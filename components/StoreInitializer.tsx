"use client";

import { useLayoutEffect } from "react";
import { useAccountStore, ConnectedAccount } from "@/lib/stores/account-store";

export function StoreInitializer({
  accounts,
  inboxUnread,
}: {
  accounts: ConnectedAccount[];
  inboxUnread: number;
}) {
  useLayoutEffect(() => {
    useAccountStore.setState({
      accounts,
      activeAccount: accounts.find((a) => a.isDefault) ?? accounts[0] ?? null,
      inboxUnread,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
