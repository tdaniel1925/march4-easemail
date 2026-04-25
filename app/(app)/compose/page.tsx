import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { prisma } from "@/lib/prisma";
import ComposeClient from "@/components/compose/ComposeClient";
import { getActiveAccountId } from "@/lib/utils/get-active-account";

type SearchParams = Promise<{
  mode?: string;
  messageId?: string;
  draftId?: string;
  homeAccountId?: string;
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

  const dbDefault = dbUser.defaultAccount;
  if (!dbDefault) redirect("/onboarding");

  const params = await searchParams;
  const mode = params.mode as "reply" | "replyAll" | "forward" | undefined;

  // Resolve which account to compose from:
  // 1. URL param (reply/forward from specific account)
  // 2. Cookie (last-used account)
  // 3. DB default
  const savedAccountId = await getActiveAccountId();
  const resolvedAccountId = params.homeAccountId ?? savedAccountId ?? dbDefault.homeAccountId;

  // Load draft if draftId provided
  let draftData = null;
  if (params.draftId) {
    draftData = await prisma.draft.findFirst({
      where: { id: params.draftId, userId: user.id }
    });
  }

  const activeAccount = dbUser.allAccounts.find((a) => a.homeAccountId === resolvedAccountId) ?? dbDefault;

  // Build unified account list for the "From" dropdown
  const allAccounts = dbUser.allAccounts.map((a) => ({
    id: a.id ?? "",
    homeAccountId: a.homeAccountId,
    msEmail: a.email,
    displayName: a.displayName,
    isDefault: a.isDefault,
  }));

  return (
      <ComposeClient
        accounts={allAccounts}
        mode={mode}
        messageId={params.messageId}
        draftId={params.draftId}
        draftData={draftData}
        defaultAccountId={resolvedAccountId}
      />
  );
}
