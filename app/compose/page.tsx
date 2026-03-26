import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import ComposeClient from "@/components/compose/ComposeClient";
import { getUnreadCount } from "@/lib/utils/get-unread-count";

type SearchParams = Promise<{
  mode?: string;
  messageId?: string;
}>;

export default async function ComposePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });

  if (!dbUser) redirect("/onboarding");
  if (!dbUser.msAccounts.length) redirect("/onboarding");

  const defaultAccount = dbUser.msAccounts.find((a) => a.isDefault) ?? dbUser.msAccounts[0];
  const params = await searchParams;
  const mode = params.mode as "reply" | "replyAll" | "forward" | undefined;

  const unreadCount = await getUnreadCount(user.id, defaultAccount.homeAccountId);

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.msEmail}
      />
      <ComposeClient
        accounts={dbUser.msAccounts.map((a) => ({
          id: a.id,
          homeAccountId: a.homeAccountId,
          msEmail: a.msEmail,
          displayName: a.displayName,
          isDefault: a.isDefault,
        }))}
        mode={mode}
        messageId={params.messageId}
      />
    </div>
  );
}
