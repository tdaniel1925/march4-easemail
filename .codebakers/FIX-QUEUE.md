# Fix Queue

## P1 — Blocking / Login Critical
- [ ] [LOGIN] `ErrorMessage` component is a no-op — `?error=` param from redirect is never displayed to user
- [ ] [LOGIN] No `?error=` param reading on login page — MS OAuth errors silently swallowed
- [ ] [AUTH] `createServiceClient()` passes `cookies()` to service role client — service role shouldn't touch cookies. Should use `createClient()` from `@supabase/supabase-js` directly with service role key.
- [ ] [AUTH] `listUsers()` called in callback to find existing user — O(n) scan of ALL users; replace with `getUserByEmail()` or filter server-side

## P2 — Architectural / Quality
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
