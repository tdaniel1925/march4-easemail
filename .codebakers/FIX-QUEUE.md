# Fix Queue
_Last updated: 2026-03-05 (latest session)_

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

## DONE ✅ — Latest Session (2026-03-05)
- [x] Domain gate: middleware + OAuth callback block non-dmillerlaw.com / non-admin emails
- [x] Compose send: router.back() instead of router.push("/sent")
- [x] Search: DB cache-first (cachedEmail contains), Graph fallback with $top=50
- [x] AI prompts: system prompts + law firm context for all 4 routes (ai-reply, remix, dictate, nl-create)
- [x] Sidebar: isAdmin computed internally (no longer needs prop from each page)
- [x] ALLOWED_DOMAINS=dmillerlaw.com added to .env.local (⚠️ still needs adding to Vercel)

## Remaining Nice-to-Haves
- [ ] Add ALLOWED_DOMAINS=dmillerlaw.com to Vercel environment variables
- [ ] Webhook subscriptions for real-time push (WebhookSubscription table exists, not wired)
- [ ] Account disconnect: also delete cached_folders/emails/cal_events/contacts for that account

## DONE ✅ — MS Teams Integration (Option B — Full Page)
_Approved by user 2026-03-05_

### Step 1 — OAuth Scopes
- [x] Add Teams scopes to MSAL auth flow: Chat.ReadWrite, ChannelMessage.Send, Team.ReadBasic.All, Channel.ReadBasic.All, OnlineMeetings.ReadWrite (TEAMS_SCOPES — separate from GRAPH_SCOPES)
- [x] Update /api/auth/microsoft scope array

### Step 2 — API Routes (/api/teams/...)
- [x] GET /api/teams/chats — list user's chats (1:1 + group)
- [x] GET /api/teams/chats/[id]/messages — messages in a chat
- [x] POST /api/teams/chats/[id]/send — send message to a chat
- [x] GET /api/teams/teams — list joined teams
- [x] GET /api/teams/teams/[id]/channels — channels in a team
- [x] GET /api/teams/channels/[id]/messages — messages in a channel
- [x] POST /api/teams/channels/[id]/send — send to a channel
- [x] GET /api/teams/presence?userId=... — presence for a user
- [x] POST /api/calendar/teams-meeting — create online Teams meeting

### Step 3 — /teams Page + TeamsClient
- [x] app/teams/page.tsx — server component, auth guard, pass initial data
- [x] components/teams/TeamsClient.tsx — split panel:
  - Left: tabs (Chats | Teams), chat list, team→channel browser
  - Right: message thread, compose bar, presence dots on senders
  - Polling every 30s for new messages

### Step 4 — Calendar Update
- [x] "New Teams Meeting" button in CalendarClient
- [x] Calls POST /api/calendar/teams-meeting → returns joinUrl
- [x] Shows join link in confirmation banner

### Step 5 — Contacts Presence
- [x] Hover on contact card → fetch GET /api/teams/presence → show availability dot

### Step 6 — Sidebar
- [x] Activate the greyed-out Teams icon in Sidebar footer → link to /teams

### Step 7 — Verify + Commit
- [x] tsc --noEmit clean
- [x] npm run dep:map
- [x] Commit all Teams work

## DONE — Offline-First Sync Engine (2026-03-05)
- [x] Email delta links / incremental Graph sync — fully wired via /api/cron/sync
- [x] Calendar delta sync — cachedCalendarEvent via same cron
- [x] Contact sync — hourly full refresh via same cron
- [x] All pages + API routes: cache-first with Graph fallback
- [x] Cursor-based pagination from DB cache (email ID as cursor)
