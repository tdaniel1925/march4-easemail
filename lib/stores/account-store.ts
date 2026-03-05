import { create } from "zustand";

export interface ConnectedAccount {
  id: string;
  homeAccountId: string;
  msEmail: string;
  displayName: string | null;
  isDefault: boolean;
}

interface AccountStore {
  accounts: ConnectedAccount[];
  activeAccount: ConnectedAccount | null;
  inboxUnread: number;
  draftCount: number;
  setAccounts: (accounts: ConnectedAccount[]) => void;
  setActiveAccount: (account: ConnectedAccount) => void;
  setInboxUnread: (count: number) => void;
  setDraftCount: (count: number) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  activeAccount: null,
  inboxUnread: 0,
  draftCount: 0,
  setAccounts: (accounts) =>
    set({
      accounts,
      activeAccount: accounts.find((a) => a.isDefault) ?? accounts[0] ?? null,
    }),
  setActiveAccount: (activeAccount) => set({ activeAccount }),
  setInboxUnread: (inboxUnread) => set({ inboxUnread }),
  setDraftCount: (draftCount) => set({ draftCount }),
}));
