-- =====================================================================
-- Diagnose Table Structure Issue
-- Run this in Supabase SQL Editor
-- =====================================================================

-- Check which schema the 'users' table is in
SELECT
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'users'
ORDER BY table_schema;

-- Check if there are multiple 'users' tables in different schemas
-- Expected:
--   - auth.users (Supabase auth table - DO NOT TOUCH)
--   - public.users (Your application table - THIS is what Prisma uses)

-- Now let's see the structure of public.users specifically
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- If public.users doesn't exist, we need to create it
-- If public.users has duplicate columns, we need to fix it
