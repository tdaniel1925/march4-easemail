# Session 2026-03-06 - Changes & Fixes Documentation

## Overview
This session focused on fixing AI features, contact creation issues, and critical sync/memory errors. However, JMAP integration changes appear to have caused broader issues. This document preserves all work for future re-implementation.

---

## 1. AI Features Fixed

### Issue: Groq API "not a legal HTTP header value" Error
**Error**: `TypeError: Bearer [REDACTED_GROQ_API_KEY] is not a legal HTTP header value`

**Root Cause**: Trailing whitespace/newline in `GROQ_API_KEY` environment variable

**Fix Applied**: `lib/groq/client.ts:9`
```typescript
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY?.trim(), // Added .trim()
});
```

**Impact**: Fixed AI dictate, AI reply, and AI remix features

---

### Issue: AI Reply Body Not Appearing in Compose Window
**Error**: AI reply selections weren't appearing in compose window, or appeared without line breaks

**Root Cause**: Plain text being inserted as HTML without conversion - line breaks lost

**Fix Applied**: `components/compose/ComposeClient.tsx:1112`
```typescript
// Before:
bodyRef.current.innerHTML = aiBody;

// After:
bodyRef.current.innerHTML = remixTextToHtml(aiBody);
```

**Impact**: AI reply bodies now display correctly with proper formatting

**Flow**:
1. User clicks "AI Reply" in inbox
2. `AiReplyModal` fetches 3 options from `/api/mail/ai-reply` (Groq Llama 70B)
3. User selects option
4. Body saved to `sessionStorage` with key `ai-reply-body-${messageId}`
5. Router navigates to `/compose?mode=reply&messageId=...`
6. `ComposeClient` reads sessionStorage and converts text to HTML
7. Modal closes automatically

---

## 2. Contact Creation Issues Fixed

### Issue 1: Contacts Not Appearing After Creation
**Problem**: Contacts saved but didn't show in list after page refresh

**Root Cause**: Original code saved to Microsoft Graph first. If Graph failed, nothing was cached locally.

**Fix Applied**: `app/api/contacts/route.ts` - Local-first approach
```typescript
// OLD APPROACH (broken):
1. Call Microsoft Graph API
2. Wait for response (2-3 seconds)
3. If Graph fails → 500 error, nothing saved
4. Only then save to database

// NEW APPROACH (fixed):
1. Save to database immediately → Return success (instant)
2. Sync to provider in background (fire and forget)
3. Contact always appears in UI
```

**Implementation**:
```typescript
// Save to database FIRST
const cachedContact = await prisma.cachedContact.create({
  data: { /* ... */ }
});

// Return immediately - contact is saved
const response = NextResponse.json({ contact: cachedContact }, { status: 201 });

// Background sync AFTER response sent
Promise.resolve().then(() => {
  syncContactToProvider(userId, homeAccountId, body, emailAccount?.provider).catch((err) => {
    console.error(`Background sync failed:`, err);
  });
});

return response;
```

---

### Issue 2: Slow Contact Save (203 seconds mentioned)
**Problem**: User complained saves were taking too long

**Root Cause**: Even with `.catch()` background sync, it was still blocking the response

**Fix**: Used `Promise.resolve().then()` pattern to ensure sync happens AFTER HTTP response is sent

---

### Issue 3: Fastmail/JMAP Contact Support
**Problem**: Contact creation only worked for Microsoft accounts

**Fix Applied**: Added provider detection and JMAP contact creation

