# 🍞 CodeBakers: Full Code Review Report — EaseMail

**Date:** 2026-06-11 · **Scope:** all API routes, lib/, components/, app/ pages, config, schema · **Build:** `tsc --noEmit` PASS (0 errors), strict mode on

Severity legend: 🔴 CRITICAL (exploitable / data loss) · 🟠 HIGH (broken feature / security gap) · 🟡 MEDIUM · ⚪ LOW

---

## 🔴 CRITICAL

| # | Location | Bug |
|---|----------|-----|
| C1 | `components/inbox/InboxClient.tsx:1657-1661,1784,1820-1824,1955` | **Stored XSS.** Split-pane and inline readers inject raw email HTML via `dangerouslySetInnerHTML` with no DOMPurify (server intentionally skips sanitization per `app/api/mail/message/[id]/route.ts:28`). Any sender can execute script. |
| C2 | `app/api/auth/microsoft/callback/route.ts:41-113` | **OAuth CSRF / account-link tampering.** No `state` nonce validation; `add:{userId}` branch trusts the userId embedded in state without re-checking the Supabase session. |
| C3 | `app/api/mail/receipt-webhook/route.ts:12-59` | **Forgeable webhook.** `clientState` parsed but never validated; `readReceipt.updateMany` has no `userId` scope — anyone can forge read receipts for any user. |
| C4 | `components/compose/ComposeClient.tsx:1265-1269,577-657` | **Reply/Forward silently drops the original message.** `originalBodyHtml` is captured but never inserted into the editor or send payload — forwards send only the user's comment. |
| C5 | `components/compose/ComposeClient.tsx:1222-1232` | **Ctrl/Cmd+Enter send is a stale closure** (`[]` deps) — always sees first-render empty state; shortcut send never works correctly. |

## 🟠 HIGH

**Security**
- `app/api/mail/image-proxy/route.ts:83-151` — SSRF check defeated by DNS rebinding (validate-then-fetch re-resolves); SVG allowed and served same-origin → XSS.
- `components/teams/TeamsClient.tsx:126-145` — plain-text Teams messages injected as HTML unsanitized (only the `html` branch is purified).
- `app/auth/callback/page.tsx:40,56,72` — open redirect: unvalidated `?next=` after login.
- `app/api/mail/reply/route.ts:97-112` — `messageId` interpolated unencoded into Graph path (path injection); also no rate limit on a send endpoint.
- `app/api/mail/send-delayed/route.ts` — bypasses send rate limit and the 25MB attachment cap of `/api/mail/send`.
- `app/api/mail/ai-priority/route.ts:21` — Anthropic endpoint with no rate limiting (spend drain).
- `lib/rate-limit.ts:199-209` — identity from **unverified** JWT payload; also `atob` fails on base64url so legit Supabase JWTs fall back to IP.
- `middleware.ts` — `/api/webhooks/` exempt from CSRF but **missing from PUBLIC_PREFIXES** → deploy-notify webhook always 401s before its HMAC check; external callers can never reach it.
- `app/api/accounts/connect-jmap|test-jmap|update` — authenticated SSRF: user-supplied `sessionUrl` fetched server-side, no host allowlist.
- `app/api/accounts/connect-imap|test-imap` + `lib/providers/imap.ts:71,95` — STARTTLS configs get `secure:false` with no `requireTLS` → plaintext credential downgrade possible.

