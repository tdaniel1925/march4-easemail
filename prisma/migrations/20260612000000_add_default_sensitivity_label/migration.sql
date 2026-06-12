-- Add nullable default sensitivity label preference to users
ALTER TABLE "users" ADD COLUMN "defaultSensitivityLabel" TEXT;
