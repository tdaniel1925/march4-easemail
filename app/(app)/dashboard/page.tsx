import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "there";

  return (
    <DashboardClient
      userName={userName}
      events={[]}
      recentUnread={[]}
      eventsToday={0}
      emailsData={[0, 0, 0, 0, 0, 0, 0]}
      sentData={[0, 0, 0, 0, 0, 0, 0]}
      draftsCount={0}
      hoursWaiting={0}
      attachmentsToday={0}
      unreadTrend={0}
    />
  );
}
