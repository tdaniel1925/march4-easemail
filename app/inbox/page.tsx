import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import InboxClient, { type EmailMessage } from "@/components/inbox/InboxClient";
import { StoreInitializer } from "@/components/StoreInitializer";
import { mapCachedEmail } from "@/lib/utils/email-helpers";

// ─── Graph API response shapes ───────────────────────────────────────────────

interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  body: { content: string; contentType: string };
}

interface GraphMessagesResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InboxPage() {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Load user + ALL connected accounts from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });

  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.msAccounts.find((a) => a.isDefault) ?? dbUser.msAccounts[0];
  if (!defaultAccount) redirect("/onboarding");

  // 3. Try DB cache first, fall back to Graph API
  let emails: EmailMessage[] = [];
  let initialNextLink: string | null = null;

  try {
    const inboxFolder = await prisma.cachedFolder.findFirst({
      where: {
        userId: user.id,
        homeAccountId: defaultAccount.homeAccountId,
        wellKnownName: "inbox",
      },
    });

    if (inboxFolder) {
      const cached = await prisma.cachedEmail.findMany({
        where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId, folderId: inboxFolder.id },
        orderBy: { receivedDateTime: "desc" },
        take: 50,
      });
      if (cached.length > 0) {
        emails = cached.map(mapCachedEmail) as EmailMessage[];
      }
    }

    // Fall back to Graph if cache is empty
    if (emails.length === 0) {
      const data = await graphGet<GraphMessagesResponse>(
        user.id,
        defaultAccount.homeAccountId,
        "/me/mailFolders/inbox/messages?$top=50&$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body&$orderby=receivedDateTime desc"
      );
      emails = data.value.map((m): EmailMessage => ({
        id: m.id,
        subject: m.subject ?? "(no subject)",
        bodyPreview: m.bodyPreview ?? "",
        receivedDateTime: m.receivedDateTime,
        isRead: m.isRead,
        hasAttachments: m.hasAttachments,
        flag: { flagStatus: m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged" },
        from: {
          name: m.from?.emailAddress?.name ?? "Unknown",
          address: m.from?.emailAddress?.address ?? "",
        },
        body: {
          content: m.body?.content ?? m.bodyPreview ?? "",
          contentType: (m.body?.contentType as "html" | "text") ?? "text",
        },
      }));
      initialNextLink = data["@odata.nextLink"] ?? null;
    }
  } catch (err) {
    console.error("Failed to fetch inbox:", err);
    // Show empty inbox rather than crash
  }

  const unreadCount = emails.filter((e) => !e.isRead).length;

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.msEmail}
      />
      <InboxClient initialEmails={emails} initialNextLink={initialNextLink} />
    </div>
  );
}
