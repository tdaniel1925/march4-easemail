# Build Log

## 2026-03-05 — Session: Security, UX Fixes, AI Prompt Improvements

### Domain/Admin Access Gate
- [Security] middleware.ts — added domain+admin allowlist check on every authenticated request. Reads ALLOWED_DOMAINS + ADMIN_EMAILS env vars. Unauthorized → 403 (API) or /login?error=unauthorized_domain (page)
- [Security] app/api/auth/microsoft/callback/route.ts — isEmailAllowed() helper added. Gate fires after token exchange in both LOGIN and ADD flows. Blocks non-dmillerlaw.com, non-admin accounts before any user/account is created
- [UX] app/login/page.tsx — added "unauthorized_domain" to ERROR_LABELS with friendly message
- [Env] .env.local — added ALLOWED_DOMAINS=dmillerlaw.com. Need to add to Vercel too.

### Compose: Send Navigation Fix
- [Fix] components/compose/ComposeClient.tsx:553 — changed router.push("/sent") → router.back(). After send, user returns to wherever they came from (inbox, email thread, etc.) instead of being dumped to /sent

### Search: DB Cache-First (Performance + Accurate Count)
- [Fix] app/api/mail/search/route.ts — rewrote to query cachedEmail table first (contains insensitive on subject/fromName/fromAddress/bodyPreview, take 100, ordered by receivedDateTime desc). Falls back to Graph only if cache returns 0 results. Reduced Graph $top from 250 → 50. Result count now reflects actual matches.

### MS Teams: Scope Separation (Loop Fix)
- [Fix] lib/microsoft/msal.ts — split into GRAPH_SCOPES (mail/calendar/contacts) and TEAMS_SCOPES (Chat.ReadWrite, ChannelMessage.Send, Team.ReadBasic.All, Channel.ReadBasic.All, OnlineMeetings.ReadWrite). acquireTokenSilent accepts optional scopes param defaulting to GRAPH_SCOPES
- [Fix] lib/microsoft/graph.ts — graphGet/graphPost/graphFetch accept optional scopes param. All Teams routes pass TEAMS_SCOPES explicitly
- [Fix] app/api/auth/microsoft/teams-consent/route.ts — new route, initiates OAuth with TEAMS_SCOPES + prompt=consent + state=teams_consent:{userId}
- [Fix] OAuth callback — added teams_consent: state handler: acquireTokenByCode with TEAMS_SCOPES → updates MSAL cache → redirects /teams

### Sidebar Admin: Self-Computing isAdmin
- [Fix] components/Sidebar.tsx — isAdmin now computed internally from NEXT_PUBLIC_ADMIN_EMAILS + userEmail prop. No longer needs to be passed from every page. Falls back to isAdminProp if provided.

### AI Prompts: Law Firm Context + System Prompts
- [Improve] app/api/mail/ai-reply/route.ts — system prompt with firm identity; extracts sender first name for greeting; prescribed reply roles (acknowledgment/clarification/substantive); max_tokens 1024→1500; body limit 3k→4k
- [Improve] app/api/mail/remix/route.ts — system prompt; preserve legal terms/case names/dates exactly; never paraphrase legal specifics
- [Improve] app/api/mail/dictate/route.ts — system prompt; legal vocabulary (depositions, motions, Latin phrases); preserve case details verbatim
- [Improve] app/api/calendar/nl-create/route.ts — system prompt; law firm event types (depositions→2hr, hearings→1hr); legal subject naming ("Deposition — Smith v. Jones"); max_tokens 256→400
- All routes: model stays claude-haiku-4-5-20251001 (cheapest)
- [TS] tsc --noEmit clean on all changes

## 2026-03-05 — MS Teams Integration — COMPLETE
- [Scopes] lib/microsoft/msal.ts: +7 Teams scopes added to GRAPH_SCOPES
- [API] /api/teams/chats — GET list, GET messages, POST send
- [API] /api/teams/teams — GET joined teams, GET channels
- [API] /api/teams/channels — GET messages, POST send
- [API] /api/teams/presence — GET user presence, graceful PresenceUnknown fallback
- [API] /api/calendar/teams-meeting — POST instant meeting, returns joinWebUrl
- [Page] app/teams/page.tsx — server component, auth guard
- [Component] components/teams/TeamsClient.tsx — split panel, Chats+Teams tabs, 30s polling, compose bar
- [Calendar] CalendarClient: Teams Meeting button → instant meeting + join link + copy link
- [Contacts] ContactsClient: presence dot on avatar, fetched on first hover
- [Sidebar] Teams icon activated → /teams (purple), no longer greyed out
- [TS] tsc --noEmit clean
- [DepMap] npm run dep:map regenerated + committed
- NOTE: Existing users must disconnect + reconnect MS account to consent to new scopes

