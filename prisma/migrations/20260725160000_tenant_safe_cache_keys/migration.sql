-- Provider IDs are only guaranteed within a mailbox/account. Scope every cache
-- primary key by tenant user and connected account to prevent collisions.
ALTER TABLE "cached_folders" DROP CONSTRAINT "cached_folders_pkey";
ALTER TABLE "cached_folders"
  ADD CONSTRAINT "cached_folders_pkey"
  PRIMARY KEY ("userId", "homeAccountId", "id");

ALTER TABLE "cached_emails" DROP CONSTRAINT "cached_emails_pkey";
ALTER TABLE "cached_emails"
  ADD CONSTRAINT "cached_emails_pkey"
  PRIMARY KEY ("userId", "homeAccountId", "id");

ALTER TABLE "cached_calendar_events" DROP CONSTRAINT "cached_calendar_events_pkey";
ALTER TABLE "cached_calendar_events"
  ADD CONSTRAINT "cached_calendar_events_pkey"
  PRIMARY KEY ("userId", "homeAccountId", "id");

ALTER TABLE "cached_contacts" DROP CONSTRAINT "cached_contacts_pkey";
ALTER TABLE "cached_contacts"
  ADD CONSTRAINT "cached_contacts_pkey"
  PRIMARY KEY ("userId", "homeAccountId", "id");
