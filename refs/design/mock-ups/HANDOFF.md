# EaseMail — Integration Handoff Document
**Date:** 2026-03-04
**For:** Integration developer connecting Microsoft Graph API
**From:** Design/prototype team
**Environment:** Sandbox MS Graph connection ready

---

## What You Are Receiving

A fully functional, click-through HTML prototype of EaseMail — a multi-account email client built for law firms. All 20 screens are complete, visually polished, and wired together with working navigation. Your job is to replace the static dummy data and demo interactions with real Microsoft Graph API calls.

This is **not** a Next.js app yet. It is vanilla HTML + Tailwind CSS. The integration work you do here will inform and be replicated in the eventual Next.js conversion.

---

## File Structure

```
mock-ups/
└── pages/                        ← all 20 screens live here
    ├── demo-nav.js               ← SHARED SCRIPT — loaded by every page
    ├── Email Composer/           ← Login screen (folder name is legacy, this is login)
    ├── Sign Up/
    ├── Forgot Password/
    ├── Inbox/
    ├── Starred/
    ├── Sent/
    ├── Drafts/
    ├── Trash/
    ├── MailBox/                  ← Contacts
    ├── Personal Dashboard – Brand Collection Applied/
    ├── EaseMail - Attachments Hub/
    ├── Unified Red Enterprise Calendar/
    ├── Event Detail/
    ├── Email Accounts Dashboard/
    ├── Account Details & Sync Settings/
    ├── Add Email Account/
    ├── Disconnect Confirmation/
    ├── AI Remix Panel/
    ├── AI Dictate Overlay (Copy)/
    └── Detailed Help Center — Brand Design System/

Each page folder contains:
    index.html      ← the screen
    styles.css      ← design tokens + page-specific CSS
    script.js       ← page-specific JS (mostly empty boilerplate, safe to extend)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Vanilla HTML5 |
| Styling | Tailwind CSS via CDN (`https://cdn.tailwindcss.com`) |
| Icons | Lucide icons via CDN + inline SVGs |
| Fonts | Google Fonts — Inter (300/400/500/600/700/800) |
| Charts | Chart.js (Dashboard page only) |
| Shared JS | `demo-nav.js` — one file, loaded on every page |
| Page JS | `script.js` per page (mostly stubs) |

No build step. No bundler. Open `index.html` in a browser and it works.

---

## Design Tokens

Every page's `styles.css` defines a `:root` block with the full token set. These are stable — do not change them.

**Primary color** — deep brand red:
```css
--color-primary-500: 138 9 9;   /* main brand red */
--color-primary-600: 110 7 7;   /* hover state */
--color-primary-50:  253 235 235; /* tint backgrounds */
```

**Secondary** — darker red `84 3 3`
**Tertiary** — emerald `16 185 129` (success/active states)
**Background** — warm white/gray scale
**Neutral** — near-black `27 29 29` gray scale

Used in Tailwind classes as `primary-500`, `primary-50`, etc. These map to CSS variables so swapping the `:root` values updates the entire page.

**Spacing/Radius:**
```css
--space-base:   10px;
--radius-small: 10px;
--radius-large: 10px;
```

---

## The Shared Script — demo-nav.js

**Every page loads this:** `<script src="../demo-nav.js"></script>`

It provides three things you need to understand:

### 1. Demo Navigator Widget
A floating panel (bottom-right corner) that lets testers jump between all 20 screens. It also has a "Glass Mode" toggle (frosted glass UI theme persisted in `localStorage('em-glass')`).

**For integration:** Keep this widget in place during development — it's useful for navigation. Remove or gate it behind a `?demo=true` flag when shipping to users.

### 2. Composer Modal
Injected into the DOM of every page automatically. Triggered by `window.openComposer()`, closed by `window.closeComposer()`.

The Compose button in the sidebar calls `openComposer()`. The modal is fully styled and has a working Send button (currently just closes the modal after 800ms delay).

**For integration:** Replace the Send button logic with a real `POST /me/sendMail` Graph API call.

### 3. Email Row Interactivity
On inbox-style pages, clicking an email row updates the reading pane with that email's content. Currently wired to a hardcoded pool of 8 demo emails inside `demo-nav.js`.

