import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import TeamsClient from "@/components/teams/TeamsClient";

export default async function TeamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");

  const userName = dbUser.name ?? defaultAccount?.displayName ?? user.email ?? "You";

  return (
      <TeamsClient
        userName={userName}
        userEmail={defaultAccount?.email ?? user.email ?? ""}
      />
  );
}
