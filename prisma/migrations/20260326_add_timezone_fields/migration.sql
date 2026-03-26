-- AlterTable: Add preferredTimeZone to users
ALTER TABLE "users" ADD COLUMN "preferredTimeZone" TEXT NOT NULL DEFAULT 'America/Chicago';

-- Note: CachedCalendarEvent.timeZone already exists in schema
