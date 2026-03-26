-- =====================================================================
-- Complete Schema Verification and Fix for EaseMail Users Table
-- Run this in Supabase SQL Editor to ensure all columns exist
-- =====================================================================

-- First, let's check what columns currently exist
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;

-- Add all potentially missing columns with defaults
-- (These will skip if column already exists - safe to run multiple times)

-- Core fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL;

-- Notification preferences (all with defaults)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationNewEmail" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationDailyDigest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationAiReplies" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationCalendarReminders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "notificationWeeklyReport" BOOLEAN NOT NULL DEFAULT false;

-- Appearance preferences (all with defaults)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "appTheme" TEXT NOT NULL DEFAULT 'light';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "fontSize" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailDensity" TEXT NOT NULL DEFAULT 'comfortable';

-- Timezone preference
ALTER TABLE users ADD COLUMN IF NOT EXISTS "preferredTimeZone" TEXT NOT NULL DEFAULT 'America/Chicago';

-- Multi-account preference
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastActiveAccountId" TEXT;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
