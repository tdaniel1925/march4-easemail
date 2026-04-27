-- CreateTable: SnoozedEmail
CREATE TABLE IF NOT EXISTS "snoozed_emails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "homeAccountId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "snoozeUntil" TIMESTAMP(3) NOT NULL,
    "subject" TEXT NOT NULL,
    "senderName" TEXT,
    "senderEmail" TEXT NOT NULL,
    "isReturned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snoozed_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ReadReceipt
CREATE TABLE IF NOT EXISTS "read_receipts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "read_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "snoozed_emails_userId_snoozeUntil_isReturned_idx" ON "snoozed_emails"("userId", "snoozeUntil", "isReturned");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "read_receipts_messageId_recipientEmail_key" ON "read_receipts"("messageId", "recipientEmail");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "read_receipts_userId_messageId_idx" ON "read_receipts"("userId", "messageId");

-- AddForeignKey
ALTER TABLE "snoozed_emails" ADD CONSTRAINT "snoozed_emails_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_receipts" ADD CONSTRAINT "read_receipts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
