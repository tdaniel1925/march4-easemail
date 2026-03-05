"use client";

import { useRef } from "react";
import { useAccountStore, ConnectedAccount } from "@/lib/stores/account-store";

export function StoreInitializer({
  accounts,
  inboxUnread,
}: {
  accounts: ConnectedAccount[];
  inboxUnread: number;
}) {
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    useAccountStore.setState({
      accounts,
      activeAccount: accounts.find((a) => a.isDefault) ?? accounts[0] ?? null,
      inboxUnread,
    });
  }
  return null;
}
