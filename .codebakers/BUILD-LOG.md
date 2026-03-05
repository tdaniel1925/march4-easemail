# Build Log

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
