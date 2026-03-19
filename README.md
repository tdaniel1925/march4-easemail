# EaseMail

> Enterprise email client for law firms, powered by Microsoft Graph API

EaseMail is a modern, feature-rich email client built specifically for legal professionals. It combines the power of Microsoft 365 with AI-assisted composition, advanced inbox automation, and seamless calendar integration.

---

## Features

### Email Management
- **Unified Inbox** - View emails from multiple Microsoft accounts in one place
- **Smart Folders** - Inbox, Sent, Drafts, Starred, Trash with search and filtering
- **Reading Pane** - Split-panel interface with email preview and full content view
- **Rich Composition** - Full-featured email composer with formatting, attachments, signatures
- **Infinite Scroll** - Load more emails automatically as you scroll
- **Bulk Operations** - Mark multiple emails as read, star, archive, or delete at once
- **Email Threading** - Group related conversations together (batch-6 feature)
- **Advanced Filters** - Filter by date range, sender, has attachments, importance level

### AI-Powered Features
- **AI Reply** - Generate contextual email responses in multiple tones (Professional, Friendly, Formal, Brief)
- **AI Remix** - Rewrite email drafts with customizable tone, length, formality, and style
- **AI Dictate** - Voice-to-text transcription with intelligent formatting via Web Speech API
- **Smart Composition** - AI quality scoring and real-time diff preview

### Calendar & Scheduling
- **Multi-View Calendar** - Week, Day, Month, Agenda, and Year views
- **Natural Language Entry** - "Meeting with David tomorrow at 2pm" → instant event creation
- **Teams Meeting Integration** - Create Microsoft Teams meetings directly from calendar
- **Voice Input** - Dictate calendar events using speech recognition
- **Event Management** - Full CRUD operations for calendar events

### Productivity Tools
- **Email Rules** - Automate inbox actions based on sender, subject, keywords (OR/AND logic)
- **Signatures** - Create and manage multiple email signatures with smart defaults
- **Quick Actions** - Reply, Reply All, Forward, Archive, Delete from reading pane
- **Schedule Send** - Schedule emails to send at 1hr, 4hr, tomorrow, Monday, or custom time
- **Draft Auto-Save** - Never lose your work with automatic draft saving every 5 seconds
- **Undo Send** - Recall sent emails within 30 seconds (batch-6 feature)

### Contacts & Teams
- **Contact Management** - Full CRUD for Microsoft contacts with presence indicators
- **Contact Search** - Autocomplete recipient fields with your contact directory
- **Teams Integration** - Chat, channels, and messaging from within EaseMail
- **Presence Indicators** - See who's available, busy, or offline in real-time

### Collaboration
- **Attachments View** - Browse all email attachments across accounts with type filtering
- **File Download** - Download attachments with one click
- **Drag & Drop** - Drop files onto composer or inline into email body
- **Voice Messages** - Record and attach audio messages (up to 10 minutes)

### Administration
- **Admin Panel** - Manage users, view sync status, configure signatures and rules
- **Domain Gate** - Restrict access to specific email domains (e.g., @dmillerlaw.com)
- **Multi-Account Support** - Connect multiple Microsoft accounts per user
- **Account Management** - Disconnect accounts with full cleanup (webhooks, tokens, drafts, cache)

### Sync & Offline Support
- **Offline-First Architecture** - All data cached locally in PostgreSQL via Prisma
- **Delta Sync** - Incremental email/calendar/contact sync every minute via Vercel Cron
- **Cursor Pagination** - Efficient loading of large datasets from local cache
- **410 Gone Handling** - Automatic full re-sync when delta tokens expire

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, React Server Components)
- **UI**: React 19, TypeScript 5.9, Tailwind CSS
- **State**: Zustand (account store, calendar store)
- **Rich Text**: ContentEditable with DOMPurify XSS protection
- **Speech**: Web Speech API (SpeechRecognition)
- **Media**: MediaRecorder API for voice messages

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 7.4 with pg adapter
- **Auth**: Supabase Auth + Microsoft OAuth (MSAL node)
- **Email**: Microsoft Graph API
- **AI**: Anthropic Claude (Haiku 4.5 model)

