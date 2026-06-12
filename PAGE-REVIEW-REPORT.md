# 🍞 CodeBakers: Per-Page Code Review — EaseMail

**Date:** 2026-06-11 (post-audit state — reflects all fixes shipped earlier today)
**Scope:** every page in `app/`, its client components, and the API routes each one calls.

> **Architecture note that affects every page:** all `(app)/*/page.tsx` files return `null` and `app/(app)/layout.tsx:54` discards `children`. The real router is `components/AppShell.tsx`, which maps the URL to a view via a client store. Several findings below stem from this indirection (dead pages, views that fall through to the wrong component).

## Executive summary

| Page | Verdict | Worst issue |
|---|---|---|
| /inbox | 🔴 NEEDS WORK | Mark-read calls `/api/mail/read` — **endpoint doesn't exist**; read state never persists |
| /inbox/[id] (read view) | 🔴 NEEDS WORK | Toolbar state frozen from stub; mark-as-read never fires; un-star impossible |
| /folder/[folderId] | 🔴 NEEDS WORK | Custom folders **redirect to /inbox on mount** — page effectively dead |
| /sent | 🟡 MINOR ISSUES | Inherits FolderClient double-fetch / dead Retry |
| /trash | 🔴 NEEDS WORK | One-click **permanent delete, no confirmation, no undo**; no Restore action |
| /starred | 🔴 NEEDS WORK | No un-star control here, and the read-view one is broken — can't un-star anywhere |
| /snoozed | 🔴 NEEDS WORK | **Unreachable** — AppShell has no `snoozed` case; URL shows the Inbox |
| /compose | 🔴 NEEDS WORK | Opening a scheduled draft silently unschedules it; restored attachments lose ids |
| /drafts | 🔴 NEEDS WORK | **Deleting a scheduled draft doesn't cancel the send — cron still sends it** |
| /templates | 🟡 MINOR ISSUES | Save failure = unhandled rejection, no error UI |
| /signatures | 🔴 NEEDS WORK | Fake sample data traps users; saves silently no-op; composer ignores signature HTML |
| /attachments | 🟢 SOLID (minor) | Redundant refetches; silent download failures |
| /dashboard | 🟡 MINOR ISSUES | Stats polling is dead weight (always zeros); agenda not account-scoped |
| /calendar | 🔴 NEEDS WORK | **Editing an event destroys its body** (truncated preview saved as full body); all-day create fails; drag strips reminders |
| /email-rules | 🟡 MINOR ISSUES | "Label as…" rules silently do nothing; reorder breaks under filters |
| /contacts | 🟡 MINOR (1 HIGH) | **Notes are write-only** — saved notes never load and auto-save overwrites them |
| /teams | 🟡 MINOR ISSUES | Thread-switch race shows wrong chat's messages; silent load failures |
| /accounts | 🟡 MINOR ISSUES | Disconnect-last-account redirect has off-by-one; modal state retains passwords |
| /settings | 🔴 NEEDS WORK | Sensitivity-label + undo-send-delay settings **silently never persist**; no timezone UI |
| /help | 🟡 MINOR ISSUES | Documents a Ctrl+Shift+A shortcut that's blocked by code; ~8 real shortcuts undocumented |
| /admin | 🟢 SOLID (minor) | Server-gated correctly; delete has no error feedback |
| /onboarding | 🟡 MINOR ISSUES | Microsoft-only, no escape hatch if OAuth fails; no loading/error states |
| /login | 🟡 MINOR ISSUES | New `oauth_state_mismatch` error code unmapped; `next` param dropped |
| /auth/callback | 🟢 SOLID | Minor polish only |
| / (root) | 🟢 SOLID | — |
| Shell (AppShell/Sidebar/layout) | 🔴 NEEDS WORK | Cold load misfires "account switch" (skeleton flash, SSR discarded); **/scheduled sidebar link is a dead route** |

---

## Mail core

