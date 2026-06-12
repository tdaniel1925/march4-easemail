-- Data retention policies + legal holds. Idempotent (applied via /api/cron/migrate).

CREATE TABLE IF NOT EXISTS "retention_policies" (
  "id"                 TEXT NOT NULL,
  "orgId"              TEXT NOT NULL,
  "cachedEmailDays"    INTEGER NOT NULL DEFAULT 0,
  "cachedCalendarDays" INTEGER NOT NULL DEFAULT 0,
  "cachedContactDays"  INTEGER NOT NULL DEFAULT 0,
  "auditLogDays"       INTEGER NOT NULL DEFAULT 0,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "retention_policies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "retention_policies_orgId_key" ON "retention_policies"("orgId");

CREATE TABLE IF NOT EXISTS "legal_holds" (
  "id"              TEXT NOT NULL,
  "orgId"           TEXT NOT NULL,
  "userId"          TEXT,
  "reason"          TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt"      TIMESTAMP(3),
  CONSTRAINT "legal_holds_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "legal_holds_orgId_releasedAt_idx" ON "legal_holds"("orgId", "releasedAt");
CREATE INDEX IF NOT EXISTS "legal_holds_userId_releasedAt_idx" ON "legal_holds"("userId", "releasedAt");

-- FKs (added only if the constraint doesn't already exist).
DO $$ BEGIN
  ALTER TABLE "retention_policies"
    ADD CONSTRAINT "retention_policies_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "legal_holds"
    ADD CONSTRAINT "legal_holds_orgId_fkey"
    FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
