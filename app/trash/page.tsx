import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import FolderClient from "@/components/folder/FolderClient";
import { StoreInitializer } from "@/components/StoreInitializer";
import type { EmailMessage } from "@/lib/types/email";
import { mapCachedEmail } from "@/lib/utils/email-helpers";
import { getUnreadCount } from "@/lib/utils/get-unread-count";

interface GraphMessage {
  id: string; subject: string; bodyPreview: string; receivedDateTime: string;
  isRead: boolean; hasAttachments: boolean; flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  body: { content: string; contentType: string };
}

export default async function TrashPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");
  const dbDefault = dbUser.defaultAccount;
  if (!dbDefault) redirect("/onboarding");
  const { getActiveAccountId } = await import("@/lib/utils/get-active-account");
  const savedAccountId = await getActiveAccountId();
  const defaultAccount = (savedAccountId ? dbUser.allAccounts.find((a) => a.homeAccountId === savedAccountId) : null) ?? dbDefault;

  let emails: EmailMessage[] = [];
  let initialNextLink: string | null = null;
  const unreadCountPromise = getUnreadCount(user.id, defaultAccount.homeAccountId);

  try {
    const trashFolder = await prisma.cachedFolder.findFirst({
      where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId, wellKnownName: "deletedItems" },
    });

    if (trashFolder) {
      const cached = await prisma.cachedEmail.findMany({
        where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId, folderId: trashFolder.id },
        orderBy: { receivedDateTime: "desc" },
        take: 50,
      });
      if (cached.length > 0) emails = cached.map(mapCachedEmail);
    }

    if (emails.length === 0) {
      const SELECT = "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body";
      const data = await graphGet<{ value: GraphMessage[]; "@odata.nextLink"?: string }>(
        user.id, defaultAccount.homeAccountId,
        `/me/mailFolders/deletedItems/messages?$select=${SELECT}&$top=50&$orderby=receivedDateTime desc`
      );
      emails = data.value.map((m) => ({
        id: m.id, subject: m.subject ?? "(no subject)", bodyPreview: m.bodyPreview ?? "",
        receivedDateTime: m.receivedDateTime, isRead: m.isRead, hasAttachments: m.hasAttachments,
        flag: { flagStatus: m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged" as const },
        from: { name: m.from?.emailAddress?.name ?? "Unknown", address: m.from?.emailAddress?.address ?? "" },
        body: { content: m.body?.content ?? m.bodyPreview ?? "", contentType: (m.body?.contentType as "html" | "text") ?? "text" },
      }));
      initialNextLink = data["@odata.nextLink"] ?? null;
    }
  } catch (err) { console.error("Failed to fetch trash:", err); }

  const unreadCount = await unreadCountPromise;

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar userName={dbUser.name ?? user.email ?? "You"} userEmail={defaultAccount.email} />
      <FolderClient folder="trash" folderLabel="Trash" initialEmails={emails} initialNextLink={initialNextLink} />
    </div>
  );
}
