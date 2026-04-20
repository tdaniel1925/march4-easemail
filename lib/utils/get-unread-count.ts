import { prisma } from "@/lib/prisma";

/**
 * Get unread email count for a specific user and account
 * @param userId - The user's ID from Supabase auth
 * @param homeAccountId - The MS account's homeAccountId
 * @returns Count of unread emails in inbox folder
 */
export async function getUnreadCount(
  userId: string,
  homeAccountId: string
): Promise<number> {
  try {
    // First, find the inbox folder for this account
    const inboxFolder = await prisma.cachedFolder.findFirst({
      where: {
        userId,
        homeAccountId,
        wellKnownName: "inbox",
      },
    });

    if (!inboxFolder) {
      return 0;
    }

    // Count unread emails in that inbox folder
    const count = await prisma.cachedEmail.count({
      where: {
        userId,
        homeAccountId,
        folderId: inboxFolder.id,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error("[getUnreadCount] Error:", error);
    return 0; // Fail gracefully
  }
}