**Broken features**
- `lib/providers/jmap.ts:774-784` — send sets `onSuccessDestroyEmail` AND `onSuccessUpdateEmail` for the same draft → Sent copy destroyed (RFC 8621 conflict).
- `lib/providers/jmap.ts:716-740` — `sendEmail` silently drops all attachments (never uploaded/referenced).
- `lib/providers/jmap.ts:1152-1198` — per-folder sync advances the account-wide `Email/changes` cursor while skipping other folders' changes → emails permanently lost from cache.
- `lib/providers/jmap.ts:1252-1254,1091` — `queryState` stored as `emailState` (wrong namespace) → delta sync always errors, falls back to full sync, deletions never detected.
- `lib/providers/jmap.ts:790-802` — `EmailSubmission/set` errors ignored → failed sends reported as success (and draft destroyed per above).
- `components/inbox/InboxClient.tsx:565-589,980-993` — delete/archive/star mutate only `emails`; search results and Unread/Attachments/Label tabs keep showing deleted mail.
- `components/compose/ComposeClient.tsx:550-574,630-648` — scheduled send serializes stale `to` (typed-but-uncommitted recipient dropped → can schedule with no recipient); voice attachment never serialized.
- `components/compose/ComposeClient.tsx:1361-1368` — unmount cleanup doesn't stop MediaRecorder/getUserMedia → **mic stays on** after navigating away.
- `components/shared/ReadingPane.tsx:179-192` — Archive/Delete/Mark-unread/Star toolbar buttons have no `onClick` — dead UI.
- `components/inbox/EmailReadClient.tsx:199`, `InboxClient.tsx:1985` — reply navigation omits `homeAccountId` → blank composer for non-default accounts (fetch error swallowed).
- `app/api/calendar/event/route.ts:27-40,119-143` — weekly/monthly recurrence missing required Graph fields (`daysOfWeek` etc.) → Graph 400; cached event times parsed timezone-naive → off by UTC offset (also `lib/sync/calendar-sync.ts:177-178`).
- `lib/validation/schemas.ts` — entire Zod layer is dead code (imported nowhere); `createRuleSchema` operators don't match the rule engine (`equals` vs `is` …) so schema-valid rules would never fire.
- `prisma/schema.prisma:178` — `Draft` has no `userId` index (per-user listing scans).

## 🟡 MEDIUM (selected)

- `app/api/mail/delete/route.ts:45-61` — cache delete/update by `id` only, no `userId` (IDOR on cache; violates project rule).
- `app/api/mail/receipts/route.ts:48-52` — upsert lets an attacker pre-claim a victim's (messageId, recipientEmail) row.
- `app/api/mail/search/route.ts:133-139,302-303` — `before:9999-99-99` → `toISOString()` RangeError outside try → 500; `$search`+`$filter` combo always 500s on Graph.
- `app/api/attachments/paginate/route.ts:39-58`, `app/api/mail/folders/sync/route.ts:27-41`, `folders/route.ts:150-175` — missing `verifyAccountOwnership`.
- `app/api/mail/cancel-send/route.ts:39-48` — TOCTOU race with the send cron; needs conditional `updateMany`.
- `lib/microsoft/msal.ts:122-159` — token-cache write race can clobber a rotated refresh token → spurious re-auth loops.
- `lib/providers/imap.ts:697-733` — flag changes from other clients never re-sync (update branch unreachable).
- `lib/providers/imap.ts:282-284`, `jmap.ts:513,617` — offset pagination → duplicates/skips when mail arrives between pages.
- `lib/providers/imap.ts:381-455` — `"` in display names breaks address quoting (header injection); Sent-append copy gets a different Message-ID → broken threading.
- `lib/providers/microsoft.ts:159-162` — `$filter`+`$orderby` combos rejected by Graph (unread/starred/attachment filters fail for MS accounts).
- `lib/providers/microsoft.ts:238-277` — markRead/flag/move/delete never update `cachedEmail` → stale lists until next sync.
- `lib/providers/jmap.ts:821-912` — `Email/set` `notUpdated` ignored; cache updated even when server rejected.
- `lib/utils/voice-profile.ts:37-46` — "your writing style" learned from received mail (`sentDateTime` set on all synced messages by imap/jmap).
- `lib/prisma.ts:20-24` — prod DB TLS `rejectUnauthorized:false` when CA cert unset.
- `components/inbox/InboxClient.tsx` — delete "Undo" doesn't undo (565-589,714-735); archive has no failure rollback (556-562); account/tab/search fetches have no AbortController → stale-response races (775-977); infinite scroll never checks `res.ok` (928-933).
- `components/compose/ComposeClient.tsx` — false "Saved" indicator (no `res.ok` check, 637-662); Discard leaves orphan draft (2347-2375); Reply-All CCs yourself (1253-1261).
- `components/teams/TeamsClient.tsx:275-383` — try/finally without catch → unhandled rejections from the 30s poll.
- `app/api/auth/signout/route.ts` — GET signout, CSRF-forceable logout.
- `prisma/schema.prisma` — no unique `[userId,messageId]` on SnoozedEmail/FollowUpReminder; `User.org` relation lacks `onDelete`.
- `package.json` — `eslint-config-next@15` vs `next@16`; lint currently broken; `@playwright/test`, `@types/pg`, `@types/dompurify` in prod deps.
- Zod absent in all 34 mail routes → concrete 500s: `drafts/route.ts:107` Invalid Date → Prisma throw; `ai-reply/route.ts:28` TypeError when `from` omitted.