### Infrastructure
- **Hosting**: Vercel
- **Storage**: Supabase PostgreSQL
- **Cron**: Vercel Cron (sync every minute, send scheduled emails)
- **Logging**: Pino (structured JSON logs)

### Development Tools
- **Linter**: ESLint
- **Formatter**: Prettier
- **Type Checker**: TypeScript strict mode
- **E2E Tests**: Playwright
- **Dependency Map**: Custom ts-node script (`npm run dep:map`)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** (LTS recommended)
- **npm or pnpm** (npm used in this project)
- **PostgreSQL** (via Supabase or local)
- **Microsoft Azure AD App** (for OAuth)
- **Anthropic API Key** (for AI features)
- **Vercel Account** (for deployment)

---

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:4000
NODE_ENV=development

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (direct Prisma connection)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_azure_app_client_id
MICROSOFT_CLIENT_SECRET=your_azure_app_client_secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:4000/api/auth/microsoft/callback

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Cron Security
CRON_SECRET=your_random_secret_here

# Access Control
ALLOWED_DOMAINS=dmillerlaw.com
ADMIN_EMAILS=admin@example.com,user@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,user@example.com

# Logging
LOG_LEVEL=info
```

### Microsoft Azure AD App Setup

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Create a new app registration:
   - Name: EaseMail
   - Supported account types: Multitenant (common)
   - Redirect URI: `http://localhost:4000/api/auth/microsoft/callback` (Web)
3. Go to Certificates & Secrets → New client secret → Copy the value
4. Go to API Permissions → Add these Microsoft Graph permissions:
   - `User.Read`
   - `Mail.ReadWrite`
   - `Mail.Send`
   - `Calendars.ReadWrite`
   - `Contacts.ReadWrite`
   - `Chat.ReadWrite`
   - `ChannelMessage.Send`
   - `Team.ReadBasic.All`
   - `Channel.ReadBasic.All`
   - `OnlineMeetings.ReadWrite`
   - `Presence.Read.All`
5. Grant admin consent for your organization

---

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd easemail

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

