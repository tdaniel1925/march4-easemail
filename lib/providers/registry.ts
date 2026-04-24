/**
 * Provider registry — routes operations to the correct email provider
 * based on accountId prefix: "imap:xxx", "jmap:xxx", or plain Microsoft homeAccountId.
 */
import { prisma } from "@/lib/prisma";
import type { EmailProvider, ProviderType, UnifiedAccount } from "./types";
import { MicrosoftProvider } from "./microsoft";
import { ImapProvider } from "./imap";
import { JmapProvider } from "./jmap";

/** Detect provider type from accountId prefix */
export function detectProviderType(accountId: string): ProviderType {
  if (accountId.startsWith("imap:")) return "imap";
  if (accountId.startsWith("jmap:")) return "jmap";
  return "microsoft";
}

/** Get the provider implementation for a given accountId */
export function getProvider(accountId: string): EmailProvider {
  const type = detectProviderType(accountId);
  switch (type) {
    case "imap":
      return new ImapProvider();
    case "jmap":
      return new JmapProvider();
    case "microsoft":
      return new MicrosoftProvider();
  }
}

/**
 * Verify that the given accountId belongs to the user.
 * Checks all three account tables based on provider type.
 * Returns the unified account or null if not found.
 */
export async function verifyAccountOwnership(
  userId: string,
  accountId: string
): Promise<UnifiedAccount | null> {
  const type = detectProviderType(accountId);

  switch (type) {
    case "microsoft": {
      const account = await prisma.msConnectedAccount.findFirst({
        where: { userId, homeAccountId: accountId },
      });
      if (!account) return null;
      return {
        id: account.id,
        accountId: account.homeAccountId,
        email: account.msEmail,
        displayName: account.displayName,
        isDefault: account.isDefault,
        providerType: "microsoft",
      };
    }

    case "imap": {
      const account = await prisma.imapConnectedAccount.findFirst({
        where: { userId, accountId },
      });
      if (!account) return null;
      return {
        id: account.id,
        accountId: account.accountId,
        email: account.email,
        displayName: account.displayName,
        isDefault: account.isDefault,
        providerType: "imap",
      };
    }

    case "jmap": {
      const account = await prisma.jmapConnectedAccount.findFirst({
        where: { userId, accountId },
      });
      if (!account) return null;
      return {
        id: account.id,
        accountId: account.accountId,
        email: account.email,
        displayName: account.displayName,
        isDefault: account.isDefault,
        providerType: "jmap",
      };
    }
  }
}

/**
 * Get all connected accounts for a user, merged from all provider types.
 * Sorted with default account first.
 */
export async function getAllAccounts(
  userId: string
): Promise<UnifiedAccount[]> {
  const [msAccounts, imapAccounts, jmapAccounts] = await Promise.all([
    prisma.msConnectedAccount.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    }),
    prisma.imapConnectedAccount.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    }),
    prisma.jmapConnectedAccount.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    }),
  ]);

  const unified: UnifiedAccount[] = [
    ...msAccounts.map((a) => ({
      id: a.id,
      accountId: a.homeAccountId,
      email: a.msEmail,
      displayName: a.displayName,
      isDefault: a.isDefault,
      providerType: "microsoft" as const,
    })),
    ...imapAccounts.map((a) => ({
      id: a.id,
      accountId: a.accountId,
      email: a.email,
      displayName: a.displayName,
      isDefault: a.isDefault,
      providerType: "imap" as const,
    })),
    ...jmapAccounts.map((a) => ({
      id: a.id,
      accountId: a.accountId,
      email: a.email,
      displayName: a.displayName,
      isDefault: a.isDefault,
      providerType: "jmap" as const,
    })),
  ];

  // Sort: default accounts first, then by email
  unified.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.email.localeCompare(b.email);
  });

  return unified;
}
