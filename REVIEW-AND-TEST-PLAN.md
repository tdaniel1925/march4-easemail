# EaseEmail — Complete App Review & Playwright Test Plan

## Part 1: Logic Gaps Found

### CRITICAL (Security / Data Loss)

| # | File | Issue | Risk |
|---|------|-------|------|
| 1 | `app/api/mail/delete/route.ts` | No ownership verification — accepts any `messageId` without checking it belongs to the authenticated user | **IDOR** — any user can delete another user's emails |
| 2 | `app/api/calendar/event/route.ts` (POST) | Creates events without verifying the account belongs to the user | **IDOR** — create events in other users' calendars |
| 3 | `lib/sync/email-sync.ts:43-76` | `deleteMany()` succeeds but if `Promise.all()` upserts fail mid-batch, deleted emails are gone with no rollback | **Data loss** on partial sync failure |
| 4 | `app/api/mail/reply/route.ts:48` | `graphPost()` not wrapped in try-catch | Unhandled rejection — reply silently fails, user gets no feedback |

### HIGH (Functional Bugs)

| # | File | Issue | Risk |
|---|------|-------|------|
| 5 | `lib/sync/calendar-sync.ts:107-110` | `new Date(start.dateTime)` ignores the `timeZone` field entirely | Events display at wrong times for non-UTC users |
| 6 | `app/api/drafts/route.ts:77-110` | No locking on `graphDraftId` — concurrent saves can create duplicate Graph drafts | Orphaned drafts, data inconsistency |
| 7 | `lib/sync/email-sync.ts:5` | `MAX_PAGES = 100` hard limit (~10K emails) with no warning | Large mailboxes silently truncated |
| 8 | `app/api/mail/send/route.ts:88-97` | Graph draft deletion silently fails — draft persists allowing duplicate sends | Users can accidentally send same email twice |

### MEDIUM (Edge Cases / Robustness)

| # | File | Issue | Risk |
|---|------|-------|------|
| 9 | `lib/utils/rule-engine.ts:139` | `email.from.name` / `email.from.address` dereferenced without null check | Crashes rule evaluator if `from` is malformed |
| 10 | `middleware.ts:21-40` | Concurrent requests both trigger token refresh — race condition | Token mismatch, re-auth loops |
| 11 | `lib/microsoft/msal.ts:52-54` | No retry/fallback if `deserialize()` fails on corrupted cache | Forces full re-auth for user |
| 12 | `lib/stores/account-store.ts` | `activeAccount` not cleared on account deletion | UI shows deleted account, Graph calls fail |

---

## Part 2: Existing Test Coverage

Currently only **2 spec files** exist:
- `tests/e2e/calendar.spec.ts` — 16 tests (UI-only, no Graph data)
- `tests/e2e/composer.spec.ts` — 19 tests (UI-only, no actual send)

**NOT covered at all:**
- Inbox / email list
- Email reading / detail view
- Authentication flow
- Contacts
- Settings
- Email rules
- Attachments page
- Dashboard
- Drafts
- Sent / Trash / Starred
- Folders
- Signatures
- Admin panel
- Search
- AI reply generation
- Account management

---

## Part 3: Comprehensive Playwright Test Plan

### How to Run

```bash
# 1. Build the app
pnpm build

# 2. Start production server
pnpm start

# 3. Run all tests
pnpm test:e2e

# 4. Run specific suite
npx playwright test tests/e2e/inbox.spec.ts

# 5. Run with UI debugger
pnpm test:e2e:ui
```

### New Test Files to Create

#### 1. `tests/e2e/auth.spec.ts` — Authentication
```
- Login page renders with Microsoft sign-in button
- Unauthenticated user redirected to /login from protected routes
- After login, user lands on /dashboard (or /inbox)
- Sign out clears session and redirects to /login
- Expired session triggers re-auth flow (not blank page)
```

#### 2. `tests/e2e/inbox.spec.ts` — Inbox & Email List
```
- Inbox page loads with email list visible
- Email list shows sender, subject, date, and preview
- Clicking an email navigates to /inbox/[id] detail view
- Unread emails have visual indicator (bold/dot)
- Mark as read removes unread indicator
- Archive moves email out of inbox list
- Delete moves email to trash
- Multi-select: checkbox selects email, bulk actions appear
- Search bar filters emails by keyword
- Empty inbox shows empty state message
- Pagination/infinite scroll loads more emails
- Pull-to-refresh / refresh button fetches new mail
```

#### 3. `tests/e2e/email-detail.spec.ts` — Reading Emails
```
- Email detail shows full body, sender, recipients, date
- Reply button navigates to /compose?mode=reply&messageId=X
- Forward button navigates to /compose?mode=forward&messageId=X
- Attachments listed with download links
- HTML email body renders safely (no XSS)
- Star/unstar toggles star state
- Move to folder shows folder picker
- AI Reply button opens AI reply modal
- AI reply modal shows generated suggestions
- Inserting AI reply populates composer
```

