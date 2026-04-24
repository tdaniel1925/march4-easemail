/**
 * Shared helper for server pages to fetch the authenticated user with all
 * connected accounts (Microsoft, IMAP, JMAP) merged into a unified format.
 * Eliminates duplication across 22+ page.tsx files.
 */
import { prisma } from "@/lib/prisma";
import type { ProviderType } from "@/lib/providers/types";

export interface PageAccount {
  id: string;
  homeAccountId: string;
  msEmail: string; // backward compat — same as email
  email: string;
  displayName: string | null;
  isDefault: boolean;
  providerType: ProviderType;
}

export interface UserWithAccounts {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  orgId: string;
  /** All accounts merged from MS + IMAP + JMAP, default first */
  allAccounts: PageAccount[];
  /** The default or first account across all providers */
  defaultAccount: PageAccount | null;
  /** Raw MS accounts for backward compat with pages that need them */
  msAccounts: Array<{
    id: string;
    homeAccountId: string;
    msEmail: string;
    displayName: string | null;
    isDefault: boolean;
    tenantId: string | null;
    connectedAt: Date;
    updatedAt: Date;
  }>;
  /** Raw IMAP accounts */
  imapAccounts: Array<{
    id: string;
    accountId: string;
    email: string;
    displayName: string | null;
    isDefault: boolean;
    connectedAt: Date;
  }>;
  /** Raw JMAP accounts */
  jmapAccounts: Array<{
    id: string;
    accountId: string;
    email: string;
    displayName: string | null;
    isDefault: boolean;
    connectedAt: Date;
  }>;
  // Pass-through fields from User model
  notificationNewEmail: boolean;
  notificationDailyDigest: boolean;
  notificationAiReplies: boolean;
  notificationCalendarReminders: boolean;
  notificationWeeklyReport: boolean;
  appTheme: string;
  fontSize: string;
  emailDensity: string;
  preferredTimeZone: string;
  lastActiveAccountId: string | null;
}

/**
 * Fetch user + all connected accounts. Returns null if user not found.
 */
export async function getUserWithAccounts(
  userId: string
): Promise<UserWithAccounts | null> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      msAccounts: { orderBy: { isDefault: "desc" } },
      imapAccounts: { orderBy: { isDefault: "desc" } },
      jmapAccounts: { orderBy: { isDefault: "desc" } },
    },
  });

  if (!dbUser) return null;

  const allAccounts: PageAccount[] = [
    ...dbUser.msAccounts.map((a) => ({
      id: a.id,
      homeAccountId: a.homeAccountId,
      msEmail: a.msEmail,
      email: a.msEmail,
      displayName: a.displayName,
      isDefault: a.isDefault,
      providerType: "microsoft" as const,
    })),
    ...dbUser.imapAccounts.map((a) => ({
      id: a.id,
      homeAccountId: a.accountId,
      msEmail: a.email,
      email: a.email,
      displayName: a.displayName,
      isDefault: a.isDefault,
      providerType: "imap" as const,
    })),
    ...dbUser.jmapAccounts.map((a) => ({
      id: a.id,
      homeAccountId: a.accountId,
      msEmail: a.email,
      email: a.email,
      displayName: a.displayName,
      isDefault: a.isDefault,
      providerType: "jmap" as const,
    })),
  ];

  const defaultAccount =
    allAccounts.find((a) => a.isDefault) ?? allAccounts[0] ?? null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    orgId: dbUser.orgId,
    allAccounts,
    defaultAccount,
    msAccounts: dbUser.msAccounts,
    imapAccounts: dbUser.imapAccounts,
    jmapAccounts: dbUser.jmapAccounts,
    notificationNewEmail: dbUser.notificationNewEmail,
    notificationDailyDigest: dbUser.notificationDailyDigest,
    notificationAiReplies: dbUser.notificationAiReplies,
    notificationCalendarReminders: dbUser.notificationCalendarReminders,
    notificationWeeklyReport: dbUser.notificationWeeklyReport,
    appTheme: dbUser.appTheme,
    fontSize: dbUser.fontSize,
    emailDensity: dbUser.emailDensity,
    preferredTimeZone: dbUser.preferredTimeZone,
    lastActiveAccountId: dbUser.lastActiveAccountId,
  };
}
