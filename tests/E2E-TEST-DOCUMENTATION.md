# EaseEmail — E2E Test Suite Documentation

## Overview

**Total test files:** 15
**Total tests:** ~175
**Framework:** Playwright 1.58.2
**Runner:** `pnpm test:e2e`
**Target:** Built app (production build, NOT dev server)
**Browser:** Chromium (Desktop Chrome)
**Auth:** Pre-injected via Supabase magic link (global-setup.ts)

---

## Quick Start

```bash
# 1. Build the production app
pnpm build

# 2. Start the production server
pnpm start

# 3. Run all tests
pnpm test:e2e

# 4. Run a specific test file
npx playwright test tests/e2e/inbox.spec.ts

# 5. Run with interactive UI debugger
pnpm test:e2e:ui

# 6. Run with headed browser (see what's happening)
npx playwright test --headed

# 7. Generate HTML report
npx playwright test --reporter=html
```

---

## Test Configuration

**File:** `playwright.config.ts`

| Setting | Value | Reason |
|---------|-------|--------|
| `baseURL` | `http://localhost:4000` | Production build port |
| `fullyParallel` | `false` | Tests mutate shared state |
| `workers` | `1` | Serial execution for data consistency |
| `retries` | `0` (local), `1` (CI) | Retry only in CI |
| `trace` | `retain-on-failure` | Debug failing tests |
| `screenshot` | `only-on-failure` | Visual evidence of failures |
| `video` | `retain-on-failure` | Replay failing tests |

**Auth Setup:** `tests/e2e/auth/global-setup.ts`
- Uses Supabase Admin SDK to generate a magic link for the test user
- Stores session in `tests/e2e/auth/session.json`
- All tests inherit this session via `storageState`
- Test user: `TEST_USER_EMAIL` env var (default: `info@tonnerow.com`)

---

## Test File Reference

### 1. `auth.spec.ts` — Authentication (7 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Login page renders | Microsoft sign-in button visible |
| 2 | /inbox redirect | Unauthenticated → /login |
| 3 | /dashboard redirect | Unauthenticated → /login |
| 4 | /compose redirect | Unauthenticated → /login |
| 5 | Sidebar visible | Navigation available after auth |
| 6 | Sign out exists | Button present in UI |
| 7 | Session persistence | Navigate across pages without re-auth |

**Dependencies:** None (tests both auth and unauth states)

---

### 2. `inbox.spec.ts` — Inbox & Email List (13 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | Email list or empty state visible |
| 2 | Header | "Inbox" heading displayed |
| 3 | Sidebar active | Inbox link highlighted |
| 4 | Email items | Show sender, subject, date |
| 5 | Click to detail | Navigates to /inbox/[id] |
| 6 | Unread indicator | Bold/dot on unread emails |
| 7 | Tab filters | All, Unread, Starred, Attachments tabs exist |
| 8 | Unread tab | Filters to unread only |
| 9 | Search bar | Input visible and accepts text |
| 10 | Search results | Typing triggers filtered list |
| 11 | Infinite scroll | More emails load on scroll/button |
| 12 | Empty search | No-results message shown |
| 13 | Refresh button | Sync/refresh triggers mailbox update |

**Dependencies:** Requires at least 1 email in test mailbox for tests 4-6

---

### 3. `email-detail.spec.ts` — Reading Emails (15 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Subject visible | Email subject displayed |
| 2 | Sender info | Name and email shown |
| 3 | Recipients | To/CC visible |
| 4 | Date/time | Received date displayed |
| 5 | Body rendered | HTML/text content visible |
| 6 | Reply button | Visible and clickable |
| 7 | Forward button | Visible and clickable |
| 8 | Reply navigation | Goes to /compose?mode=reply |
| 9 | Forward navigation | Goes to /compose?mode=forward |
| 10 | Star toggle | Star/unstar button exists |
| 11 | Delete button | Exists |
| 12 | Archive button | Exists |
| 13 | Move to folder | Option exists |
| 14 | AI Reply | Opens AI reply modal |
| 15 | Back button | Returns to inbox |

**Dependencies:** Requires at least 1 email; tests skip gracefully if empty

---

