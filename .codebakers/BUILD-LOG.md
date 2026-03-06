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
