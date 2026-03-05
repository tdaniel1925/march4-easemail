import { create } from "zustand";
import type { MailFolder } from "@/lib/types/email";

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
  mailFolders: MailFolder[];
  setAccounts: (accounts: ConnectedAccount[]) => void;
  setActiveAccount: (account: ConnectedAccount) => void;
  removeAccount: (homeAccountId: string) => void;
  setInboxUnread: (count: number) => void;
  setDraftCount: (count: number) => void;
  setMailFolders: (folders: MailFolder[]) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  activeAccount: null,
  inboxUnread: 0,
  draftCount: 0,
  mailFolders: [],
  setAccounts: (accounts) =>
    set({
      accounts,
      activeAccount: accounts.find((a) => a.isDefault) ?? accounts[0] ?? null,
    }),
  setActiveAccount: (activeAccount) => set({ activeAccount }),
  removeAccount: (homeAccountId) =>
    set((state) => {
      const remaining = state.accounts.filter((a) => a.homeAccountId !== homeAccountId);
      const activeStillExists = remaining.some(
        (a) => a.homeAccountId === state.activeAccount?.homeAccountId
      );
      return {
        accounts: remaining,
        activeAccount: activeStillExists
          ? state.activeAccount
          : (remaining.find((a) => a.isDefault) ?? remaining[0] ?? null),
      };
    }),
  setInboxUnread: (inboxUnread) => set({ inboxUnread }),
  setDraftCount: (draftCount) => set({ draftCount }),
  setMailFolders: (mailFolders) => set({ mailFolders }),
}));
