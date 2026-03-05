# EaseMail — New Page Design Briefs

> Hand this to your design tool. Each section describes exactly what the page needs to look like and do.
> These 7 pages need to be built from scratch as proper templates — not duplicates of Inbox.

---

## GLOBAL RULES (apply to every page)

- **App name:** EaseMail
- **Brand color:** Red (primary-500 = rgb(138, 9, 9) — dark red)
- **Font heading:** Poppins | **Font body:** Work Sans
- **Layout:** height:100vh, overflow:hidden on root. Scrollable areas use flex:1; overflow-y:auto
- **Sidebar:** Always visible on desktop. Same sidebar across all inbox-group pages.
- **Demo nav:** Every page must include `<script src="../demo-nav.js"></script>` at bottom of body
- **Styles:** Every page must include `<link rel="stylesheet" href="styles.css">` — copy styles.css from Inbox folder
- **No placeholder text** — all content should look like real law firm email data
- **User:** Alex Morgan | alex@darrenmillerlaw.com | Darren Miller Law Firm

---

## PAGE 1 — STARRED

**Folder:** `Starred/`
**Purpose:** Shows emails the user has starred/flagged for follow-up

### Layout
Identical 3-panel layout to Inbox:
- Left: Sidebar (same as Inbox, but "Starred" is the active nav item — highlighted in red)
- Middle: Email list (narrower panel, ~380px)
- Right: Reading pane (fills remaining space)

### Email List Panel
- Header: "Starred" with a filled gold star icon next to it
- Subtitle: "5 starred messages" (small gray text)
- No filter tabs needed (All / Unread etc. not relevant here)
- Show 5 email rows. Each row has:
  - Filled gold star icon on the left (this is what makes it "starred")
  - Sender avatar (colored circle with initials)
  - Sender name (bold if unread)
  - Email subject
  - Preview text (1 line, truncated)
  - Timestamp (right aligned)
  - Thin red left border on the first/selected row
- The first row should appear selected (light red background)
- Rows should have subtle bottom dividers

### Suggested starred emails (law firm context):
1. **From:** Judge Patricia Wells | **Subject:** Case 2024-CR-0847 — Hearing Rescheduled | 2 days ago
2. **From:** Marcus Chen (Client) | **Subject:** Settlement Agreement — Please Review | 3 days ago
3. **From:** Sarah Okonkwo | **Subject:** Deposition Transcript Ready — Johnson v. State | 4 days ago
4. **From:** Court Filing System | **Subject:** Filing Confirmation — Motion to Suppress | 1 week ago
5. **From:** David Park (Paralegal) | **Subject:** Evidence Summary — Updated Version | 1 week ago

### Reading Pane
- Shows the first starred email fully open
- Header: sender name, email address, timestamp, "Starred" gold badge
- Action buttons: Archive, Delete, Mark Unread, Forward, Reply, More
- Full email body (professional legal correspondence tone)
- Reply box at bottom (collapsed, shows "Click to reply")
- Star button in header should be FILLED gold (already starred)

---

## PAGE 2 — SENT

**Folder:** `Sent/`
**Purpose:** Shows emails the user has sent

### Layout
Same 3-panel layout as Inbox. "Sent" is active in sidebar.