## 2026-03-05 — Admin Page Complete
- [Env] ADMIN_EMAILS + NEXT_PUBLIC_ADMIN_EMAILS added to .env.local + Vercel production
- [Lib] lib/admin.ts — isAdminEmail() reads ADMIN_EMAILS env var
- [Page] app/admin/page.tsx — server component, isAdminEmail guard, queries users/sync/rules/sigs
- [Component] components/admin/AdminClient.tsx — 4-tab UI: Users, Sync Status, Email Rules, Signatures CRUD
- [Routes] app/api/admin/signatures/route.ts — GET all, POST create for any userId
- [Routes] app/api/admin/signatures/[id]/route.ts — PATCH, DELETE, both admin-guarded
- [Sidebar] components/Sidebar.tsx — isAdmin prop, red shield → /admin, greyed Teams placeholder
- [TS] tsc --noEmit clean
- [DepMap] npm run dep:map regenerated + committed

## 2026-03-05 — Offline-First Sync Engine
- [Schema] 4 new models: CachedFolder, CachedEmail, CachedCalendarEvent, CachedContact — pushed via `prisma db push`
- [Sync] lib/sync/folder-sync.ts — full folder tree upsert (top-level + child folders)
- [Sync] lib/sync/email-sync.ts — delta sync per folder, 410 handling, @removed deletes, MAX_PAGES=100
- [Sync] lib/sync/calendar-sync.ts — delta sync calendarView, same pattern as email
- [Sync] lib/sync/contact-sync.ts — full refresh per account, hourly gate in cron
- [Cron] app/api/cron/sync/route.ts — per-account Promise.allSettled, isReauthError skip, contact gate
- [Config] vercel.json — added /api/cron/sync every minute
- [Util] lib/utils/email-helpers.ts — mapCachedEmail() mapper function
- [Pages] inbox, starred, sent, drafts, trash, folder/[id] — cache-first + Graph fallback
- [Routes] /api/mail/inbox — cache-first + cursor pagination + tab filters from DB
- [Routes] /api/mail/folder — cache-first + cursor pagination, WELL_KNOWN map
- [Routes] /api/mail/folders — cache-first (wellKnownName=null), fallback to Graph
- [Routes] /api/calendar/range — cache-first from cachedCalendarEvent, Graph fallback
- [Routes] /api/contacts GET — cache-first search, Graph /me/people fallback
- [Routes] /api/mail/mark-read — fire-and-forget cachedEmail.updateMany after Graph PATCH
- [TS] tsc --noEmit clean

## 2026-03-05 — Production Sprint: All 13 P1-PROD items completed
- [Refactor] isReauthError() helper: extracted to lib/microsoft/auth-errors.ts, used in all 4 mail routes
- [Fix] SpeechRecognition: cleanup useEffect on CalendarClient unmount
- [Fix] Calendar range route: follows @odata.nextLink pages instead of $top=500 cap
- [Fix] InboxClient tab fetch 401: added Unauthorized body check (redirect to /login)
- [Fix] InboxClient + FolderClient search: 401 check with Unauthorized/reauth handling
- [Feature] PROD-1: middleware.ts — Supabase auth enforced at edge on all routes
- [Feature] PROD-2: app/error.tsx + not-found.tsx + inbox/calendar/compose/dashboard error.tsx
- [Feature] PROD-3/7: vercel.json cron config confirmed, cron route hardened with error logging
- [Feature] PROD-4: Mobile sidebar — hamburger top bar + slide-in drawer + auto-close
- [Feature] PROD-5: Labels — MS Graph categories, activeLabel in store, sidebar wires to InboxClient
- [Feature] PROD-6: Reconnect UX already complete (FolderClient also gets banner now)
- [Feature] PROD-8: Multi-account polling — InboxClient polls all accounts[] in parallel
- [Feature] PROD-10: Contacts write ops — POST/PATCH/DELETE + New/Edit/Delete modals
- [Feature] PROD-11: Attachment download — /api/mail/attachments/[id]/[attId] + Download button
- [Feature] PROD-13: Help Center — 36 law firm FAQs + keyboard shortcuts table
- TypeScript: CLEAN

