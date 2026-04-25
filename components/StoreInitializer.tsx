"use client";

import { useLayoutEffect, useMemo } from "react";
import { useAccountStore, ConnectedAccount } from "@/lib/stores/account-store";

interface MsAccount {
  id: string;
  homeAccountId: string;
  msEmail: string;
  displayName: string | null;
  isDefault: boolean;
}

interface ImapAccount {
  id: string;
  accountId: string;
  email: string;
  displayName: string | null;
  isDefault: boolean;
}

interface JmapAccount {
  id: string;
  accountId: string;
  email: string;
  displayName: string | null;
  isDefault: boolean;
}

export function StoreInitializer({
  accounts,
  imapAccounts,
  jmapAccounts,
  inboxUnread,
}: {
  accounts: MsAccount[];
  imapAccounts?: ImapAccount[];
  jmapAccounts?: JmapAccount[];
  inboxUnread: number;
}) {
  // Stable key so we re-init when accounts actually change (L2 fix)
  const accountKey = useMemo(
    () =>
      accounts.map((a) => a.id).join(",") +
      "|" + (imapAccounts ?? []).map((a) => a.id).join(",") +
      "|" + (jmapAccounts ?? []).map((a) => a.id).join(","),
    [accounts, imapAccounts, jmapAccounts]
  );

  useLayoutEffect(() => {
    const allAccounts: ConnectedAccount[] = [
      ...accounts.map((a) => ({
        id: a.id,
        homeAccountId: a.homeAccountId,
        msEmail: a.msEmail,
        email: a.msEmail,
        displayName: a.displayName,
        isDefault: a.isDefault,
        providerType: "microsoft" as const,
      })),
      ...(imapAccounts ?? []).map((a) => ({
        id: a.id,
        homeAccountId: a.accountId,
        msEmail: a.email,
        email: a.email,
        displayName: a.displayName,
        isDefault: a.isDefault,
        providerType: "imap" as const,
      })),
      ...(jmapAccounts ?? []).map((a) => ({
        id: a.id,
        homeAccountId: a.accountId,
        msEmail: a.email,
        email: a.email,
        displayName: a.displayName,
        isDefault: a.isDefault,
        providerType: "jmap" as const,
      })),
    ];

    // Use setAccounts action — it restores the last-used account from localStorage
    useAccountStore.getState().setAccounts(allAccounts);
    useAccountStore.setState({ inboxUnread });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountKey, inboxUnread]);
  return null;
}