**For integration:** This behavior should be replaced by fetching the selected message via `GET /me/messages/{id}` and rendering the body in the reading pane.

### 4. Infinite Scroll
On all 5 email list pages (Inbox, Starred, Sent, Drafts, Trash), `demo-nav.js` uses `IntersectionObserver` to load 8 more dummy rows when the user scrolls to the bottom. 650ms delay + spinner.

**For integration:** Replace `setupInfiniteScroll()` with a real pagination call using Graph's `$skip` / `$top` parameters or `@odata.nextLink`.

---

## All 20 Pages — Purpose & Integration Notes

### Authentication Group

#### 1. Email Composer (`Email Composer/index.html`)
**What it is:** Login screen. Two-panel layout — red brand panel left, sign-in form right.
**Demo behavior:** "Sign In" button navigates to Dashboard after 900ms delay.
**Graph integration:**
- Replace button with `supabase.auth.signInWithOAuth({ provider: 'azure' })` (multi-tenant `/common` endpoint)
- On success, Microsoft returns an access token with delegated Graph permissions
- Required scopes: `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`, `Contacts.Read`, `Calendars.Read`, `User.Read`
- Redirect to Dashboard on auth success

#### 2. Sign Up (`Sign Up/index.html`)
**What it is:** Create account screen. Same two-panel layout as Login.
**Demo behavior:** "Create Account" button → Dashboard after 1200ms.
**Graph integration:** For a law-firm multi-tenant app, sign-up is the same OAuth flow as sign-in. Microsoft handles account creation. This screen may be repurposed as an "Add new account" or onboarding welcome screen.
**Note:** This screen needs final UI polish — it was created as a placeholder.

#### 3. Forgot Password (`Forgot Password/index.html`)
**What it is:** Password reset screen. Two-panel layout.
**Demo behavior:** Shows email input + reset button.
**Graph integration:** Microsoft/Azure AD handles password reset externally. This screen can either link out to the Azure SSPR flow or be removed entirely — the OAuth flow handles auth without custom password management.
**Note:** Needs final UI polish.

---

### Email Group

#### 4. Inbox (`Inbox/index.html`)
**What it is:** Main 3-panel layout — sidebar / email list / reading pane.
**Layout:** Sidebar (hidden on mobile) + email list (w-80/96) + reading pane (flex-1).
**Demo data:** 8 hardcoded emails, filter tabs (All/Unread/Starred/Attachments), inline reply box.

**Graph API mapping:**
| UI Element | Graph Call |
|---|---|
| Email list | `GET /me/messages?$top=25&$orderby=receivedDateTime desc` |
| Unread filter tab | add `$filter=isRead eq false` |
| Starred filter tab | `GET /me/messages?$filter=flag/flagStatus eq 'flagged'` |
| Attachments filter | add `$filter=hasAttachments eq true` |
| Click email row | `GET /me/messages/{id}` |
| Reading pane body | render `message.body.content` (HTML or text) |
| Archive button | `POST /me/messages/{id}/move` with `destinationId: 'archive'` |
| Delete button | `DELETE /me/messages/{id}` |
| Star button | `PATCH /me/messages/{id}` with `{ "flag": { "flagStatus": "flagged" } }` |
| Mark Unread button | `PATCH /me/messages/{id}` with `{ "isRead": false }` |
| Send Reply | `POST /me/sendMail` with reply payload |
| Unread count badge (sidebar) | `GET /me/mailFolders/Inbox` → `unreadItemCount` |
| Infinite scroll next page | follow `@odata.nextLink` or use `$skip` |

**Inline reply box** (bottom of reading pane): Already has working `sendReply()` JS function with loading state. Wire it to Graph instead of the demo timeout.

#### 5–8. Starred / Sent / Drafts / Trash
**What they are:** Same 3-panel layout as Inbox, with the active sidebar nav item changed.
**Sidebar active state:** Each page highlights the correct nav item.

**Graph folder mapping:**
| Page | Graph Folder |
|---|---|
| Starred | `GET /me/messages?$filter=flag/flagStatus eq 'flagged'` |
| Sent | `GET /me/mailFolders/sentitems/messages` |
| Drafts | `GET /me/mailFolders/drafts/messages` |
| Trash | `GET /me/mailFolders/deleteditems/messages` |