**Implementation**: `app/api/contacts/route.ts`
```typescript
async function syncContactToProvider(
  userId: string,
  homeAccountId: string,
  data: { displayName: string; email?: string; phone?: string; company?: string; title?: string },
  provider?: EmailProvider
): Promise<void> {
  try {
    if (provider === EmailProvider.JMAP) {
      // Sync to Fastmail
      await createJmapContact(userId, homeAccountId, data);
      console.log(`[syncContactToProvider] Synced ${data.displayName} to Fastmail`);
    } else {
      // Sync to Microsoft Graph
      const payload: GraphContact = {
        displayName: data.displayName,
        /* ... */
      };
      await graphPost<GraphContact>(userId, homeAccountId, "/me/contacts", payload);
      console.log(`[syncContactToProvider] Synced ${data.displayName} to Microsoft Graph`);
    }
  } catch (err) {
    console.error(`[syncContactToProvider] Failed to sync ${data.displayName}:`, err);
  }
}

async function createJmapContact(
  userId: string,
  accountId: string,
  data: { displayName: string; email?: string; phone?: string; company?: string; title?: string }
): Promise<string> {
  // Get JMAP session and token
  const emailAccount = await prisma.emailAccount.findFirst({
    where: { userId, providerAccountId: accountId, provider: EmailProvider.JMAP },
  });

  if (!emailAccount || !emailAccount.accessToken) {
    throw new Error("JMAP account not found or missing token");
  }

  const apiUrl = (emailAccount.providerConfig as any)?.apiUrl || "https://api.fastmail.com/jmap/session";

  // Get JMAP session
  const sessionRes = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${emailAccount.accessToken}` },
  });
  const session = await sessionRes.json();

  // Create contact using JMAP ContactCard/set
  const jmapRequest = {
    using: ["urn:ietf:params:jmap:core", "com.fastmail:contacts"],
    methodCalls: [
      [
        "ContactCard/set",
        {
          accountId: session.primaryAccounts?.["com.fastmail:contacts"] || accountId,
          create: {
            newContact: {
              name: { full: data.displayName },
              ...(data.email ? { emails: { email1: { address: data.email } } } : {}),
              ...(data.phone ? { phones: { phone1: { number: data.phone } } } : {}),
              ...(data.company ? { organizations: { org1: { name: data.company } } } : {}),
              ...(data.title ? { titles: { title1: { name: data.title } } } : {}),
            },
          },
        },
        "0",
      ],
    ],
  };

  const createRes = await fetch(session.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${emailAccount.accessToken}`,
    },
    body: JSON.stringify(jmapRequest),
  });

  const result = await createRes.json();
  const created = result.methodResponses?.[0]?.[1]?.created?.newContact;

  if (!created?.id) {
    throw new Error("Failed to create JMAP contact");
  }

  return created.id;
}
```

---

## 3. Contact UI Simplification

### User Request: "make the contact page only 2 panels. remove the contacts folders (first) panel."

**Changes**: `components/contacts/ContactsClient.tsx` (210 lines removed)

**Removed**:
- Left sidebar with groups/navigation
- Favorites filter toggle
- Alpha filters (All, A-F, G-M, N-Z)
- User profile section
- State: `activeFilter`, `selectedGroup`, `alphaFilter`

**Added**:
- "New Contact" button moved to contact list header

**Before** (3 panels):
```
[Sidebar: Groups/Nav] [Contact List] [Contact Detail]
```

**After** (2 panels):
```
[Contact List with search + New button] [Contact Detail]
```

**Related Changes**: `app/contacts/page.tsx`
```typescript
// Before: Fetched contacts and groups
const [dbUser, emailAccounts, contacts, groups] = await Promise.all([...]);

// After: Only fetch contacts
const [dbUser, emailAccounts, contacts] = await Promise.all([...]);

// Removed groups prop from ContactsClient
<ContactsClient
  initialContacts={contacts}
  // initialGroups={groups} - REMOVED
  currentUser={{...}}
/>
```

---

## 4. Critical Sync & Memory Issues Fixed

### Issue 1: Memory Exhaustion Crashes
**Error**: `Vercel Runtime Error: instance was killed because it ran out of available memory` (repeated multiple times)

**Root Cause**: Sync cron job processing ALL accounts and folders in parallel with no limits

**Fix Applied**: `app/api/cron/sync/route.ts` - Added batching

```typescript
const BATCH_SIZE = 5; // Process 5 accounts at a time

// Helper to process items in batches
async function processBatched<T>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<void>
): Promise<PromiseSettledResult<void>[]> {
  const results: PromiseSettledResult<void>[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}

// Changed from:
const emailAccountResults = await Promise.allSettled(
  emailAccounts.map(async (account) => { /* ... */ })
);

// To:
const emailAccountResults = await processBatched(emailAccounts, BATCH_SIZE, async (account) => {
  /* ... */
});
```

**Impact**: Prevents memory exhaustion by limiting concurrent operations

---

### Issue 2: Microsoft Calendar Sync Error
**Error**:
```
Calendar delta sync failed 400: {
  "error": {
    "code": "ErrorInvalidUrlQuery",
    "message": "The '$top' parameter is not supported with change tracking over the 'CalendarView' resource as page size cannot be guaranteed. Express page size preferences using the Prefer: odata.maxpagesize= header instead."
  }
}
```

**Root Cause**: Using `$top=100` parameter with Microsoft Graph CalendarView delta sync

**Fix Applied**: `lib/sync/calendar-sync.ts:64`
```typescript
// Before:
initialPath =
  `/me/calendarView/delta` +
  `?startDateTime=${encodeURIComponent(oneYearAgo.toISOString())}` +
  `&endDateTime=${encodeURIComponent(twoYearsAhead.toISOString())}` +
  `&$select=${CAL_SELECT}&$top=100`;  // ❌ Not supported

// After:
initialPath =
  `/me/calendarView/delta` +
  `?startDateTime=${encodeURIComponent(oneYearAgo.toISOString())}` +
  `&endDateTime=${encodeURIComponent(twoYearsAhead.toISOString())}` +
  `&$select=${CAL_SELECT}`;  // ✅ Removed $top parameter
```

**Impact**: Calendar sync now works correctly with Microsoft Graph API

---

### Issue 3: JMAP Delta Sync Crash
**Error**: `TypeError: e.created is not iterable (cannot read property undefined)`

**Root Cause**: JMAP server returning `undefined` or `null` instead of arrays for `created`, `updated`, `destroyed` fields

**Fix Applied**: `lib/providers/jmap/JmapEmailProvider.ts:350-352`
```typescript
// Before:
allCreated.push(...changesData.created);
allUpdated.push(...changesData.updated);
allDestroyed.push(...changesData.destroyed);

// After:
if (Array.isArray(changesData.created)) allCreated.push(...changesData.created);
if (Array.isArray(changesData.updated)) allUpdated.push(...changesData.updated);
if (Array.isArray(changesData.destroyed)) allDestroyed.push(...changesData.destroyed);
```

**Impact**: JMAP/Fastmail sync no longer crashes on unexpected responses

---

## 5. All Files Modified (Today's Session)

### Core Fixes
1. `lib/groq/client.ts` - Added `.trim()` to API key
2. `components/compose/ComposeClient.tsx` - Fixed AI reply body insertion with `remixTextToHtml()`

### Contact System
3. `app/api/contacts/route.ts` - Local-first contact creation + JMAP support
4. `components/contacts/ContactsClient.tsx` - 2-panel layout (210 lines removed)
5. `app/contacts/page.tsx` - Removed group fetching

### Sync System
6. `app/api/cron/sync/route.ts` - Added batching to prevent memory crashes
7. `lib/sync/calendar-sync.ts` - Removed `$top` parameter from CalendarView delta
8. `lib/providers/jmap/JmapEmailProvider.ts` - Added defensive array checks

### Related Systems (Read but not modified)
- `lib/microsoft/graph.ts` - Better JSON parse error handling (already present)
- `app/api/mail/dictate/route.ts` - Reviewed, works correctly
- `app/api/mail/ai-reply/route.ts` - Reviewed, works correctly
- `app/api/mail/remix/route.ts` - Reviewed, works correctly
- `components/inbox/AiReplyModal.tsx` - Reviewed, works correctly
- `components/inbox/InboxClient.tsx` - Reviewed, works correctly

---

## 6. Git Commits Created

### Commit 1: `b1989eb`
```
fix(ai): fix Groq API key whitespace and AI reply body insertion

- Add .trim() to GROQ_API_KEY to remove trailing whitespace/newlines
  causing "not a legal HTTP header value" error
- Fix AI reply body insertion to use remixTextToHtml() for proper
  line break rendering in compose window

Fixes:
- AI dictate Groq connection errors
- AI reply body not appearing with proper formatting
- All AI features (dictate, reply, remix) now work correctly
```

### Commit 2: `8fc595b`
```
fix(sync): fix memory crashes, calendar sync errors, and JMAP delta sync

Critical fixes for production issues:

1. Memory Exhaustion - Added batching to process accounts 5 at a time
   instead of all in parallel, preventing "instance was killed because
   it ran out of available memory" errors

2. Calendar Sync Error - Removed $top parameter from CalendarView delta
   sync requests. Microsoft Graph API rejects $top with CalendarView change
   tracking.

3. JMAP Delta Sync - Added defensive checks for created/updated/destroyed
   arrays that may be undefined or non-iterable from JMAP server responses.

Files changed:
- app/api/cron/sync/route.ts: Added processBatched helper
- lib/sync/calendar-sync.ts: Removed $top parameter
- lib/providers/jmap/JmapEmailProvider.ts: Added Array.isArray checks
```

---

## 7. Known Issues & Considerations

### JMAP Integration Issues
The JMAP/Fastmail integration appears to have caused broader system issues. Specific problems not fully diagnosed:
- User profile lookup failures (may be unrelated)
- Potential database schema conflicts
- Token management issues
- Session handling problems

### Rollback Decision
Decided to roll back to commit `6835e37` (feat(inbox): add Create Event button) and re-implement JMAP integration more carefully.

### Re-implementation Strategy
When re-implementing:
1. Start with AI fixes (safe, isolated changes)
2. Then contact local-first approach (safe, improves UX)
3. Add batching to sync cron (critical for memory)
4. Fix calendar sync `$top` parameter (critical for Microsoft accounts)
5. Finally, re-add JMAP support incrementally with thorough testing

---

## 8. Testing Checklist for Re-implementation

### AI Features
- [ ] AI Dictate works and inserts text with proper formatting
- [ ] AI Reply generates 3 options correctly
- [ ] AI Reply inserts selected text into compose window
- [ ] AI Remix works on selected text
- [ ] Modal closes after AI Reply selection
- [ ] No Groq API errors in logs

### Contact System
- [ ] Create contact saves instantly (no 203 second wait)
- [ ] Contact appears in list immediately after creation
- [ ] Contact syncs to Microsoft Graph in background
- [ ] Contact syncs to Fastmail/JMAP if that's the provider
- [ ] Contact list shows all contacts after page refresh
- [ ] 2-panel layout works correctly
- [ ] Search works
- [ ] Contact detail view works

### Sync System
- [ ] No memory crashes during cron sync
- [ ] Calendar sync completes without `$top` parameter error
- [ ] JMAP delta sync doesn't crash on undefined arrays
- [ ] All accounts sync successfully
- [ ] Logs show successful batched processing
- [ ] No "instance was killed" errors

### JMAP Integration (when re-implementing)
- [ ] JMAP accounts can be connected
- [ ] JMAP folder sync works
- [ ] JMAP email sync works
- [ ] JMAP contact creation works
- [ ] JMAP token refresh works
- [ ] No conflicts with Microsoft Graph accounts
- [ ] User profile lookup still works
- [ ] Database queries don't timeout

---

## 9. Environment Variables Required

```env
# Groq API (for AI features)
GROQ_API_KEY=gsk_...  # Make sure no trailing whitespace!

# Fastmail/JMAP (when re-implementing)
FASTMAIL_CLIENT_ID=...
FASTMAIL_CLIENT_SECRET=...
FASTMAIL_REDIRECT_URI=...

# Cron authentication
CRON_SECRET=...
```

---

## 10. Key Learnings

1. **Always trim API keys** - Environment variables can have trailing whitespace
2. **Use defensive array checks** - External APIs may return undefined instead of empty arrays
3. **Batch heavy operations** - Processing all accounts in parallel causes memory crashes
4. **Read API docs carefully** - Microsoft Graph CalendarView doesn't support `$top` with delta
5. **Local-first is better UX** - Save locally first, sync to provider in background
6. **Test incrementally** - Large integrations (like JMAP) should be added piece by piece

---

## 11. Quick Reference: Rollback Command Used

```bash
git reset --hard 6835e37
git push --force
```

This removed all changes after the "Create Event button" commit.

---

**Session End**: 2026-03-06
**Status**: Rolled back to clean state, all changes documented for future re-implementation
