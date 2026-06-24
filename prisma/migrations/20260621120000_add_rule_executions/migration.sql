-- Rule execution log for server-side rules idempotency. Idempotent SQL
-- (applied via /api/cron/migrate through the pooler).
CREATE TABLE IF NOT EXISTS "rule_executions" (
  "id"        TEXT NOT NULL,
  "ruleId"    TEXT NOT NULL,
  "emailId"   TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rule_executions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "rule_executions_ruleId_emailId_key" ON "rule_executions"("ruleId", "emailId");
CREATE INDEX IF NOT EXISTS "rule_executions_userId_createdAt_idx" ON "rule_executions"("userId", "createdAt");