### 4. `drafts.spec.ts` — Draft Management (10 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | /drafts accessible |
| 2 | Header | "Drafts" heading |
| 3 | List/empty state | Shows drafts or empty message |
| 4 | Click opens composer | Draft → /compose?draftId=X |
| 5 | Pre-filled subject | Subject populated from draft |
| 6 | Pre-filled recipients | To field populated |
| 7 | Delete button | Exists on drafts |
| 8 | Sidebar count | Draft count badge |
| 9 | Auto-save | Typing triggers save |
| 10 | Saved indicator | "Saved" text appears |

**Dependencies:** Tests 4-6 require existing drafts; skip if empty

---

### 5. `contacts.spec.ts` — Contact Management (15 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | /contacts accessible |
| 2 | Contact list | Shows contacts or empty state |
| 3 | Search input | Filter input visible |
| 4 | Search filters | Typing filters contact list |
| 5 | Add button | "Add Contact" visible |
| 6 | Form opens | Click add → form/modal |
| 7 | Name field | Input exists |
| 8 | Email field | Input exists |
| 9 | Phone field | Input exists |
| 10 | Cancel button | Closes form |
| 11 | Validation | Empty submit shows errors |
| 12 | Click contact | Opens detail panel |
| 13 | Detail info | Shows name/email/phone |
| 14 | Edit button | Exists on detail |
| 15 | Delete button | Exists on detail |

**Dependencies:** Tests 4, 12-15 require existing contacts

---

### 6. `search.spec.ts` — Email Search (10 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Input visible | Search bar on inbox |
| 2 | Placeholder | Appropriate placeholder text |
| 3 | Triggers results | Typing shows filtered results |
| 4 | Empty query | Returns normal inbox |
| 5 | No matches | Empty state message |
| 6 | Result content | Shows sender/subject |
| 7 | Click result | Opens email detail |
| 8 | Clear search | Returns to inbox view |
| 9 | Tab preservation | Search doesn't break tabs |
| 10 | Debounce | Doesn't fire on every keystroke |

**Dependencies:** Requires emails in mailbox for meaningful results

---

### 7. `folders.spec.ts` — Sent/Trash/Starred/Folders (11 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Sent page | /sent loads with header |
| 2 | Sent content | Shows emails or empty state |
| 3 | Trash page | /trash loads |
| 4 | Trash content | Shows deleted or empty |
| 5 | Starred page | /starred loads |
| 6 | Starred content | Shows starred or empty |
| 7 | Sidebar links | Inbox, Sent, Drafts, Trash, Starred visible |
| 8 | Custom folders | Appear in sidebar if exist |
| 9 | Folder navigation | /folder/[id] shows content |
| 10 | Folder search | Search works in folder view |
| 11 | Email rows | Show sender, subject, date |

---

### 8. `email-rules.spec.ts` — Email Rules (14 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | /email-rules accessible |
| 2 | Rules list | Shows rules or empty state |
| 3 | Create button | "Create Rule" visible |
| 4 | Form opens | Click create → form/modal |
| 5 | Condition fields | From/subject/etc inputs |
| 6 | Action fields | Move/mark/star options |
| 7 | Cancel button | Closes form |
| 8 | Save button | Exists |
| 9 | Validation | Empty submit shows errors |
| 10 | Rule display | Shows name/description |
| 11 | Enable toggle | On/off switch |
| 12 | Edit button | Exists |
| 13 | Delete button | Exists |
| 14 | Delete confirm | Shows confirmation dialog |

---

### 9. `dashboard.spec.ts` — Dashboard (11 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | Dashboard header/welcome visible |
| 2 | Live clock | Current time displayed |
| 3 | Unread count | Email count card |
| 4 | Recent emails | Email list or empty state |
| 5 | Calendar widget | Agenda/upcoming events |
| 6 | Todo section | Todo list exists |
| 7 | Add todo input | Input field visible |
| 8 | Add todo | Appends to list |
| 9 | Complete todo | Marks as done |
| 10 | Quick actions | Compose/Calendar links |
| 11 | Activity chart | Weekly chart renders |

---

