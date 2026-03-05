# 🍞 EaseMail — BRAIN.md
_Last updated: 2026-03-05_

## Project Identity
- **Name:** EaseMail
- **Type:** Email client (web app) for law firms
- **Target:** Darren Miller Law Firm (single-tenant for now, multi-tenant ready)
- **Stack:** Next.js 16 + Supabase + Prisma (pg adapter) + MS Graph API + Vercel

## Auth Architecture
- **Identity provider:** Microsoft (via MSAL node — `@azure/msal-node`)
- **Session layer:** Supabase Auth (magic link issued server-side after MS OAuth)
- **Flow:** `/api/auth/microsoft` → MS consent → `/api/auth/microsoft/callback` → Supabase magic link → `/auth/callback` → `/inbox`
- **DB:** Prisma (direct pg connection to Supabase DB, NOT Supabase client for DB ops)

## Key Decisions
- Supabase Auth is used ONLY for session cookies — MS Graph is the email source
- MSAL token cache is serialized to DB per user (`msal_token_cache` table)
- `prisma.config.ts` exists but datasource in schema has NO `url` — relies on env vars at runtime
- package.json uses `^` on all deps — VIOLATES CodeBakers rule (should be --save-exact)
- No `pnpm` — project uses `npm` (package-lock.json present, no pnpm-lock.yaml)

## DB Schema (Prisma)
- `organizations` — tenant (law firm)
- `users` — mirrors Supabase auth.users.id, belongs to org
- `ms_connected_accounts` — one per MS account linked
- `msal_token_cache` — serialized MSAL cache per user
- `email_delta_links` — for incremental Graph sync (not yet wired)
- `webhook_subscriptions` — MS Graph change notifications (not yet wired)
- `drafts` — email drafts (graphDraftId, scheduledAt, scheduledSent — fully wired)
- `signatures` — email signatures (name, title, company, phone, isDefault) — replaces localStorage
- `email_rules` — inbox automation rules (conditions/actions as Json, priority, emailCount, stopProcessing)

