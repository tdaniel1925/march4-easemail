# Error Log
_Entries added as errors are investigated and fixed._

---

## 2026-03-04 — Prisma JSON field TypeScript cast errors

**Error:** `Type 'Condition[]' is not assignable to type 'JsonNull | InputJsonValue'` (writes) and `Conversion of type 'JsonValue' to type 'Condition[]' may be a mistake` (reads)

**Root cause:** Prisma's `Json` column type uses `InputJsonValue` for writes and `JsonValue` for reads. Neither accepts a typed array directly because typed arrays lack the required index signature.

**Fix:**
- Writes: `JSON.parse(JSON.stringify(body.conditions ?? []))` — returns `any`, Prisma accepts it
- Reads: `r.conditions as unknown as Condition[]` — double cast via `unknown` required

**Files:** `app/api/rules/route.ts`, `app/api/rules/[id]/route.ts`

**Pattern:** See `codebakers-suggestions.md` #1

---

## 2026-03-04 — `prisma migrate dev` drift error

**Error:** `Drift detected: Your database schema is not in sync with your migration history` when running `npx prisma migrate dev --name add_email_rules`

**Root cause:** Tables were created in the live DB outside of Prisma's migration system (or migration history was lost). Prisma's migration engine detected the DB state didn't match what the migrations would produce.

**Fix:** Used `npx prisma db push` instead — syncs schema to DB without requiring migration history consistency. No data loss.

**Pattern:** See `codebakers-suggestions.md` #2

---

## 2026-03-04 — `insertTranscript is not defined` ReferenceError at runtime

**Error:** `ReferenceError: insertTranscript is not defined` in browser console after renaming the function to `generateEmail` + `insertDictated`

**Root cause:** Turbopack dev server served a cached bundle that still referenced the old function name. `tsc --noEmit` was clean — this was a build cache issue, not a code issue.

**Fix:** Restarted the dev server (`npm run dev`). Turbopack rebuilt from scratch.

**Pattern:** See `codebakers-suggestions.md` #6. If tsc passes but browser throws ReferenceError for something not in source → restart dev server, not a code change.

---

## 2026-03-04 — Blank lines invisible in contenteditable after text-to-HTML conversion

**Error:** `formatEmailSpacing()` correctly inserted blank lines (`\n\n`) between email sections, but they were invisible after insertion into the email body. Salutation had no gap before body, closing had no gap before signature.

**Root cause:** `remixTextToHtml()` was joining `<div>` paragraph blocks with `""`. Adjacent `<div>` elements in a contenteditable stack flush with no visual gap. The blank lines from `formatEmailSpacing` were structurally present in the string but lost when converted to HTML.

**Fix:** Changed `.join("")` to `.join("<div><br></div>")`. An empty `<div><br></div>` is the browser's native representation of a blank line in contenteditable — it's what browsers emit when you press Enter twice.

**Files:** `components/compose/ComposeClient.tsx` — `remixTextToHtml()`

**Scope:** Fixed both AI Remix and AI Dictate (shared function).

**Pattern:** See `codebakers-suggestions.md` #3

---

## 2026-03-26 — Production schema mismatch after deployment (FULLY RESOLVED)

**Error:** `PrismaClientKnownRequestError: Invalid 'prisma.user.findUnique()' invocation: The column '(not available)' does not exist in the current database.`

**Root cause (Initial):** Migrations created locally (`20260326_add_todo_items`, `20260326_add_timezone_fields`) were committed and pushed, but not applied to production Supabase database.

**Root cause (Actual):** Two-part issue discovered through investigation:
1. **Missing tables/columns:** `todo_items` table and new `users` columns didn't exist in production
2. **Existing user records with NULL values:** After adding columns with `ALTER TABLE ... ADD COLUMN ... DEFAULT`, the default only applied to NEW rows. Existing 6 users had NULL in required fields.

**Investigation process:**
1. Applied initial migrations (todo_items, preferredTimeZone)
2. Error persisted with same "(not available)" message
3. Checked schema structure - discovered duplicate columns in initial query (queried wrong schema)
4. Verified `public.users` structure - all columns present with correct defaults
5. Discovered existing users had NULL values in newly added required fields
6. Updated all 6 existing users with proper defaults

**Complete fix (3 parts):**

```sql
-- Part 1: Add todo_items table
CREATE TABLE "todo_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "todo_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "todo_items_userId_createdAt_idx" ON "todo_items"("userId", "createdAt" DESC);
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Part 2: Add all missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationNewEmail" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationDailyDigest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationAiReplies" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationCalendarReminders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationWeeklyReport" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "appTheme" TEXT NOT NULL DEFAULT 'light';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "fontSize" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailDensity" TEXT NOT NULL DEFAULT 'comfortable';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "preferredTimeZone" TEXT NOT NULL DEFAULT 'America/Chicago';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastActiveAccountId" TEXT;

-- Part 3: Update existing users with proper defaults (CRITICAL)
UPDATE public.users SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
UPDATE public.users SET "preferredTimeZone" = 'America/Chicago' WHERE "preferredTimeZone" IS NULL;
UPDATE public.users SET
    "notificationNewEmail" = COALESCE("notificationNewEmail", true),
    "notificationDailyDigest" = COALESCE("notificationDailyDigest", false),
    "notificationAiReplies" = COALESCE("notificationAiReplies", true),
    "notificationCalendarReminders" = COALESCE("notificationCalendarReminders", true),
    "notificationWeeklyReport" = COALESCE("notificationWeeklyReport", false)
WHERE "notificationNewEmail" IS NULL OR "notificationDailyDigest" IS NULL
   OR "notificationAiReplies" IS NULL OR "notificationCalendarReminders" IS NULL
   OR "notificationWeeklyReport" IS NULL;
UPDATE public.users SET
    "appTheme" = COALESCE("appTheme", 'light'),
    "fontSize" = COALESCE("fontSize", 'default'),
    "emailDensity" = COALESCE("emailDensity", 'comfortable')
WHERE "appTheme" IS NULL OR "fontSize" IS NULL OR "emailDensity" IS NULL;
```

**Key learning:** PostgreSQL `ALTER TABLE ... ADD COLUMN ... DEFAULT` only applies default to **new rows**, not existing ones. Always backfill existing rows after adding required columns.

**Diagnostic scripts created:**
- `verify-schema.sql` - Comprehensive column addition script
- `diagnose-table-issue.sql` - Schema structure diagnostics
- `fix-existing-users.sql` - Existing user record updates

**Resolution:** All 6 users updated, sign-in working correctly.

**Prevention:** For production-only setups:
1. Apply migration SQL in Supabase FIRST
2. **Always backfill existing records** after adding required columns
3. Verify with query: `SELECT COUNT(*) FROM users WHERE new_column IS NULL`
4. Then deploy code changes

**Files affected:** All pages using `user.preferredTimeZone`, notification/appearance prefs, `/api/todos/*` routes

**Pattern:** Migration timing + existing record backfills in production-first workflows