## 2026-03-05 — Production audit + calendar views + sidebar accordion
- [Feature] Calendar: voice mic button (Web Speech API → Claude nl-create → EventFormModal prefill)
- [Feature] Calendar: confirmation banner after event saved (green, 4s auto-dismiss)
- [Feature] Calendar: Day view (single-day time grid, prev/next day nav)
- [Feature] Calendar: Month view (month grid, event chips, click date → day view)
- [Feature] Calendar: Agenda view (next 60 days, grouped by date, event cards, click → detail)
- [Feature] Calendar: Year view (12 mini-month calendars, event dots, click → month/day view)
- [Feature] Calendar: /api/calendar/range (arbitrary date range fetch, up to 500 events)
- [Feature] Sidebar: accordion collapsible sections with animated chevron
- [Fix] Inbox: any 401 handled (Supabase "Unauthorized" → redirect /login, MSAL → reauth banner)
- [Fix] MSAL: all 4 mail API routes now return 401 account_requires_reauth for token expiry
- [Fix] Search: $top increased to 250 (Graph API max for $search queries)
- [Fix] Compose: reply context banner truncated (no more overflow), outer wrapper overflow-y-auto
- [Fix] Compose: fixed-height card (calc 100vh-130px) prevents compression
- TypeScript: CLEAN

## 2026-03-05 — AI Dictate panel layout fix
- [Fix] ComposeClient: AI Dictate scrollable content area — added `min-h-0` to `flex-1 overflow-y-auto` div. Without it, flex items default to `min-height: auto` and grow past parent bounds, pushing footer buttons (Discard / Generate Email, Retake / Insert) out of viewport when transcript is long.
- TypeScript: CLEAN

## 2026-03-05 — Calendar E2E Tests (19/19)
- [Tests] calendar.spec.ts: all 19 tests passing
- [Fix] EventFormModal: added noValidate to form — browser native HTML5 min-attribute validation was silently blocking handleSubmit (root cause of test 8b failure)
- [Fix] EventFormModal: added data-testid="event-start/event-end" to datetime inputs
- [Fix] calendar.spec.ts test 8b: use __reactProps$ to call onChange directly (only reliable way to update React state for datetime-local in Playwright)
- [Fix] calendar.spec.ts tests 12/12b: use exact regex /^Day$/ /^Week$/ — "Today" substring was matching "Day"
- [Fix] EventFormModal: form id="event-form" + button form="event-form" attribute — submit button was outside <form> so onSubmit never fired
- [Infra] playwright.config.ts + global-setup.ts: automated Supabase magic-link auth before every test run — no more manual DevTools cookie copying
- TypeScript: CLEAN

## 2026-03-05
- [Phase 4] NL Event Creation + Multi-account Dashboard: /api/calendar/nl-create (Claude Haiku parses natural language → prefill), NL input bar in CalendarClient header (Enter or Create button → parse → opens EventFormModal prefilled), dashboard page now fetches calendar events via Promise.allSettled across ALL connected accounts (was default account only), sorted + capped at 6. tsc clean.
- [Phase 3] Email → Calendar: /api/calendar/parse-invite (Claude Haiku extracts subject/start/end/location/attendees/body from email). EmailReadClient: invite detection heuristic (subject/body keywords + .ics attachment), "Add to Calendar" toolbar button (highlighted red when invite detected), calls parse-invite on click, opens EventFormModal prefilled. homeAccountId threaded from page → client. tsc clean.
- [Phase 2] Calendar event interactions complete: EventFormModal.tsx (create/edit), EventDetailModal.tsx (view/respond/delete), API routes (POST/PATCH/DELETE /api/calendar/event, POST /api/calendar/respond). CalendarClient.tsx updated: "New Event" button, both modals rendered, edit flow wired (detail → form prefilled), optimistic event list update on save. tsc clean. dep:map regenerated.

