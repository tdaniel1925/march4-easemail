"use client";

import { useLayoutEffect } from "react";
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

    useAccountStore.setState({
      accounts: allAccounts,
      activeAccount: allAccounts.find((a) => a.isDefault) ?? allAccounts[0] ?? null,
      inboxUnread,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