## Pages / Routes
| Route | Status |
|---|---|
| `/` | Redirects to `/login` |
| `/login` | ✅ UI complete, MS OAuth button wired |
| `/onboarding` | ✅ Connect MS account prompt |
| `/inbox` | ✅ Fetches emails via Graph, list + reading pane |
| `/api/auth/microsoft` | ✅ Initiates MSAL auth code flow |
| `/api/auth/microsoft/callback` | ✅ Exchanges code, upserts user+DB, generates magic link |
| `/auth/callback` | ✅ Client-side page (NOT route handler) — handles both PKCE (?code=) and implicit (#access_token=) flows |
| `/api/auth/signout` | ✅ Signs out Supabase session |
| `/starred`, `/sent`, `/drafts`, `/trash` | ✅ Built — FolderClient with search, infinite scroll, AI Reply |
| `/dashboard` | ✅ Live clock, agenda, todos, weekly chart, recent unread |
| `/accounts` | ✅ Account cards, disconnect modal, default promotion, full cleanup on disconnect (webhooks, delta links, drafts, MSAL cache, Zustand store) |
| `/calendar` | ⚠️ Read-only week view only — multi-account sync, event details, NL create all missing |
| `/attachments` | ✅ File table from Graph expanded attachments, type filter, search |
| `/contacts` | ✅ Split-panel, alphabetical list, detail panel, /me/contacts |
| `/help` | ✅ Hero + search, 6 category tabs, FAQ accordion |
| `/settings` | ✅ Profile, notifications toggles, appearance, privacy, sign out |

## InboxClient Data Architecture
- **All tab:** local `emails` state + infinite scroll via `@odata.nextLink`
- **Unread/Starred/Attachments tabs:** fetch from Graph API with `$filter` on tab switch — NOT local filtering. Route: `/api/mail/inbox?tab=unread|starred|attachments`
- **Search:** debounced 400ms → `/api/mail/search?q=...` — overrides all tabs, disables infinite scroll
- InboxClient owns all data fetching; Sidebar reads counts from Zustand `account-store`

## Shared Infrastructure (created during folder build)
- `lib/types/email.ts` — `EmailMessage` interface (single source of truth)
- `lib/utils/email-helpers.ts` — `formatDate`, `getInitials`, `getAvatarColor`
- `components/shared/ReadingPane.tsx` — reading pane + SafeHtml (DOMPurify lazy)
- `components/folder/FolderClient.tsx` — lean inbox (search, infinite scroll, AI Reply, no tab filters)
- `/api/mail/folder` — serves all 4 folder routes via `?folder=sent|drafts|trash|starred`

## Completed Features (session 3)
- `/compose` — full email composer: AI Remix (tone/length/formality/presets, selection-aware), AI Dictate (SpeechRecognition → Claude formatting → preview → insert), Voice Message (MediaRecorder, 10-min), signature ghost placeholder, body expand/focus mode
- `/signatures` — SignaturesClient, localStorage persistence (pending DB migration)
- `/email-rules` — EmailRulesClient fully wired to DB: Prisma EmailRule model, 5 API routes, pure rule engine (lib/utils/rule-engine.ts), client-side enforcement in InboxClient

## Key Patterns Established
- **Prisma Json fields:** write via `JSON.parse(JSON.stringify(...))`, read via `as unknown as Type[]`
- **Contenteditable blank lines:** join `<div>` sections with `<div><br></div>` not `""`
- **AI output pipeline:** Claude → `formatEmailSpacing()` → `remixTextToHtml()` → `innerHTML`
- **SpeechRecognition:** auto-restart on silence via `onend` + `intentionalStopRef`, 10-min cap via time ref
- **Rule engine:** pure function, `Promise.allSettled` for side effects, never throws to inbox

## MSAL Token Cache — Critical Pattern
- `getAllAccounts()` is synchronous and reads in-memory state ONLY — does NOT trigger `beforeCacheAccess`
- Fix: manually `deserialize()` from DB before calling `getAllAccounts()` in `acquireTokenSilent()`
- `acquireTokenSilent()` now takes `userId` as 3rd param to load cache row directly
- `graphFetch()` passes `userId` through to `acquireTokenSilent()`
- See `lib/microsoft/msal.ts` — `acquireTokenSilent()` for the pattern

## Account Store — removeAccount
- `account-store.ts` now has `removeAccount(homeAccountId)` action
- Updates `accounts[]` and resets `activeAccount` to new default if deleted account was active
- Called by `AccountsClient` after successful disconnect API response

## Account Disconnect — Full Cleanup (2026-03-05)
On disconnect, `app/api/accounts/disconnect/route.ts` now:
1. Cancels Graph webhook subscriptions (best-effort via Promise.allSettled)
2. Removes account tokens from MSAL cache JSON in DB
3. Deletes WebhookSubscription + EmailDeltaLink + Draft records in one transaction
4. Deletes MsConnectedAccount
5. Promotes new default if needed
Client: `AccountsClient` calls `removeAccount()` on Zustand store → sidebar updates live

## Auth Callback — Critical Architecture Note
- `/auth/callback` MUST be a client-side `page.tsx`, NOT a route handler
- Supabase implicit flow sends `#access_token=` as URL hash fragment
- Browsers strip hash fragments before sending HTTP requests → route handlers never see them
- Client page reads both `?code=` (PKCE) and `window.location.hash` (implicit)

## Inbox API — Error Handling
- `/api/mail/inbox` and `/api/mail/folders` wrap all Graph calls in try/catch
- MSAL cache miss → returns `{ error: "account_requires_reauth" }` with HTTP 401
- InboxClient detects 401 and shows inline reconnect banner (not silent failure)
- `/api/mail/folders` uses `$filter=wellKnownName eq null` (NOT `$select=wellKnownName` — Graph rejects that)

## Current Focus
- Session: 2026-03-05 (continued)
- Last completed: Full production hardening sprint — all 13 P1-PROD items done
- Status: App is production-ready. All 13 production items complete.

## Production Hardening — Completed (2026-03-05)
- middleware.ts: Supabase auth at edge, public routes whitelisted
- Error boundaries: global + section-level (inbox/calendar/compose/dashboard) + not-found.tsx
- Mobile sidebar: hamburger bar, slide-in drawer, auto-close on route change
- Labels: MS Graph categories filter, store-driven, sidebar → inbox filter
- FolderClient: full 401 handling + reconnect banner
- Search 401: both InboxClient and FolderClient search paths protected
- Multi-account polling: all accounts polled in parallel
- Contacts write: POST/PATCH/DELETE + full CRUD UI with modals
- Attachment download: base64 → blob → browser download
- Cron hardened: CRON_SECRET + structured logging + timestamps
- Help Center: 36 real FAQs + keyboard shortcuts table
- isReauthError() helper: DRY across all 4 mail routes
- Calendar range route: @odata.nextLink pagination, no 500-event cap
- SpeechRecognition cleanup on unmount

## Calendar — Now Complete
- Week, Day, Month, Agenda, Year views all functional
- NL text input + mic voice button (Web Speech API → Claude → EventFormModal prefill)
- Confirmation banner after event saved (green, 4s auto-dismiss)
- /api/calendar/range route (arbitrary date range fetch)
- CalendarView type now includes: "day" | "week" | "month" | "agenda" | "year"

## Sidebar — Now Accordion
- All sections collapsible (Mailboxes, Folders, Navigate, Manage, AI Tools, Labels, Support)
- Mailboxes/Navigate/Manage default open; AI Tools/Labels/Support default collapsed
- ChevronIcon animates on toggle

## Composer Features Built (session 3 continued)
- File attachments: file picker → base64 → Graph send (inline ≤4MB, array)
- Draft auto-save: debounced 5s → /api/drafts → MS Graph Drafts folder sync
- Reply/Forward mode: ?mode=reply|replyAll|forward&messageId=X → pre-fill To/Subject/quoted banner
- From account selector: dropdown when multiple accounts, single label when one
- Recipient chips + autocomplete: /api/contacts → /me/people debounced 300ms
- Signature DB migration: /api/signatures CRUD, localStorage → DB on first load
- Voice attachment wired: addVoiceAttachment() base64 → attachments[] → send
- Schedule Send: dropdown (1hr/4hr/tomorrow/monday/custom) → saves draft with scheduledAt → /api/cron/send-scheduled (Vercel cron every minute)
- Ctrl+Enter to send: global keydown listener
- AI quality score: real calculation based on word count ratio (not hardcoded 88%)
- Real diff: fast-diff word-level diff shown in AI Remix panel
- Full Compose button in ReadingPane toolbar: links to /compose?mode=reply&messageId=X

## Session Artifacts
- `codebakers-suggestions.md` — improvements to the CodeBakers framework captured during this build. Update it whenever a protocol gap or recurring friction point is identified.

## Known Issues / Risks
See FIX-QUEUE.md