All other per-row actions (archive, delete, star, mark unread) are the same as Inbox.

---

### Other Content Pages

#### 9. MailBox — Contacts (`MailBox/index.html`)
**What it is:** Alphabetical contact list with search. Each contact shows name, email, job title, phone.
**Graph integration:** `GET /me/contacts?$orderby=displayName` or `GET /users` (org directory).
For law firms, the org directory (`/users`) is more useful than personal contacts.

#### 10. Personal Dashboard (`Personal Dashboard – Brand Collection Applied/index.html`)
**What it is:** Home dashboard with stats cards, recent emails list, charts.
**Uses Chart.js** for the activity charts. Chart colors update automatically when Glass Mode is toggled.
**Graph integration:**
- Stats cards: pull from `GET /me/mailFolders` (inbox count, unread, etc.)
- Recent emails: `GET /me/messages?$top=5&$orderby=receivedDateTime desc`
- Charts: aggregate data from Graph (by day/week) — will need server-side aggregation

#### 11. EaseMail - Attachments Hub (`EaseMail - Attachments Hub/index.html`)
**What it is:** Browse all attachments across all emails. Cards show file name, type, sender, date, source email link.
**Graph integration:** `GET /me/messages?$filter=hasAttachments eq true&$expand=attachments`
The "source email" link on each card currently points to `../Inbox/index.html` — replace with deep link to specific message.

#### 12. Unified Red Enterprise Calendar (`Unified Red Enterprise Calendar/index.html`)
**What it is:** Monthly calendar grid + 8am–6pm day schedule view. Events shown as colored blocks with `border-l-4` styling.
**Click behavior:** Clicking any event block (`.border-l-4` div) navigates to Event Detail page (wired in `demo-nav.js`).
**Graph integration:** `GET /me/calendarView?startDateTime=...&endDateTime=...`
Map event `start.dateTime`, `end.dateTime`, `subject`, `organizer` to the calendar slots.

#### 13. Event Detail (`Event Detail/index.html`)
**What it is:** Full event view — title, date/time, location, attendees, description.
**Navigation:** Back button → Calendar.
**"Email all attendees" button:** Calls `window.openComposer()` with the attendee emails pre-filled (currently opens blank composer).
**Graph integration:** `GET /me/events/{id}`
Pre-populate the composer `To:` field with `event.attendees[].emailAddress.address`.
**Note:** This page needs final UI polish.

---

### Account Management Group

#### 14. Email Accounts Dashboard (`Email Accounts Dashboard/index.html`)
**What it is:** Lists all connected email accounts (Microsoft 365, Outlook, etc.) with status indicators (Active/Syncing/Error).
**Actions per account row:** Settings → Account Details; a disconnect option.
**Graph integration:** This screen represents multi-account management. Each account = one Microsoft OAuth token.
Store tokens in Supabase, display account list from your DB (not Graph — Graph is per-account).
Sync status comes from your own sync state machine.

#### 15. Account Details & Sync Settings (`Account Details & Sync Settings/index.html`)
**What it is:** Edit view for a single connected account. Shows email, display name, sync frequency, folder selection, signature.
**Actions:** Save, Disconnect.
**Disconnect button** → navigates to Disconnect Confirmation page.
**Graph integration:** `GET /me/profile` for account info. Sync settings stored in your DB.

#### 16. Add Email Account (`Add Email Account/index.html`)
**What it is:** Wizard for adding a new account. Step-by-step: choose provider → authenticate → configure sync.
**Navigation:** Back/Cancel both → Email Accounts Dashboard.
**Graph integration:** Trigger `supabase.auth.signInWithOAuth({ provider: 'azure' })` for the chosen account. On success, store the new token and add the account to the dashboard list.

#### 17. Disconnect Confirmation (`Disconnect Confirmation/index.html`)
**What it is:** Confirmation dialog before disconnecting an account. Shows account email, warning about what will be removed.
**Actions:**
- "Cancel — Keep Account" → Account Details & Sync Settings
- "Connect a Different Account" → Add Email Account
- Confirm disconnect → should disconnect and return to Email Accounts Dashboard
**Graph integration:** On confirm, revoke the stored token in your DB. Optionally call `POST /me/revokeSignInSessions`.

