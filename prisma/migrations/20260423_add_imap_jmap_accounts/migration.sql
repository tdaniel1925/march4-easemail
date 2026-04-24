-- CreateTable
CREATE TABLE "imap_connected_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imapHost" TEXT NOT NULL,
    "imapPort" INTEGER NOT NULL DEFAULT 993,
    "imapSecurity" TEXT NOT NULL DEFAULT 'tls',
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpSecurity" TEXT NOT NULL DEFAULT 'starttls',
    "encryptedPassword" TEXT NOT NULL,
    "encryptionIv" TEXT NOT NULL,
    "encryptionTag" TEXT NOT NULL,
    "uidValidity" JSONB NOT NULL DEFAULT '{}',
    "highestModSeq" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "imap_connected_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jmap_connected_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionUrl" TEXT NOT NULL,
    "jmapAccountId" TEXT NOT NULL,
    "encryptedToken" TEXT NOT NULL,
    "encryptionIv" TEXT NOT NULL,
    "encryptionTag" TEXT NOT NULL,
    "emailState" TEXT,
    "mailboxState" TEXT,

    CONSTRAINT "jmap_connected_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "imap_connected_accounts_userId_accountId_key" ON "imap_connected_accounts"("userId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "imap_connected_accounts_userId_email_key" ON "imap_connected_accounts"("userId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "jmap_connected_accounts_userId_accountId_key" ON "jmap_connected_accounts"("userId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "jmap_connected_accounts_userId_email_key" ON "jmap_connected_accounts"("userId", "email");

-- AddForeignKey
ALTER TABLE "imap_connected_accounts" ADD CONSTRAINT "imap_connected_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jmap_connected_accounts" ADD CONSTRAINT "jmap_connected_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
