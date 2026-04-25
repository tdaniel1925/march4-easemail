import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import AttachmentsClient from "@/components/attachments/AttachmentsClient";
import { getUnreadCount } from "@/lib/utils/get-unread-count";

interface GraphMessage {
  id: string;
  subject: string;
  receivedDateTime?: string;
  sentDateTime?: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients?: { emailAddress: { name: string; address: string } }[];
  attachments?: {
    id: string;
    name: string;
    size: number;
    contentType: string;
    isInline?: boolean;
  }[];
}

// Filter out inline/signature attachments (logos, tracking pixels, signature images)
const SIGNATURE_PATTERNS = /^(image\d+|logo|signature|banner|spacer|pixel|icon|footer|header|cid)/i;
const MIN_ATTACHMENT_SIZE = 5 * 1024; // 5KB — smaller files are usually inline images/tracking pixels

function isRealAttachment(att: { name: string; size: number; contentType: string; isInline?: boolean }): boolean {
  // Skip inline attachments (embedded in email body)
  if (att.isInline) return false;
  // Skip very small images (tracking pixels, spacer gifs, signature logos)
  if (att.contentType.startsWith("image/") && att.size < MIN_ATTACHMENT_SIZE) return false;
  // Skip files matching common signature image patterns
  const baseName = att.name.replace(/\.[^.]+$/, "");
  if (SIGNATURE_PATTERNS.test(baseName)) return false;
  return true;
}

interface GraphMessagesResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
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
  homeAccountId: string;
  direction: "received" | "sent";
}

export default async function AttachmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");

  let attachments: AttachmentItem[] = [];
  let receivedNextLink: string | null = null;
  let sentNextLink: string | null = null;

  try {
    // Fetch received attachments — newest first, including isInline for filtering
    const receivedData = await graphGet<GraphMessagesResponse>(
      user.id,
      defaultAccount.homeAccountId,
      `/me/messages?$filter=hasAttachments eq true&$top=50&$select=id,subject,from,receivedDateTime,hasAttachments&$expand=attachments`
    );

    for (const message of receivedData.value ?? []) {
      for (const att of message.attachments ?? []) {
        if (!isRealAttachment(att)) continue; // Skip inline/signature attachments
        attachments.push({
          id: att.id,
          name: att.name,
          size: att.size,
          contentType: att.contentType,
          messageId: message.id,
          messageSubject: message.subject ?? "(no subject)",
          senderName: message.from?.emailAddress?.name ?? "Unknown",
          senderAddress: message.from?.emailAddress?.address ?? "",
          receivedDateTime: message.receivedDateTime ?? new Date().toISOString(),
          homeAccountId: defaultAccount.homeAccountId,
          direction: "received",
        });
      }
    }
    receivedNextLink = receivedData["@odata.nextLink"] || null;

    // Fetch sent attachments — newest first
    const sentData = await graphGet<GraphMessagesResponse>(
      user.id,
      defaultAccount.homeAccountId,
      `/me/mailFolders/sentitems/messages?$filter=hasAttachments eq true&$top=50&$select=id,subject,toRecipients,sentDateTime,hasAttachments&$expand=attachments`
    );

    for (const message of sentData.value ?? []) {
      const firstRecipient = message.toRecipients?.[0];
      for (const att of message.attachments ?? []) {
        if (!isRealAttachment(att)) continue; // Skip inline/signature attachments
        attachments.push({
          id: att.id,
          name: att.name,
          size: att.size,
          contentType: att.contentType,
          messageId: message.id,
          messageSubject: message.subject ?? "(no subject)",
          senderName: firstRecipient?.emailAddress?.name ?? "Unknown",
          senderAddress: firstRecipient?.emailAddress?.address ?? "",
          receivedDateTime: message.sentDateTime ?? new Date().toISOString(),
          homeAccountId: defaultAccount.homeAccountId,
          direction: "sent",
        });
      }
    }
    sentNextLink = sentData["@odata.nextLink"] || null;

    attachments.sort((a, b) => b.receivedDateTime.localeCompare(a.receivedDateTime));
  } catch (err) {
    console.error("Failed to fetch attachments:", err);
  }

  const unreadCount = await getUnreadCount(user.id, defaultAccount.homeAccountId);

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.email}
      />
      <AttachmentsClient
        attachments={attachments}
        receivedNextLink={receivedNextLink}
        sentNextLink={sentNextLink}
        homeAccountId={defaultAccount.homeAccountId}
      />
    </div>
  );
}
