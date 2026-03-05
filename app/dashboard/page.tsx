import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import DashboardClient from "@/components/dashboard/DashboardClient";
import type { EmailMessage } from "@/lib/types/email";

// ─── Graph shapes ─────────────────────────────────────────────────────────────

interface GraphEventList {
  value: {
    id: string;
    subject: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: { displayName: string };
    attendees?: { emailAddress: { name: string } }[];
  }[];
}

interface GraphMessageList {
  value: {
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
  }[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
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

  // Fetch today's calendar events
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  let events: GraphEventList["value"] = [];
  try {
    const eventsData = await graphGet<GraphEventList>(
      user.id,
      defaultAccount.homeAccountId,
      `/me/calendarView?startDateTime=${encodeURIComponent(startOfDay)}&endDateTime=${encodeURIComponent(endOfDay)}&$top=3&$select=id,subject,start,end,location,attendees&$orderby=start/dateTime`
    );
    events = eventsData.value ?? [];
  } catch {
    // Calendar may not be consented — not fatal
  }

  // Fetch top 3 unread emails
  let recentUnread: EmailMessage[] = [];
  try {
    const msgData = await graphGet<GraphMessageList>(
      user.id,
      defaultAccount.homeAccountId,
      `/me/messages?$filter=isRead eq false&$top=3&$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,toRecipients,ccRecipients&$orderby=receivedDateTime desc`
    );
    recentUnread = (msgData.value ?? []).map((m) => ({
      id: m.id,
      subject: m.subject ?? "(no subject)",
      bodyPreview: m.bodyPreview ?? "",
      receivedDateTime: m.receivedDateTime,
      isRead: m.isRead,
      hasAttachments: m.hasAttachments,
      flag: { flagStatus: (m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged") as "flagged" | "notFlagged" },
      from: { name: m.from?.emailAddress?.name ?? "Unknown", address: m.from?.emailAddress?.address ?? "" },
      toRecipients: (m.toRecipients ?? []).map((r) => ({ name: r.emailAddress.name, address: r.emailAddress.address })),
      ccRecipients: (m.ccRecipients ?? []).map((r) => ({ name: r.emailAddress.name, address: r.emailAddress.address })),
    }));
  } catch {
    // Not fatal
  }

  const userName = dbUser.name ?? defaultAccount.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar
        userName={userName}
        userEmail={defaultAccount.msEmail}
      />
      <DashboardClient
        userName={userName.split(" ")[0]}
        events={events.map((e) => ({
          id: e.id,
          subject: e.subject ?? "(no subject)",
          startDateTime: e.start.dateTime,
          endDateTime: e.end.dateTime,
          location: e.location?.displayName ?? "",
          attendeeCount: e.attendees?.length ?? 0,
        }))}
        recentUnread={recentUnread}
        eventsToday={events.length}
      />
    </div>
  );
}
