"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/lib/stores/account-store";
import { ReadingPane } from "@/components/shared/ReadingPane";
import AiReplyModal from "@/components/inbox/AiReplyModal";
import type { EmailMessage } from "@/lib/types/email";
import { formatDate, getInitials, getAvatarColor } from "@/lib/utils/email-helpers";

// ─── EmailRow ─────────────────────────────────────────────────────────────────

function EmailRow({
  email,
  selected,
  onClick,
  onAiReply,
  showRecipient = false,
}: {
  email: EmailMessage;
  selected: boolean;
  onClick: () => void;
  onAiReply: () => void;
  showRecipient?: boolean;
}) {
  const displayName = showRecipient
    ? (email.toRecipients?.[0]?.name || email.toRecipients?.[0]?.address || email.from.name)
    : email.from.name;
  const color = getAvatarColor(displayName);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors"
      style={{
        backgroundColor: selected ? "rgb(253 235 235)" : "transparent",
        borderLeft: selected ? "2px solid rgb(138 9 9)" : "2px solid transparent",
      }}
    >
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onAiReply(); }}
          className="absolute right-3 top-3 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[8px] z-10"
          style={{ backgroundColor: "rgb(138 9 9)", color: "white" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Reply
        </button>
      )}

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
  const [emails, setEmails] = useState<EmailMessage[]>(initialEmails);
  const [selectedId, setSelectedId] = useState<string | null>(initialEmails[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [nextLink, setNextLink] = useState<string | null>(initialNextLink);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<EmailMessage[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [aiReplyEmail, setAiReplyEmail] = useState<EmailMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  const activeAccount = useAccountStore((s) => s.activeAccount);
  const firstRender = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Well-known folder names that exist on every account
  const SYSTEM_FOLDERS = new Set(["sent", "drafts", "trash", "starred"]);
  const isCustomFolder = !SYSTEM_FOLDERS.has(folder);

  // Account switch: reload system folders, redirect away from custom folders
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!activeAccount) return;
    // Custom folder IDs belong to a specific account — redirect to inbox on switch
    if (isCustomFolder) { router.push("/inbox"); return; }
    setLoadingEmails(true);
    setSelectedId(null);
    setNextLink(null);
    fetch(`/api/mail/folder?folder=${folder}&homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`)
      .then((r) => r.json())
      .then((data: { emails?: EmailMessage[]; nextLink?: string | null }) => {
        setEmails(data.emails ?? []);
        setSelectedId(data.emails?.[0]?.id ?? null);
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

  // Reset reply on email change
  useEffect(() => { setReplyText(""); }, [selectedId]);

  const displayEmails = searchResults ?? emails;
  const selectedEmail = displayEmails.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex flex-1" style={{ overflow: "hidden" }}>
      {/* Email List */}
      <div className="flex flex-col w-full lg:w-80 xl:w-96 bg-white border-r border-neutral-200 flex-shrink-0" style={{ height: "100vh", overflow: "hidden" }}>
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
                selected={selectedId === email.id}
                showRecipient={folder === "sent" || folder === "drafts"}
                onAiReply={() => setAiReplyEmail(email)}
                onClick={() => {
                  setSelectedId(email.id);
                  if (!email.isRead) {
                    setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, isRead: true } : e));
                    fetch("/api/mail/mark-read", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ messageId: email.id }),
                    }).catch(console.error);
                  }
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

      {/* Reading Pane */}
      <ReadingPane
        email={selectedEmail}
        replyText={replyText}
        setReplyText={setReplyText}
        emptyLabel={`Select an email from ${folderLabel.toLowerCase()}`}
        onMarkRead={(id) => setEmails((prev) => prev.map((e) => e.id === id ? { ...e, isRead: true } : e))}
      />

      {/* AI Reply Modal */}
      {aiReplyEmail && (
        <AiReplyModal
          email={aiReplyEmail}
          onClose={() => setAiReplyEmail(null)}
          onSelectOption={(body) => {
            setSelectedId(aiReplyEmail.id);
            setReplyText(body);
          }}
        />
      )}
    </div>
  );
}
