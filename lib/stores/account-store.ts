import { create } from "zustand";
import type { MailFolder } from "@/lib/types/email";
import type { ProviderType } from "@/lib/providers/types";

export interface ConnectedAccount {
  id: string;
  homeAccountId: string;
  msEmail: string; // kept for backward compatibility
  email: string;
  displayName: string | null;
  isDefault: boolean;
  providerType: ProviderType;
}

interface AccountStore {
  accounts: ConnectedAccount[];
  activeAccount: ConnectedAccount | null;
  inboxUnread: number;
  draftCount: number;
  scheduledCount: number;
  mailFolders: MailFolder[];
  activeLabel: string | null;
  setAccounts: (accounts: ConnectedAccount[]) => void;
  setActiveAccount: (account: ConnectedAccount) => void;
  removeAccount: (homeAccountId: string) => void;
  setInboxUnread: (count: number) => void;
  setDraftCount: (count: number) => void;
  setScheduledCount: (count: number) => void;
  setMailFolders: (folders: MailFolder[]) => void;
  setActiveLabel: (label: string | null) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  activeAccount: null,
  inboxUnread: 0,
  draftCount: 0,
  scheduledCount: 0,
  mailFolders: [],
  activeLabel: null,
  setAccounts: (accounts) => {
    // Restore last-used account from cookie (SSR-accessible) or localStorage fallback
    let saved: string | null = null;
    try {
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)easemail_account=([^;]*)/);
        saved = match ? decodeURIComponent(match[1]) : null;
      }
      if (!saved && typeof window !== "undefined") {
        saved = localStorage.getItem("easemail:activeAccountId");
      }
    } catch {}
    const restored = saved ? accounts.find((a) => a.homeAccountId === saved) : null;
    set({
      accounts,
      activeAccount: restored ?? accounts.find((a) => a.isDefault) ?? accounts[0] ?? null,
    });
  },
  setActiveAccount: (activeAccount) => {
    // Persist to both cookie (SSR-readable) and localStorage (fallback)
    try {
      document.cookie = `easemail_account=${encodeURIComponent(activeAccount.homeAccountId)};path=/;max-age=31536000;SameSite=Lax`;
      localStorage.setItem("easemail:activeAccountId", activeAccount.homeAccountId);
    } catch {}
    // Zero out all account-scoped counts immediately so stale counts
    // from the previous account are never shown while the new data loads.
    set({
      activeAccount,
      inboxUnread: 0,
      draftCount: 0,
      scheduledCount: 0,
      mailFolders: [],
    });
  },
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
  setScheduledCount: (scheduledCount) => set({ scheduledCount }),
  setMailFolders: (mailFolders) => set({ mailFolders }),
  setActiveLabel: (activeLabel) => set({ activeLabel }),
}));
