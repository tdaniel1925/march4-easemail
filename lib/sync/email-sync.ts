import { graphFetch } from "@/lib/microsoft/graph";
import { prisma } from "@/lib/prisma";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const MAX_PAGES = 100;
const EMAIL_SELECT =
  "id,subject,bodyPreview,receivedDateTime,sentDateTime,isRead,hasAttachments,flag,from,toRecipients,categories,parentFolderId";

interface DeltaResponse {
  value: DeltaItem[];
  "@odata.nextLink"?: string;
  "@odata.deltaLink"?: string;
}

interface DeltaItem {
  id: string;
  subject?: string;
  bodyPreview?: string;
  receivedDateTime?: string;
  sentDateTime?: string;
  isRead?: boolean;
  hasAttachments?: boolean;
  flag?: { flagStatus?: string };
  from?: { emailAddress?: { name?: string; address?: string } };
  toRecipients?: { emailAddress?: { name?: string; address?: string } }[];
  categories?: string[];
  parentFolderId?: string;
  "@removed"?: { reason: string };
}

export async function syncEmails(
  userId: string,
  homeAccountId: string,
  folderId: string
): Promise<void> {
  const deltaRecord = await prisma.emailDeltaLink.findUnique({
    where: { userId_homeAccountId_folderId: { userId, homeAccountId, folderId } },
  });

  let initialPath: string;
  if (deltaRecord?.deltaToken && deltaRecord.deltaToken.startsWith("http")) {
    const fullUrl = deltaRecord.deltaToken;
    initialPath = fullUrl.startsWith(GRAPH_BASE)
      ? fullUrl.slice(GRAPH_BASE.length)
      : fullUrl;
  } else {
    initialPath =
      `/me/mailFolders/${folderId}/messages/delta` +
      `?$select=${EMAIL_SELECT}&$top=100`;
  }

  let path: string | null = initialPath;
  let lastDeltaLink: string | null = null;
  let pageCount = 0;

  while (path && pageCount < MAX_PAGES) {
    pageCount++;

    const res = await graphFetch(userId, homeAccountId, path);

    if (res.status === 410) {
      // Delta token expired — clear it. Next run does fresh full sync.
      await prisma.emailDeltaLink.deleteMany({
        where: { userId, homeAccountId, folderId },
      });
      return;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Email delta sync ${folderId} failed ${res.status}: ${err}`);
    }

    const data: DeltaResponse = await res.json();
    const items = data.value ?? [];

    const toDelete: string[] = [];
    const toUpsert: DeltaItem[] = [];

    for (const item of items) {
      if (item["@removed"]) {
        toDelete.push(item.id);
      } else {
        toUpsert.push(item);
      }
    }

    if (toDelete.length > 0) {
      await prisma.cachedEmail.deleteMany({
        where: { id: { in: toDelete }, userId },
      });
    }

    if (toUpsert.length > 0) {
      await Promise.all(
        toUpsert.map((m) => {
          const receivedDateTime = m.receivedDateTime
            ? new Date(m.receivedDateTime)
            : new Date();
          const toRecipients = JSON.parse(
            JSON.stringify(
              (m.toRecipients ?? []).map((r) => ({
                name: r.emailAddress?.name ?? "",
                address: r.emailAddress?.address ?? "",
              }))
            )
          );
          const categories = JSON.parse(JSON.stringify(m.categories ?? []));

          return prisma.cachedEmail.upsert({
            where: { id: m.id },
            update: {
              folderId: m.parentFolderId ?? folderId,
              subject: m.subject ?? "",
              bodyPreview: m.bodyPreview ?? "",
              fromName: m.from?.emailAddress?.name ?? "",
              fromAddress: m.from?.emailAddress?.address ?? "",
              toRecipients,
              receivedDateTime,
              sentDateTime: m.sentDateTime ? new Date(m.sentDateTime) : null,
              isRead: m.isRead ?? false,
              hasAttachments: m.hasAttachments ?? false,
              flagStatus: m.flag?.flagStatus ?? "notFlagged",
              categories,
              syncedAt: new Date(),
            },
            create: {
              id: m.id,
              userId,
              homeAccountId,
              folderId: m.parentFolderId ?? folderId,
              subject: m.subject ?? "",
              bodyPreview: m.bodyPreview ?? "",
              fromName: m.from?.emailAddress?.name ?? "",
              fromAddress: m.from?.emailAddress?.address ?? "",
              toRecipients,
              receivedDateTime,
              sentDateTime: m.sentDateTime ? new Date(m.sentDateTime) : null,
              isRead: m.isRead ?? false,
              hasAttachments: m.hasAttachments ?? false,
              flagStatus: m.flag?.flagStatus ?? "notFlagged",
              categories,
            },
          });
        })
      );
    }

    lastDeltaLink = data["@odata.deltaLink"] ?? null;
    if (lastDeltaLink) {
      path = null;
    } else {
      const next = data["@odata.nextLink"] ?? null;
      path = next
        ? next.startsWith(GRAPH_BASE)
          ? next.slice(GRAPH_BASE.length)
          : next
        : null;
    }
  }

  if (lastDeltaLink) {
    await prisma.emailDeltaLink.upsert({
      where: { userId_homeAccountId_folderId: { userId, homeAccountId, folderId } },
      update: { deltaToken: lastDeltaLink, updatedAt: new Date() },
      create: {
        userId,
        homeAccountId,
        folderId,
        deltaToken: lastDeltaLink,
        updatedAt: new Date(),
      },
    });
  }
}
