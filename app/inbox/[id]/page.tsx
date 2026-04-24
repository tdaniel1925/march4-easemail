import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import EmailReadClient from "@/components/inbox/EmailReadClient";

// ─── Graph shapes ─────────────────────────────────────────────────────────────

interface GraphAttachment {
  id: string;
  name: string;
  size: number;
  contentType: string;
}

interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  toRecipients: { emailAddress: { name: string; address: string } }[];
  ccRecipients: { emailAddress: { name: string; address: string } }[];
  body: { content: string; contentType: string };
  attachments?: GraphAttachment[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EmailReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const returnTo = typeof search.returnTo === "string" ? search.returnTo : "/inbox";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");

  let message: GraphMessage | null = null;
  try {
    // Use encodeURIComponent to safely embed the message ID in the Graph URL path
    message = await graphGet<GraphMessage>(
      user.id,
      defaultAccount.homeAccountId,
      `/me/messages/${encodeURIComponent(id)}?$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,toRecipients,ccRecipients,body&$expand=attachments($select=id,name,size,contentType)`
    );
  } catch (err) {
    console.error("Failed to fetch message:", err);
    redirect("/inbox");
  }

  if (!message) redirect("/inbox");

  const email = {
    id: message.id,
    subject: message.subject ?? "(no subject)",
    bodyPreview: message.bodyPreview ?? "",
    receivedDateTime: message.receivedDateTime,
    isRead: message.isRead,
    hasAttachments: message.hasAttachments,
    flag: { flagStatus: message.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged" as const },
    from: {
      name: message.from?.emailAddress?.name ?? "Unknown",
      address: message.from?.emailAddress?.address ?? "",
    },
    to: (message.toRecipients ?? []).map((r) => ({
      name: r.emailAddress.name,
      address: r.emailAddress.address,
    })),
    cc: (message.ccRecipients ?? []).map((r) => ({
      name: r.emailAddress.name,
      address: r.emailAddress.address,
    })),
    body: {
      content: message.body?.content ?? message.bodyPreview ?? "",
      contentType: (message.body?.contentType as "html" | "text") ?? "text",
    },
    attachments: (message.attachments ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      contentType: a.contentType,
    })),
  };

  const inboxUnread = 0; // sidebar badge — not critical here

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={inboxUnread} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.email}
      />
      <EmailReadClient email={email} homeAccountId={defaultAccount.homeAccountId} returnTo={returnTo} />
    </div>
  );
}
