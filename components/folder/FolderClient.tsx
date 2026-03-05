"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/lib/stores/account-store";
import type { EmailMessage } from "@/lib/types/email";
import { formatDate, getInitials, getAvatarColor } from "@/lib/utils/email-helpers";

// ─── EmailRow ─────────────────────────────────────────────────────────────────

function EmailRow({
  email,
  onClick,
  showRecipient = false,
}: {
  email: EmailMessage;
  onClick: () => void;
  showRecipient?: boolean;
}) {
  const displayName = showRecipient
    ? (email.toRecipients?.[0]?.name || email.toRecipients?.[0]?.address || email.from.name)
    : email.from.name;
  const color = getAvatarColor(displayName);

  return (
    <div
      onClick={onClick}
      className="relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-neutral-50 border-l-2 border-transparent"
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
          <span className="text-xs flex-shrink-0" style={{ color: "rgb(155 155 155)" }}>
            {formatDate(email.receivedDateTime)}
          </span>
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
  const router = useRouter();
  const [emails, setEmails] = useState<EmailMessage[]>(initialEmails);
  const [search, setSearch] = useState("");
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [nextLink, setNextLink] = useState<string | null>(initialNextLink);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<EmailMessage[] | null>(null);
  const [searching, setSearching] = useState(false);

  const activeAccount = useAccountStore((s) => s.activeAccount);
  const firstRender = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Well-known folder names that exist on every account
  const SYSTEM_FOLDERS = new Set(["sent", "drafts", "trash", "starred"]);
  const isCustomFolder = !SYSTEM_FOLDERS.has(folder);

  // Account switch: reload system folders, redirect away from custom folders
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!activeAccount) return;
    if (isCustomFolder) { router.push("/inbox"); return; }
    setLoadingEmails(true);
    setNextLink(null);
    fetch(`/api/mail/folder?folder=${folder}&homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`)
      .then((r) => r.json())
      .then((data: { emails?: EmailMessage[]; nextLink?: string | null }) => {
        setEmails(data.emails ?? []);
        setNextLink(data.nextLink ?? null);
      })
      .catch(console.error)
      .finally(() => setLoadingEmails(false));
  }, [activeAccount?.homeAccountId]);

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (!nextLink || loadingMore || !activeAccount) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/mail/folder?folder=${folder}&homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&nextLink=${encodeURIComponent(nextLink)}`
      );
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

  // Debounced search
  useEffect(() => {
    const q = search.trim();
    if (!q) { setSearchResults(null); return; }
    if (!activeAccount) return;
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/mail/search?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&q=${encodeURIComponent(q)}&folder=${encodeURIComponent(folder)}`)
        .then((r) => r.json())
        .then((data: { emails: EmailMessage[] }) => setSearchResults(data.emails))
        .catch(console.error)
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeAccount?.homeAccountId]);

  const displayEmails = searchResults ?? emails;

  return (
    <div className="flex flex-1" style={{ overflow: "hidden" }}>
      <div className="flex flex-col w-full bg-white flex-shrink-0" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>{folderLabel}</h2>
          </div>

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
        </div>

        {/* Email rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 relative">
          {loadingEmails && (
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
                showRecipient={folder === "sent" || folder === "drafts"}
                onClick={() => {
                  if (!email.isRead) {
                    setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, isRead: true } : e));
                  }
                  router.push(`/inbox/${email.id}`);
                }}
              />
            ))
          )}
          {!search && <div ref={sentinelRef} className="h-1" />}
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
