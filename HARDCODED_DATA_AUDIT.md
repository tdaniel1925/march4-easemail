# Dashboard Hardcoded Data Audit

## Executive Summary

The dashboard contains 5 major categories of hardcoded/incomplete data that need to be replaced with real database queries. Of these, 3 are high-priority (Weekly Activity Chart, Notifications stat, and Todo list) because they significantly impact user experience.

---

## 1. WEEKLY ACTIVITY CHART - Hardcoded Email Count Data

**File:** C:\dev\1 - March 4 Easemail\march4-easemail\components\dashboard\DashboardClient.tsx
**Line:** 60
**Current Code:** `const emailsData = [5, 8, 6, 11, 9, 3, 2];`

**What it is:** Hardcoded array for bar chart showing emails per day of week (Mon-Sun)
**Current values:** Mon=5, Tue=8, Wed=6, Thu=11, Fri=9, Sat=3, Sun=2
**What it should be:** Real count of emails received per day for past 7 days

**Database source:** cached_emails table
**Query approach:** Group cachedEmails by day, count per day for past 7 days

**Suggested query:**
```
SELECT DATE(receivedDateTime) as date, COUNT(*) as count
FROM cached_emails
WHERE userId = :userId 
  AND homeAccountId = :homeAccountId
  AND receivedDateTime >= NOW() - INTERVAL 7 days
GROUP BY DATE(receivedDateTime)
ORDER BY date ASC
```

**Priority:** HIGH
**Complexity:** Medium
**Impact:** User gets incorrect activity data

---

## 2. TODO LIST - Hardcoded with No Persistence

**File:** C:\dev\1 - March 4 Easemail\march4-easemail\components\dashboard\DashboardClient.tsx
**Lines:** 138-142

**Current Code:**
```typescript
const [todos, setTodos] = useState<TodoItem[]>([
  { id: "1", text: "Review client contracts", done: false, priority: "high" },
  { id: "2", text: "Send meeting summary email", done: true },
  { id: "3", text: "Prepare case notes for Thursday", done: false, priority: "normal" },
]);
```

**What it is:** Client-side state with example todos, lost on page refresh
**Current todos:** 
  - "Review client contracts" (high priority, incomplete)
  - "Send meeting summary email" (normal, complete)
  - "Prepare case notes for Thursday" (normal, incomplete)

**What it should be:** User-created todos persisted in database

**Database solution:** Need new TodoItem model - DOES NOT EXIST
**Priority:** HIGH
**Complexity:** High (new schema + API required)
**Impact:** Complete feature loss on refresh; core functionality unavailable

---

## 3. UNREAD EMAIL COUNT - Hardcoded Zero

**File:** C:\dev\1 - March 4 Easemail\march4-easemail\app\dashboard\page.tsx
**Line:** 107

**Current Code:** `<StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />`
**Current value:** Always 0
**What it should be:** Actual count of unread emails

**Database source:** cached_emails where isRead=false

**How it's done correctly elsewhere:**
In app\inbox\page.tsx line 103: `const unreadCount = emails.filter((e) => !e.isRead).length;`

**Suggested fix:** Use same pattern in dashboard
```
const inboxFolder = await prisma.cachedFolder.findFirst({
  where: { userId, homeAccountId, wellKnownName: "inbox" }
});

const unreadCount = inboxFolder ? await prisma.cachedEmail.count({
  where: { userId, homeAccountId, folderId: inboxFolder.id, isRead: false }
}) : 0;
```

**Priority:** HIGH
**Complexity:** Low
**Impact:** Dashboard stat misleading; store data inconsistent with reality

---

## 4. NOTIFICATIONS STAT - Hardcoded Zero, Purpose Unclear

**File:** C:\dev\1 - March 4 Easemail\march4-easemail\components\dashboard\DashboardClient.tsx
**Line:** 432

**Current Code:**
```typescript
<span className="text-2xl font-bold text-white">0</span>
<span className="text-xs font-medium">Notifications</span>
```

**Current value:** Always 0
**What it should be:** UNCLEAR - product decision needed

