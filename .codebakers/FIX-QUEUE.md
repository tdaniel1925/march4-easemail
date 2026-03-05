# Fix Queue

## P1-PROD — Production Hardening Sprint (13 items, ALL DONE ✅)

- [x] [PROD-1] middleware.ts — Supabase auth enforced on all non-public routes
- [x] [PROD-2] app/error.tsx + not-found.tsx + section error.tsx (inbox/calendar/compose/dashboard)
- [x] [PROD-3] vercel.json cron config already present; cron route hardened with error logging
- [x] [PROD-4] Mobile sidebar — hamburger top bar + slide-in drawer with backdrop + close on route change
- [x] [PROD-5] Labels — store activeLabel, sidebar wires labels to InboxClient tab filter via Graph categories
- [x] [PROD-6] Reconnect UX — banner with "Reconnect" link to /api/auth/microsoft?add=1 (was already done)
- [x] [PROD-7] Cron hardening — CRON_SECRET verified, structured response with timestamps, per-failure logging
- [x] [PROD-8] Multi-account polling — InboxClient polls ALL accounts[] in parallel, aggregates new emails
- [x] [PROD-9] Search 401 handling — both InboxClient and FolderClient search paths check 401
- [x] [PROD-10] Contacts write ops — POST/PATCH/DELETE routes + New/Edit/Delete modals in ContactsClient
- [x] [PROD-11] Attachment download — /api/mail/attachments/[messageId]/[attachmentId] + Download button
- [x] [PROD-12] Dashboard — Compose CTA + per-account stats already present
- [x] [PROD-13] Help Center — 36 real FAQs (6 per category), keyboard shortcuts table, law firm content

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