---

### AI Features Group

#### 18. AI Remix Panel (`AI Remix Panel/index.html`)
**What it is:** AI email rewriting tool. Two-column layout — original email text left, AI-rewritten version right. Tone controls (Formal, Casual, Persuasive, Concise).
**Navigation:** Header back link + footer nav both → Inbox.
**"AI Dictate" footer link** → AI Dictate Overlay page.
**Integration notes:**
- Original email text comes from the currently selected message (pass message body in)
- Tone buttons trigger a rewrite call to your AI backend
- "Use This Version" button should replace the compose/reply draft content
- AI endpoint is your own — Graph is not involved here

#### 19. AI Dictate Overlay (`AI Dictate Overlay (Copy)/index.html`)
**What it is:** Voice dictation UI. Two-column layout — microphone/waveform left, live transcript right. Controls: Start/Stop/Clear/Insert.
**Navigation:** Header back link + footer nav → Inbox.
**Integration notes:**
- "Start Recording" connects to browser `MediaRecorder` / `getUserMedia` + your speech-to-text backend
- "Insert" places the transcript into the active compose/reply field
- AI/STT backend is your own — not Graph

---

### Support

#### 20. Detailed Help Center (`Detailed Help Center — Brand Design System/index.html`)
**What it is:** Full help documentation site. Accordion sections, code examples, design system reference.
**Navigation:** Accessible from the Support section of every sidebar.
**Integration notes:** Mostly static content. No Graph API calls needed. Can be driven by a CMS or remain static.

---

## Navigation Map — Complete

Every page's sidebar has these sections (where applicable):

```
Mailboxes:  Inbox · Starred · Sent · Drafts · Trash
Navigate:   Dashboard · Attachments · Calendar
Manage:     Email Accounts · Contacts
Support:    Help Center
```

### Page-to-Page Wiring (all links verified)

| From | Action | Destination |
|---|---|---|
| Login | Sign In button (900ms delay) | Dashboard |
| Sign Up | Create Account button (1200ms delay) | Dashboard |
| Login | "Create account" link | Sign Up |
| Login | "Forgot password" link | Forgot Password |
| Forgot Password | "Back to sign in" link | Login |
| Sign Up | "Back to sign in" link | Login |
| Any page | Compose button | Composer modal (openComposer()) |
| Inbox reading pane | "AI Remix" button | AI Remix Panel |
| Inbox reading pane | "AI Dictate" button | AI Dictate Overlay |
| AI Remix Panel | Back/header/footer | Inbox |
| AI Remix Panel | "AI Dictate" footer link | AI Dictate Overlay |
| AI Dictate Overlay | Back/header/footer | Inbox |
| Calendar | Click event block (.border-l-4) | Event Detail |
| Event Detail | Back button | Calendar |
| Event Detail | "Email all attendees" | Composer modal |
| Email Accounts Dashboard | Settings icon per account | Account Details & Sync Settings |
| Account Details | Disconnect button | Disconnect Confirmation |
| Disconnect Confirmation | Cancel | Account Details & Sync Settings |
| Disconnect Confirmation | "Connect a Different Account" | Add Email Account |
| Add Email Account | Back button | Email Accounts Dashboard |
| Add Email Account | Cancel | Email Accounts Dashboard |
| Attachments Hub | Source email link | Inbox |

---

## What to Keep vs. What to Replace

### Keep as-is
- All HTML structure and layout
- All Tailwind CSS classes
- All `styles.css` design tokens
- All sidebar navigation HTML
- The Demo Navigator widget (useful during development)
- Glass Mode (nice-to-have, keep for demo)
- Composer modal structure (just wire the Send button)
- Infinite scroll observer pattern (replace data source only)
- All loading/success/error button states

