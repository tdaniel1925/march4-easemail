import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import FolderClient from "@/components/folder/FolderClient";
import type { EmailMessage } from "@/lib/types/email";
import { mapCachedEmail } from "@/lib/utils/email-helpers";

interface GraphRecipient {
  emailAddress: { name: string; address: string };
}

interface GraphFolder {
  id: string;
  displayName: string;
}

interface GraphMessage {
  id: string; subject: string; bodyPreview: string;
  receivedDateTime: string;
  isRead: boolean; hasAttachments: boolean; flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  toRecipients?: GraphRecipient[];
  body: { content: string; contentType: string };
}

const SELECT = "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,toRecipients,body";

export default async function CustomFolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");
  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");

  let folderLabel = "Folder";
  let emails: EmailMessage[] = [];
  let initialNextLink: string | null = null;

  try {
    // Verify the folder belongs to this user's account before any data access
    const cachedFolder = await prisma.cachedFolder.findFirst({
      where: {
        id: folderId,
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
      },
    });

    if (cachedFolder) {
      folderLabel = cachedFolder.displayName;
      // folderId is validated — scoped to userId + homeAccountId above
      const cached = await prisma.cachedEmail.findMany({
        where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId, folderId: cachedFolder.id },
        orderBy: { receivedDateTime: "desc" },
        take: 50,
      });
      if (cached.length > 0) emails = cached.map(mapCachedEmail);
    }

    if (emails.length === 0) {
      // Only fall back to Graph if we have no cached data.
      // Use encodeURIComponent to safely embed folderId in the Graph URL path.
      const folderMeta = await graphGet<GraphFolder>(
        user.id, defaultAccount.homeAccountId,
        `/me/mailFolders/${encodeURIComponent(folderId)}?$select=id,displayName`
      );
      folderLabel = folderMeta.displayName;

      const data = await graphGet<{ value: GraphMessage[]; "@odata.nextLink"?: string }>(
        user.id, defaultAccount.homeAccountId,
        `/me/mailFolders/${encodeURIComponent(folderId)}/messages?$select=${SELECT}&$top=50&$orderby=receivedDateTime desc`
      );
      emails = data.value.map((m) => ({
        id: m.id, subject: m.subject ?? "(no subject)", bodyPreview: m.bodyPreview ?? "",
        receivedDateTime: m.receivedDateTime ?? "",
        isRead: m.isRead, hasAttachments: m.hasAttachments,
        flag: { flagStatus: m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged" as const },
        from: { name: m.from?.emailAddress?.name ?? "Unknown", address: m.from?.emailAddress?.address ?? "" },
        toRecipients: m.toRecipients?.map((r) => ({
          name: r.emailAddress?.name ?? "", address: r.emailAddress?.address ?? "",
        })),
        body: { content: m.body?.content ?? m.bodyPreview ?? "", contentType: (m.body?.contentType as "html" | "text") ?? "text" },
      }));
      initialNextLink = data["@odata.nextLink"] ?? null;
    }
  } catch (err) {
    console.error("Failed to fetch custom folder:", err);
  }

  return <FolderClient folder={folderId} folderLabel={folderLabel} initialEmails={emails} initialNextLink={initialNextLink} />;
}
