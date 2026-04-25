import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import AccountsClient from "@/components/accounts/AccountsClient";
import type { ProviderType } from "@/lib/providers/types";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.defaultAccount;
  if (!defaultAccount) redirect("/onboarding");

  // Merge all account types into a unified list for the UI
  const accounts: Array<{
    id: string;
    msEmail: string;
    email: string;
    displayName: string;
    homeAccountId: string;
    isDefault: boolean;
    connectedAt: string;
    providerType: ProviderType;
  }> = [
    ...dbUser.msAccounts.map((a) => ({
      id: a.id,
      msEmail: a.msEmail,
      email: a.msEmail,
      displayName: a.displayName ?? a.msEmail,
      homeAccountId: a.homeAccountId,
      isDefault: a.isDefault,
      connectedAt: a.connectedAt.toISOString(),
      providerType: "microsoft" as const,
    })),
    ...dbUser.imapAccounts.map((a) => ({
      id: a.id,
      msEmail: a.email,
      email: a.email,
      displayName: a.displayName ?? a.email,
      homeAccountId: a.accountId,
      isDefault: a.isDefault,
      connectedAt: a.connectedAt.toISOString(),
      providerType: "imap" as const,
    })),
    ...dbUser.jmapAccounts.map((a) => ({
      id: a.id,
      msEmail: a.email,
      email: a.email,
      displayName: a.displayName ?? a.email,
      homeAccountId: a.accountId,
      isDefault: a.isDefault,
      connectedAt: a.connectedAt.toISOString(),
      providerType: "jmap" as const,
    })),
  ];

  return <AccountsClient accounts={accounts} />;
}