**Possible meanings:**
1. Failed notifications (from notification_log with status="failed")
2. Active email rule triggers
3. System alerts/warnings
4. Something else entirely

**Database tables available:**
- notification_log - has type, status, sentAt, errorMessage
- email_rules - has lastExecutedAt, failureCount

**Recommended interpretation:** Count of failed notifications in past 24 hours
```
SELECT COUNT(*) FROM notification_log 
WHERE userId = :userId AND status = 'failed' 
  AND sentAt >= NOW() - INTERVAL 1 day
```

**Priority:** MEDIUM
**Complexity:** Low (once purpose defined)
**Impact:** Placeholder stat confuses users

**BLOCKER:** Needs product definition before implementation

---

## 5. INBOXUNREAD INITIALIZATION - Inconsistent Across App

**Affected files (17 total):**
- app\dashboard\page.tsx:107 - HARDCODED 0
- app\trash\page.tsx:67 - HARDCODED 0
- app\teams\page.tsx:25 - HARDCODED 0
- app\email-rules\page.tsx:27 - HARDCODED 0
- app\drafts\page.tsx:79 - HARDCODED 0
- app\contacts\page.tsx:103 - HARDCODED 0
- app\attachments\page.tsx:85 - HARDCODED 0
- app\compose\page.tsx:36 - HARDCODED 0
- app\accounts\page.tsx:33 - HARDCODED 0
- app\calendar\page.tsx:68 - HARDCODED 0
- app\help\page.tsx:27 - HARDCODED 0
- app\admin\page.tsx:68 - HARDCODED 0
- app\signatures\page.tsx:27 - HARDCODED 0
- app\folder\[folderId]\page.tsx:101 - HARDCODED 0
- app\starred\page.tsx:63 - HARDCODED 0
- app\settings\page.tsx:32 - HARDCODED 0
- app\sent\page.tsx:78 - HARDCODED 0
- app\inbox\page.tsx:107 - CORRECT (uses unreadCount)

**What it is:** All pages hardcode inboxUnread=0 except Inbox which calculates correctly

**Solution:** Create utility function for reuse
```
// lib/utils/get-unread-count.ts
export async function getUnreadCount(userId, homeAccountId) {
  const folder = await prisma.cachedFolder.findFirst({
    where: { userId, homeAccountId, wellKnownName: "inbox" }
  });
  return folder ? await prisma.cachedEmail.count({
    where: { userId, homeAccountId, folderId: folder.id, isRead: false }
  }) : 0;
}
```

**Priority:** MEDIUM
**Complexity:** Low
**Impact:** Inconsistent data across app; sidebar badge wrong on most pages

---

## Summary Matrix

| Issue | File | Line | Current | Should Be | Priority | Files | Complexity |
|-------|------|------|---------|-----------|----------|-------|------------|
| Weekly Chart | DashboardClient.tsx | 60 | [5,8,6,...] | Real data query | HIGH | 1 | Medium |
| Todo List | DashboardClient.tsx | 138-142 | 3 samples | DB + API | HIGH | 7+ | High |
| Unread Count | page.tsx | 107 | 0 | Real count | HIGH | 1 | Low |
| Notifications | DashboardClient.tsx | 432 | 0 | TBD (decision) | MEDIUM | 1 | Low |
| Init Inconsistency | 17 pages | Various | 0 | Utility func | MEDIUM | 18 | Low |

---

## Implementation Plan

### Phase 1 (30 min) - High Priority Quick Wins
- [ ] Fix dashboard unread count (copy inbox pattern)
- [ ] Create getUnreadCount utility 
- [ ] Apply to all 18 page files

### Phase 2 (1 hour) - Weekly Activity
- [ ] Query emailsData server-side
- [ ] Pass as prop to component
- [ ] Remove hardcoded array

### Phase 3 (3-4 hours) - Todo Persistence
- [ ] Add TodoItem model to Prisma
- [ ] Create migration
- [ ] Build CRUD API routes
- [ ] Update component to use API

### Phase 4 (TBD) - Notifications Stat
- [ ] Define what "Notifications" means
- [ ] Implement query

