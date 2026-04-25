import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import SettingsClient from "@/components/settings/SettingsClient";

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

  return <SettingsClient profile={profile} />;
}
