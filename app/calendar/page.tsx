import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import CalendarClient from "@/components/calendar/CalendarClient";
import type { CalEvent } from "@/components/calendar/CalendarClient";

// ─── Graph shapes ─────────────────────────────────────────────────────────────

interface GraphEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  attendees?: { emailAddress: { name: string; address: string } }[];
  bodyPreview?: string;
}

interface GraphEventList {
  value: GraphEvent[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });
  if (!dbUser) redirect("/onboarding");

  const defaultAccount =
    dbUser.msAccounts.find((a) => a.isDefault) ?? dbUser.msAccounts[0];
  if (!defaultAccount) redirect("/onboarding");

  // Calculate current week: Monday 00:00:00 → Sunday 23:59:59
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - daysFromMonday);
  weekStartDate.setHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  const weekStartStr = weekStartDate.toISOString().split("T")[0];

  let events: CalEvent[] = [];
  try {
    const eventsData = await graphGet<GraphEventList>(
      user.id,
      defaultAccount.homeAccountId,
      `/me/calendarView?startDateTime=${encodeURIComponent(weekStartDate.toISOString())}&endDateTime=${encodeURIComponent(weekEndDate.toISOString())}&$top=50&$select=id,subject,start,end,location,attendees,bodyPreview&$orderby=start/dateTime`
    );
    events = (eventsData.value ?? []).map((e) => ({
      id: e.id,
      subject: e.subject ?? "(no subject)",
      startDateTime: e.start.dateTime,
      endDateTime: e.end.dateTime,
      location: e.location?.displayName ?? "",
      attendeeCount: e.attendees?.length ?? 0,
    }));
  } catch {
    // Calendar may not be consented — not fatal
  }

  const userName =
    dbUser.name ?? defaultAccount.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar userName={userName} userEmail={defaultAccount.msEmail} />
      <CalendarClient weekStart={weekStartStr} events={events} />
    </div>
  );
}
