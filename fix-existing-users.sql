-- =====================================================================
-- Fix Existing User Records
-- Some users may have been created before new columns were added
-- This updates them with proper default values
-- =====================================================================

-- First, check if there are any users with NULL in required fields
SELECT
    id,
    email,
    "updatedAt" IS NULL as missing_updated_at,
    "preferredTimeZone" IS NULL as missing_timezone,
    "notificationNewEmail" IS NULL as missing_notif_email,
    "appTheme" IS NULL as missing_theme
FROM public.users
WHERE "updatedAt" IS NULL
   OR "preferredTimeZone" IS NULL
   OR "notificationNewEmail" IS NULL
   OR "appTheme" IS NULL;

-- Fix any users with missing updatedAt
UPDATE public.users
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE "updatedAt" IS NULL;

-- Fix any users with missing preferredTimeZone
UPDATE public.users
SET "preferredTimeZone" = 'America/Chicago'
WHERE "preferredTimeZone" IS NULL;

-- Fix any users with missing notification preferences
UPDATE public.users
SET
    "notificationNewEmail" = COALESCE("notificationNewEmail", true),
    "notificationDailyDigest" = COALESCE("notificationDailyDigest", false),
    "notificationAiReplies" = COALESCE("notificationAiReplies", true),
    "notificationCalendarReminders" = COALESCE("notificationCalendarReminders", true),
    "notificationWeeklyReport" = COALESCE("notificationWeeklyReport", false)
WHERE "notificationNewEmail" IS NULL
   OR "notificationDailyDigest" IS NULL
   OR "notificationAiReplies" IS NULL
   OR "notificationCalendarReminders" IS NULL
   OR "notificationWeeklyReport" IS NULL;

-- Fix any users with missing appearance preferences
UPDATE public.users
SET
    "appTheme" = COALESCE("appTheme", 'light'),
    "fontSize" = COALESCE("fontSize", 'default'),
    "emailDensity" = COALESCE("emailDensity", 'comfortable')
WHERE "appTheme" IS NULL
   OR "fontSize" IS NULL
   OR "emailDensity" IS NULL;

-- Verify all users are now valid
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN "updatedAt" IS NULL THEN 1 END) as missing_updated_at,
    COUNT(CASE WHEN "preferredTimeZone" IS NULL THEN 1 END) as missing_timezone,
    COUNT(CASE WHEN "notificationNewEmail" IS NULL THEN 1 END) as missing_notif,
    COUNT(CASE WHEN "appTheme" IS NULL THEN 1 END) as missing_theme
FROM public.users;

-- Should show all zeros in the missing columns
