import { prisma } from "@/lib/prisma";
import { detectProviderType } from "@/lib/providers/registry";

/**
 * Get unread email count for a specific user and account.
 * Uses the cached folder's unreadCount (set by Graph/sync) as the primary
 * source since it's always accurate. Falls back to counting cached emails
 * if the folder record doesn't have a count, and to Graph API as last resort.
 */
export async function getUnreadCount(
  userId: string,
  homeAccountId: string
): Promise<number> {
  try {
    // Find the inbox folder for this account
    const inboxFolder = await prisma.cachedFolder.findFirst({
      where: {
        userId,
        homeAccountId,
        wellKnownName: "inbox",
      },
    });

    // Use the folder's unreadCount if available (set by folder sync from Graph)
    if (inboxFolder && inboxFolder.unreadCount > 0) {
      return inboxFolder.unreadCount;
    }

    // Fall back to counting cached unread emails
    if (inboxFolder) {
      const count = await prisma.cachedEmail.count({
        where: {
          userId,
          homeAccountId,
          folderId: inboxFolder.id,
          isRead: false,
        },
      });
      if (count > 0) return count;
    }

    // Last resort for MS accounts: fetch directly from Graph API
    const providerType = detectProviderType(homeAccountId);
    if (providerType === "microsoft") {
      try {
        const { graphGet } = await import("@/lib/microsoft/graph");
        const folder = await graphGet<{ unreadItemCount: number }>(
          userId,
          homeAccountId,
          "/me/mailFolders/inbox?$select=unreadItemCount"
        );
        return folder.unreadItemCount ?? 0;
      } catch {
        // Graph call failed — return 0
      }
    }

    return 0;
  } catch (error) {
    console.error("[getUnreadCount] Error:", error);
    return 0;
  }
}
