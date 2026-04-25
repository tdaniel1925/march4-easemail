import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
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
import { getUnreadCount } from "@/lib/utils/get-unread-count";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");
  if (!dbUser.allAccounts.length) redirect("/onboarding");

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

  const defaultAccount = dbUser.defaultAccount;

  // Fetch calendar events and unread count in parallel
  const [results, unreadCount] = await Promise.all([
    Promise.allSettled(
      dbUser.msAccounts.map((acc) =>
        graphGet<GraphCalEventList>(user.id, acc.homeAccountId, graphPath).then((data) =>
          (data.value ?? []).map((e) => mapGraphEvent(e, acc.homeAccountId, acc.msEmail))
        )
      )
    ),
    defaultAccount ? getUnreadCount(user.id, defaultAccount.homeAccountId) : Promise.resolve(0),
  ]);

  const events: CalEvent[] = results
    .filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const userName = dbUser.name ?? defaultAccount?.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar userName={userName} userEmail={defaultAccount?.email ?? dbUser.email} />
      <CalendarClient weekStart={weekStartStr} events={events} userTimeZone={dbUser.preferredTimeZone} />
    </div>
  );
}
