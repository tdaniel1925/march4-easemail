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
