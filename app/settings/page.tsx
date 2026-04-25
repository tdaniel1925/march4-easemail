import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import SettingsClient from "@/components/settings/SettingsClient";
import { getUnreadCount } from "@/lib/utils/get-unread-count";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const dbDefault = dbUser.defaultAccount;
  if (!dbDefault) redirect("/onboarding");
  const { getActiveAccountId } = await import("@/lib/utils/get-active-account");
  const savedAccountId = await getActiveAccountId();
  const defaultAccount = (savedAccountId ? dbUser.allAccounts.find((a) => a.homeAccountId === savedAccountId) : null) ?? dbDefault;

  const profile = {
    name: dbUser.name ?? "",
    email: defaultAccount.email,
  };

  const unreadCount = await getUnreadCount(user.id, defaultAccount.homeAccountId);

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.email}
      />
      <SettingsClient profile={profile} />
    </div>
  );
}
