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

  const dbDefault = dbUser.defaultAccount;
  if (!dbDefault) redirect("/onboarding");
  const { getActiveAccountId } = await import("@/lib/utils/get-active-account");
  const savedAccountId = await getActiveAccountId();
  const defaultAccount = (savedAccountId ? dbUser.allAccounts.find((a) => a.homeAccountId === savedAccountId) : null) ?? dbDefault;
  const weekStartDate = weekStart.toISOString().split("T")[0];
  const weekEndDate = weekEnd.toISOString().split("T")[0];

  // Fetch calendar events from all providers + unread count in parallel
  const [msResults, jmapResults, unreadCount] = await Promise.all([
    // Microsoft accounts
    Promise.allSettled(
      dbUser.msAccounts.map((acc) =>
        graphGet<GraphCalEventList>(user.id, acc.homeAccountId, graphPath).then((data) =>
          (data.value ?? []).map((e) => mapGraphEvent(e, acc.homeAccountId, acc.msEmail))
        )
      )
    ),
    // JMAP accounts
    Promise.allSettled(
      dbUser.jmapAccounts.map(async (acc) => {
        const { JmapProvider } = await import("@/lib/providers/jmap");
        const provider = new JmapProvider();
        const jmapEvents = await provider.fetchEvents(user.id, acc.accountId, weekStartDate, weekEndDate);
        return jmapEvents.map((e): CalEvent => ({
          id: e.id,
          subject: e.subject,
          startDateTime: e.startDateTime,
          endDateTime: e.endDateTime,
          timeZone: e.timeZone,
          isAllDay: e.isAllDay,
          location: e.location,
          bodyPreview: e.bodyPreview,
          organizer: e.organizer,
          attendees: e.attendees,
          onlineMeetingUrl: e.onlineMeetingUrl,
          responseStatus: e.responseStatus as CalEvent["responseStatus"],
          accountHomeId: acc.accountId,
          accountEmail: acc.email,
          isRecurring: e.isRecurring,
          recurrence: e.recurrence,
        }));
      })
    ),
    defaultAccount ? getUnreadCount(user.id, defaultAccount.homeAccountId) : Promise.resolve(0),
  ]);

  const events: CalEvent[] = [
    ...msResults
      .filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled")
      .flatMap((r) => r.value),
    ...jmapResults
      .filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === "fulfilled")
      .flatMap((r) => r.value),
  ].sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  const userName = dbUser.name ?? defaultAccount?.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar userName={userName} userEmail={defaultAccount?.email ?? dbUser.email} />
      <CalendarClient weekStart={weekStartStr} events={events} userTimeZone={dbUser.preferredTimeZone} />
    </div>
  );
}
