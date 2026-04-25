import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import InboxClient, { type EmailMessage } from "@/components/inbox/InboxClient";
import { StoreInitializer } from "@/components/StoreInitializer";
import { mapCachedEmail, mapGraphMessage, mapNormalizedEmail } from "@/lib/utils/email-helpers";
import { detectProviderType, getProvider } from "@/lib/providers/registry";
import type { GraphMessagesResponse } from "@/lib/types/graph";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InboxPage() {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Load user + inbox data in parallel
  const [dbUser, inboxFolder] = await Promise.all([
    getUserWithAccounts(user.id),
    prisma.cachedFolder.findFirst({
      where: { userId: user.id, wellKnownName: "inbox" },
    }),
  ]);
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");

  const providerType = detectProviderType(defaultAccount.homeAccountId);

  // 3. Fetch emails — cache first, provider fallback
  let emails: EmailMessage[] = [];
  let initialNextLink: string | null = null;

  try {
    if (inboxFolder && inboxFolder.homeAccountId === defaultAccount.homeAccountId) {
      const cached = await prisma.cachedEmail.findMany({
        where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId, folderId: inboxFolder.id },
        orderBy: { receivedDateTime: "desc" },
        take: 50,
      });
      if (cached.length > 0) {
        emails = cached.map(mapCachedEmail) as EmailMessage[];
        // Enable infinite scroll for cached results (C4 fix)
        if (cached.length === 50) {
          initialNextLink = cached[cached.length - 1].id;
        }
      }
    }

    // Fall back to provider if cache is empty
    if (emails.length === 0) {
      if (providerType !== "microsoft") {
        // IMAP/JMAP: use provider abstraction (H4 fix)
        const provider = getProvider(defaultAccount.homeAccountId);
        const result = await provider.fetchEmails(
          user.id,
          defaultAccount.homeAccountId,
          "inbox",
          { top: 50 }
        );
        emails = result.emails.map(mapNormalizedEmail);
        initialNextLink = result.nextCursor ?? null;
      } else {
        // Microsoft: use Graph API directly
        const data = await graphGet<GraphMessagesResponse>(
          user.id,
          defaultAccount.homeAccountId,
          "/me/mailFolders/inbox/messages?$top=50&$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body,conversationId&$orderby=receivedDateTime desc"
        );
        emails = data.value.map(mapGraphMessage);
        initialNextLink = data["@odata.nextLink"] ?? null;
      }
    }
  } catch (err) {
    console.error("Failed to fetch inbox:", err);
  }

  // Use folder's unread count (from sync) or count from loaded emails
  const unreadCount = inboxFolder?.unreadCount || emails.filter((e) => !e.isRead).length;

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.email}
      />
      <InboxClient initialEmails={emails} initialNextLink={initialNextLink} totalUnread={unreadCount} />
    </div>
  );
}