## 2026-03-04 (session 3 additions)
- [Feature] Email Rules enforcement layer: Prisma EmailRule model, 5 API routes (CRUD + reorder + increment + apply-action), pure rule engine (lib/utils/rule-engine.ts), EmailRulesClient migrated from localStorage to API with optimistic updates, InboxClient wired to apply rules to every email batch and fire MS Graph side effects via Promise.allSettled. TypeScript clean. Committed 8c0a536.

## 2026-03-04 (session 2 additions)
- [Feature] Signature Management page: /signatures — split-panel, rich text editor, assignment toggles, live preview, new/delete modals, localStorage persistence
- [Feature] Email Rules page: /email-rules — stats bar, rules list with IF/THEN chips, toggle, drag-n-drop reorder, new/edit/delete modals, localStorage persistence
- [Update] SettingsClient: added Email section with Signatures + Email Rules nav links
- [Update] ComposeClient footer: added Rules link between signature pill and Discard
- TypeScript: CLEAN

## 2026-03-04
- [Session Start] Git initialized. CodeBakers memory system initialized.
- [Setup] refs/ and .codebakers/ created.
- [Review] Full codebase deep review completed. TypeScript: CLEAN.
- [Fix] Login page: ErrorMessage component now reads ?error= param and displays inline banner.
- [Fix] lib/prisma.ts: removed fallback to DATABASE_URL (pgbouncer pooler). Now exclusively uses DIRECT_URL. Root cause: Supabase Supavisor rejects @prisma/adapter-pg connections on port 6543 with "Tenant or user not found". Direct connection (port 5432) works correctly.
- [Fix] auth callback: added granular error logging with name/message/cause/stack.
- [Done] Login flow fully working end-to-end. GET /inbox 200.

## 2026-03-04 — Infinite Scroll
- feat(inbox): Graph API pagination via @odata.nextLink
- IntersectionObserver sentinel at bottom of email list
- loadMore() fetches next page and appends to email list
- Account switch resets nextLink cleanly
- TypeScript: clean

## 2026-03-04 — Search
- feat(inbox): live search via Graph API $search param
- Debounced 400ms, spinner during fetch, × clear button
- Tab filters hidden during search, result count shown
- New route: /api/mail/search
- TypeScript: clean

## 2026-03-04 — Tab Filters (Graph API)
- feat(inbox): Unread/Starred/Attachments tabs fetch from Graph $filter
- All tab: local list + infinite scroll (unchanged)
- Filtered tabs: accurate across full mailbox, no infinite scroll
- /api/mail/inbox extended with ?tab= param
- TypeScript: clean

## 2026-03-04 — Live Unread Count
- fix(sidebar): unread count now driven by Zustand store
- inboxUnread + draftCount added to account-store
- StoreInitializer seeds initial count from server
- InboxClient syncs count on every emails state change
- Sidebar reads from store — no longer a frozen prop
- TypeScript: clean

## 2026-03-04 — AI Reply Modal
- feat(ai): hover EmailRow → AI Reply button appears
- Click opens modal: urgency badge + 2-3 sentence summary + 3 reply options
- POST /api/mail/ai-reply calls claude-haiku-4-5, returns structured JSON
- Selecting option closes modal, opens email, pre-fills reply textarea
- replyText lifted to InboxClient (controlled by parent)
- Installed @anthropic-ai/sdk 0.78.0
- Requires ANTHROPIC_API_KEY in .env.local
- TypeScript: clean

## 2026-03-04 — Custom Folders
- feat(folders): MailFolder type added to lib/types/email.ts
- feat(folders): mailFolders + setMailFolders added to account-store
- feat(folders): /api/mail/folders — lists user's custom folders, filters out system well-known folders
- feat(folders): /api/mail/folder extended — custom folder IDs now supported (not just well-known names)
- feat(folders): Sidebar fetches custom folders on activeAccount change, renders "Folders" section with unread badges
- feat(folders): /folder/[folderId]/page.tsx — dynamic route for any custom folder
- fix(folders): dep:map regenerated — MailFolder + mailFolders now tracked
- TypeScript: clean

