import { create } from "zustand";

// ─── View types ──────────────────────────────────────────────────────────────

export type AppView =
  | "inbox"
  | "calendar"
  | "dashboard"
  | "contacts"
  | "drafts"
  | "sent"
  | "starred"
  | "trash"
  | "settings"
  | "attachments"
  | "compose"
  | "help"
  | "accounts"
  | "signatures"
  | "email-rules"
  | "teams"
  | "folder"
  | "email-read";

// ─── Store ───────────────────────────────────────────────────────────────────

interface DataCacheStore {
  activeView: AppView;
  /** For dynamic folder view — the folderId */
  activeFolderId: string | null;
  /** For email read view — the message ID + return path */
  activeEmailId: string | null;
  activeEmailAccountId: string | null;
  activeEmailReturnTo: string | null;
  /** For compose — query params */
  composeParams: {
    mode?: "reply" | "replyAll" | "forward";
    messageId?: string;
    draftId?: string;
    homeAccountId?: string;
    panel?: string;
    to?: string;
  } | null;
  /** Track which views have been loaded at least once */
  loadedViews: Set<AppView>;
  /** Loading state per view */
  loadingView: AppView | null;

  setActiveView: (view: AppView) => void;
  setActiveFolderId: (id: string | null) => void;
  setActiveEmail: (id: string | null, accountId?: string | null, returnTo?: string | null) => void;
  setComposeParams: (params: DataCacheStore["composeParams"]) => void;
  markViewLoaded: (view: AppView) => void;
  setLoadingView: (view: AppView | null) => void;
}

/** Map view names to URL paths */
export function viewToPath(view: AppView, extra?: { folderId?: string; emailId?: string; composeParams?: DataCacheStore["composeParams"] }): string {
  switch (view) {
    case "inbox": return "/inbox";
    case "calendar": return "/calendar";
    case "dashboard": return "/dashboard";
    case "contacts": return "/contacts";
    case "drafts": return "/drafts";
    case "sent": return "/sent";
    case "starred": return "/starred";
    case "trash": return "/trash";
    case "settings": return "/settings";
    case "attachments": return "/attachments";
    case "compose": {
      const p = extra?.composeParams;
      if (!p) return "/compose";
      const qs = new URLSearchParams();
      if (p.mode) qs.set("mode", p.mode);
      if (p.messageId) qs.set("messageId", p.messageId);
      if (p.draftId) qs.set("draftId", p.draftId);
      if (p.homeAccountId) qs.set("homeAccountId", p.homeAccountId);
      if (p.panel) qs.set("panel", p.panel);
      if (p.to) qs.set("to", p.to);
      const str = qs.toString();
      return str ? `/compose?${str}` : "/compose";
    }
    case "help": return "/help";
    case "accounts": return "/accounts";
    case "signatures": return "/signatures";
    case "email-rules": return "/email-rules";
    case "teams": return "/teams";
    case "folder": return extra?.folderId ? `/folder/${extra.folderId}` : "/dashboard";
    case "email-read": return extra?.emailId ? `/inbox/${extra.emailId}` : "/dashboard";
    default: return "/dashboard";
  }
}

/** Map a pathname to a view */
export function pathToView(pathname: string): { view: AppView; folderId?: string; emailId?: string } {
  if (pathname.startsWith("/inbox/")) {
    const id = decodeURIComponent(pathname.slice("/inbox/".length));
    return { view: "email-read", emailId: id };
  }
  if (pathname.startsWith("/folder/")) {
    const id = decodeURIComponent(pathname.slice("/folder/".length));
    return { view: "folder", folderId: id };
  }
  switch (pathname) {
    case "/inbox": return { view: "inbox" };
    case "/calendar": return { view: "calendar" };
    case "/dashboard": return { view: "dashboard" };
    case "/contacts": return { view: "contacts" };
    case "/drafts": return { view: "drafts" };
    case "/sent": return { view: "sent" };
    case "/starred": return { view: "starred" };
    case "/trash": return { view: "trash" };
    case "/settings": return { view: "settings" };
    case "/attachments": return { view: "attachments" };
    case "/compose": return { view: "compose" };
    case "/help": return { view: "help" };
    case "/accounts": return { view: "accounts" };
    case "/signatures": return { view: "signatures" };
    case "/email-rules": return { view: "email-rules" };
    case "/teams": return { view: "teams" };
    default: return { view: "dashboard" };
  }
}

export const useDataCacheStore = create<DataCacheStore>((set) => ({
  activeView: "dashboard",
  activeFolderId: null,
  activeEmailId: null,
  activeEmailAccountId: null,
  activeEmailReturnTo: null,
  composeParams: null,
  loadedViews: new Set<AppView>(),
  loadingView: null,

  setActiveView: (view) => set({ activeView: view, loadingView: null }),
  setActiveFolderId: (id) => set({ activeFolderId: id }),
  setActiveEmail: (id, accountId, returnTo) =>
    set({
      activeEmailId: id,
      activeEmailAccountId: accountId ?? null,
      activeEmailReturnTo: returnTo ?? null,
    }),
  setComposeParams: (params) => set({ composeParams: params }),
  markViewLoaded: (view) =>
    set((state) => {
      const next = new Set(state.loadedViews);
      next.add(view);
      return { loadedViews: next };
    }),
  setLoadingView: (view) => set({ loadingView: view }),
}));
