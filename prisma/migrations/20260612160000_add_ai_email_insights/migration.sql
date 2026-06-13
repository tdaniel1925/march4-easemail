-- Per-email AI insight cache. Idempotent (applied via /api/cron/migrate).
CREATE TABLE IF NOT EXISTS "ai_email_insights" (
  "id"               TEXT NOT NULL,
  "userId"           TEXT NOT NULL,
  "messageId"        TEXT NOT NULL,
  "homeAccountId"    TEXT,
  "latestReceivedAt" TIMESTAMP(3) NOT NULL,
  "tldr"             TEXT NOT NULL,
  "bullets"          JSONB NOT NULL DEFAULT '[]',
  "actionItems"      JSONB NOT NULL DEFAULT '[]',
  "suggestedAction"  TEXT,
  "model"            TEXT NOT NULL,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_email_insights_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_email_insights_userId_messageId_key" ON "ai_email_insights"("userId", "messageId");
CREATE INDEX IF NOT EXISTS "ai_email_insights_userId_createdAt_idx" ON "ai_email_insights"("userId", "createdAt" DESC);

DO $$ BEGIN
  ALTER TABLE "ai_email_insights"
    ADD CONSTRAINT "ai_email_insights_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
