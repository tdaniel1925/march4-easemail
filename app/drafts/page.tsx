import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import FolderClient from "@/components/folder/FolderClient";
import { StoreInitializer } from "@/components/StoreInitializer";
import type { EmailMessage } from "@/lib/types/email";
import { mapCachedEmail } from "@/lib/utils/email-helpers";

interface GraphRecipient {
  emailAddress: { name: string; address: string };
}

interface GraphMessage {
  id: string; subject: string; bodyPreview: string;
  receivedDateTime: string; sentDateTime?: string; lastModifiedDateTime: string;
  isRead: boolean; hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  toRecipients?: GraphRecipient[];
  body: { content: string; contentType: string };
}

export default async function DraftsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });
  if (!dbUser) redirect("/onboarding");
  const defaultAccount = dbUser.msAccounts.find((a) => a.isDefault) ?? dbUser.msAccounts[0];
  if (!defaultAccount) redirect("/onboarding");

  let emails: EmailMessage[] = [];
  let initialNextLink: string | null = null;

  try {
    const draftsFolder = await prisma.cachedFolder.findFirst({
      where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId, wellKnownName: "drafts" },
    });

    if (draftsFolder) {
      const cached = await prisma.cachedEmail.findMany({
        where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId, folderId: draftsFolder.id },
        orderBy: { syncedAt: "desc" },
        take: 50,
      });
      if (cached.length > 0) emails = cached.map(mapCachedEmail);
    }

    if (emails.length === 0) {
      const SELECT = "id,subject,bodyPreview,receivedDateTime,sentDateTime,lastModifiedDateTime,isRead,hasAttachments,flag,from,toRecipients,body";
      const data = await graphGet<{ value: GraphMessage[]; "@odata.nextLink"?: string }>(
        user.id, defaultAccount.homeAccountId,
        `/me/mailFolders/drafts/messages?$select=${SELECT}&$top=50&$orderby=lastModifiedDateTime desc`
      );
      emails = data.value.map((m) => ({
        id: m.id, subject: m.subject ?? "(no subject)", bodyPreview: m.bodyPreview ?? "",
        receivedDateTime: m.lastModifiedDateTime ?? m.sentDateTime ?? m.receivedDateTime,
        sentDateTime: m.sentDateTime,
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
  } catch (err) { console.error("Failed to fetch drafts:", err); }

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar userName={dbUser.name ?? user.email ?? "You"} userEmail={defaultAccount.msEmail} />
      <FolderClient folder="drafts" folderLabel="Drafts" initialEmails={emails} initialNextLink={initialNextLink} />
    </div>
  );
}
