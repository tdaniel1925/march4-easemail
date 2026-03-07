-- Migration: Add Missing Schema Fields
-- Date: 2026-03-07
-- Description: Adds 14 missing fields across Draft, Signature, and CachedCalendarEvent models

-- ============================================================================
-- DRAFT MODEL - Add 5 fields
-- ============================================================================

-- Add importance field (normal | high)
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "importance" TEXT NOT NULL DEFAULT 'normal';

-- Add read receipt request flag
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "requestReadReceipt" BOOLEAN NOT NULL DEFAULT false;

-- Add draft type field (new | reply | forward)
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "draftType" TEXT NOT NULL DEFAULT 'new';

-- Add reply context field
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "inReplyToMessageId" TEXT;

-- Add forward context field
ALTER TABLE "drafts"
ADD COLUMN IF NOT EXISTS "forwardedMessageId" TEXT;

-- ============================================================================
-- SIGNATURE MODEL - Add 4 fields
-- ============================================================================

-- Add HTML signature body
ALTER TABLE "signatures"
ADD COLUMN IF NOT EXISTS "html" TEXT NOT NULL DEFAULT '';

-- Add default for new emails flag
ALTER TABLE "signatures"
ADD COLUMN IF NOT EXISTS "defaultNew" BOOLEAN NOT NULL DEFAULT false;

-- Add default for replies flag
ALTER TABLE "signatures"
ADD COLUMN IF NOT EXISTS "defaultReplies" BOOLEAN NOT NULL DEFAULT false;

-- Add account scope field
ALTER TABLE "signatures"
ADD COLUMN IF NOT EXISTS "account" TEXT NOT NULL DEFAULT 'all';

-- ============================================================================
-- CACHED_CALENDAR_EVENTS MODEL - Add 3 fields
-- ============================================================================

-- Add reminder in minutes field
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "reminderMinutes" INTEGER;

-- Add availability status field (busy | free | tentative)
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "showAs" TEXT NOT NULL DEFAULT 'busy';

-- Add recurrence pattern field (daily | weekly | monthly | null)
ALTER TABLE "cached_calendar_events"
ADD COLUMN IF NOT EXISTS "recurrence" TEXT;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify migration)
-- ============================================================================

-- Verify drafts columns
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'drafts'
-- AND column_name IN ('importance', 'requestReadReceipt', 'draftType', 'inReplyToMessageId', 'forwardedMessageId');

-- Verify signatures columns
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'signatures'
-- AND column_name IN ('html', 'defaultNew', 'defaultReplies', 'account');

-- Verify calendar events columns
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'cached_calendar_events'
-- AND column_name IN ('reminderMinutes', 'showAs', 'recurrence');
