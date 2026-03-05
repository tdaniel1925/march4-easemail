# Fix Queue

## P1-PROD — Production Hardening Sprint (13 items, ordered)

- [ ] [PROD-1] Add `middleware.ts` at project root — enforce Supabase auth on all non-public routes server-side. Public routes: /, /login, /auth/callback, /api/auth/*, /api/cron/*. All others → redirect to /login if no session.
- [ ] [PROD-2] Add `app/error.tsx` global error boundary + `app/not-found.tsx`. Each main section (inbox, calendar, compose, dashboard) gets its own `error.tsx`. Show branded error UI with "Try again" + "Go to inbox" buttons.
- [ ] [PROD-3] Confirm Vercel production env vars: NEXT_PUBLIC_APP_URL=https://easemail.app, MICROSOFT_REDIRECT_URI=https://easemail.app/api/auth/microsoft/callback, NEXT_PUBLIC_MICROSOFT_REDIRECT_URI=https://easemail.app/api/auth/microsoft/callback. Add vercel.json with cron: /api/cron/send-scheduled every minute.
- [ ] [PROD-4] Mobile sidebar: add hamburger toggle in app header visible on mobile (lg:hidden), slide-in drawer with same Sidebar content, overlay backdrop, close on route change. Sidebar currently hidden on mobile entirely.
- [ ] [PROD-5] Labels: wire to Microsoft Graph categories ($select=categories on messages). Sidebar label buttons filter inbox by clicking → set activeLabel → InboxClient fetches /me/mailFolders/inbox/messages?$filter=contains(categories,'Work'). Allow user to add/remove labels inline on email.
- [ ] [PROD-6] Reconnect UX: when `requiresReauth=true` banner shows in InboxClient/FolderClient, add a "Reconnect" button that calls /api/auth/microsoft with the account's homeAccountId as state, redirects to MS login, then returns user to inbox. Currently banner shows but user must go to /accounts manually.
- [ ] [PROD-7] vercel.json cron config for /api/cron/send-scheduled — must run every minute. Also harden the route: verify CRON_SECRET header, add error logging, return structured response. Without vercel.json cron entry, scheduled sends never fire in production.
- [ ] [PROD-8] Multi-account email polling: 30s polling in InboxClient currently only polls active account. Should poll ALL connected accounts (from accounts[] in store) in parallel and aggregate new email counts across all. Show per-account count in banner.
- [ ] [PROD-9] Search 401 handling: InboxClient search fetch has no 401 check — returns silent failure. Add same pattern as load: if 401 + account_requires_reauth → setRequiresReauth(true). Also add reauth check to FolderClient search path.
- [ ] [PROD-10] Contacts write ops: ContactsClient is read-only. Add: "New Contact" button → modal (name, email, phone, company, title) → POST /api/contacts → Graph POST /me/contacts. Edit button on contact detail → PATCH. Delete with confirmation → DELETE.
- [ ] [PROD-11] Attachment download: AttachmentsClient lists attachments but no download button. Add download icon per row → GET /api/mail/attachments/[messageId]/[attachmentId] → Graph GET /me/messages/{id}/attachments/{attId} → return base64 → client triggers blob download.
- [ ] [PROD-12] Dashboard enrichment: add unread count per connected account (from accountStore), emails sent today (Graph sent items filter by sentDateTime), next 3 upcoming events (not just today), quick-compose button. DashboardClient already has accounts from store.
- [ ] [PROD-13] Help Center content: HelpClient has UI shell. Populate with real content: FAQ accordion (6 topics minimum: connecting account, composing, AI features, calendar, rules, billing/support), keyboard shortcuts reference, contact support link.

## P1 — Blocking / Login Critical
- [x] [LOGIN] `ErrorMessage` component fixed — now reads `?error=` param and shows inline red banner
- [x] [LOGIN] MS OAuth errors now visible on login page
- [ ] [AUTH] `createServiceClient()` passes `cookies()` to service role client — service role shouldn't touch cookies. Should use `createClient()` from `@supabase/supabase-js` directly with service role key.
- [ ] [AUTH] `listUsers()` called in callback to find existing user — O(n) scan of ALL users; replace with `getUserByEmail()` or filter server-side

## P2 — Architectural / Quality
- [x] [DB] lib/prisma.ts now exclusively uses DIRECT_URL — pgbouncer pooler (DATABASE_URL) is incompatible with @prisma/adapter-pg
- [ ] [SCHEMA] `prisma/schema.prisma` datasource has NO `url` field — relies entirely on env. Add explicit `url` and `directUrl` fields.
- [ ] [DEPS] All package.json deps use `^` — should be pinned exact per CodeBakers rule
- [ ] [SECURITY] `dangerouslySetInnerHTML` on email body HTML in InboxClient — no sanitization. XSS risk.
- [ ] [INBOX] Reply "Send Reply" button is a no-op (TODO comment) — does not call Graph API
- [ ] [INBOX] "Mark as read" on email open only updates local state — doesn't call Graph PATCH /messages/{id}
- [ ] [AUTH] `NEXTAUTH_SECRET=` in .env.local is empty and unused — remove it (NextAuth is banned per CodeBakers)

## P3 — Missing Features (not yet built)
- [ ] `/starred`, `/sent`, `/drafts`, `/trash` pages
- [ ] `/dashboard`, `/attachments`, `/calendar` pages
- [ ] `/accounts`, `/contacts`, `/settings`, `/help` pages
- [ ] Compose email flow
- [ ] AI Remix + AI Dictate (buttons exist, no backend)