#### 4. `tests/e2e/drafts.spec.ts` — Draft Management
```
- Drafts page lists saved drafts
- Clicking a draft opens it in composer with pre-filled fields
- Editing and leaving auto-saves changes
- Delete draft removes from list
- Draft count badge updates in sidebar
```

#### 5. `tests/e2e/contacts.spec.ts` — Contact Management
```
- Contacts page loads with contact list
- Create new contact with name + email
- Edit existing contact
- Delete contact with confirmation
- Search/filter contacts
- Contact auto-complete in composer To field
```

#### 6. `tests/e2e/email-rules.spec.ts` — Email Rules
```
- Rules page loads with existing rules listed
- Create new rule: condition + action
- Rule conditions: from, subject contains, has attachment
- Rule actions: move to folder, mark as read, star
- Toggle rule enabled/disabled
- Delete rule
- Rule order (priority) drag-and-drop or arrows
```

#### 7. `tests/e2e/settings.spec.ts` — Settings
```
- Settings page loads
- Change display name — saved successfully
- Change notification preferences
- Theme/appearance toggle (if applicable)
- Signature selection for default
```

#### 8. `tests/e2e/signatures.spec.ts` — Signatures
```
- Signatures page lists existing signatures
- Create new signature with rich text
- Edit signature content
- Delete signature
- Set default signature
- Signature appears in composer when composing new email
```

#### 9. `tests/e2e/folders.spec.ts` — Custom Folders
```
- Sidebar shows custom folders
- Create new folder via UI
- Navigate to folder view — shows emails in that folder
- Move email to custom folder
- Rename folder
- Delete folder (with confirmation)
```

#### 10. `tests/e2e/attachments.spec.ts` — Attachment Library
```
- Attachments page loads
- Received tab shows attachments from received emails
- Sent tab shows attachments from sent emails
- Preview attachment (modal)
- Download attachment
- Filter by file type
- Pagination works
```

#### 11. `tests/e2e/dashboard.spec.ts` — Dashboard
```
- Dashboard loads with metrics cards
- Unread count matches inbox state
- Recent emails section shows latest messages
- Calendar widget shows upcoming events
- Quick actions (compose, calendar) work
- Charts/graphs render without error
```

#### 12. `tests/e2e/search.spec.ts` — Search
```
- Global search bar visible in header
- Typing triggers search results
- Results show matching emails with highlighted terms
- Clicking result navigates to email detail
- Empty search shows appropriate message
- Search with no results shows "no results found"
```

#### 13. `tests/e2e/sent-trash-starred.spec.ts` — Mail Folders
```
- Sent page shows sent emails
- Trash page shows deleted emails
- Starred page shows starred emails
- Permanently delete from trash
- Restore from trash moves back to inbox
- Star from inbox appears in starred view
```

#### 14. `tests/e2e/accounts.spec.ts` — Account Management
```
- Accounts page shows connected Microsoft accounts
- Disconnect account button shows confirmation
- Account switcher in sidebar works
- Multiple accounts: switching changes active mailbox
```

#### 15. `tests/e2e/admin.spec.ts` — Admin Panel
```
- Admin page accessible to admin users
- Team members list visible
- Signature management (org-level)
- Activity log shows recent actions
```

---

## Part 4: Priority Order for Implementation

**Phase 1 — Critical path (ship blockers):**
1. `inbox.spec.ts` — core feature, most used
2. `email-detail.spec.ts` — reading email is the primary use case
3. `auth.spec.ts` — gate for everything else
4. `drafts.spec.ts` — data loss risk without verification

**Phase 2 — Business features:**
5. `contacts.spec.ts`
6. `search.spec.ts`
7. `sent-trash-starred.spec.ts`
8. `folders.spec.ts`

**Phase 3 — Supporting features:**
9. `dashboard.spec.ts`
10. `attachments.spec.ts`
11. `signatures.spec.ts`
12. `email-rules.spec.ts`
13. `settings.spec.ts`
14. `accounts.spec.ts`
15. `admin.spec.ts`

---

## Part 5: Test Infrastructure Notes

- **Auth**: Already handled via `global-setup.ts` (Supabase magic link)
- **Data seeding**: Tests that need real emails/events require either:
  - A seeded test mailbox (recommended)
  - Mocked API responses via Playwright route interception
- **Isolation**: Tests run serially (`workers: 1`) due to shared state
- **CI**: Add `pnpm build && pnpm start` as a pre-step, then `pnpm test:e2e`
- **Timeouts**: Some tests need Graph API responses — increase timeout for those

---

## Part 6: Recommended Fixes (Priority Order)

1. **Fix IDOR in delete route** — add `user_id` filter before deletion
2. **Fix IDOR in calendar POST** — verify account ownership
3. **Wrap graphPost in try-catch** in reply route
4. **Add transaction to email sync** — use Prisma `$transaction` for delete+upsert
5. **Apply timezone** in calendar sync — use `timeZone` field with proper Date construction
6. **Add optimistic locking** to draft saves — version field or `updatedAt` check
7. **Null-check `email.from`** in rule engine before accessing properties
8. **Delete Graph draft reliably** — retry once on failure, or delete before send confirmation