### Email List Panel
- Header: "Sent" with a send/paper-plane icon
- Subtitle: "Showing 24 sent messages"
- Show 6 email rows. Each row has:
  - Sender avatar (Alex Morgan's initials — AM — since these are sent by the user)
  - "To: [Recipient Name]" instead of a from-sender (this is sent mail)
  - Email subject
  - Preview text (first line of the email body)
  - Timestamp
  - Small "Delivered" green checkmark badge on right
- No unread dots (sent mail is always "read")
- First row selected

### Suggested sent emails (law firm context):
1. **To:** Judge Patricia Wells | **Subject:** Re: Case 2024-CR-0847 — Availability Confirmed | Today 11:42 AM
2. **To:** Marcus Chen | **Subject:** Settlement Counteroffer — Revised Terms Attached | Yesterday 4:15 PM
3. **To:** Opposing Counsel | **Subject:** Discovery Request — 30-Day Response Window | Yesterday 9:30 AM
4. **To:** Court Filing System | **Subject:** Motion to Suppress — Filed Successfully | Mon 3:22 PM
5. **To:** Sarah Okonkwo, David Park | **Subject:** Team Briefing — Johnson v. State Trial Prep | Mon 10:00 AM
6. **To:** All Staff | **Subject:** Office Closure — December 26-27 | Fri 2:00 PM

### Reading Pane
- Shows first sent email fully open
- Header: "To: Judge Patricia Wells" | sent timestamp | "Delivered" green badge in header
- Action buttons: Delete, Forward, and a "Resend" option in More menu
- Full email body (professional, formal legal tone — a reply confirming availability)
- NO reply box at bottom (you sent this — you don't reply to your own sent mail)
- Show a subtle "Sent from EaseMail" footer note

---

## PAGE 3 — DRAFTS

**Folder:** `Drafts/`
**Purpose:** Shows unsent draft emails the user is working on

### Layout
Same 3-panel layout. "Drafts" active in sidebar. Drafts badge (count) on sidebar item.

### Email List Panel
- Header: "Drafts" with a pencil/edit icon
- Subtitle: "3 unsaved drafts"
- Show 3 email rows. Each row has:
  - Yellow/amber "Draft" badge (pill shape)
  - Recipient name (or "No recipient" if blank)
  - Subject line (or "No subject" in gray italics if blank)
  - Preview of body text
  - "Last edited" timestamp
  - NO star, NO unread dot
- First row selected

### Suggested drafts (law firm context):
1. **To:** Marcus Chen | **Subject:** Settlement Final Terms — For Your Review | Last edited 20 min ago
2. **To:** (No recipient yet) | **Subject:** Motion to Continue — Draft | Last edited 2 hours ago
3. **To:** All Staff | **Subject:** (No subject) | Last edited Yesterday

### Reading Pane (for drafts this becomes an inline editor)
- Header: "Draft — Last saved 20 min ago" with Save and Discard buttons
- To field: shows recipient chips (removable), with an "Add recipient" input
- Subject field: editable input with current subject
- Toolbar: Bold, Italic, Underline, List, Link, Attach
- Body: editable content area with the draft text (real paragraph content, law firm tone)
- Bottom actions: Large red "Send" button | Attach | Discard draft (trash icon)
- No reply box — this IS the compose area

---

## PAGE 4 — TRASH

**Folder:** `Trash/`
**Purpose:** Shows deleted emails before permanent deletion

### Layout
Same 3-panel layout. "Trash" active in sidebar.

### Email List Panel
- Header: "Trash" with a trash icon
- Info banner at top (amber/yellow): "Items in Trash are permanently deleted after 30 days"
- Show 5 email rows. Each row has:
  - Slightly muted appearance (lower opacity or grayed text — but still readable)
  - Sender name (NOT strikethrough — strikethrough is hard to read, use gray color instead)
  - Subject (gray, not strikethrough)
  - Preview text
  - "Deleted X days ago" timestamp in red/muted
  - Small "Deletes in X days" label on far right
- First row selected

### Suggested trash emails (law firm context):
1. **From:** Newsletter | **Subject:** Legal Tech Weekly — Issue 47 | Deleted 5 days ago | Deletes in 25 days
2. **From:** Court System | **Subject:** Automated Reminder — Filing Deadline (Resolved) | Deleted 8 days ago | Deletes in 22 days
3. **From:** Spam Sender | **Subject:** You've been selected for... | Deleted 12 days ago | Deletes in 18 days
4. **From:** Old Client | **Subject:** Case Closed — Thank You | Deleted 20 days ago | Deletes in 10 days
5. **From:** Auto-Notification | **Subject:** Meeting Recording Available (Expired) | Deleted 28 days ago | Deletes in 2 days

### Reading Pane
- Header: sender name, timestamp, "Deleted X days ago" red badge
- Warning bar below header: "This email will be permanently deleted in 25 days" (amber)
- Action buttons: **Restore** (primary, green or outlined), **Delete Forever** (red, destructive)
- Full email body at reduced visual weight (slight gray tint on the content area, NOT opacity on entire pane)
- No reply box
- No star option (can't star deleted mail)

---

## PAGE 5 — SIGN UP

**Folder:** `Sign Up/`
**Purpose:** New user account creation — Microsoft OAuth only

### Layout
Same two-panel layout as the Login page (Email Composer folder):
- Left panel: Red branded panel (same as Login — keep identical)
- Right panel: Sign up form

### Right Panel Content
- Mobile logo (hidden on desktop): EaseMail logo mark + "EaseMail" text, centered
- Heading (centered): "Create your account"
- Subtext (centered): "Sign up with your Microsoft work account"
- Single large button (centered, full width): "Sign up with Microsoft"
  - Microsoft four-square logo (same SVG as Login page)
  - White background, border, shadow
- Below button (centered, small gray text):
  "You'll be redirected to Microsoft to authenticate.
  EaseMail only accesses your email and calendar."
- Divider line with "Already have an account?" text
- Link (centered): "Sign in instead" (navigates back to Login)
- Footer links (centered): Privacy Policy · Terms of Service · Help Center
- Copyright (centered): © 2025 EaseMail Inc. All rights reserved.

### What NOT to include
- No Google button
- No GitHub button
- No email field
- No password field
- No name fields
- No terms checkbox

---

## PAGE 6 — FORGOT PASSWORD

**Folder:** `Forgot Password/`
**Purpose:** This flow doesn't exist for Microsoft OAuth — redirect users to Microsoft

### Layout
Same two-panel layout as Login page:
- Left panel: Red branded panel (same as Login — keep identical)
- Right panel: Guidance content

### Right Panel Content
- Mobile logo (centered, hidden on desktop)
- Icon (centered): Large shield or key icon in red
- Heading (centered): "Password managed by Microsoft"
- Subtext (centered):
  "Your EaseMail account uses Microsoft for authentication.
  To reset your password, visit Microsoft's account recovery page."
- Primary button (centered, full width, red): "Go to Microsoft Account Recovery"
  - Opens microsoft.com/password in new tab
  - Include external link icon
- Secondary text (centered, small):
  "Once you've reset your Microsoft password, return here to sign in."
- Divider
- Link (centered): "← Back to Sign In"
- Footer links (centered): Privacy Policy · Terms of Service · Help Center

### What NOT to include
- No email input field
- No "Send Reset Link" button
- No "Check your email" success state
- No password input of any kind

---

## PAGE 7 — EVENT DETAIL

**Folder:** `Event Detail/`
**Purpose:** Full detail view for a calendar event, accessed from the Calendar page

### Layout
Two-panel layout:
- Left: Same sidebar as Calendar page ("Calendar" is the active nav item)
- Right: Event detail content (scrollable)

### Event Detail Content

**Top bar:**
- "← Back to Calendar" link (left aligned)
- Event actions on the right: Edit button (outlined) | Delete button (red, outlined) | More (···)

**Event Header Card** (white card with shadow):
- Large date badge on left (red square): Month abbreviation + day number (e.g., "NOV" / "14")
- Event title (large, bold): "Q4 Strategy Review — Darren Miller Law Firm"
- Status badge: "Upcoming" (green) or "Today" (red)
- Event type badge: "Internal Meeting"

**Details Section** (below header card):
- Time row: clock icon | "Thursday, November 14, 2025 · 2:00 PM – 3:30 PM EST"
- Location row: map pin icon | "Conference Room A — 3rd Floor" + "Join via Teams" link button
- Organizer row: person icon | "Alex Morgan (You)"
- Calendar row: calendar icon | "Darren Miller Law Firm — Main Calendar"

**Attendees Section:**
- Section header: "Attendees (5)" with "Email all attendees" button (outlined, right side)
- List of 5 attendees, each showing:
  - Avatar (colored circle with initials)
  - Full name
  - Role/title
  - RSVP status badge: Accepted (green) / Pending (gray) / Declined (red)

### Suggested attendees:
1. Alex Morgan (You) — Senior Attorney — Accepted
2. Darren Miller — Managing Partner — Accepted
3. Sarah Okonkwo — Associate Attorney — Accepted
4. David Park — Paralegal — Pending
5. Linda Reyes — Legal Assistant — Pending

**Description Section:**
- Section header: "Description"
- 2-3 paragraphs of real meeting description (quarterly strategy, agenda items, preparation notes)

**RSVP Section** (bottom card):
- "Your Response" label
- Three buttons side by side: Accept (green, currently selected/active) | Maybe (gray) | Decline (red outlined)
- Small note: "Your response was last updated Nov 10 at 9:15 AM"

---

## DESIGN CONSISTENCY CHECKLIST

When building each page, verify:
- [ ] Red brand color used (not blue, not default gray)
- [ ] Poppins for headings, Work Sans for body
- [ ] Sidebar matches Inbox sidebar exactly (same items, same icons, same structure)
- [ ] Active sidebar item highlighted in red
- [ ] Root container: height:100vh; overflow:hidden
- [ ] Content area: flex:1; overflow-y:auto
- [ ] demo-nav.js script tag at bottom of body
- [ ] styles.css linked in head
- [ ] No placeholder text (lorem ipsum, "your@email.com", etc.)
- [ ] No Google, GitHub, or non-Microsoft auth elements anywhere
- [ ] User shown as Alex Morgan / alex@darrenmillerlaw.com
- [ ] EaseMail branding everywhere (not MailFlow, not ProMail, not RedSync)
