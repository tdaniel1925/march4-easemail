import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { graphGet } from "@/lib/microsoft/graph";
import { detectProviderType, getProvider } from "@/lib/providers/registry";
import { getUnreadCount } from "@/lib/utils/get-unread-count";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import EmailReadClient from "@/components/inbox/EmailReadClient";
import type { GraphMessage } from "@/lib/types/graph";

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
  // Accept homeAccountId from searchParams to support multi-account + multi-provider
  const searchAccountId = typeof search.homeAccountId === "string" ? search.homeAccountId : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");

  // Use the account from searchParams if provided, otherwise default
  const accountId = searchAccountId ?? defaultAccount.homeAccountId;
  const providerType = detectProviderType(accountId);

  // Start unread count fetch early — don't wait for email
  const unreadCountPromise = getUnreadCount(user.id, accountId);

  // Build the email detail object used by EmailReadClient
  let email: {
    id: string;
    subject: string;
    bodyPreview: string;
    receivedDateTime: string;
    isRead: boolean;
    hasAttachments: boolean;
    flag: { flagStatus: string };
    from: { name: string; address: string };
    to: { name: string; address: string }[];
    cc: { name: string; address: string }[];
    body: { content: string; contentType: "html" | "text" };
    attachments: { id: string; name: string; size: number; contentType: string }[];
  } | null = null;

  try {
    if (providerType !== "microsoft") {
      // IMAP/JMAP: use provider abstraction
      const provider = getProvider(accountId);
      const msg = await provider.fetchMessage(user.id, accountId, id);
      email = {
        id: msg.id,
        subject: msg.subject || "(no subject)",
        bodyPreview: msg.bodyPreview ?? "",
        receivedDateTime: msg.receivedDateTime,
        isRead: msg.isRead,
        hasAttachments: msg.hasAttachments,
        flag: { flagStatus: msg.flagStatus },
        from: { name: msg.from.name, address: msg.from.address },
        to: msg.toRecipients.map((r) => ({ name: r.name, address: r.address })),
        cc: (msg.ccRecipients ?? []).map((r) => ({ name: r.name, address: r.address })),
        body: msg.bodyHtml
          ? { content: msg.bodyHtml, contentType: "html" as const }
          : { content: msg.bodyText ?? msg.bodyPreview ?? "", contentType: "text" as const },
        attachments: (msg.attachments ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          size: a.size,
          contentType: a.contentType,
        })),
      };
    } else {
      // Microsoft: use Graph API directly
      const message = await graphGet<GraphMessage>(
        user.id,
        accountId,
        `/me/messages/${encodeURIComponent(id)}?$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,toRecipients,ccRecipients,body&$expand=attachments($select=id,name,size,contentType)`
      );
      if (!message) redirect("/inbox");

      email = {
        id: message.id,
        subject: message.subject ?? "(no subject)",
        bodyPreview: message.bodyPreview ?? "",
        receivedDateTime: message.receivedDateTime,
        isRead: message.isRead,
        hasAttachments: message.hasAttachments,
        flag: { flagStatus: message.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged" },
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
    }
  } catch (err) {
    console.error("Failed to fetch message:", err);
    redirect(returnTo);
  }

  if (!email) redirect(returnTo);

  // Await the unread count we started earlier
  const inboxUnread = await unreadCountPromise;

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={inboxUnread} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.email}
      />
      <EmailReadClient email={email} homeAccountId={accountId} returnTo={returnTo} />
    </div>
  );
}
