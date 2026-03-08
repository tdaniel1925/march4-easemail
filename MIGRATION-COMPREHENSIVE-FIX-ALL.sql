-- ============================================================================
-- COMPREHENSIVE MIGRATION: Fix All 74 Issues
-- Date: 2026-03-07
-- Description: Adds all missing database fields discovered in complete app audit
-- ============================================================================

-- ============================================================================
-- CONTACTS - Add missing fields for complete contact data
-- ============================================================================

-- Add department field (fetched from Graph but never saved)
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "department" TEXT NOT NULL DEFAULT '';

-- Add support for multiple emails (currently only stores first)
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "emailAddresses" JSONB NOT NULL DEFAULT '[]';

-- Add support for multiple phones with types
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "phones" JSONB NOT NULL DEFAULT '[]';

-- Add structured name fields
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "givenName" TEXT NOT NULL DEFAULT '';

ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "surname" TEXT NOT NULL DEFAULT '';

ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "middleName" TEXT NOT NULL DEFAULT '';

-- Add structured addresses
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "addresses" JSONB NOT NULL DEFAULT '[]';

-- Add IM addresses
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "imAddresses" JSONB NOT NULL DEFAULT '[]';

-- Add categories/tags for CRM
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "categories" JSONB NOT NULL DEFAULT '[]';

-- Add notes field
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "notes" TEXT NOT NULL DEFAULT '';

-- Add birthday field
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "birthday" TIMESTAMP;

-- Add anniversary field
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "anniversary" TIMESTAMP;

-- Add manager/reports for org structure
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "manager" TEXT;

ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "directReports" JSONB NOT NULL DEFAULT '[]';

-- Add CRM frequency/importance tracking
ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "frequencyScore" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "isVIP" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "cached_contacts"
ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- EMAILS - Add missing fields for metadata and actions
-- ============================================================================

-- Add importance field
ALTER TABLE "cached_emails"
ADD COLUMN IF NOT EXISTS "importance" TEXT NOT NULL DEFAULT 'normal';

-- Add sensitivity field
ALTER TABLE "cached_emails"
ADD COLUMN IF NOT EXISTS "sensitivity" TEXT NOT NULL DEFAULT 'normal';

-- Add inferenceClassification (focused inbox)
ALTER TABLE "cached_emails"
ADD COLUMN IF NOT EXISTS "inferenceClassification" TEXT NOT NULL DEFAULT 'other';

-- Add conversationId for threading
ALTER TABLE "cached_emails"
ADD COLUMN IF NOT EXISTS "conversationId" TEXT;

-- Add isDraft flag
ALTER TABLE "cached_emails"
ADD COLUMN IF NOT EXISTS "isDraft" BOOLEAN NOT NULL DEFAULT false;

-- Add sync status tracking
ALTER TABLE "cached_emails"
ADD COLUMN IF NOT EXISTS "syncStatus" TEXT NOT NULL DEFAULT 'synced';

-- Add last modified timestamp
ALTER TABLE "cached_emails"
ADD COLUMN IF NOT EXISTS "lastModifiedDateTime" TIMESTAMP;

-- ============================================================================
-- CALENDAR - Add missing event fields
-- ============================================================================

-- Add event color
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "eventColor" TEXT;

-- Add Teams meeting data
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "teamsMeetingUrl" TEXT;

ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "teamsMeetingId" TEXT;

-- Add original message body for context
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "bodyHtml" TEXT;

-- Add time zone
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "timeZone" TEXT NOT NULL DEFAULT 'UTC';

-- Add organizer type (required | optional)
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "organizerType" TEXT NOT NULL DEFAULT 'required';

-- Add series master ID for recurring events
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "seriesMasterId" TEXT;

-- Add iCalUId for external calendar compatibility
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "iCalUId" TEXT;

-- Add calendar ID (which calendar this belongs to)
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "calendarId" TEXT;

-- Add created/modified tracking
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "createdDateTime" TIMESTAMP;

ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "lastModifiedDateTime" TIMESTAMP;

-- ============================================================================
-- DRAFTS - Add missing compose fields
-- ============================================================================

-- Add original message body for reply/forward context
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "originalMessageBody" TEXT;

-- Add sensitivity
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "sensitivity" TEXT NOT NULL DEFAULT 'normal';

-- Add delivery receipt request
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "requestDeliveryReceipt" BOOLEAN NOT NULL DEFAULT false;

-- Add categories
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "categories" JSONB NOT NULL DEFAULT '[]';

-- Add scheduled send tracking
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "scheduledNotificationSent" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "lastScheduleAttemptAt" TIMESTAMP;

ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "scheduleAttemptCount" INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- USER PREFERENCES - Add account preference
-- ============================================================================

-- Add last active account for multi-account users
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "lastActiveAccountId" TEXT;

-- ============================================================================
-- EMAIL RULES - Add execution tracking
-- ============================================================================

-- Add execution tracking fields
ALTER TABLE "email_rules"
ADD COLUMN IF NOT EXISTS "lastExecutedAt" TIMESTAMP;

ALTER TABLE "email_rules"
ADD COLUMN IF NOT EXISTS "lastExecutionStatus" TEXT;

ALTER TABLE "email_rules"
ADD COLUMN IF NOT EXISTS "lastExecutionError" TEXT;

ALTER TABLE "email_rules"
ADD COLUMN IF NOT EXISTS "failureCount" INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- NEW TABLES - Missing functionality
-- ============================================================================

-- Table: Email Attachments (track all attachments)
CREATE TABLE IF NOT EXISTS "email_attachments" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "graphMessageId" TEXT,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "contentHash" TEXT,
  "isInline" BOOLEAN NOT NULL DEFAULT false,
  "contentId" TEXT,
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "email_attachments_user_message_idx"
ON "email_attachments"("userId", "messageId");

