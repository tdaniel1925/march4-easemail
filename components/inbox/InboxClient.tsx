"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/lib/stores/account-store";
import type { EmailMessage } from "@/lib/types/email";
import { formatDate, getInitials, getAvatarColor } from "@/lib/utils/email-helpers";
import { applyRules } from "@/lib/utils/rule-engine";
import type { SideEffect } from "@/lib/utils/rule-engine";
import type { Rule } from "@/lib/types/rules";
import AiReplyModal from "@/components/inbox/AiReplyModal";

// Re-export so existing imports from this file still work
export type { EmailMessage };

type FilterTab = "all" | "unread" | "starred" | "attachments";

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmailRow({
  email,
  onClick,
  onAiReply,
}: {
  email: EmailMessage;
  onClick: () => void;
  onAiReply: (e: React.MouseEvent) => void;
}) {
  const color = getAvatarColor(email.from.name);

  return (
    <div
      onClick={onClick}
      className="relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-neutral-50 border-l-2 border-transparent"
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {getInitials(email.from.name)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className="text-sm truncate"
            style={{
              fontWeight: email.isRead ? 500 : 700,
              color: email.isRead ? "rgb(82 82 82)" : "rgb(27 29 29)",
            }}
          >
            {email.from.name}
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
        <p
          className="text-sm truncate"
          style={{
            fontWeight: email.isRead ? 500 : 600,
            color: email.isRead ? "rgb(115 115 115)" : "rgb(38 38 38)",
          }}
        >
          {email.subject}
        </p>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: email.isRead ? "rgb(155 155 155)" : "rgb(115 115 115)" }}>
          {email.bodyPreview}
        </p>
      </div>

      {/* Right side: AI reply button (hover) + unread dot */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0 mt-0.5">
        <button
          onClick={onAiReply}
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[6px]"
          style={{ backgroundColor: "rgb(254 242 242)", color: "rgb(138 9 9)" }}
          title="AI Reply"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Reply
        </button>
        {!email.isRead && (
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgb(138 9 9)" }} />
        )}
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function InboxClient({
  initialEmails,
  initialNextLink,
}: {
  initialEmails: EmailMessage[];
  initialNextLink?: string | null;
}) {
  const router = useRouter();
  const [emails, setEmails] = useState<EmailMessage[]>(initialEmails);
  const [aiReplyEmail, setAiReplyEmail] = useState<EmailMessage | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [nextLink, setNextLink] = useState<string | null>(initialNextLink ?? null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<EmailMessage[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [tabEmails, setTabEmails] = useState<EmailMessage[] | null>(null);
  const [loadingTab, setLoadingTab] = useState(false);
  const [requiresReauth, setRequiresReauth] = useState(false);

  const activeAccount = useAccountStore((s) => s.activeAccount);
  const setInboxUnread = useAccountStore((s) => s.setInboxUnread);
  const firstRender = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<Rule[]>([]);

  // ── Rule engine helpers ──

  function fireSideEffects(ses: SideEffect[], mc: Map<string, number>) {
    if (ses.length) {
      void Promise.allSettled(
        ses.map((se) =>
          fetch("/api/rules/apply-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(se),
          })
        )
      );
    }
    mc.forEach((count, ruleId) => {
      void fetch(`/api/rules/${ruleId}/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
    });
  }

  function processWithRules(batch: EmailMessage[], hid: string): EmailMessage[] {
    if (!rulesRef.current.length) return batch;
    try {
      const { emails, sideEffects, matchCounts } = applyRules(batch, rulesRef.current, hid);
      fireSideEffects(sideEffects, matchCounts);
      return emails;
    } catch {
      return batch;
    }
  }

  // Load rules once on mount; apply to initial email batch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!activeAccount) return;
    const hid = activeAccount.homeAccountId;
    fetch("/api/rules")
      .then((r) => r.json() as Promise<Rule[]>)
      .then((data) => {
        rulesRef.current = data;
        if (!data.length) return;
        const { emails: processed, sideEffects, matchCounts } = applyRules(initialEmails, data, hid);
        setEmails(processed);
        fireSideEffects(sideEffects, matchCounts);
      })
      .catch(() => {}); // rules must never break the inbox
  }, []);

  // Keep sidebar unread badge in sync with local email state
  useEffect(() => {
    setInboxUnread(emails.filter((e) => !e.isRead).length);
  }, [emails, setInboxUnread]);

  // Account switch: reload from scratch
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!activeAccount) return;
    setRequiresReauth(false);
    setLoadingEmails(true);
    setNextLink(null);
    setTabEmails(null);
    fetch(`/api/mail/inbox?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`)
      .then(async (r) => {
        if (r.status === 401) {
          const body = await r.json() as { error: string };
          if (body.error === "account_requires_reauth") { setRequiresReauth(true); return null; }
        }
        if (!r.ok) throw new Error(`inbox ${r.status}`);
        return r.json() as Promise<{ emails: EmailMessage[]; nextLink: string | null }>;
      })
      .then((data) => {
        if (!data) return;
        setEmails(processWithRules(data.emails, activeAccount.homeAccountId));
        setNextLink(data.nextLink ?? null);
      })
      .catch(console.error)
      .finally(() => setLoadingEmails(false));
  }, [activeAccount?.homeAccountId]);

  // Tab switch: fetch from Graph for filtered tabs, use local list for "all"
  useEffect(() => {
    if (activeTab === "all") { setTabEmails(null); return; }
    if (!activeAccount) return;
    setLoadingTab(true);
    setTabEmails(null);
    fetch(`/api/mail/inbox?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&tab=${activeTab}`)
      .then((r) => { if (!r.ok) throw new Error(`inbox-tab ${r.status}`); return r.json(); })
      .then((data: { emails: EmailMessage[] }) => setTabEmails(data.emails))
      .catch(console.error)
      .finally(() => setLoadingTab(false));
  }, [activeTab, activeAccount?.homeAccountId]);

  // Infinite scroll: load next page
  const loadMore = useCallback(async () => {
    if (!nextLink || loadingMore || !activeAccount) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/mail/inbox?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&nextLink=${encodeURIComponent(nextLink)}`
      );
      const data: { emails: EmailMessage[]; nextLink: string | null } = await res.json();
      setEmails((prev) => [...prev, ...processWithRules(data.emails, activeAccount.homeAccountId)]);
      setNextLink(data.nextLink ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [nextLink, loadingMore, activeAccount]);

  // IntersectionObserver watches sentinel at bottom of list
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

  // Debounced search — hits Graph API after 400ms pause
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    if (!activeAccount) return;
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/mail/search?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data: { emails: EmailMessage[] }) => setSearchResults(data.emails))
        .catch(console.error)
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeAccount?.homeAccountId]);

  // "All" tab uses local emails (supports infinite scroll); other tabs use Graph-fetched results
  const baseEmails = activeTab === "all" ? emails : (tabEmails ?? []);

  // Search overrides everything
  const displayEmails = searchResults ?? baseEmails;

  const unreadCount = emails.filter((e) => !e.isRead).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "starred", label: "Starred" },
    { key: "attachments", label: "Attachments" },
  ];

  return (
    <>
    <div className="flex flex-1" style={{ overflow: "hidden" }}>
      {/* Email List — full width */}
      <div className="flex flex-col w-full bg-white flex-shrink-0" style={{ height: "100vh", overflow: "hidden" }}>
        {/* AI Compose Banner */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-b border-primary-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs font-semibold text-primary-700">AI-powered email, ready when you are</span>
          </div>
          <a
            href="/compose"
            className="flex items-center gap-1.5 ai-gradient-bg text-white text-xs font-semibold px-3 py-1.5 rounded-small transition-all compose-btn-glow flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Email
          </a>
        </div>

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>
              Inbox {unreadCount > 0 && <span className="ml-1 text-xs font-normal" style={{ color: "rgb(155 155 155)" }}>({unreadCount} unread)</span>}
            </h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-[10px] transition-colors" style={{ color: "rgb(155 155 155)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
              </button>
            </div>
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
              placeholder="Search all emails..."
              className="w-full pl-9 py-2 rounded-[10px] text-sm placeholder-neutral-400 focus:outline-none transition-colors border"
              style={{ paddingRight: search ? "2rem" : "1rem", backgroundColor: "rgb(245 245 245)", borderColor: "transparent", color: "rgb(58 58 58)" }}
              onFocus={(e) => { e.target.style.backgroundColor = "white"; e.target.style.borderColor = "rgb(218 100 100)"; }}
              onBlur={(e) => { e.target.style.backgroundColor = "rgb(245 245 245)"; e.target.style.borderColor = "transparent"; }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                style={{ color: "rgb(155 155 155)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter tabs — hidden during search */}
          {!search && (
            <div className="flex items-center gap-1 mt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="px-3 py-1 text-xs font-medium rounded-[10px] transition-colors"
                  style={{
                    backgroundColor: activeTab === tab.key ? "rgb(253 235 235)" : "transparent",
                    color: activeTab === tab.key ? "rgb(83 5 5)" : "rgb(115 115 115)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          {search && searchResults && (
            <p className="mt-2 text-xs" style={{ color: "rgb(115 115 115)" }}>
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
          )}
        </div>

        {/* Reconnect banner */}
        {requiresReauth && activeAccount && (
          <div className="mx-4 mt-3 px-4 py-3 rounded-[10px] border flex items-center justify-between gap-3" style={{ backgroundColor: "rgb(253 235 235)", borderColor: "rgb(220 180 180)" }}>
            <p className="text-xs" style={{ color: "rgb(83 5 5)" }}>
              This account&apos;s session expired. Reconnect to load emails.
            </p>
            <a
              href="/api/auth/microsoft?add=1"
              className="text-xs font-semibold flex-shrink-0 underline"
              style={{ color: "rgb(138 9 9)" }}
            >
              Reconnect
            </a>
          </div>
        )}

        {/* Email rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 relative">
          {(loadingEmails || loadingTab) && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: "rgba(255,255,255,0.80)" }}>
              <p className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>Loading…</p>
            </div>
          )}
          {displayEmails.length === 0 && !searching ? (
            <div className="flex flex-col items-center justify-center h-32 text-sm" style={{ color: "rgb(155 155 155)" }}>
              {search ? `No results for "${search}"` : "No emails found"}
            </div>
          ) : (
            displayEmails.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                onClick={() => {
                  if (!email.isRead) {
                    setEmails((prev) =>
                      prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
                    );
                  }
                  router.push(`/inbox/${email.id}`);
                }}
                onAiReply={(e) => { e.stopPropagation(); setAiReplyEmail(email); }}
              />
            ))
          )}

          {/* Infinite scroll sentinel — All tab only, not during search */}
          {!search && activeTab === "all" && <div ref={sentinelRef} className="h-1" />}
          {loadingMore && (
            <div className="flex justify-center py-3">
              <p className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>Loading more…</p>
            </div>
          )}
        </div>
      </div>

    </div>

    {aiReplyEmail && (
      <AiReplyModal
        email={aiReplyEmail}
        onClose={() => setAiReplyEmail(null)}
        onSelectOption={(body) => {
          sessionStorage.setItem(`ai-reply-${aiReplyEmail.id}`, body);
          router.push(`/inbox/${aiReplyEmail.id}`);
          setAiReplyEmail(null);
        }}
      />
    )}
    </>
  );
}
