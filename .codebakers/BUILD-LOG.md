# Build Log

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
