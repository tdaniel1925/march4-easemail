import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import TeamsClient from "@/components/teams/TeamsClient";

export default async function TeamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });
  if (!dbUser) redirect("/onboarding");
  if (!dbUser.msAccounts.length) redirect("/onboarding");

  const defaultAccount = dbUser.msAccounts[0];
  const userName = dbUser.name ?? defaultAccount?.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar
        userName={userName}
        userEmail={defaultAccount?.msEmail ?? user.email ?? ""}
      />
      <TeamsClient
        userName={userName}
        userEmail={defaultAccount?.msEmail ?? user.email ?? ""}
      />
    </div>
  );
}
