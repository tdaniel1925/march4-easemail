import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import EmailRulesClient from "@/components/email-rules/EmailRulesClient";

export default async function EmailRulesPage() {
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

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.msEmail}
      />
      <EmailRulesClient />
    </div>
  );
}
