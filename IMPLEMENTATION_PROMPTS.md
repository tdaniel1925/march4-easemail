# 🍞 CodeBakers Implementation Prompts

This document contains detailed, copy-paste ready prompts for future implementation sessions. Each prompt follows the CodeBakers V4.3.0 protocol.

---

## 🔧 Settings UI - Timezone Selector

**Status:** API complete, UI pending

### Prompt:
```
Add timezone selector to Settings page following CodeBakers protocol.

Read these first:
- .codebakers/BRAIN.md
- .codebakers/DEPENDENCY-MAP.md

Task:
1. Edit components/settings/SettingsClient.tsx
2. Add new section after "Appearance" section (around line 180):

```typescript
{/* Timezone Preferences */}
<section className="bg-white rounded-large border border-neutral-200 shadow-custom p-6">
  <h2 className="text-base font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>
    Timezone
  </h2>

  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "rgb(58 58 58)" }}>
        Preferred Timezone
      </label>
      <select
        value={profile.preferredTimeZone || "America/Chicago"}
        onChange={async (e) => {
          const newTz = e.target.value;
          setProfile(prev => ({ ...prev, preferredTimeZone: newTz }));

          try {
            await fetch("/api/user/settings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ preferredTimeZone: newTz }),
            });
          } catch (error) {
            console.error("Failed to update timezone:", error);
          }
        }}
        className="w-full px-3 py-2 border border-neutral-300 rounded-small"
      >
        <option value="America/Chicago">Central Time (US)</option>
        <option value="America/New_York">Eastern Time (US)</option>
        <option value="America/Denver">Mountain Time (US)</option>
        <option value="America/Los_Angeles">Pacific Time (US)</option>
        <option value="America/Anchorage">Alaska Time</option>
        <option value="Pacific/Honolulu">Hawaii Time</option>
        <option value="Europe/London">London</option>
        <option value="Europe/Paris">Paris</option>
        <option value="Asia/Tokyo">Tokyo</option>
        <option value="Australia/Sydney">Sydney</option>
      </select>
    </div>
  </div>
</section>
```

3. Update Profile type to include preferredTimeZone: string
4. Verify TypeScript compiles
5. Commit: feat(settings): add timezone preference selector
```

---

## 📊 Calendar Display - Timezone Formatting

**Status:** Backend complete, display functions pending

### Prompt:
```
Update calendar display functions to use user timezone following CodeBakers protocol.

Read these first:
- .codebakers/BRAIN.md
- .codebakers/DEPENDENCY-MAP.md

Task 1: Update CalendarClient formatTime
File: components/calendar/CalendarClient.tsx (line 79-90)

Change:
```typescript
function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
```

To:
```typescript
function formatTime(iso: string, timeZone: string = "America/Chicago"): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone
  });
}
```

Task 2: Pass timezone to formatTime calls
- Find all formatTime() calls in CalendarClient
- Pass event.timeZone as second parameter
- If event doesn't have timeZone, use "America/Chicago" as default

Task 3: Update DashboardClient formatEventTime
File: components/dashboard/DashboardClient.tsx (line 28-30)

Same pattern as above.

Commit: feat(calendar): add timezone-aware display formatting
```

---

## 🔍 Attachments - Backend Filtering API

**Status:** Pagination done, filtering API pending

### Prompt:
```
Create backend filtering API for attachments following CodeBakers protocol.

Read these first:
- .codebakers/BRAIN.md
- .codebakers/DEPENDENCY-MAP.md
- agents/patterns/atomic-unit.md

Task: Create app/api/mail/attachments/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // documents | images | spreadsheets | other
  const sort = searchParams.get("sort") || "date"; // name | sender | date | size
  const order = searchParams.get("order") || "desc"; // asc | desc
  const top = parseInt(searchParams.get("top") || "100");

  // Build content type filter
  let contentTypeFilter = "";
  if (type === "documents") {
    contentTypeFilter = "contentType eq 'application/pdf' or contentType eq 'application/msword'";
  } else if (type === "images") {
    contentTypeFilter = "contentType eq 'image/jpeg' or contentType eq 'image/png'";
  } else if (type === "spreadsheets") {
    contentTypeFilter = "contentType eq 'application/vnd.ms-excel'";
  }

  const filter = contentTypeFilter ? `hasAttachments eq true and (${contentTypeFilter})` : "hasAttachments eq true";

  const sortField = sort === "date" ? "receivedDateTime" : "from/emailAddress/name";
  const orderBy = `${sortField} ${order}`;

  try {
    const data = await graphGet(
      user.id,
      homeAccountId,
      `/me/messages?$filter=${encodeURIComponent(filter)}&$top=${top}&$select=id,subject,from,receivedDateTime,hasAttachments&$expand=attachments($select=id,name,size,contentType)&$orderby=${orderBy}`
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/mail/attachments] Error:", error);
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}
```

Then update AttachmentsClient to call this API when tab changes.

Commit: feat(attachments): add backend filtering API with content type support
```

---

## 🔔 Notifications Stat - Product Decision Required

**Status:** Blocked - needs product decision

### Options:

**Option A: Failed Notifications (recommended)**
```typescript
// In app/dashboard/page.tsx
const failedNotifications = await prisma.notificationLog.count({
  where: {
    userId: user.id,
    status: "failed",
    sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
});

// Pass to DashboardClient
<DashboardClient ... failedNotifications={failedNotifications} />
```

**Option B: Active Email Rules**
```typescript
const activeRules = await prisma.emailRule.count({
  where: {
    userId: user.id,
    enabled: true,
  },
});
```

**Option C: System Alerts (requires new table)**
Create new SystemAlert model for app-level notifications.

### Prompt (after decision):
```
Implement notifications stat for dashboard.

Decision: [OPTION A/B/C]

[Include specific implementation based on choice]

Commit: feat(dashboard): add real notifications stat (shows [description])
```

---

## 🧪 Testing Checklist

After implementing any of the above, verify:

```
1. TypeScript compiles:
   npm run build (ignore DATABASE_URL error - expected locally)

2. Dependency map updated:
   npm run dep:map

3. Git status clean:
   git status

4. Commit follows pattern:
   feat(scope): description

   - Bullet 1
   - Bullet 2

   Part of [issue/fix reference]
```

---

## 📝 Notes for Future Sessions

### Database Migrations
- Migrations are created but not applied locally (no DATABASE_URL)
- They will auto-apply on Vercel deployment
- Manual application: Set DATABASE_URL in .env.local, then `npx prisma migrate deploy`

### Prisma Client Generation
- Always run `npx prisma generate` after schema changes
- Already configured in package.json postinstall

### CodeBakers Protocol Reminders
1. Read .codebakers/BRAIN.md before ANY changes
2. Check DEPENDENCY-MAP.md before mutations
3. Run dep:map after new stores/components
4. Commit after each atomic unit
5. Log to BUILD-LOG.md after features

---

**Generated:** 2026-03-26
**CodeBakers Version:** 4.3.0
