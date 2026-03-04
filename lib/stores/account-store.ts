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
  setAccounts: (accounts: ConnectedAccount[]) => void;
  setActiveAccount: (account: ConnectedAccount) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  activeAccount: null,
  setAccounts: (accounts) =>
    set({
      accounts,
      activeAccount: accounts.find((a) => a.isDefault) ?? accounts[0] ?? null,
    }),
  setActiveAccount: (activeAccount) => set({ activeAccount }),
}));