### /inbox — `InboxClient.tsx`
- **CRITICAL** `InboxClient.tsx:680,1714` — mark-read/mark-unread call **`/api/mail/read`, which does not exist** (only `/api/mail/mark-read` does). 404 isn't a fetch rejection so the revert never fires: read/unread **never persists**, emails reappear unread on reload, badge drifts.
- **HIGH** `:1327` — fixed `width: 340|380px` columns, `height: 100vh`, zero responsive classes → broken on mobile.
- **HIGH** `:1122` — search checks 401 but not `res.ok`; a 500 silently shows the full inbox as "results".
- **MEDIUM** star/pin/mark-unread/bulkMarkRead don't check `res.ok` (stuck optimistic state on server error); body fetches unaborted (A's body can render under B's header); duplicate 30s polling in both AppShell and InboxClient.
- **LOW** un-star on the server-fetched Starred tab doesn't remove the row; stale snooze error; `#` shortcut dead on UK layouts.
- ✅ Confirmed good: DOMPurify everywhere, list-mutation helpers, delete undo + cache persistence, ghost cleanup, reauth banner, account-switch aborts.

### /inbox/[id] — `EmailReadClient.tsx`
- **CRITICAL** `:133,193-217` — toolbar state (`isRead/isStarred/isPinned/sensitivity`) initialized from AppShell's **stub** email and never re-synced after the real fetch; fetch mapping hardcodes `isRead: true`. Starred emails show unstarred → **un-star from read view impossible**; mark-as-read effect can never fire (stub is already `isRead: true`). Combined with the inbox bug: **no path in the app persists read state**.
- **MEDIUM** no AbortController on message fetch; toggles don't check `res.ok`.
- **LOW** back label always "Inbox"; custom-folder `returnTo` lands on dashboard; native `confirm()` for delete.

### /folder/[folderId] — `FolderClient.tsx`
- **CRITICAL** `:202-212` — the account-switch effect has no first-render guard; on mount it sees a custom folder and immediately `navigateTo("/inbox")` → **custom folders are unreachable**.
- **HIGH** `:247-251` — search Retry button is a no-op (`setSearch(prev => prev)` bails out).
- **HIGH** `:162-183` — folder fetch failure shows the "No emails" empty state with no error/retry.
- **MEDIUM** double fetch on every mount (two effects race, spinners clear each other); `loadMore` lacks `res.ok`.

### /sent — MINOR: inherits FolderClient issues; opening unread marks read locally only; recipient display uses `toRecipients[0]` with sender fallback.

### /trash — **HIGH**: hover delete sends `{permanent: true}` with **no confirmation and no undo** (violates the project's own destructive-action rule); no Restore-from-trash action exists.

### /starred — **HIGH**: rows have no star toggle (delete only — surprising here), and the read view's star is broken (above) → users cannot reliably un-star anywhere.

### /snoozed — **CRITICAL**: `pathToView` maps `/snoozed` → `"snoozed"` but `AppShell.renderView()` has no `snoozed` case → falls to default and **renders the Inbox**. `SnoozedClient` (which is well-built) is dead code; no sidebar link points to it either.

---

## Compose & content

### /compose — `ComposeClient.tsx`
- **HIGH** opening a scheduled draft triggers auto-save which posts `scheduledAt: null` → **silently unschedules it** (manual Save Draft does too).
- **HIGH** restored draft attachments have no `id` → removing one removes all; duplicate React keys.
- **HIGH** schedule picker `min` uses a UTC string in a local-time `datetime-local` → users west of UTC can't schedule within offset hours.
- **MEDIUM** custom schedule fires on first onChange (sends mid-entry); pasting multiple addresses makes one garbage chip; no invalid-email feedback; loaded drafts hide CC/BCC rows (recipients still receive!); templates wipe reply quotes and lose newlines; signature system disconnect (composer inserts plain text, ignores the HTML signatures and defaultNew/defaultReplies toggles managed in /signatures; saves duplicate rows); silent reply-context fetch failure.
- **LOW** dictate's Auto-Punctuate/Fix-Grammar toggles are decorative; dead code (`_undoPending`); "AI Quality Score" is a length heuristic.

### /drafts — list via FolderClient (Graph drafts folder)
- **CRITICAL** deleting a scheduled draft deletes only the Graph copy; the local row stays `scheduledSent: false` and **the cron still sends the email**. Orphaned local rows also make the sidebar count diverge from the list.
- **HIGH** the scheduled-send cron sends **without attachments** (Graph + IMAP payloads omit them entirely, even though the composer serialized them).
- **MEDIUM** no "scheduled" indicator in the list.