### 10. `attachments.spec.ts` — Attachment Library (11 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | /attachments accessible |
| 2 | Received tab | Active by default |
| 3 | Sent tab | Visible |
| 4 | Table/grid | Shows files or empty state |
| 5 | Columns | File name, size, date visible |
| 6 | Type filter | Filter by PDF/DOCX/etc |
| 7 | Search | Filter input works |
| 8 | Preview | Opens preview modal |
| 9 | Download | Download button exists |
| 10 | Pagination | Load More or pagination |
| 11 | Tab switch | Switching tabs changes data |

---

### 11. `signatures.spec.ts` — Email Signatures (13 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | /signatures accessible |
| 2 | List | Shows signatures or empty |
| 3 | Create button | "New Signature" visible |
| 4 | Editor opens | Click create → editor |
| 5 | Name field | Input exists |
| 6 | Content area | Rich text area exists |
| 7 | Save button | Exists |
| 8 | Cancel button | Exists |
| 9 | Save works | Adds to list |
| 10 | Edit button | Exists per signature |
| 11 | Delete button | Exists per signature |
| 12 | Default indicator | Shows which is default |
| 13 | Set default | Toggle default works |

---

### 12. `settings.spec.ts` — Settings (8 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | /settings accessible |
| 2 | Profile section | Name/email visible |
| 3 | Notifications | Preferences section exists |
| 4 | Appearance | Theme section exists |
| 5 | Controls | Toggles/inputs present |
| 6 | Save mechanism | Save button or auto-save |
| 7 | Sign out | Button exists |
| 8 | Privacy | Section exists |

---

### 13. `accounts.spec.ts` — Account Management (8 tests)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Page loads | /accounts accessible |
| 2 | Account list | Connected accounts shown |
| 3 | Email display | Account emails visible |
| 4 | Disconnect button | Exists per account |
| 5 | Confirm modal | Click disconnect → modal |
| 6 | Modal buttons | Cancel + Confirm present |
| 7 | Cancel works | Closes without action |
| 8 | Sidebar switcher | Account switcher visible |

---

### 14. `calendar.spec.ts` — Calendar (16 tests) [EXISTING]

Covers: week view, navigation, Today button, New Event modal, form validation, all-day toggle, attendee chips, NL input bar, view toggle.

---

### 15. `composer.spec.ts` — Email Composer (19 tests) [EXISTING]

Covers: From field, recipient chips, file attachments, draft auto-save, schedule send, reply/forward modes, discard confirmation, drag-and-drop, inline images, Ctrl+Enter shortcut.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install
      - run: npx playwright install --with-deps chromium
      - run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - run: pnpm start &
      - run: npx wait-on http://localhost:4000 --timeout 30000
      - run: pnpm test:e2e
        env:
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Tests fail with "login redirect" | Session expired — delete `session.json` and re-run |
| Timeout on page load | Ensure `pnpm start` is running on port 4000 |
| "No email found" skips | Test mailbox is empty — send test emails first |
| Flaky element selectors | Use `data-testid` attributes (add to components) |
| CI auth failure | Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in CI env |

### Debugging Tips

```bash
# Run single test with debug logging
npx playwright test tests/e2e/inbox.spec.ts --debug

# Show browser during test
npx playwright test --headed --slow-mo=500

# View trace from failed test
npx playwright show-trace test-results/*/trace.zip

# Re-export auth session
pnpm test:e2e:export-session
```

---

## Data Requirements

Some tests require real data in the test mailbox:

| Feature | Minimum Data Needed |
|---------|-------------------|
| Inbox | 1+ email |
| Email Detail | 1+ email |
| Drafts | 1+ draft (or test creates one) |
| Contacts | 1+ contact (or test creates one) |
| Sent | 1+ sent email |
| Starred | 1+ starred email |
| Attachments | 1+ email with attachment |
| Calendar | Events covered by existing tests (modal-only) |

Tests that depend on data use `test.skip()` gracefully when none is available.

---

## Architecture Decisions

1. **Serial execution** — Tests share a real mailbox; parallel runs would cause race conditions
2. **Production build** — Tests verify the actual deployed experience, not dev quirks
3. **Real auth** — Magic link via Supabase Admin ensures real session behavior
4. **No mocks** — Tests hit real APIs (Graph, Supabase) for true integration validation
5. **Graceful skips** — Data-dependent tests skip rather than fail when mailbox is empty
6. **Numbered tests** — Easy to reference in bug reports and CI logs
