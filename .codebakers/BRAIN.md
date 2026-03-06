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
- `email_delta_links` — stores delta tokens for emails AND calendar (folderId="calendar" for cal)
- `webhook_subscriptions` — MS Graph change notifications (table exists, not wired)
- `drafts` — email drafts (graphDraftId, scheduledAt, scheduledSent — fully wired)
- `signatures` — email signatures (name, title, company, phone, isDefault) — replaces localStorage
- `email_rules` — inbox automation rules (conditions/actions as Json, priority, emailCount, stopProcessing)
- `cached_folders` — synced mail folders (wellKnownName for inbox/sent/drafts/deletedItems lookup)
- `cached_emails` — synced emails (folderId, receivedDateTime, flagStatus, categories as Json)
- `cached_calendar_events` — synced calendar events (startDateTime, endDateTime, attendees as Json)
- `cached_contacts` — synced contacts (displayName, emailAddress, phone, jobTitle, company)

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

## Offline-First Sync Engine (2026-03-05)
- **Cron:** `/api/cron/sync` runs every minute (vercel.json). Delta-syncs all accounts.
- **Flow:** syncFolders → syncEmails (per folder, delta) → syncCalendar (delta) → syncContacts (hourly full refresh)
- **Delta tokens:** stored in `email_delta_links` table. For calendar: folderId = "calendar".
- **410 Gone:** clears delta token, returns. Next run does fresh full sync.
- **Cache-first reads:** all pages + API routes read from DB cache first, fallback to Graph if empty.
- **Cursor pagination:** cache returns last email ID as nextLink (not Graph URL). Routes detect "http..." prefix = legacy Graph URL, otherwise treat as cursor ID.
- **mark-read:** fires-and-forgets `cachedEmail.updateMany` after Graph PATCH succeeds.
- **Sync libs:** `lib/sync/folder-sync.ts`, `email-sync.ts`, `calendar-sync.ts`, `contact-sync.ts`

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
- Session: 2026-03-05 (latest)
- Last completed: Domain gate, compose send fix, search cache-first, AI prompt improvements
- Next: Nothing critical pending. Nice-to-haves remain (webhooks, per-account cache cleanup on disconnect)

## Admin Panel (2026-03-05)
- `/admin` — server page, isAdminEmail() guard (redirects non-admins to /inbox)
- `lib/admin.ts` — reads ADMIN_EMAILS env var, isAdminEmail() helper
- `components/admin/AdminClient.tsx` — 4-tab UI: Users, Sync Status, Email Rules, Signatures
- `/api/admin/signatures` (GET/POST) + `/api/admin/signatures/[id]` (PATCH/DELETE) — admin-only CRUD
- `ADMIN_EMAILS` + `NEXT_PUBLIC_ADMIN_EMAILS` set in .env.local AND Vercel production
- Admins: tdaniel@bundlefly.com, david@dmillerlaw.com, marcela@dmillerlaw.com, shall@botmakers.ai, info@tonnerow.com
- Sidebar: `isAdmin` computed internally from NEXT_PUBLIC_ADMIN_EMAILS + userEmail (no longer needs prop)

## Domain/Access Gate (2026-03-05)
- `ALLOWED_DOMAINS=dmillerlaw.com` in .env.local (add to Vercel)
- `ADMIN_EMAILS` — additional non-domain users allowed (see above)
- **middleware.ts** — checks every authenticated session. Non-allowed → 403 (API) or redirect /login?error=unauthorized_domain
- **OAuth callback** — `isEmailAllowed()` helper checks after token exchange. Blocks at creation time for both LOGIN + ADD flows
- Login page shows friendly message for `unauthorized_domain` error

## MS Teams Integration (2026-03-05)
- GRAPH_SCOPES and TEAMS_SCOPES are separate constants in lib/microsoft/msal.ts
- acquireTokenSilent accepts optional scopes param (default GRAPH_SCOPES) — prevents token conflict
- All /api/teams/* routes pass TEAMS_SCOPES explicitly to graphGet/graphPost
- /api/auth/microsoft/teams-consent — incremental consent route (prompt=consent, state=teams_consent:{userId})
- OAuth callback handles teams_consent: state — updates MSAL cache, redirects /teams
- /teams page — TeamsClient: Chats tab (DMs/groups) + Teams tab (team→channel browser), 30s polling
- Calendar: Teams Meeting button → POST /api/calendar/teams-meeting → joinWebUrl
- Contacts: presence dot on hover → GET /api/teams/presence

## AI Features (2026-03-05)
- All AI routes use claude-haiku-4-5-20251001 (cheapest model)
- All routes now use system parameter for persona separation
- ai-reply: firm context, sender first name in greeting, 3 prescribed reply roles, max_tokens 1500
- remix: preserves legal terms/case names/dates, never paraphrases legal specifics
- dictate: legal vocabulary context, preserves case details verbatim
- nl-create: law firm event types, smart durations, legal subject naming, max_tokens 400

## Search Architecture (2026-03-05)
- /api/mail/search: DB cache-first (cachedEmail contains insensitive, take 100)
- Falls back to Graph only if cache returns 0 results ($top=50, down from 250)
- Result count = actual DB matches, not Graph page size limit

## MS Teams Integration — Complete (2026-03-05)
- Approved scope: Option B (full page — chats + channels + meetings + presence)
- New OAuth scopes needed: Chat.ReadWrite, ChannelMessage.Read.All, ChannelMessage.Send, Team.ReadBasic.All, Channel.ReadBasic.All, Presence.Read.All, OnlineMeetings.ReadWrite
- NOTE: Existing users must re-auth (disconnect + reconnect MS account) to grant new scopes
- New routes: /api/teams/chats, /api/teams/chats/[id]/messages+send, /api/teams/teams, /api/teams/teams/[id]/channels, /api/teams/channels/[id]/messages+send, /api/teams/presence, /api/calendar/teams-meeting
- New page: /teams — split panel, Chats + Teams tabs, 30s polling
- Calendar update: "New Teams Meeting" button → joinUrl
- Contacts: presence dot on hover

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
