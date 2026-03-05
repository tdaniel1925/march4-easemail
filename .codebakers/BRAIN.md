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
- `email_rules` — inbox automation rules (conditions/actions as Json, priority, emailCount, stopProcessing)

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
| `/dashboard` | ✅ Live clock, agenda, todos, weekly chart, recent unread |
| `/accounts` | ✅ Account cards, disconnect modal, default promotion |
| `/calendar` | ✅ Week-view grid, MS Graph calendarView, prev/next navigation |
| `/attachments` | ✅ File table from Graph expanded attachments, type filter, search |
| `/contacts` | ✅ Split-panel, alphabetical list, detail panel, /me/contacts |
| `/help` | ✅ Hero + search, 6 category tabs, FAQ accordion |
| `/settings` | ✅ Profile, notifications toggles, appearance, privacy, sign out |

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

## Completed Features (session 3)
- `/compose` — full email composer: AI Remix (tone/length/formality/presets, selection-aware), AI Dictate (SpeechRecognition → Claude formatting → preview → insert), Voice Message (MediaRecorder, 10-min), signature ghost placeholder, body expand/focus mode
- `/signatures` — SignaturesClient, localStorage persistence (pending DB migration)
- `/email-rules` — EmailRulesClient fully wired to DB: Prisma EmailRule model, 5 API routes, pure rule engine (lib/utils/rule-engine.ts), client-side enforcement in InboxClient

## Key Patterns Established
- **Prisma Json fields:** write via `JSON.parse(JSON.stringify(...))`, read via `as unknown as Type[]`
- **Contenteditable blank lines:** join `<div>` sections with `<div><br></div>` not `""`
- **AI output pipeline:** Claude → `formatEmailSpacing()` → `remixTextToHtml()` → `innerHTML`
- **SpeechRecognition:** auto-restart on silence via `onend` + `intentionalStopRef`, 10-min cap via time ref
- **Rule engine:** pure function, `Promise.allSettled` for side effects, never throws to inbox

## Current Focus
- Session start: 2026-03-04 (session 3)
- Last completed: AI Dictate formatting + spacing fix, dep map + error log update
- Next: TBD by user

## Session Artifacts
- `codebakers-suggestions.md` — improvements to the CodeBakers framework captured during this build. Update it whenever a protocol gap or recurring friction point is identified.

## Known Issues / Risks
See FIX-QUEUE.md
