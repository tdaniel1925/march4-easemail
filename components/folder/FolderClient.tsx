"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAccountStore } from "@/lib/stores/account-store";
import { useDataCacheStore, pathToView } from "@/lib/stores/data-cache";
import type { EmailMessage } from "@/lib/types/email";
import { formatDate, getInitials, getAvatarColor } from "@/lib/utils/email-helpers";

/** Shared utility — refresh folder counts in the sidebar after mutations */
export async function refreshFolderCounts(homeAccountId: string, setMailFolders: (folders: import("@/lib/types/email").MailFolder[]) => void): Promise<void> {
  try {
    const r = await fetch(`/api/mail/folders?homeAccountId=${encodeURIComponent(homeAccountId)}&refresh=1`);
    if (!r.ok) return;
    const data = await r.json() as { folders?: import("@/lib/types/email").MailFolder[] };
    if (data.folders) setMailFolders(data.folders);
  } catch {
    // non-critical — sidebar counts will refresh on next mount
  }
}

// ─── EmailRow ─────────────────────────────────────────────────────────────────

function EmailRow({
  email,
  onClick,
  onDelete,
  deleteLabel = "Delete",
  showRecipient = false,
  confirmDelete = false,
  onConfirmDelete,
  onCancelDelete,
}: {
  email: EmailMessage;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  deleteLabel?: string;
  showRecipient?: boolean;
  /** When true, this row is awaiting a permanent-delete confirmation (Trash). */
  confirmDelete?: boolean;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
}) {
  const displayName = showRecipient
    ? (email.toRecipients?.[0]?.name || email.toRecipients?.[0]?.address || email.from.name)
    : email.from.name;
  const color = getAvatarColor(displayName);

  return (
    <div
      data-testid="email-item"
      onClick={onClick}
      className="group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-neutral-50 border-l-2 border-transparent"
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {getInitials(displayName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm truncate" style={{ fontWeight: email.isRead ? 500 : 700, color: email.isRead ? "rgb(82 82 82)" : "rgb(27 29 29)" }}>
            {showRecipient ? `To: ${displayName}` : displayName}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {email.hasAttachments && (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" style={{ color: "rgb(155 155 155)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
            <span className="text-xs" style={{ color: "rgb(155 155 155)" }}>
              {formatDate(email.receivedDateTime)}
            </span>
          </div>
        </div>
        <p className="text-sm truncate" style={{ fontWeight: email.isRead ? 500 : 600, color: email.isRead ? "rgb(115 115 115)" : "rgb(38 38 38)" }}>
          {email.subject}
        </p>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: email.isRead ? "rgb(155 155 155)" : "rgb(115 115 115)" }}>
          {email.bodyPreview}
        </p>
      </div>

      {!email.isRead && (
        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: "rgb(138 9 9)" }} />
      )}

      {/* Inline permanent-delete confirmation (Trash) — replaces the one-click
          hover delete so a permanent delete can't fire from a single hover click. */}
      {onDelete && confirmDelete ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 flex-shrink-0 mt-0.5"
        >
          <span className="text-xs font-medium mr-0.5" style={{ color: "rgb(138 9 9)" }}>Delete forever?</span>
          <button
            onClick={(e) => { e.stopPropagation(); onConfirmDelete?.(); }}
            className="text-xs font-semibold px-2 py-1 rounded-[8px] text-white"
            style={{ backgroundColor: "rgb(138 9 9)" }}
          >
            Delete
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCancelDelete?.(); }}
            className="text-xs font-medium px-2 py-1 rounded-[8px] border border-neutral-200 bg-white"
            style={{ color: "rgb(115 115 115)" }}
          >
            Cancel
          </button>
        </div>
      ) : onDelete ? (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e); }}
          title={deleteLabel}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-[8px] border border-neutral-200 bg-white hover:border-red-300 flex-shrink-0 mt-0.5"
          style={{ color: "rgb(115 115 115)" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

// ─── FolderClient ─────────────────────────────────────────────────────────────

export default function FolderClient({
  folder,
  folderLabel,
  initialEmails,
  initialNextLink,
}: {
  folder: string;
  folderLabel: string;
  initialEmails: EmailMessage[];
  initialNextLink: string | null;
}) {
  /** SPA-aware navigation — updates store + pushState instead of server round-trip */
  function navigateTo(href: string) {
    const { view, folderId, emailId } = pathToView(href.split("?")[0]);
    useDataCacheStore.getState().setActiveView(view);
    if (folderId) useDataCacheStore.getState().setActiveFolderId(folderId);
    if (view === "email-read" && emailId) {
      const acctId = useAccountStore.getState().activeAccount?.homeAccountId ?? null;
      useDataCacheStore.getState().setActiveEmail(emailId, acctId, `/${folder}`);
    }
    if (view === "compose") {
      const sp = new URLSearchParams(href.includes("?") ? href.split("?")[1] : "");
      useDataCacheStore.getState().setComposeParams({
        mode: (sp.get("mode") as "reply" | "replyAll" | "forward") || undefined,
        messageId: sp.get("messageId") || undefined,
        draftId: sp.get("draftId") || undefined,
        homeAccountId: sp.get("homeAccountId") || undefined,
        panel: sp.get("panel") || undefined,
      });
    }
    window.history.pushState(null, "", href);
  }

  const [emails, setEmails] = useState<EmailMessage[]>(initialEmails);
  // Trash-only: id of the row whose permanent delete is awaiting confirmation.
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [nextLink, setNextLink] = useState<string | null>(initialNextLink);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<EmailMessage[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [requiresReauth, setRequiresReauth] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeAccount = useAccountStore((s) => s.activeAccount);
  const setMailFolders = useAccountStore((s) => s.setMailFolders);
  const setLoadingFolderId = useDataCacheStore((s) => s.setLoadingFolderId);
  const loadingFolderId = useDataCacheStore((s) => s.loadingFolderId);
  const firstRender = useRef(true);
  // Separate guard for the account-switch effect. Without it the effect fires
  // on initial mount and (a) immediately redirects custom folders to /inbox,
  // making them unreachable, and (b) double-fetches system folders alongside
  // the mount effect. The redirect/refetch must only run on an ACTUAL account
  // change, never the first render.
  const accountSwitchFirstRender = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Well-known folder names that exist on every account
  const SYSTEM_FOLDERS = new Set(["sent", "drafts", "trash", "starred"]);
  const isCustomFolder = !SYSTEM_FOLDERS.has(folder);

  // Fetch emails for a given folder + account — always runs on mount and folder change (Fix 1)
  const doFetch = useCallback((hid: string, reset: boolean) => {
    setLoadingEmails(true);
    setLoadingFolderId(folder);
    if (reset) { setNextLink(null); setEmails([]); }
    setRequiresReauth(false);
    fetch(`/api/mail/folder?folder=${encodeURIComponent(folder)}&homeAccountId=${encodeURIComponent(hid)}`)
      .then(async (r) => {
        if (r.status === 401) {
          // Provider token expired (401 / Unauthorized / reauth_required) — the app
          // session is still valid (middleware handles missing sessions), so show
          // the inline reconnect banner instead of bouncing the user to /login.
          await r.json().catch(() => null);
          setRequiresReauth(true); return null;
        }
        if (!r.ok) {
          const errBody = await r.json().catch(() => ({} as { error?: string })) as { error?: string };
          throw new Error(errBody.error ?? `folder ${r.status}`);
        }
        return r.json() as Promise<{ emails?: EmailMessage[]; nextLink?: string | null }>;
      })
      .then((data) => {
        if (!data) return;
        setEmails(data.emails ?? []);
        setNextLink(data.nextLink ?? null);
      })
      .catch(console.error)
      .finally(() => { setLoadingEmails(false); setLoadingFolderId(null); });
  }, [folder, setLoadingFolderId]);

  // Always fetch on mount and when folder ID changes (Fix 1 — remove initialEmails.length guard)
  useEffect(() => {
    const hid = activeAccount?.homeAccountId;
    if (!hid) { setLoadingEmails(false); return; }
    // Use initialEmails if provided on first render to avoid double-fetch on SSR
    if (firstRender.current && initialEmails.length > 0) {
      setLoadingEmails(false);
      firstRender.current = false;
      return;
    }
    firstRender.current = false;
    doFetch(hid, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  // Account switch: reload system folders, redirect away from custom folders (Fix 4)
  useEffect(() => {
    // First-render guard — the mount effect above already handles the initial
    // load. Only run on an actual account change so custom folders stay
    // reachable on direct navigation and system folders aren't double-fetched.
    if (accountSwitchFirstRender.current) { accountSwitchFirstRender.current = false; return; }
    if (!activeAccount) return;
    if (isCustomFolder) {
      // Fix 4: clear activeFolderId before navigating away
      useDataCacheStore.getState().setActiveFolderId(null);
      navigateTo("/inbox");
      return;
    }
    doFetch(activeAccount.homeAccountId, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.homeAccountId]);

  // Infinite scroll — pass full nextLink URL directly (Fix 10, 15)
  const loadMore = useCallback(async () => {
    if (!nextLink || loadingMore || !activeAccount) return;
    setLoadingMore(true);
    try {
      // nextLink may be a full Graph URL (http...) or a cursor string
      const isFullUrl = nextLink.startsWith("http");
      const url = isFullUrl
        ? `/api/mail/folder?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&nextLink=${encodeURIComponent(nextLink)}`
        : `/api/mail/folder?folder=${encodeURIComponent(folder)}&homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&nextLink=${encodeURIComponent(nextLink)}`;
      const res = await fetch(url);
      const data: { emails: EmailMessage[]; nextLink: string | null } = await res.json();
      setEmails((prev) => [...prev, ...data.emails]);
      setNextLink(data.nextLink ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [nextLink, loadingMore, activeAccount, folder]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Debounced search — with inline error state (Fix 6)
  // Bumping searchNonce forces the search effect to re-run even when the query
  // text is unchanged (setSearch(prev=>prev) was a no-op and never retried).
  const [searchNonce, setSearchNonce] = useState(0);
  const retrySearch = useCallback(() => {
    setSearchError(null);
    setSearchNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    const q = search.trim();
    if (!q) { setSearchResults(null); setSearchError(null); return; }
    if (!activeAccount) return;
    const timer = setTimeout(() => {
      setSearching(true);
      setSearchError(null);
      fetch(`/api/mail/search?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&q=${encodeURIComponent(q)}&folder=${encodeURIComponent(folder)}`)
        .then(async (r) => {
          if (r.status === 401) {
            // Provider token expired — show inline reconnect banner, never /login.
            await r.json().catch(() => null);
            setRequiresReauth(true); return null;
          }
          if (!r.ok) throw new Error(`search ${r.status}`);
          return r.json() as Promise<{ emails: EmailMessage[] }>;
        })
        .then((data) => { if (data) setSearchResults(data.emails); })
        .catch(() => { setSearchError("Search failed — try again"); setSearchResults(null); })
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeAccount?.homeAccountId, folder, searchNonce]);

  const displayEmails = searchResults ?? emails;

  // ── Delete handler — same optimistic pattern as InboxClient ───────────────
  // The visible list can be `emails` or `searchResults`, so removal/restore
  // must update both. Uses /api/mail/delete which also updates the server
  // cache (cachedEmail), so the email can't resurrect on the next load.
  // In Trash, delete is permanent.
  const handleDelete = useCallback((email: EmailMessage) => {
    if (!activeAccount) return;
    const hid = activeAccount.homeAccountId;

    // Optimistic removal from every visible list
    const filterFn = (prev: EmailMessage[]) => prev.filter((e) => e.id !== email.id);
    setEmails(filterFn);
    setSearchResults((prev) => (prev ? filterFn(prev) : prev));
    setActionError(null);

    // In the Drafts folder, the Graph delete alone leaves the local Prisma draft
    // row intact — a scheduled draft would still be sent by the send-scheduled
    // cron. Also delete the local draft so it is fully cancelled. The list keys
    // rows by the Graph message ID, so the DELETE endpoint resolves it via
    // graphDraftId. Best-effort; never blocks the optimistic UI.
    if (folder === "drafts") {
      void fetch(`/api/drafts/${encodeURIComponent(email.id)}`, { method: "DELETE" }).catch(() => {
        // non-critical — Graph copy is removed below; local row cleanup retried on next delete
      });
    }

    void fetch("/api/mail/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: email.id,
        homeAccountId: hid,
        ...(folder === "trash" ? { permanent: true } : {}),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`delete ${res.status}`);
        // Keep sidebar folder counts in sync (non-critical)
        void refreshFolderCounts(hid, setMailFolders);
      })
      .catch(() => {
        // Failure — restore the email back into all lists, sorted into place
        const restoreFn = (prev: EmailMessage[]) => {
          if (prev.some((e) => e.id === email.id)) return prev;
          return [...prev, email].sort(
            (a, b) => new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime()
          );
        };
        setEmails(restoreFn);
        setSearchResults((prev) => (prev ? restoreFn(prev) : prev));
        setActionError(
          folder === "trash"
            ? "Failed to permanently delete email. Please try again."
            : "Failed to delete email. Please try again."
        );
      });
  }, [activeAccount, folder, setMailFolders]);

  return (
    <div className="flex flex-1" style={{ overflow: "hidden" }}>
      <div className="flex flex-col w-full bg-white flex-shrink-0" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>{folderLabel}</h2>
          </div>

          {/* Reconnect banner */}
          {requiresReauth && activeAccount && (
            <div className="mb-3 px-4 py-3 rounded-[10px] border flex items-center justify-between gap-3" style={{ backgroundColor: "rgb(253 235 235)", borderColor: "rgb(220 180 180)" }}>
              <p className="text-xs" style={{ color: "rgb(83 5 5)" }}>
                This account&apos;s session expired. Reconnect to load emails.
              </p>
              <a href="/api/auth/microsoft?add=1" className="text-xs font-semibold flex-shrink-0 underline" style={{ color: "rgb(138 9 9)" }}>
                Reconnect
              </a>
            </div>
          )}

          {/* Delete error banner */}
          {actionError && (
            <div className="mb-3 px-4 py-3 rounded-[10px] border flex items-center justify-between gap-3" style={{ backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 216 216)" }}>
              <p className="text-xs" style={{ color: "rgb(138 9 9)" }}>{actionError}</p>
              <button onClick={() => setActionError(null)} className="text-xs font-semibold flex-shrink-0" style={{ color: "rgb(138 9 9)" }}>Dismiss</button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            {searching ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgb(155 155 155)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${folderLabel.toLowerCase()}…`}
              className="w-full pl-9 py-2 rounded-[10px] text-sm placeholder-neutral-400 focus:outline-none transition-colors border"
              style={{ paddingRight: search ? "2rem" : "1rem", backgroundColor: "rgb(245 245 245)", borderColor: "transparent", color: "rgb(58 58 58)" }}
              onFocus={(e) => { e.target.style.backgroundColor = "white"; e.target.style.borderColor = "rgb(218 100 100)"; }}
              onBlur={(e) => { e.target.style.backgroundColor = "rgb(245 245 245)"; e.target.style.borderColor = "transparent"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgb(155 155 155)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {search && searchResults && (
            <p className="mt-2 text-xs" style={{ color: "rgb(115 115 115)" }}>
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
          )}
          {/* Search error — Fix 6 */}
          {searchError && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs" style={{ color: "rgb(138 9 9)" }}>{searchError}</p>
              <button
                onClick={retrySearch}
                className="text-xs font-semibold underline"
                style={{ color: "rgb(138 9 9)" }}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Email rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 relative">
          {/* Fix 16: per-folder loading spinner — only show when this folder is loading */}
          {(loadingEmails && loadingFolderId === folder) && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: "rgba(255,255,255,0.80)" }}>
              <p className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>Loading…</p>
            </div>
          )}
          {displayEmails.length === 0 && !loadingEmails ? (
            <div className="flex flex-col items-center justify-center h-32 text-sm" style={{ color: "rgb(155 155 155)" }}>
              {search ? `No results for "${search}"` : `No emails in ${folderLabel.toLowerCase()}`}
            </div>
          ) : (
            displayEmails.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                // In Trash, the trash icon arms an inline confirm instead of
                // deleting immediately. Elsewhere it deletes (moves to trash) as before.
                onDelete={() => {
                  if (folder === "trash") setConfirmDeleteId(email.id);
                  else handleDelete(email);
                }}
                confirmDelete={folder === "trash" && confirmDeleteId === email.id}
                onConfirmDelete={() => { setConfirmDeleteId(null); handleDelete(email); }}
                onCancelDelete={() => setConfirmDeleteId(null)}
                deleteLabel={folder === "trash" ? "Delete permanently" : "Delete"}
                showRecipient={folder === "sent" || folder === "drafts"}
                onClick={() => {
                  if (folder === "drafts") {
                    navigateTo(`/compose?draftId=${encodeURIComponent(email.id)}`);
                    return;
                  }

                  if (!email.isRead) {
                    setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, isRead: true } : e));
                  }
                  navigateTo(`/inbox/${encodeURIComponent(email.id)}`);
                }}
              />
            ))
          )}
          {/* Infinite scroll sentinel + Load More button (Fix 15) */}
          {!search && <div ref={sentinelRef} className="h-1" />}
          {nextLink && !loadingMore && (
            <div className="flex justify-center py-3">
              <button
                onClick={() => { void loadMore(); }}
                className="text-xs font-semibold px-4 py-1.5 rounded-[8px] border"
                style={{ color: "rgb(138 9 9)", borderColor: "rgb(220 180 180)" }}
              >
                Load more
              </button>
            </div>
          )}
          {loadingMore && (
            <div className="flex justify-center py-3">
              <p className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>Loading more…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
