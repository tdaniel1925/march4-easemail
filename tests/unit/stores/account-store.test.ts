import { describe, it, expect, beforeEach } from "vitest";
import { useAccountStore, ConnectedAccount } from "@/lib/stores/account-store";

describe("account-store", () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAccountStore.getState();
    store.setAccounts([]);
    store.setInboxUnread(0);
    store.setDraftCount(0);
    store.setMailFolders([]);
    store.setActiveLabel(null);
  });

  const mockAccount1: ConnectedAccount = {
    id: "account-1",
    homeAccountId: "home-1",
    msEmail: "user1@example.com",
    displayName: "User One",
    isDefault: true,
  };

  const mockAccount2: ConnectedAccount = {
    id: "account-2",
    homeAccountId: "home-2",
    msEmail: "user2@example.com",
    displayName: "User Two",
    isDefault: false,
  };

  const mockAccount3: ConnectedAccount = {
    id: "account-3",
    homeAccountId: "home-3",
    msEmail: "user3@example.com",
    displayName: "User Three",
    isDefault: false,
  };

  describe("setAccounts", () => {
    it("should set accounts and automatically set default as active", () => {
      const store = useAccountStore.getState();
      store.setAccounts([mockAccount1, mockAccount2]);

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual([mockAccount1, mockAccount2]);
      expect(state.activeAccount).toEqual(mockAccount1);
    });

    it("should set first account as active when no default exists", () => {
      const nonDefaultAccount = { ...mockAccount1, isDefault: false };
      const store = useAccountStore.getState();
      store.setAccounts([nonDefaultAccount, mockAccount2]);

      const state = useAccountStore.getState();
      expect(state.activeAccount).toEqual(nonDefaultAccount);
    });

    it("should set activeAccount to null when no accounts", () => {
      const store = useAccountStore.getState();
      store.setAccounts([]);

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual([]);
      expect(state.activeAccount).toBeNull();
    });

    it("should prefer default account even if not first", () => {
      const nonDefaultAccount1 = { ...mockAccount1, isDefault: false };
      const defaultAccount = { ...mockAccount2, isDefault: true };
      const store = useAccountStore.getState();
      store.setAccounts([nonDefaultAccount1, defaultAccount]);

      const state = useAccountStore.getState();
      expect(state.activeAccount).toEqual(defaultAccount);
    });
  });

  describe("setActiveAccount", () => {
    it("should set active account", () => {
      const store = useAccountStore.getState();
      store.setAccounts([mockAccount1, mockAccount2]);
      store.setActiveAccount(mockAccount2);

      const state = useAccountStore.getState();
      expect(state.activeAccount).toEqual(mockAccount2);
    });

    it("should allow setting any account as active", () => {
      const store = useAccountStore.getState();
      store.setAccounts([mockAccount1, mockAccount2, mockAccount3]);

      store.setActiveAccount(mockAccount3);
      expect(useAccountStore.getState().activeAccount).toEqual(mockAccount3);

      store.setActiveAccount(mockAccount1);
      expect(useAccountStore.getState().activeAccount).toEqual(mockAccount1);
    });
  });

  describe("removeAccount", () => {
    it("should remove account from accounts array", () => {
      const store = useAccountStore.getState();
      store.setAccounts([mockAccount1, mockAccount2]);

      store.removeAccount("home-2");

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual([mockAccount1]);
    });

    it("should keep active account if it still exists after removal", () => {
      const store = useAccountStore.getState();
      store.setAccounts([mockAccount1, mockAccount2]);
      store.setActiveAccount(mockAccount1);

      store.removeAccount("home-2");

      const state = useAccountStore.getState();
      expect(state.activeAccount).toEqual(mockAccount1);
    });

    it("should set new default as active when removing current active account", () => {
      const store = useAccountStore.getState();
      const defaultAccount = { ...mockAccount2, isDefault: true };
      store.setAccounts([mockAccount1, defaultAccount]);
      store.setActiveAccount(mockAccount1);

      store.removeAccount("home-1");

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual([defaultAccount]);
      expect(state.activeAccount).toEqual(defaultAccount);
    });

    it("should set first account as active when removing current active and no default", () => {
      const store = useAccountStore.getState();
      const nonDefault1 = { ...mockAccount1, isDefault: false };
      const nonDefault2 = { ...mockAccount2, isDefault: false };
      store.setAccounts([nonDefault1, nonDefault2]);
      store.setActiveAccount(nonDefault1);

      store.removeAccount("home-1");

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual([nonDefault2]);
      expect(state.activeAccount).toEqual(nonDefault2);
    });

    it("should set activeAccount to null when removing last account", () => {
      const store = useAccountStore.getState();
      store.setAccounts([mockAccount1]);

      store.removeAccount("home-1");

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual([]);
      expect(state.activeAccount).toBeNull();
    });

    it("should do nothing when removing non-existent account", () => {
      const store = useAccountStore.getState();
      store.setAccounts([mockAccount1, mockAccount2]);
      const initialState = useAccountStore.getState();

      store.removeAccount("non-existent-id");

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual(initialState.accounts);
      expect(state.activeAccount).toEqual(initialState.activeAccount);
    });

    it("should handle removing from middle of accounts array", () => {
      const store = useAccountStore.getState();
      store.setAccounts([mockAccount1, mockAccount2, mockAccount3]);

      store.removeAccount("home-2");

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual([mockAccount1, mockAccount3]);
    });

    it("should prefer default account when resetting active after removal", () => {
      const store = useAccountStore.getState();
      const defaultAccount = { ...mockAccount3, isDefault: true };
      store.setAccounts([mockAccount1, mockAccount2, defaultAccount]);
      store.setActiveAccount(mockAccount1);

      store.removeAccount("home-1");

      const state = useAccountStore.getState();
      expect(state.activeAccount).toEqual(defaultAccount);
    });
  });

  describe("setInboxUnread", () => {
    it("should set inbox unread count", () => {
      const store = useAccountStore.getState();
      store.setInboxUnread(42);

      expect(useAccountStore.getState().inboxUnread).toBe(42);
    });

    it("should update from zero to non-zero", () => {
      const store = useAccountStore.getState();
      expect(useAccountStore.getState().inboxUnread).toBe(0);

      store.setInboxUnread(5);
      expect(useAccountStore.getState().inboxUnread).toBe(5);
    });

    it("should update to zero", () => {
      const store = useAccountStore.getState();
      store.setInboxUnread(10);

      store.setInboxUnread(0);
      expect(useAccountStore.getState().inboxUnread).toBe(0);
    });
  });

  describe("setDraftCount", () => {
    it("should set draft count", () => {
      const store = useAccountStore.getState();
      store.setDraftCount(15);

      expect(useAccountStore.getState().draftCount).toBe(15);
    });

    it("should update draft count", () => {
      const store = useAccountStore.getState();
      store.setDraftCount(5);
      store.setDraftCount(10);

      expect(useAccountStore.getState().draftCount).toBe(10);
    });
  });

  describe("setMailFolders", () => {
    it("should set mail folders", () => {
      const folders = [
        { id: "folder-1", displayName: "Inbox", totalItemCount: 10, unreadItemCount: 5 },
        { id: "folder-2", displayName: "Sent", totalItemCount: 20, unreadItemCount: 0 },
      ];

      const store = useAccountStore.getState();
      store.setMailFolders(folders);

      expect(useAccountStore.getState().mailFolders).toEqual(folders);
    });

    it("should replace existing folders", () => {
      const folders1 = [
        { id: "folder-1", displayName: "Inbox", totalItemCount: 10, unreadItemCount: 5 },
      ];
      const folders2 = [
        { id: "folder-2", displayName: "Sent", totalItemCount: 20, unreadItemCount: 0 },
      ];

      const store = useAccountStore.getState();
      store.setMailFolders(folders1);
      store.setMailFolders(folders2);

      expect(useAccountStore.getState().mailFolders).toEqual(folders2);
    });
  });

  describe("setActiveLabel", () => {
    it("should set active label", () => {
      const store = useAccountStore.getState();
      store.setActiveLabel("important");

      expect(useAccountStore.getState().activeLabel).toBe("important");
    });

    it("should set active label to null", () => {
      const store = useAccountStore.getState();
      store.setActiveLabel("work");
      store.setActiveLabel(null);

      expect(useAccountStore.getState().activeLabel).toBeNull();
    });

    it("should update active label", () => {
      const store = useAccountStore.getState();
      store.setActiveLabel("personal");
      store.setActiveLabel("work");

      expect(useAccountStore.getState().activeLabel).toBe("work");
    });
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const store = useAccountStore.getState();
      store.setAccounts([]);
      store.setInboxUnread(0);
      store.setDraftCount(0);
      store.setMailFolders([]);
      store.setActiveLabel(null);

      const state = useAccountStore.getState();
      expect(state.accounts).toEqual([]);
      expect(state.activeAccount).toBeNull();
      expect(state.inboxUnread).toBe(0);
      expect(state.draftCount).toBe(0);
      expect(state.mailFolders).toEqual([]);
      expect(state.activeLabel).toBeNull();
    });
  });
});
