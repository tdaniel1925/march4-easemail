# Fix Queue
_Last updated: 2026-03-05_

## ALL DONE ✅ — P1-PROD Sprint (13 items)
## ALL DONE ✅ — P1 Auth / Login Critical
## ALL DONE ✅ — P2 Architectural / Quality (fixed this session)
## ALL DONE ✅ — P3 Features (all pages built)

### What was completed (P2, fixed 2026-03-05):
- [x] createServiceClient() — already correctly uses plain createClient() from @supabase/supabase-js
- [x] listUsers() O(n) — replaced with prisma.user.findUnique({ where: { email } }) — O(1) indexed
- [x] Prisma datasource — added explicit url/directUrl env fields
- [x] package.json — all ^ removed, all deps pinned exact
- [x] XSS — SafeHtml already used DOMPurify (was done earlier)
- [x] Send Reply — /api/mail/reply + compose ?mode=reply already wired (was done earlier)
- [x] Mark as read — /api/mail/mark-read already exists and is called on email open (was done earlier)
- [x] NEXTAUTH_SECRET= — removed from .env.local

### What was completed (P3 features, all done in earlier sessions):
- [x] /starred, /sent, /drafts, /trash — FolderClient with search, infinite scroll, AI Reply
- [x] /dashboard — live clock, agenda, todos, weekly chart, recent unread, multi-account events
- [x] /attachments — file table from Graph, type filter, search, download
- [x] /calendar — Week/Day/Month/Agenda/Year views, NL create, voice mic, event CRUD, email→calendar
- [x] /accounts — account cards, disconnect modal, full cleanup on disconnect
- [x] /contacts — split-panel, alphabetical list, detail panel, full CRUD (POST/PATCH/DELETE)
- [x] /settings — profile, notification toggles, appearance, privacy, sign out
- [x] /help — hero + search, 6 category tabs, 36 law firm FAQs, keyboard shortcuts
- [x] /compose — full composer: To/Cc/Bcc chips, From selector, attachments, drag-drop, AI Remix, AI Dictate, Voice Message, signature, schedule send, draft auto-save, reply/forward/replyAll mode, Ctrl+Enter, discard confirm, importance flag, read receipt
- [x] AI Remix — /api/mail/remix, tone/style/length/formality/presets, real diff, version history
- [x] AI Dictate — Web Speech API, live transcript, Claude formatting, insert into email
- [x] /signatures — SignaturesClient, CRUD API, DB-backed
- [x] /email-rules — EmailRulesClient, 5 CRUD routes, Prisma EmailRule model, pure rule engine, InboxClient enforcement

## Remaining Nice-to-Haves
- [ ] Webhook subscriptions for real-time push (WebhookSubscription table exists, not wired)
- [ ] Account disconnect: also delete cached_folders/emails/cal_events/contacts for that account

## DONE — Offline-First Sync Engine (2026-03-05)
- [x] Email delta links / incremental Graph sync — fully wired via /api/cron/sync
- [x] Calendar delta sync — cachedCalendarEvent via same cron
- [x] Contact sync — hourly full refresh via same cron
- [x] All pages + API routes: cache-first with Graph fallback
- [x] Cursor-based pagination from DB cache (email ID as cursor)