The app will be available at [http://localhost:4000](http://localhost:4000)

---

## Development

### Available Scripts

```bash
npm run dev           # Start development server (port 4000, Turbopack enabled)
npm run build         # Build production bundle (runs prisma generate first)
npm start             # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript compiler without emitting files
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting without modifying files
npm test              # Run all tests (E2E)
npm run test:e2e      # Run Playwright E2E tests
npm run test:e2e:ui   # Run Playwright tests in UI mode
npm run dep:map       # Generate dependency map (.codebakers/DEPENDENCY-MAP.md)
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name describe_your_changes

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Code Structure

```
easemail/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Microsoft OAuth callbacks
│   │   ├── mail/            # Email CRUD operations
│   │   ├── calendar/        # Calendar operations
│   │   ├── contacts/        # Contact operations
│   │   ├── teams/           # Teams chat/channels
│   │   ├── cron/            # Vercel Cron jobs (sync, send-scheduled)
│   │   ├── drafts/          # Draft management
│   │   ├── signatures/      # Signature CRUD
│   │   ├── rules/           # Email rules engine
│   │   └── admin/           # Admin panel APIs
│   ├── inbox/               # Main inbox page
│   ├── compose/             # Email composer
│   ├── calendar/            # Calendar view
│   ├── contacts/            # Contacts directory
│   ├── teams/               # Teams integration
│   ├── settings/            # User settings
│   ├── admin/               # Admin panel
│   └── [other folders]/     # Starred, Sent, Drafts, Trash, Attachments
│
├── components/              # React components
│   ├── inbox/              # InboxClient, EmailReadClient
│   ├── compose/            # ComposeClient, AI panels
│   ├── calendar/           # CalendarClient, EventFormModal
│   ├── contacts/           # ContactsClient
│   ├── teams/              # TeamsClient
│   ├── settings/           # SettingsClient
│   ├── admin/              # AdminClient
│   ├── folder/             # FolderClient (lean inbox for folders)
│   ├── signatures/         # SignaturesClient
│   ├── email-rules/        # EmailRulesClient
│   ├── shared/             # ReadingPane, SafeHtml
│   └── Sidebar.tsx         # Navigation sidebar
│
├── lib/                     # Shared utilities
│   ├── microsoft/          # MSAL client, Graph API, auth errors
│   ├── supabase/           # Supabase client/server helpers
│   ├── sync/               # Sync engines (folder, email, calendar, contact)
│   ├── stores/             # Zustand stores (account, calendar)
│   ├── types/              # TypeScript types (email, calendar, rules)
│   ├── utils/              # Helpers (email-helpers, rule-engine)
│   ├── logger.ts           # Pino structured logger
│   └── prisma.ts           # Prisma client singleton
│
├── prisma/
│   └── schema.prisma       # Database schema (14 models)
│
├── tests/
│   └── e2e/                # Playwright E2E tests
│
├── .codebakers/            # CodeBakers system memory
│   ├── BRAIN.md            # Project state & decisions
│   ├── BUILD-LOG.md        # Build history
│   ├── DEPENDENCY-MAP.md   # Auto-generated dependency map
│   └── [other files]
│
└── public/                 # Static assets
```

---

## Database Schema

### Core Tables

- **organizations** - Law firms (multi-tenant ready)
- **users** - Mirrors Supabase auth.users, belongs to org
- **ms_connected_accounts** - Microsoft account connections (homeAccountId, isDefault)
- **msal_token_cache** - MSAL token cache serialized per user

### Email & Sync

- **cached_folders** - Synced mail folders (wellKnownName lookup)
- **cached_emails** - Synced emails (folderId, categories, flagStatus)
- **email_delta_links** - Delta tokens for incremental sync
- **drafts** - Email drafts (graphDraftId, scheduledAt, scheduledSent)

### Calendar & Contacts

- **cached_calendar_events** - Synced events (startDateTime, endDateTime, attendees)
- **cached_contacts** - Synced contacts (displayName, emailAddress, phone)

### Automation & Settings

- **email_rules** - Inbox automation (conditions/actions as Json, priority)
- **signatures** - Email signatures (isDefault flag)
- **webhook_subscriptions** - MS Graph change notifications (table exists, not fully wired)
- **sync_status** - Track sync health per account/resource type

---

## Testing

### E2E Tests (Playwright)

Tests are located in `tests/e2e/` and cover:

1. **Authentication** - Microsoft OAuth flow, session persistence
2. **Inbox** - Email list, reading pane, search, infinite scroll
3. **Compose** - New email, reply, forward, attachments, AI features
4. **Calendar** - Event creation, NL input, Teams meetings
5. **Contacts** - CRUD operations, search
6. **Email Rules** - Rule creation, condition logic, action execution

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/inbox/inbox.spec.ts

# Debug test
npx playwright test --debug
```

### Test Session Management

Tests use an exported Supabase session to avoid re-authenticating:

```bash
# Export your session (run once, manually authenticate)
npm run test:e2e:export-session

# Session stored in tests/e2e/.auth/session.json (gitignored)
```

---

## Deployment

### Vercel

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Add all environment variables from `.env.local`
4. Set build command: `npm run build`
5. Set output directory: `.next`
6. Deploy

### Database

EaseMail uses Supabase PostgreSQL. To deploy:

1. Create a Supabase project
2. Run `npx prisma migrate deploy` to apply migrations
3. Update `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables

### Cron Jobs

Add `vercel.json` (already included):

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/send-scheduled",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/cleanup-ai-replies",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Architecture Overview

### Authentication Flow

1. User clicks "Sign in with Microsoft"
2. Redirect to `/api/auth/microsoft` → Microsoft OAuth consent screen
3. Microsoft redirects to `/api/auth/microsoft/callback` with authorization code
4. Exchange code for access token via MSAL
5. Create/update Supabase user + Prisma user + MsConnectedAccount
6. Serialize MSAL token cache to database (`msal_token_cache` table)
7. Generate Supabase magic link → browser gets session cookie → `/inbox`

### Email Sync Architecture

**Offline-First + Delta Sync:**

1. Vercel Cron calls `/api/cron/sync` every minute
2. For each connected account:
   - Sync folders (Graph API → `cached_folders`)
   - Sync emails per folder (delta token → `cached_emails`)
   - Sync calendar events (delta token → `cached_calendar_events`)
   - Sync contacts (hourly full refresh → `cached_contacts`)
3. All reads happen from local cache (PostgreSQL)
4. Writes (send, delete, archive) hit Graph API + update cache
5. Delta tokens stored in `email_delta_links` (folderId="calendar" for cal)
6. 410 Gone response → clears delta token → next run does full sync

### State Management

- **Server State**: React Server Components fetch data directly from Prisma
- **Client State**: Zustand stores for account selection, calendar view
- **No Redux, no React Query** - Server Components eliminate most client state needs

### Security

- **Middleware**: Edge middleware checks Supabase auth on all routes (except public paths)
- **Domain Gate**: `ALLOWED_DOMAINS` + `ADMIN_EMAILS` restrict access
- **MSAL Cache**: Encrypted access tokens stored in database per user
- **XSS Protection**: DOMPurify sanitizes all HTML content
- **CSRF**: Next.js built-in CSRF protection
- **Row-Level Security**: Every mutation filters by `userId` + `id`
- **No Raw SQL**: `executeRawUnsafe` and `queryRawUnsafe` banned
- **`.maybeSingle()`**: Always used (`.single()` banned to prevent 406 errors)

---

## Features by Session

### Batch 1 (Initial Build)
- Microsoft OAuth integration
- Inbox with reading pane
- Email send/reply
- Multi-account support
- Basic folder views

### Batch 2 (Dashboard & Folders)
- Dashboard with live clock, agenda, charts
- Starred, Sent, Drafts, Trash folders
- Search across all folders
- Infinite scroll

### Batch 3 (Calendar & AI)
- Calendar with week/day/month/agenda/year views
- Natural language event creation
- AI Reply, AI Remix, AI Dictate
- Voice message recording
- Draft auto-save
- Schedule send

### Batch 4 (Teams & Admin)
- Teams integration (chats, channels, presence)
- Admin panel (users, signatures, rules)
- Domain gate & access control
- Offline-first sync engine

### Batch 5 (Contacts & Attachments)
- Contact management with CRUD
- Attachments browser with filtering
- Drag & drop file uploads
- Email rules automation

### Batch 6 (Production Hardening)
- Email threading
- Undo send (30s window)
- Bulk operations (mark read, star, archive, delete)
- Advanced filters (date, sender, attachments, importance)
- Error boundaries (global + per-route)
- Mobile responsive sidebar
- Help center with 36 FAQs

---

## Known Issues / Future Work

See `.codebakers/FIX-QUEUE.md` for full list. Notable items:

- Webhook subscriptions for real-time push (table exists, not wired)
- Account disconnect doesn't clean up cached_* tables (memory leak)
- E2E tests require manual session export (no headless OAuth yet)

---

## License

Proprietary - All rights reserved. This project is built for Darren Miller Law Firm.

---

## Support

For questions or issues, contact:
- **Technical**: shall@botmakers.ai
- **Business**: david@dmillerlaw.com

---

**Built with ❤️ by the CodeBakers framework**
