import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import FolderClient from "@/components/folder/FolderClient";
import { StoreInitializer } from "@/components/StoreInitializer";
import type { EmailMessage } from "@/lib/types/email";
import { mapCachedEmail } from "@/lib/utils/email-helpers";

interface GraphMessage {
  id: string; subject: string; bodyPreview: string; receivedDateTime: string;
  isRead: boolean; hasAttachments: boolean; flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  body: { content: string; contentType: string };
}

export default async function StarredPage() {
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
    // Starred emails can be in any folder — query by flagStatus across all folders
    const cached = await prisma.cachedEmail.findMany({
      where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId, flagStatus: "flagged" },
      orderBy: { receivedDateTime: "desc" },
      take: 50,
    });

    if (cached.length > 0) {
      emails = cached.map(mapCachedEmail);
    } else {
      const SELECT = "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body";
      const data = await graphGet<{ value: GraphMessage[]; "@odata.nextLink"?: string }>(
        user.id, defaultAccount.homeAccountId,
        `/me/messages?$filter=flag/flagStatus eq 'flagged'&$select=${SELECT}&$top=50`
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
  } catch (err) { console.error("Failed to fetch starred:", err); }

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar userName={dbUser.name ?? user.email ?? "You"} userEmail={defaultAccount.msEmail} />
      <FolderClient folder="starred" folderLabel="Starred" initialEmails={emails} initialNextLink={initialNextLink} />
    </div>
  );
}
