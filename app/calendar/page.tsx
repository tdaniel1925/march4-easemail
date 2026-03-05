import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import CalendarClient from "@/components/calendar/CalendarClient";
import {
  type CalEvent,
  type GraphCalEventList,
  mapGraphEvent,
  CALENDAR_SELECT,
} from "@/lib/types/calendar";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });
  if (!dbUser) redirect("/onboarding");
  if (!dbUser.msAccounts.length) redirect("/onboarding");

  // Current week: Monday 00:00:00 → Sunday 23:59:59
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekStartStr = weekStart.toISOString().split("T")[0];

  const graphPath =
    `/me/calendarView` +
    `?startDateTime=${encodeURIComponent(weekStart.toISOString())}` +
    `&endDateTime=${encodeURIComponent(weekEnd.toISOString())}` +
    `&$select=${CALENDAR_SELECT}` +
    `&$top=200`;

  // Fetch from all connected accounts — partial failures don't block the page
  const results = await Promise.allSettled(
    dbUser.msAccounts.map((acc) =>
      graphGet<GraphCalEventList>(user.id, acc.homeAccountId, graphPath).then((data) =>
        (data.value ?? []).map((e) => mapGraphEvent(e, acc.homeAccountId, acc.msEmail))
      )
    )
  );

  const events: CalEvent[] = results
    .filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const defaultAccount = dbUser.msAccounts.find((a) => a.isDefault) ?? dbUser.msAccounts[0];
  const userName = dbUser.name ?? defaultAccount.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar userName={userName} userEmail={defaultAccount.msEmail} />
      <CalendarClient weekStart={weekStartStr} events={events} />
    </div>
  );
}
