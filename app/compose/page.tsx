import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import ComposeClient from "@/components/compose/ComposeClient";
import { getUnreadCount } from "@/lib/utils/get-unread-count";

type SearchParams = Promise<{
  mode?: string;
  messageId?: string;
  draftId?: string;
}>;

export default async function ComposePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");
  const params = await searchParams;
  const mode = params.mode as "reply" | "replyAll" | "forward" | undefined;

  // Load draft if draftId provided
  let draftData = null;
  if (params.draftId) {
    draftData = await prisma.draft.findFirst({
      where: { id: params.draftId, userId: user.id }
    });
  }

  const unreadCount = await getUnreadCount(user.id, defaultAccount.homeAccountId);

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={dbUser.name ?? user.email ?? "You"}
        userEmail={defaultAccount.email}
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
        draftId={params.draftId}
        draftData={draftData}
      />
    </div>
  );
}
