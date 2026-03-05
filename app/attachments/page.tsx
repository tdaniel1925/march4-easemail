import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import AttachmentsClient from "@/components/attachments/AttachmentsClient";

interface GraphMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
  from: { emailAddress: { name: string; address: string } };
  attachments?: {
    id: string;
    name: string;
    size: number;
    contentType: string;
  }[];
}

interface GraphMessagesResponse {
  value: GraphMessage[];
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  contentType: string;
  messageId: string;
  messageSubject: string;
  senderName: string;
  senderAddress: string;
  receivedDateTime: string;
}

export default async function AttachmentsPage() {
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

  let attachments: AttachmentItem[] = [];

  try {
    const data = await graphGet<GraphMessagesResponse>(
      user.id,
      defaultAccount.homeAccountId,
      "/me/messages?$filter=hasAttachments eq true&$top=25&$select=id,subject,from,receivedDateTime,hasAttachments&$expand=attachments($select=id,name,size,contentType)"
    );

    for (const message of data.value ?? []) {
      for (const att of message.attachments ?? []) {
        attachments.push({
          id: att.id,
          name: att.name,
          size: att.size,
          contentType: att.contentType,
          messageId: message.id,
          messageSubject: message.subject ?? "(no subject)",
          senderName: message.from?.emailAddress?.name ?? "Unknown",
          senderAddress: message.from?.emailAddress?.address ?? "",
          receivedDateTime: message.receivedDateTime,
        });
      }
    }
    attachments.sort((a, b) => b.receivedDateTime.localeCompare(a.receivedDateTime));
  } catch (err) {
    console.error("Failed to fetch attachments:", err);
  }

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.msEmail}
      />
      <AttachmentsClient attachments={attachments} />
    </div>
  );
}