### Replace with real data
| Demo element | Replace with |
|---|---|
| Hardcoded email rows (8 emails) | Graph `GET /me/messages` |
| Reading pane static content | Graph `GET /me/messages/{id}` |
| Email row click handler in demo-nav.js | Your own message fetch + render |
| Infinite scroll dummy row generator | Graph `@odata.nextLink` pagination |
| Calendar event blocks | Graph `GET /me/calendarView` |
| Contact list dummy data | Graph `GET /me/contacts` or `/users` |
| Dashboard stats numbers | Aggregated from Graph folder counts |
| Account list in Email Accounts Dashboard | Your DB (accounts table) |
| Sender avatar images (Unsplash URLs) | User photos from Graph `GET /users/{id}/photo` |

### Remove when going to production
- Demo Navigator widget (or gate behind `?demo=true`)
- `setupInfiniteScroll()` dummy row generators in demo-nav.js
- Hardcoded email pool (`EMAILS` array) in demo-nav.js
- `setTimeout()` navigation delays on Login/Sign Up buttons

---

## Auth Architecture

**Auth method:** Microsoft OAuth only via Supabase Azure provider.
**Azure app:** Must be registered as **multi-tenant** (use `/common` endpoint, not a tenant-specific ID).
**No other auth methods.** No Google, GitHub, email/password.

**Required Graph permission scopes (delegated):**
```
User.Read
Mail.Read
Mail.ReadWrite
Mail.Send
Contacts.Read
Calendars.Read
offline_access   ← for refresh tokens
```

**Multi-tenant model:** Each law firm = one tenant. Every DB query must filter by both `org_id` AND `user_id`.

---

## Known Demo-Only Behaviors

These look real but are entirely fake — replace them:

1. **Send Reply button** in Inbox reading pane — shows "Sending…" then "✓ Sent" after 800ms. Not actually sending anything.
2. **Compose modal Send button** — closes modal after fake send. Not calling Graph.
3. **Sign In / Create Account buttons** — `setTimeout` navigation, no real auth.
4. **Email row click** — swaps static HTML, not fetching from Graph.
5. **Filter tabs** (All/Unread/Starred/Attachments) — client-side show/hide on existing DOM elements only.
6. **Dashboard charts** — Chart.js with random/static data arrays.
7. **Infinite scroll** — generates random dummy rows from a name/subject pool.
8. **Account sync status badges** (Active/Syncing/Error) — hardcoded in HTML.
9. **Unread count badges** (12 in Inbox, 3 in Drafts) — hardcoded in HTML.
10. **AI Remix tone buttons** — visual state only, no AI call being made.
11. **AI Dictate waveform** — CSS animation only, no actual audio recording.

---

## Graph API Quick Reference

```
Base URL: https://graph.microsoft.com/v1.0

# Messages
GET  /me/messages                              list inbox
GET  /me/messages?$filter=isRead eq false      unread
GET  /me/messages/{id}                         single message
GET  /me/messages/{id}/attachments             attachments
POST /me/sendMail                              send
PATCH /me/messages/{id}                        update (read, flag)
DELETE /me/messages/{id}                       delete
POST /me/messages/{id}/move                    move to folder

# Folders
GET  /me/mailFolders                           list folders
GET  /me/mailFolders/inbox/messages            inbox messages
GET  /me/mailFolders/sentitems/messages        sent
GET  /me/mailFolders/drafts/messages           drafts
GET  /me/mailFolders/deleteditems/messages     trash

# Calendar
GET  /me/calendarView?startDateTime=&endDateTime=   events in range
GET  /me/events/{id}                                single event

# Contacts
GET  /me/contacts                              personal contacts
GET  /users                                    org directory

# Profile
GET  /me                                       current user
GET  /me/photo/$value                          profile photo
```

---

## Questions for the Integration Developer

Before starting, confirm these with the product owner:

1. **Multi-account:** Should one EaseMail user be able to connect multiple Microsoft accounts (personal + work), or one account per user?
2. **Sent folder:** Graph's sent items folder name is `sentitems` — verify this matches expected behavior.
3. **Contacts source:** Personal contacts (`/me/contacts`) or org directory (`/users`)? The law firm use case likely wants the org directory.
4. **Calendar:** Personal calendar only, or shared/room calendars too?
5. **Attachments Hub:** Should this search all folders or just inbox? Graph needs `$filter=hasAttachments eq true` across folders which requires separate calls per folder or a search endpoint.
6. **AI features:** Is the AI backend already set up, or is that out of scope for this integration phase?

---

*End of handoff document.*
