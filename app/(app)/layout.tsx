import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { getActiveAccountId } from "@/lib/utils/get-active-account";
import { getUnreadCount } from "@/lib/utils/get-unread-count";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const dbDefault = dbUser.defaultAccount;
  if (!dbDefault) redirect("/onboarding");

  const savedAccountId = await getActiveAccountId();
  const activeAccount = (savedAccountId
    ? dbUser.allAccounts.find((a) => a.homeAccountId === savedAccountId)
    : null) ?? dbDefault;

  const unreadCount = await getUnreadCount(user.id, activeAccount.homeAccountId);
  const userName = dbUser.name ?? activeAccount.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer
        accounts={dbUser.msAccounts}
        imapAccounts={dbUser.imapAccounts}
        jmapAccounts={dbUser.jmapAccounts}
        inboxUnread={unreadCount}
      />
      <Sidebar userName={userName} userEmail={activeAccount.email} />
      {children}
    </div>
  );
}
