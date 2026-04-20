# 🔍 MS Teams Integration - Why It Won't Work

## Current Status: ⚠️ Missing Critical Scope

### The Problem

The MS Teams section shows a "Grant Teams Access" button because it's missing **one critical permission scope** that's required to read channel messages.

### Root Cause

**Missing scope:** `ChannelMessage.Read.All`

**Current TEAMS_SCOPES in `lib/microsoft/msal.ts`:**
```typescript
export const TEAMS_SCOPES = [
  "https://graph.microsoft.com/Chat.ReadWrite",           // ✅ Has this
  "https://graph.microsoft.com/ChannelMessage.Send",      // ✅ Has this
  "https://graph.microsoft.com/Team.ReadBasic.All",       // ✅ Has this
  "https://graph.microsoft.com/Channel.ReadBasic.All",    // ✅ Has this
  "https://graph.microsoft.com/OnlineMeetings.ReadWrite", // ✅ Has this
];
```

**What's missing:**
```typescript
"https://graph.microsoft.com/ChannelMessage.Read.All"     // ❌ MISSING
```

### Why This Matters

Without `ChannelMessage.Read.All`:
- ✅ **Chats work** (uses `Chat.ReadWrite`)
- ✅ **Sending messages works** (uses `ChannelMessage.Send`)
- ❌ **Reading channel messages FAILS** (requires `ChannelMessage.Read.All`)

When you click on a Teams channel, the app tries to call:
```
GET /me/teams/{teamId}/channels/{channelId}/messages
```

This endpoint requires `ChannelMessage.Read.All` permission, which the app doesn't have.

### Evidence from Code

In `components/teams/TeamsClient.tsx` line 282-290:
```typescript
const body = await res.json() as { error?: string };
if (body.error === "admin_consent_required") {
  setMessages([{
    id: "__admin_consent__",
    createdDateTime: new Date().toISOString(),
    from: null,
    body: {
      contentType: "text",
      content: "Reading channel messages requires your Microsoft 365 admin to grant ChannelMessage.Read.All permission for this app.",
    },
  }]);
}
```

The code is **already handling this case** - it detects the missing permission and shows a message.

### Additional Issue: Admin Consent Required

Even after adding the scope, `ChannelMessage.Read.All` is an **admin-only scope** that requires:
1. Microsoft 365 admin to grant tenant-wide consent
2. Or: Application permissions (not delegated) configured in Azure AD

**This is why the error message says:**
> "Reading channel messages requires your Microsoft 365 admin to grant ChannelMessage.Read.All permission for this app."

## What Works Right Now

✅ **Chats (Direct Messages & Group Chats)**
- List all chats
- Read chat messages
- Send messages to chats
- View members

✅ **Teams List**
- View all teams you're a member of
- View team details

✅ **Channels List**
- View all channels in a team
- View channel details

❌ **Channel Messages (BLOCKED)**
- Cannot read channel messages
- Requires admin consent

✅ **Online Meetings**
- Create Teams meetings from calendar

## How to Fix (2 Steps Required)

### Step 1: Add Missing Scope to Code

Edit `lib/microsoft/msal.ts` line ~18:

```typescript
export const TEAMS_SCOPES = [
  "https://graph.microsoft.com/Chat.ReadWrite",
  "https://graph.microsoft.com/ChannelMessage.Send",
  "https://graph.microsoft.com/ChannelMessage.Read.All",  // ADD THIS LINE
  "https://graph.microsoft.com/Team.ReadBasic.All",
  "https://graph.microsoft.com/Channel.ReadBasic.All",
  "https://graph.microsoft.com/OnlineMeetings.ReadWrite",
];
```

### Step 2: Azure AD Admin Consent

**This requires your Microsoft 365 admin to:**

1. Go to Azure Portal → Azure Active Directory → App Registrations
2. Find your EaseMail app registration
3. Go to API Permissions
4. Add `ChannelMessage.Read.All` (delegated permission)
5. Click "Grant admin consent for [Your Organization]"

**Without Step 2, channel messages will never work - even with the code change.**

## Alternative: Remove Channel Messages Feature

If you can't get admin consent, you have two options:

**Option A: Hide channel message reading**
- Keep Teams/Channels visible
- Show message: "Your admin hasn't granted permission to read channel messages"
- Allow sending (ChannelMessage.Send works without admin consent in some tenants)

**Option B: Teams Chats Only**
- Remove the "Teams" tab entirely
- Keep only "Chats" tab (works perfectly)
- This gives you DM + group chat functionality

## Why "Grant Teams Access" Button Appears

The button appears when the API returns:
- `error: "teams_scope_required"` (403 Forbidden)
- `error: "account_requires_reauth"` (401 Unauthorized)

This happens because:
1. User clicks Teams page
2. App calls `/api/teams/chats` with TEAMS_SCOPES
3. Token exists but doesn't have `ChannelMessage.Read.All`
4. Later when clicking a channel, Graph API returns 403
5. UI shows "Grant Teams Access" thinking user needs to re-consent
6. But re-consenting won't help - **the scope isn't in the request**

## Summary

**Why Teams won't work:**
1. Missing `ChannelMessage.Read.All` scope in code
2. Even after adding, requires Microsoft 365 admin approval

**What does work:**
- Direct messages (chats)
- Group chats
- Viewing teams/channels list
- Sending channel messages (maybe - depends on tenant settings)

**What doesn't work:**
- Reading channel messages (requires admin consent)

**Recommended path:**
1. Add the missing scope to code
2. Ask David (david@dmillerlaw.com) to grant admin consent in Azure AD
3. All users disconnect/reconnect their Microsoft accounts
4. Channel messages will start working

**Or:** Simplify to "Chats Only" mode and avoid the admin consent requirement entirely.