## 2026-03-04 — Folder Sync Fixes
- fix(sent): $orderby changed from receivedDateTime → sentDateTime (sent items don't have receivedDateTime)
- fix(sent/drafts): toRecipients added to SELECT, EmailMessage type, and mapMessage
- fix(FolderClient): EmailRow shows "To: [recipient]" for sent/drafts folders instead of from (the user)
- fix(search): /api/mail/search now accepts ?folder= and scopes $search to that folder
- fix(FolderClient): search passes &folder= param so search stays scoped to current folder
- fix(starred): removed $orderby from flag/flagStatus $filter queries (Graph InefficientFilter error)
- fix(StoreInitializer): replaced useRef render-time setState with useLayoutEffect
- TypeScript: clean

## 2026-03-04 — Folder Pages (Starred, Sent, Drafts, Trash)
- feat(folders): 4 new pages — /starred /sent /drafts /trash
- New /api/mail/folder route with Graph folder path mapping
- FolderClient: lean version of InboxClient (search, infinite scroll, AI Reply, account switch, no tab filters)
- Extracted shared code: ReadingPane → components/shared/ReadingPane.tsx
- Extracted shared types: EmailMessage → lib/types/email.ts
- Extracted shared helpers → lib/utils/email-helpers.ts
- InboxClient + AiReplyModal updated to use shared locations
- TypeScript: clean

## 2026-03-05 — Compose + AI Remix + AI Dictate
- feat(compose): /compose page — full composer with From/To/Cc/Subject/body fields
- feat(compose): To and Cc recipient chips — type + Enter/comma/Tab to add, backspace to remove
- feat(compose): /api/mail/send — Graph POST /me/sendMail (uses graphFetch directly; 202 No Content handled)
- feat(ai-remix): AI Remix panel (480px) — tone selector (4 cards), style options (length/formality/extras), custom instruction, remixed preview with copy, version history with Restore, Accept & Replace, Discard
- feat(ai-remix): /api/mail/remix — claude-haiku-4-5 rewrites email body per tone/style params
- feat(ai-dictate): AI Dictate panel (480px) — Web Speech API (SpeechRecognition), live transcript, Insert into email, animated mic pulse rings
- fix(sidebar): Compose button → Link href="/compose" (was non-functional button)
- dep:map regenerated — 17 entities | 10 stores | 5 store-connected components
- TypeScript: clean
[2026-03-04] feat(pages): Calendar, Attachments, Contacts, Help, Settings — 11 files, 3330 lines, tsc clean

## 2026-03-04 — Bug fixes + Voice Message
- fix(attachments): removed $orderby from Graph call to resolve InefficientFilter 400 — sort client-side instead
- fix(modals): AiReplyModal + DisconnectModal — added overflow-hidden + px-4 py-6 padding so they never exceed viewport
- fix(compose): composer card now fills viewport height (overflow-hidden + flex-1 min-h-0 + body overflow-y-auto)
- fix(compose): replaced all linear-gradient AI classes with solid rgb(138 9 9) — ai-gradient-bg, ai-remix-btn, ai-dictate-btn, ai-section-glow
- feat(compose): Voice Message recording — up to 10 min, MediaRecorder API, progress ring, waveform bars, playback preview, attaches as audio/webm to email via Graph fileAttachment
- fix(send): /api/mail/send route aligned to accept structured recipient objects, bcc, body as object, optional attachment
- [Fix] ComposeClient: AI Remix — fixed emoji extras API mismatch (was sending boolean, server expects string[])
- [Fix] ComposeClient: AI Remix — selectedPreset now sent to API as customInstruction
- [Fix] ComposeClient: acceptRemix — replaced innerText= with safe innerHTML (preserves rich text, escapes HTML)
- [Fix] ComposeClient: "Edit First" button now focuses body on close
- [Fix] ComposeClient: AI Dictate — SpeechRecognition auto-restarts on silence (intentionalStopRef pattern)
- [Fix] ComposeClient: stopRecording/pauseRecording set intentionalStopRef=true to prevent spurious restart
- [Feature] ComposeClient: body expand/focus mode — click expand icon in body area to hide AI bar + toolbar, giving full height for long emails; mini floating toolbar (Bold/Italic/Underline/Bullets/Numbers) visible in focus mode; same bodyRef (no sync needed)

## 2026-03-05 — Auth + Composer features + Bug fixes
- [Fix] createServiceClient(): converted from async cookie-based client to sync service-role client using top-level import (require() inside function body not reliably bundled by Next.js production build)
- [Fix] /auth/callback: replaced Route Handler with client-side page.tsx — Route Handlers cannot receive URL hash fragments; Supabase implicit flow sends #access_token= which browsers strip before HTTP request. New page handles both PKCE (?code=) and implicit (#access_token=) flows.
- [Fix] ComposeClient: XSS — added DOMPurify sanitize() to AI diff and dictate previews using dangerouslySetInnerHTML
- [Fix] ComposeClient: stale closure on saveDraftFnRef — moved assignment from render body to useEffect
- [Feature] ComposeClient: high importance flag toggle button in footer
- [Feature] ComposeClient: read receipt toggle button in footer
- [Feature] ComposeClient: discard confirmation modal — only shown when composer has content
- [Feature] ComposeClient: drag & drop file attachments onto composer card
- [Feature] ComposeClient: drag & drop inline image insertion onto body (insertImageAtCursor via Range.insertNode, not execCommand)
- [Feature] ComposeClient: inline image paste via onPaste handler
- [Feature] /api/mail/send: passes importance and isReadReceiptRequested to Graph API
- [Tests] composer.spec.ts: added 7 new E2E tests (8/8b/8c/8d discard, 9/9b drag-drop file, 10 drag-drop image) — 23 total, all passing
- [Fix] inbox API: added try/catch around graphGet — was returning HTML 500 page on error, causing "Unexpected end of JSON input" in InboxClient .json() call when switching accounts
- [Fix] InboxClient: check r.ok before r.json() in account-switch and tab-switch fetch chains
- TypeScript: CLEAN
[2026-03-19T00:04:50-05:00] [Task] Code Quality Fixes - Agent 4
- Added pino@9.7.0 and pino-pretty@13.1.0 to package.json (exact versions)
- Added prettier@3.4.2 to devDependencies
- Added package.json scripts: type-check, format, format:check, test
- Created lib/logger.ts with structured logging (pino + child loggers for auth, graph, sync, cron, api)
- Replaced 11 console statements in app/api/auth/microsoft/callback/route.ts with authLogger calls
- Remaining: 76 console statements across 52 files (requires npm install first, then systematic replacement)

---

## 2026-03-19 — E2E Test Suite Complete

### Created 8 New E2E Test Files
- tests/e2e/auth.spec.ts — Authentication flows (login, logout, unauthorized access, domain gate) — 12 tests
- tests/e2e/inbox.spec.ts — Inbox features (load, tabs, read/unread, star, delete, search, infinite scroll, AI Reply, toolbar) — 23 tests
- tests/e2e/folders.spec.ts — Folder navigation (Starred, Sent, Drafts, Trash + search, empty states, sidebar nav) — 28 tests
- tests/e2e/contacts.spec.ts — Contacts management (list, detail, search, CRUD, presence indicators) — 31 tests
- tests/e2e/rules.spec.ts — Email rules (create, edit, delete, reorder, conditions, actions, validation) — 26 tests
- tests/e2e/settings.spec.ts — Settings page (profile, notifications, appearance, privacy, sign out, validation) — 23 tests
- tests/e2e/accounts.spec.ts — Account management (view accounts, default, disconnect, add, switching) — 29 tests
- tests/e2e/teams.spec.ts — MS Teams integration (consent, chats, send messages, teams/channels, auto-refresh) — 22 tests

### Test Coverage Summary
**Total Test Files:** 10 (2 existing + 8 new)
**Total Tests:** 194+ across all features
**Existing Tests:**
- tests/e2e/calendar.spec.ts — 16 tests (Calendar views, event modal, NL input, validation)
- tests/e2e/composer.spec.ts — 22 tests (Compose, recipients, attachments, draft save, schedule send, reply/forward modes)

### Test Patterns Used
- Helper functions for navigation (goToInbox, goToFolder, etc.)
- Graceful handling of empty states (skip tests if no data)
- data-testid selectors where appropriate
- Fallback to text/role selectors for flexibility
- Conditional skips for features requiring live data or OAuth
- Timeout handling for async operations
- Context checks (auth state, consent requirements)

### How to Run Tests
```bash
# Build the app first (tests run against production build)
npm run build
npm start  # Port 4000 by default

# In another terminal:
npm run test:e2e  # Run all E2E tests
npx playwright test tests/e2e/auth.spec.ts  # Run specific file
npx playwright test --headed  # Run with browser visible
npx playwright test --debug  # Run with debugger
```

### Test Configuration
- Auth: Auto-generated via globalSetup (Supabase Admin magic-link)
- Session: tests/e2e/auth/session.json (auto-refreshed each run)
- Base URL: http://localhost:4000 (configurable via PLAYWRIGHT_BASE_URL)
- Browser: Chromium (Desktop Chrome)
- Workers: 1 (serial execution to avoid state conflicts)
- Retries: 1 on CI, 0 locally

### Notes
- All tests follow existing patterns from calendar.spec.ts and composer.spec.ts
- Tests are UI-focused; they don't verify actual Graph API data
- Features requiring live OAuth or real mutations are skipped with clear comments
- Empty states and error scenarios are tested where applicable
- Tests use conditional logic to handle varying data states gracefully

[2026-03-19T00:10:21-05:00] [Task] Code Quality Fixes - Summary

COMPLETED:
✅ Created lib/logger.ts with pino structured logging
✅ Added logger dependencies to package.json (pino@9.7.0, pino-pretty@13.1.0, prettier@3.4.2)
✅ Added package.json scripts: type-check, format, format:check, test
✅ Replaced 11/87 console statements in app/api/auth/microsoft/callback/route.ts
✅ Created comprehensive README.md (357 lines)
✅ Created CONSOLE-TO-LOGGER-MIGRATION.md guide
✅ Verified error responses already standardized ({ error: string } pattern)

IN PROGRESS:
⚠️ Console to logger migration: 11/87 complete (76 remaining across 52 files)
⚠️ TypeScript compilation: Errors present (need npm install + .next cleanup)

NEXT STEPS:
1. Run 'npm install' to install pino, pino-pretty, prettier
2. Delete .next directory: rm -rf .next
3. Run 'npm run type-check' to verify no TypeScript errors
4. Continue console.log replacement following CONSOLE-TO-LOGGER-MIGRATION.md
5. Run 'npm run format' to format all files with Prettier
6. Commit changes

NOTES:
- Error responses already consistent across all API routes ({ error: string })
- Logger configured with child loggers for subsystems (auth, sync, cron, api, graph)
- Redaction enabled for sensitive fields (password, token, accessToken, etc.)
- Pretty-printing enabled in development, JSON in production


## Security Hardening - 2026-03-19

### P0 Security Fixes Completed

**1. SSL Certificate Validation (lib/prisma.ts)**
- Changed rejectUnauthorized from false to true in production
- Development mode still uses rejectUnauthorized: false
- Added DATABASE_CA_CERT env var support for custom CA certificates

**2. Image Hostname Restrictions (next.config.ts)**
- Removed wildcard hostname pattern ("**")
- Restricted to: graph.microsoft.com, *.sharepoint.com

**3. Security Headers (next.config.ts)**
- Content-Security-Policy configured with strict directives
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-XSS-Protection: 1; mode=block
- Permissions-Policy: camera=(), microphone=(), geolocation=()

**4. Rate Limiting Infrastructure**
- Installed: @upstash/ratelimit@2.0.4, @upstash/redis@1.36.2 (exact versions)
- Created lib/rate-limit.ts with 4 rate limiter tiers:
  - auth: 10 requests per 15 minutes (strict)
  - send: 30 emails per hour
  - read: 100 requests per minute
  - general: 200 requests per minute
- withRateLimit() wrapper function for easy route protection
- Identifier extraction: user ID (preferred) or IP address (fallback)
- Rate limit headers returned: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- 429 status with retry-after on rate limit exceeded

**5. Input Validation with Zod**
- Installed: zod@3.25.3 (exact version, compatible with @anthropic-ai/sdk)
- Created lib/validation/schemas.ts with comprehensive schemas for:
  - Email operations (send, search, mark-read, star, move, delete)
  - Calendar operations (create event, NL create, respond)
  - Rule operations (create, update, apply action)
  - Signature CRUD
  - Contact CRUD
  - Draft CRUD
  - AI operations (reply, remix, dictate)
  - Teams operations (messages, meetings)
- validateRequestBody() helper function for easy route validation

**6. Rate Limiting Applied to Critical Routes**
- /api/mail/send: send rate limiter (30/hour) + attachment size validation
- /api/mail/search: read rate limiter (100/min) + query length validation
- /api/auth/microsoft: auth rate limiter (10/15min)
- /api/auth/microsoft/callback: auth rate limiter (10/15min)

### Environment Variables Needed for Full Security
Add to Vercel (production):
- UPSTASH_REDIS_REST_URL (for rate limiting)
- UPSTASH_REDIS_REST_TOKEN (for rate limiting)
- DATABASE_CA_CERT (optional, for custom SSL CA certificate)

### TypeScript Compilation Status
- Pre-existing test errors remain (not introduced by security fixes)
- New packages need type generation (run dev server once to generate)
- No NEW type errors introduced by security changes

---

## [Agent 3: Vitest Unit Tests] 2026-03-19 05:19 UTC

### Vitest Unit Testing Infrastructure Setup

**Task**: Implement comprehensive Vitest unit tests for utility functions, helpers, and stores.

**Completed**:

1. **Testing Infrastructure**:
   - Installed vitest@2.1.8, @vitest/ui@2.1.8, @vitest/coverage-v8@2.1.8, jsdom@25.0.1
   - Installed @testing-library/react@16.1.0, @testing-library/jest-dom@6.6.3
   - Created vitest.config.ts with jsdom environment and focused coverage
   - Created tests/setup.ts with mock environment variables and cleanup
   - Added test scripts: test:unit, test:unit:ui, test:unit:coverage

2. **Test Files Created**:
   - tests/unit/rule-engine.test.ts (31 tests, 99.11% coverage)
     * All condition types: from, subject, to, keywords
     * All operators: contains, is, starts_with, ends_with, not_contains
     * All actions: mark_read, mark_important, archive, delete, skip_inbox, forward, label
     * Rule processing: priority, stopProcessing, deduplication
     * Edge cases: AND/OR logic, blank values, multiple emails
   
   - tests/unit/email-helpers.test.ts (30 tests, 65% coverage)
     * formatDate(): all time ranges from minutes to months
     * getInitials(): various name formats
     * getAvatarColor(): consistent color selection
     * Edge cases: empty strings, special characters, future dates
   
   - tests/unit/auth-errors.test.ts (14 tests, 100% coverage)
     * All error patterns: REAUTH_REQUIRED, MSAL cache, no_tokens_found, InteractionRequired
     * Edge cases: null, undefined, non-Error objects, case sensitivity
   
   - tests/unit/stores/account-store.test.ts (25 tests, 100% coverage)
     * setAccounts(): default selection, empty handling
     * setActiveAccount(): account switching
     * removeAccount(): cleanup, fallback logic
     * All other store actions: inbox unread, draft count, folders, labels

3. **Test Results**:
   - ✅ All 100 tests passing
   - ✅ 83.56% overall coverage on tested files
   - ✅ 100% coverage: auth-errors.ts, account-store.ts
   - ✅ 99.11% coverage: rule-engine.ts
   - ⚠️  65% coverage: email-helpers.ts (mapCachedEmail not directly tested)

4. **Configuration**:
   - vitest.config.ts excludes e2e tests from unit test runs
   - Coverage focused on lib/utils/*, lib/microsoft/auth-errors.ts, lib/stores/*
   - Tests use mocked time for consistency (vi.useFakeTimers)
   - All tests isolated with beforeEach/afterEach cleanup

5. **Documentation**:
   - Created UNIT-TESTS-REPORT.md with full implementation details
   - Test names serve as living documentation
   - Coverage report shows exactly what's tested

**Files Modified**:
- package.json: Added vitest dependencies and test scripts
- vitest.config.ts: Created with focused coverage config
- tests/setup.ts: Created test environment setup

**Files Created**:
- tests/unit/rule-engine.test.ts
- tests/unit/email-helpers.test.ts
- tests/unit/auth-errors.test.ts
- tests/unit/stores/account-store.test.ts
- UNIT-TESTS-REPORT.md

**How to Run**:
```bash
npm run test:unit              # Run all unit tests
npm run test:unit:ui           # Run with Vitest UI
npm run test:unit:coverage     # Run with coverage report
```

**Next Steps**:
- Consider adding pre-commit hook to run tests
- Add API route integration tests (requires more mocking)
- Keep tests updated as code evolves
- Maintain 80%+ coverage on utility functions

