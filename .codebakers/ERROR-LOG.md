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

## 2026-03-26 — Production schema mismatch after deployment

**Error:** `PrismaClientKnownRequestError: Invalid 'prisma.user.findUnique()' invocation: The column '(not available)' does not exist in the current database.`

**Root cause:** Migrations created locally (`20260326_add_todo_items`, `20260326_add_timezone_fields`) were committed and pushed, but not applied to production Supabase database. The app code deployed to Vercel expects `users.preferredTimeZone` and `todo_items` table, but they don't exist yet in the database.

**Why it happened:**
1. Local development has no DATABASE_URL (intentional - work against production directly)
2. `npx prisma migrate dev` couldn't run locally
3. Migration SQL files created manually
4. Code deployed before migrations could be applied
5. Timing issue: app expects columns that don't exist

**Fix:** Run migration SQL directly in Supabase SQL Editor:

```sql
-- Migration 1: Add todo_items table
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

-- Migration 2: Add timezone field
ALTER TABLE "users" ADD COLUMN "preferredTimeZone" TEXT NOT NULL DEFAULT 'America/Chicago';
```

**Prevention:** For schema changes in production-only setups:
1. Apply migration SQL in Supabase FIRST
2. Then deploy code changes that use new columns
3. Or: set up staging environment with DATABASE_URL for migration testing

**Files affected:** All pages using `user.preferredTimeZone`, `/api/todos/*` routes

**Pattern:** Migration timing in production-first development workflows
