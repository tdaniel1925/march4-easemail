-- Append-only audit log (compliance). Idempotent: safe to re-run via the
-- /api/cron/migrate endpoint (the project applies migrations through the pooler).
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT,
  "orgId"      TEXT,
  "actorEmail" TEXT,
  "action"     TEXT NOT NULL,
  "target"     TEXT,
  "metadata"   JSONB,
  "ip"         TEXT,
  "userAgent"  TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "audit_logs_orgId_createdAt_idx" ON "audit_logs"("orgId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt" DESC);