## ⚪ LOW (selected)

- DOMPurify `ALLOWED_URI_REGEXP` permits `data:`/`blob:` hrefs (phishing) — `ReadingPane.tsx:16`, `EmailReadClient.tsx:78`.
- `hooks/useKeyboardShortcuts.ts:98-110` — CapsLock turns `r` into Reply-All.
- `lib/rate-limit.ts:158-161` — fail-open when Redis is down.
- `lib/admin.ts:9-10` — admin email list shipped to client bundle.
- `app/(app)/signatures/page.tsx:313-316` — unsanitized signature HTML preview (self-XSS).
- `lib/microsoft/auth-errors.ts:24` — `includes("403")` substring false-positives.
- `lib/stores/account-store.ts:75-87` — `removeAccount` leaves stale unread counts.
- `app/api/mail/folder/route.ts:275` — `return;` (undefined) from route handler (latent).
- `AttachmentsClient.tsx:586,841,900` — `revokeObjectURL` immediately after `click()` can abort downloads.
- `.eslintrc.json` deprecated format; 821 eslint errors (mostly unused vars in tests).

## ✅ Resolution status (2026-06-11)

All CRITICAL and HIGH findings fixed and verified (commits `489d728`, `6c1c402`, `7317ac3`): tsc 0 errors, eslint 0 errors, production build passing, 100/100 unit tests, full e2e suite 0 failures. Zod validation wired into every route; stable IMAP/JMAP pagination; MSAL race mutexed; reauth no longer logs users out; Set-as-Default account feature added. `GRAPH_WEBHOOK_SECRET` (new random secret) and `DATABASE_CA_CERT` (CA verified via strict-TLS test connection) were set in Vercel production/preview and `.env.local` — strict DB TLS confirmed working end-to-end. Remaining e2e skips are solely data-gated on the test mailbox's Microsoft re-consent (requires the account owner's interactive login — not an app defect; the app correctly shows its inline reconnect banner, which the tests verify).

## 🔧 Environment finding (local dev)

Every secret in `.env.local` ended with a literal `\r\n` escape sequence inside the quotes (paste artifact). dotenv expands `\n` in double-quoted values to a real newline, so the local server loaded corrupted Supabase keys — **local auth always failed with "Invalid API key" while production worked**. Fixed by cleaning the 10 affected values (backup at `.env.local.bak`). Tooling added: `tests/e2e/auth/mint-session.mjs` mints a fresh Playwright session for `TEST_USER_EMAIL` via the Supabase admin API — no interactive login needed.

## ✅ Verified clean

Exact-pinned deps, 0 `.single()`, 0 raw SQL, no committed secrets, strict TS passes, cron routes require `CRON_SECRET`, deploy webhook uses HMAC + `timingSafeEqual`, crypto.ts (AES-256-GCM) sound, admin routes properly gated, ownership filters correct on rules/templates/signatures/todos/reminders/contacts, security headers present in next.config.
