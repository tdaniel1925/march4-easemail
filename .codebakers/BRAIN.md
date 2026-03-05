# 🍞 EaseMail — BRAIN.md
_Last updated: 2026-03-04_

## Project Identity
- **Name:** EaseMail
- **Type:** Email client (web app) for law firms
- **Target:** Darren Miller Law Firm (single-tenant for now, multi-tenant ready)
- **Stack:** Next.js 16 + Supabase + Prisma (pg adapter) + MS Graph API + Vercel

## Auth Architecture
- **Identity provider:** Microsoft (via MSAL node — `@azure/msal-node`)
- **Session layer:** Supabase Auth (magic link issued server-side after MS OAuth)
- **Flow:** `/api/auth/microsoft` → MS consent → `/api/auth/microsoft/callback` → Supabase magic link → `/auth/callback` → `/inbox`
- **DB:** Prisma (direct pg connection to Supabase DB, NOT Supabase client for DB ops)

## Key Decisions
- Supabase Auth is used ONLY for session cookies — MS Graph is the email source
- MSAL token cache is serialized to DB per user (`msal_token_cache` table)
- `prisma.config.ts` exists but datasource in schema has NO `url` — relies on env vars at runtime
- package.json uses `^` on all deps — VIOLATES CodeBakers rule (should be --save-exact)
- No `pnpm` — project uses `npm` (package-lock.json present, no pnpm-lock.yaml)

## DB Schema (Prisma)
- `organizations` — tenant (law firm)
- `users` — mirrors Supabase auth.users.id, belongs to org
- `ms_connected_accounts` — one per MS account linked
- `msal_token_cache` — serialized MSAL cache per user
- `email_delta_links` — for incremental Graph sync (not yet wired)
- `webhook_subscriptions` — MS Graph change notifications (not yet wired)
- `drafts` — email drafts (not yet wired to UI)

## Pages / Routes
| Route | Status |
|---|---|
| `/` | Redirects to `/login` |
| `/login` | ✅ UI complete, MS OAuth button wired |
| `/onboarding` | ✅ Connect MS account prompt |
| `/inbox` | ✅ Fetches emails via Graph, list + reading pane |
| `/api/auth/microsoft` | ✅ Initiates MSAL auth code flow |
| `/api/auth/microsoft/callback` | ✅ Exchanges code, upserts user+DB, generates magic link |
| `/auth/callback` | ✅ Exchanges Supabase code for session, redirects |
| `/api/auth/signout` | ✅ Signs out Supabase session |
| `/starred`, `/sent`, `/drafts`, `/trash` | ✅ Built — FolderClient with search, infinite scroll, AI Reply |
| `/dashboard`, `/attachments`, `/calendar` | ❌ NOT BUILT |
| `/accounts`, `/contacts`, `/settings`, `/help` | ❌ NOT BUILT |

## InboxClient Data Architecture
- **All tab:** local `emails` state + infinite scroll via `@odata.nextLink`
- **Unread/Starred/Attachments tabs:** fetch from Graph API with `$filter` on tab switch — NOT local filtering. Route: `/api/mail/inbox?tab=unread|starred|attachments`
- **Search:** debounced 400ms → `/api/mail/search?q=...` — overrides all tabs, disables infinite scroll
- InboxClient owns all data fetching; Sidebar reads counts from Zustand `account-store`

## Shared Infrastructure (created during folder build)
- `lib/types/email.ts` — `EmailMessage` interface (single source of truth)
- `lib/utils/email-helpers.ts` — `formatDate`, `getInitials`, `getAvatarColor`
- `components/shared/ReadingPane.tsx` — reading pane + SafeHtml (DOMPurify lazy)
- `components/folder/FolderClient.tsx` — lean inbox (search, infinite scroll, AI Reply, no tab filters)
- `/api/mail/folder` — serves all 4 folder routes via `?folder=sent|drafts|trash|starred`

## Current Focus
- Session start: 2026-03-04
- Last completed: Starred, Sent, Drafts, Trash folder pages
- Next: Compose or remaining sidebar pages (Dashboard, Accounts, Contacts, Settings, etc.)

## Session Artifacts
- `codebakers-suggestions.md` — improvements to the CodeBakers framework captured during this build. Update it whenever a protocol gap or recurring friction point is identified.

## Known Issues / Risks
See FIX-QUEUE.md