CREATE INDEX IF NOT EXISTS "email_attachments_graph_message_idx"
ON "email_attachments"("graphMessageId");

-- Table: AI Generated Replies (persist AI content)
CREATE TABLE IF NOT EXISTS "ai_generated_replies" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "generatedBody" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS "ai_generated_replies_user_message_idx"
ON "ai_generated_replies"("userId", "messageId");

CREATE INDEX IF NOT EXISTS "ai_generated_replies_expires_idx"
ON "ai_generated_replies"("expiresAt");

-- Table: Search Cache (cache search results)
CREATE TABLE IF NOT EXISTS "cached_search_results" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "homeAccountId" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "results" JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE UNIQUE INDEX IF NOT EXISTS "cached_search_results_unique_idx"
ON "cached_search_results"("userId", "homeAccountId", "query");

CREATE INDEX IF NOT EXISTS "cached_search_results_expires_idx"
ON "cached_search_results"("expiresAt");

-- Table: Sync Status (track all sync operations)
CREATE TABLE IF NOT EXISTS "sync_status" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "homeAccountId" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "lastSyncedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "status" TEXT NOT NULL DEFAULT 'success',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "sync_status_unique_idx"
ON "sync_status"("userId", "homeAccountId", "resourceType");

CREATE INDEX IF NOT EXISTS "sync_status_last_synced_idx"
ON "sync_status"("lastSyncedAt");

-- Table: Notification Log (audit trail for notifications)
CREATE TABLE IF NOT EXISTS "notification_log" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "sentAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "status" TEXT NOT NULL,
  "errorMessage" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS "notification_log_user_type_idx"
ON "notification_log"("userId", "type");

CREATE INDEX IF NOT EXISTS "notification_log_sent_at_idx"
ON "notification_log"("sentAt");

-- Table: Migration Status (track one-time migrations)
CREATE TABLE IF NOT EXISTS "migration_status" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "migrationType" TEXT NOT NULL,
  "completedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "metadata" JSONB NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS "migration_status_unique_idx"
ON "migration_status"("userId", "migrationType");

-- ============================================================================
-- DATA MIGRATIONS - Fix existing data
-- ============================================================================

-- Migrate single email to emailAddresses array for existing contacts
UPDATE "cached_contacts"
SET "emailAddresses" = jsonb_build_array(
  jsonb_build_object('address', "emailAddress", 'name', "displayName")
)
WHERE "emailAddress" != ''
AND "emailAddresses"::text = '[]';

-- Migrate single phone to phones array for existing contacts
UPDATE "cached_contacts"
SET "phones" = jsonb_build_array(
  jsonb_build_object('type', 'mobile', 'value', "phone")
)
WHERE "phone" != ''
AND "phones"::text = '[]';

-- Split displayName into givenName/surname (best effort)
UPDATE "cached_contacts"
SET
  "givenName" = SPLIT_PART("displayName", ' ', 1),
  "surname" = CASE
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY("displayName", ' '), 1) > 1
    THEN SPLIT_PART("displayName", ' ', 2)
    ELSE ''
  END
WHERE "displayName" != ''
AND "givenName" = '';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count contacts with multiple emails
-- SELECT COUNT(*) FROM cached_contacts WHERE jsonb_array_length(emailAddresses) > 1;

-- Count contacts with multiple phones
-- SELECT COUNT(*) FROM cached_contacts WHERE jsonb_array_length(phones) > 1;

-- Count emails by importance
-- SELECT importance, COUNT(*) FROM cached_emails GROUP BY importance;

-- Count rules with failures
-- SELECT COUNT(*) FROM email_rules WHERE failureCount > 0;

-- Show sync status summary
-- SELECT resourceType, status, COUNT(*) FROM sync_status GROUP BY resourceType, status;

-- Show attachment statistics
-- SELECT contentType, COUNT(*), SUM(size) as total_bytes FROM email_attachments GROUP BY contentType;

-- ============================================================================
-- CLEANUP - Scheduled cleanup jobs (run via cron)
-- ============================================================================

-- Clean up expired AI replies (run daily)
-- DELETE FROM ai_generated_replies WHERE expiresAt < NOW();

-- Clean up expired search cache (run hourly)
-- DELETE FROM cached_search_results WHERE expiresAt < NOW();

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS (add after tables exist)
-- ============================================================================

-- Add foreign keys for new tables
DO $$
BEGIN
  -- email_attachments → users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_attachments_userId_fkey'
  ) THEN
    ALTER TABLE "email_attachments"
    ADD CONSTRAINT "email_attachments_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  -- ai_generated_replies → users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ai_generated_replies_userId_fkey'
  ) THEN
    ALTER TABLE "ai_generated_replies"
    ADD CONSTRAINT "ai_generated_replies_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  -- cached_search_results → users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cached_search_results_userId_fkey'
  ) THEN
    ALTER TABLE "cached_search_results"
    ADD CONSTRAINT "cached_search_results_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  -- sync_status → users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sync_status_userId_fkey'
  ) THEN
    ALTER TABLE "sync_status"
    ADD CONSTRAINT "sync_status_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  -- notification_log → users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notification_log_userId_fkey'
  ) THEN
    ALTER TABLE "notification_log"
    ADD CONSTRAINT "notification_log_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  -- migration_status → users
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'migration_status_userId_fkey'
  ) THEN
    ALTER TABLE "migration_status"
    ADD CONSTRAINT "migration_status_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- To verify migration success, run:
-- SELECT 'Migration complete' as status, NOW() as completed_at;