### /templates — MINOR: save failure is an unhandled rejection with no error UI; fetch failure renders as "No templates yet"; variables aren't auto-detected from the body (raw `{{x}}` can be sent).

### /signatures — `SignaturesClient.tsx`
- **HIGH** fake SAMPLE signatures shown on empty/error with non-DB ids; Save/Delete on them hit `/api/signatures/sig-1` → 404 → **silently nothing happens**; no save/delete error UI at all.
- **MEDIUM** unsaved edits lost when switching signatures; model mismatch with composer (manages `html/defaultNew/defaultReplies`, composer consumes `name/title/isDefault` only); admin-assigned signatures are never read by anything user-facing.
- Note: `app\(app)\signatures\page.tsx` is **752 lines of dead duplicate code** (never rendered) — should be deleted.
- ✅ XSS-sanitized previews confirmed.

### /attachments — SOLID with minors: effect deps cause redundant refetches; download failures only console.error; selections persist invisibly across tab switches. Pagination, object-URL lifecycle, and MIME handling verified correct.

---

## Productivity

### /dashboard — MINOR: `router.refresh()` polling can never update the hardcoded-zero SSR stats (dead weight; stats stale until account switch); agenda fetch omits `homeAccountId` (shows all accounts while other cards are scoped); agenda times ignore the user timezone; addTodo double-submit possible; reminders dismiss/snooze don't check `res.ok`.

### /calendar — `CalendarClient` + modals + event route
- **HIGH** edit roundtrip **destroys event bodies**: form seeds from truncated `bodyPreview` and PATCH saves it as the full body.
- **HIGH** all-day events: zero-length range sent (no +1-day exclusive end) → **Graph rejects creation**.
- **HIGH** drag-drop PATCH omits `reminderMinutes` → server sends `isReminderOn: false` → **dragging strips reminders** (also resets showAs).
- **MEDIUM** month-view drop double-PATCHes; clearing recurrence impossible; week-nav fetch unaborted (wrong week can render); NL-create uses `accounts[0]` not active account; detail modal shows browser-local times while the grid uses user timezone; PATCH caches attendees in raw Graph shape (breaks rendering after edit).
- **MINOR** editing a no-reminder event silently adds a 30-min reminder; multi-day events render on day 1 only; no occurrence-vs-series prompt for recurring events.

### /email-rules — MINOR: ✅ operator/schema/engine alignment verified fixed; but "Label as…" rules are documented no-ops with no warning; reorder uses filtered-list indices against the unfiltered array (silent wrong swaps when searching); no mutation error feedback; blank condition values save as never-matching rules.

### /contacts — MINOR + 1 HIGH: **notes are write-only** (`:750-795`) — selecting a contact resets notes to `""`, never loads the saved note, and the 800ms auto-save then **overwrites the stored note with empty text** (data loss). Account-switch fetch unaborted; search only filters loaded pages.

### /teams — MINOR: thread-switch race (no abort/identity guard — chat A's messages can render in chat B); non-OK message loads show "No messages yet" instead of an error; poll continues when tab hidden; `isMe` matched by display name (same-named colleagues misattributed). ✅ XSS fix verified; send-error recovery and consent flow good.

---

## Account & system

### /accounts — MINOR: disconnect-last-account check reads pre-update state (`accounts.length <= 1` never true at that point) so the onboarding redirect doesn't fire; connect modals retain passwords/tokens in state after close; port inputs silently reset on invalid text; set-default ignores the API response; test-imap/test-jmap return different error shapes. ✅ Auth/ownership/encryption/transaction patterns all verified correct.

### /settings — `SettingsClient.tsx`
- **CRITICAL** Default Sensitivity Label setting is **100% dead**: not in the Zod schema, not in the Prisma schema, silently stripped — UI pretends to save a privilege-related feature.
- **CRITICAL** Undo Send Delay **never persists**: client sends `"10"` (string), schema requires number literals → every PUT 400s, swallowed; selector also never highlights the stored value.
- **HIGH** timezone is used for rendering (`layout.tsx:71`) but **no UI control exists** to set it (orphaned PATCH route).
- **HIGH** Profile "Save Changes" is fake (flashes "Saved", no API call) over readonly fields.
- **MEDIUM** no save-failure feedback or rollback anywhere; toggling before initial GET resolves clobbers stored prefs with defaults; fontSize/density/digest toggles persist but nothing consumes them (placebo settings).

