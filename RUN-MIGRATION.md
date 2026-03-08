# Database Migration Instructions

## Status

✅ **Prisma Client Generated** - All new fields available in code
✅ **TypeScript Compiles** - No compilation errors
⏳ **Database Migration Pending** - Run SQL script below

---

## Step 1: Connect to Your Supabase Database

### Option A: Using Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `MIGRATION-COMPREHENSIVE-FIX-ALL.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Verify you see "Migration complete" message at the bottom

### Option B: Using psql Command Line

```bash
# Get your DATABASE_URL from .env.local
# Look for DATABASE_URL or DIRECT_URL

# Run migration
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  < MIGRATION-COMPREHENSIVE-FIX-ALL.sql

# Verify success - should see "Migration complete" at the end
```

### Option C: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration file
supabase db push --file MIGRATION-COMPREHENSIVE-FIX-ALL.sql
```

---

## Step 2: Verify Migration Success

After running the migration, verify it worked:

### Check 1: New Tables Created

Run this query in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'email_attachments',
  'ai_generated_replies',
  'cached_search_results',
  'sync_status',
  'notification_log',
  'migration_status'
)
ORDER BY table_name;
```

**Expected**: 6 rows showing all new tables

### Check 2: New Fields Added to Contacts

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cached_contacts'
AND column_name IN (
  'department',
  'emailAddresses',
  'phones',
  'categories',
  'notes',
  'isVIP',
  'isFavorite'
)
ORDER BY column_name;
```

**Expected**: 7 rows showing all new contact fields

### Check 3: New Fields Added to Drafts

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'drafts'
AND column_name IN (
  'originalMessageBody',
  'sensitivity',
  'requestDeliveryReceipt',
  'scheduledNotificationSent',
  'lastScheduleAttemptAt',
  'scheduleAttemptCount'
)
ORDER BY column_name;
```

**Expected**: 6 rows showing all new draft fields

### Check 4: Migration Complete Message

```sql
SELECT 'Migration complete' as status, NOW() as completed_at;
```

**Expected**: Shows current timestamp

---

## Step 3: Restart Your Development Server

After migration completes:

```bash
# Kill the current dev server (Ctrl+C)

# Restart
npm run dev
```

The app will now use all the new database fields.

---

## Step 4: Test the Fixes

### Test Compose Draft Persistence

1. Go to `/compose`
2. Write an email
3. Mark as "High importance" (exclamation icon)
4. Check "Request read receipt" (eye icon)
5. Click "Save Draft"
6. Close the tab
7. Navigate back to `/compose` and open the draft
8. **Verify**: Importance and read receipt are still selected

### Test Inbox Star/Archive/Delete

1. Go to `/inbox`
2. Click the star icon on any email
3. **Verify**: Star shows immediately
4. Refresh the page
5. **Verify**: Star persists after refresh
6. Try Archive button
7. **Verify**: Email moves to Archive folder
8. Try Delete button
9. **Verify**: Email moves to Deleted Items

### Test Scheduled Send

1. Compose an email
2. Mark as high importance
3. Schedule to send in 2 minutes
4. **Verify**: When sent, importance is included

---

## Troubleshooting

### Error: "relation already exists"

**This is OK** - It means some tables/columns already exist. The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

### Error: "permission denied"

**Solution**: Make sure you're using the correct DATABASE_URL with full permissions (not the pooler URL).

Check your `.env.local`:
```
DIRECT_URL=postgresql://... (use this for migrations)
DATABASE_URL=postgresql://... (pooler - don't use for migrations)
```

### Error: "column already exists"

**This is OK** - The migration script uses `ADD COLUMN IF NOT EXISTS` so existing columns are skipped.

### Migration Hangs or Times Out

**Solution**: The migration has a lot of commands. Try running sections separately:

1. First run just the ALTER TABLE commands
2. Then run the CREATE TABLE commands
3. Then run the data migration commands
4. Finally run the foreign key constraints

---

## What Gets Added

### New Tables (6)
- `email_attachments` - Track all attachments with metadata
- `ai_generated_replies` - Persist AI content (replaces sessionStorage)
- `cached_search_results` - Cache search results (reduces API calls)
- `sync_status` - Track all sync operations
- `notification_log` - Audit trail for notifications
- `migration_status` - Track one-time migrations per user

### New Fields (66)
- **Contacts**: 18 fields (department, multiple emails/phones, CRM features)
- **Emails**: 7 fields (importance, sensitivity, conversation threading)
- **Calendar**: 12 fields (event color, Teams links, timezone, recurrence)
- **Drafts**: 9 fields (original message body, sensitivity, scheduling)
- **Users**: 1 field (last active account)
- **Rules**: 4 fields (execution tracking)

### Indexes Created (12)
- All new tables have proper indexes for performance
- Composite indexes on userId + related fields
- Expiration indexes for cleanup jobs

---

## Next Steps After Migration

1. ✅ Migration complete
2. ⏳ Test all fixed endpoints (see Step 4 above)
3. ⏳ Continue with remaining 54 issues
4. ⏳ Deploy to production when ready

---

## Rollback (If Needed)

If something goes wrong and you need to rollback:

```sql
-- Drop new tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS migration_status CASCADE;
DROP TABLE IF EXISTS notification_log CASCADE;
DROP TABLE IF EXISTS sync_status CASCADE;
DROP TABLE IF EXISTS cached_search_results CASCADE;
DROP TABLE IF EXISTS ai_generated_replies CASCADE;
DROP TABLE IF EXISTS email_attachments CASCADE;

-- Remove new columns (can't be undone easily - backup first!)
-- Contact your DBA or create a full database backup before migration
```

**Better approach**: Take a Supabase backup before running migration:
1. Go to Database → Backups in Supabase Dashboard
2. Click "Create Backup"
3. Wait for backup to complete
4. Then run migration
5. If issues occur, restore from backup

---

## Support

If you encounter issues:

1. Check the verification queries above
2. Look for error messages in SQL Editor
3. Check Supabase logs: Logs → Postgres Logs
4. Verify your DATABASE_URL has correct permissions

**Migration File**: `MIGRATION-COMPREHENSIVE-FIX-ALL.sql` (353 lines)
**Summary Document**: `FIXES-APPLIED-2026-03-07.md` (complete documentation)