### /help — MINOR: documents "Ctrl+Shift+A opens AI Composer" but the shortcut handler ignores all Ctrl combos (dead doc); "Shift+U" documented where code uses plain `u`; ~8 real shortcuts (j/k/o/?/s/#) undocumented. All internal route references valid; no security issues.

### /admin — SOLID: server-side `isAdminEmail` gate on the page AND `requireAdmin()` on every API route verified; Zod-validated; default-signature handling correct. Minor: delete has no error feedback; no audit logging.

### /onboarding — MINOR/NEEDS-POLISH: auth checked server-side ✓, OAuth state nonce ✓; but Microsoft-only (no IMAP/JMAP path despite the app supporting them), no loading state on the connect button, all callback failures collapse to a generic `auth_failed` on /login, and a user whose OAuth fails can loop login→onboarding with no guidance.

---

## Entry & shell

### /login — MINOR: error allowlist is safe ✓ but missing the new `oauth_state_mismatch` code (today's CSRF fix) → generic message; middleware's `?next=` is never propagated into the sign-in link (deep-link return lost); Privacy/Terms are `href="#"`.

### /auth/callback — SOLID: PKCE + implicit handled, open-redirect guard verified, loading + failure recovery present. Minor: provider error params fall through to a slightly misleading `no_session` message.

### Shell — `(app)/layout.tsx`, `AppShell.tsx`, `Sidebar.tsx`, middleware
- **HIGH** `AppShell.tsx:119,202` — first mount is treated as an account switch: skeleton flashes over the SSR-rendered view and inbox/calendar/drafts are refetched on **every cold load** (SSR prefetch work discarded).
- **HIGH** `Sidebar.tsx:29` — "Scheduled" links to `/scheduled`: no view mapping (client-nav shows dashboard) and no page file (hard refresh **404s**). Its badge is wired to a dead destination.
- **MEDIUM** `(app)/layout.tsx:75` — reads `x-url`/`x-invoke-path` headers nothing sets; `initialView*` props are computed and never consumed by AppShell (dead path causing the wrong-view flash on deep links).
- **MEDIUM** account-switch refetch has no AbortController (stale account's data can win); `EmailReadClient`/compose not keyed by account (cross-account leak when switching mid-read); `/icon.svg` + `/apple-icon.svg` not in middleware public prefixes (favicons break logged-out); ErrorBoundary wraps only AppShell (a Sidebar crash white-screens); root layout missing `suppressHydrationWarning` (violates project's own browser-extension rule); "Reminders" nav is a disguised dashboard link; mobile drawer shows drafts count for every badge.
- ✅ History/back-forward handling works for mapped views; unread count single-source verified; Sidebar folder fetch (abort/retry/reauth) is the reference implementation the other components should copy.

---

## Priority fix list (by user impact)

1. **Read state never persists anywhere** — dead `/api/mail/read` endpoint + read-view stub bug (`InboxClient.tsx:680,1714`, `EmailReadClient.tsx:133-217`).
2. **Deleting a scheduled draft still sends the email** (cron) + scheduled sends drop attachments + opening a scheduled draft unschedules it.
3. **Calendar edit destroys event bodies**; all-day creation fails; drag strips reminders.
4. **Custom folders unreachable** (FolderClient mount redirect) and **/snoozed renders the Inbox** (missing AppShell case); **/scheduled is a dead sidebar link**.
5. **Trash permanent-delete with no confirmation/undo**; no un-star path anywhere.
6. **Contacts notes data loss** (write-only + empty overwrite).
7. **Settings that lie**: sensitivity label and undo-send delay never save; timezone unsettable.
8. **Cold-load account-switch misfire** in AppShell (flash + wasted SSR).
9. Signatures sample-data trap + composer/signature model disconnect.
10. Mobile: inbox fixed-width columns.
