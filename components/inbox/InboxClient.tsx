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
import EventFormModal from "@/components/calendar/EventFormModal";

// Re-export so existing imports from this file still work
export type { EmailMessage };

type FilterTab = "all" | "unread" | "starred" | "attachments" | "label";

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmailRow({
  email,
  onClick,
  onAiReply,
  onStar,
  bulkMode = false,
  isSelected = false,
  onToggleSelect,
}: {
  email: EmailMessage;
  onClick: () => void;
  onAiReply: (e: React.MouseEvent) => void;
  onStar: (e: React.MouseEvent) => void;
  bulkMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (e: React.MouseEvent) => void;
}) {
  const color = getAvatarColor(email.from.name);
  const isStarred = email.flag?.flagStatus === "flagged";
  const threadCount = (email as EmailMessage & { __threadCount?: number }).__threadCount;

  return (
    <div
      onClick={onClick}
      className="relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-neutral-50 border-l-2 border-transparent"
    >
      {/* Bulk mode checkbox */}
      {bulkMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect?.(e as any);
          }}
          className="w-4 h-4 rounded border-neutral-300 flex-shrink-0 mt-2.5 cursor-pointer"
          style={{ accentColor: "rgb(138 9 9)" }}
        />
      )}

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
          className="text-sm truncate flex items-center gap-2"
          style={{
            fontWeight: email.isRead ? 500 : 600,
            color: email.isRead ? "rgb(115 115 115)" : "rgb(38 38 38)",
          }}
        >
          {email.subject}
          {threadCount && threadCount > 1 && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgb(254 242 242)", color: "rgb(138 9 9)" }}>
              {threadCount}
            </span>
          )}
        </p>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: email.isRead ? "rgb(155 155 155)" : "rgb(115 115 115)" }}>
          {email.bodyPreview}
        </p>
      </div>

      {/* Right side: Star button + AI reply button + unread dot */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0 mt-0.5">
        <button
          onClick={onStar}
          className="p-1 rounded hover:bg-neutral-100 transition-colors"
          title={isStarred ? "Unstar" : "Star"}
        >
          {isStarred ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: "rgb(234 179 8)" }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: "rgb(155 155 155)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </button>
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
  const [showEventForm, setShowEventForm] = useState(false);
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

  const [pendingNewEmails, setPendingNewEmails] = useState<EmailMessage[]>([]);

  // ── Conversation view ──
  const [conversationView, setConversationView] = useState(false);

  // ── Bulk selection ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // ── Undo functionality ──
  const [undoStack, setUndoStack] = useState<Array<{
    action: string;
    emails: EmailMessage[];
    timestamp: number;
  }>>([]);

  // ── Advanced search filters ──
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: "all" as "all" | "today" | "week" | "month",
    hasAttachments: false,
    isUnread: false,
    sender: "",
  });

  const activeAccount = useAccountStore((s) => s.activeAccount);
  const accounts = useAccountStore((s) => s.accounts);
  const setInboxUnread = useAccountStore((s) => s.setInboxUnread);
  const activeLabel = useAccountStore((s) => s.activeLabel);
  const firstRender = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<Rule[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set(initialEmails.map((e) => e.id)));

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

  // ── Star toggle handler ──

  const handleStarToggle = useCallback((email: EmailMessage) => {
    if (!activeAccount) return;

    const newFlagStatus = email.flag?.flagStatus === "flagged" ? "notFlagged" : "flagged";

    // Optimistically update UI
    setEmails((prev) =>
      prev.map((e) =>
        e.id === email.id
          ? { ...e, flag: { flagStatus: newFlagStatus as "flagged" | "notFlagged" } }
          : e
      )
    );

    // Update via API (will also update cache)
    void fetch("/api/mail/star", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: email.id,
        homeAccountId: activeAccount.homeAccountId,
        flagged: newFlagStatus === "flagged",
      }),
    }).catch((err) => {
      console.error("Failed to update star:", err);
      // Revert on error
      setEmails((prev) =>
        prev.map((e) =>
          e.id === email.id
            ? { ...e, flag: email.flag }
            : e
        )
      );
    });
  }, [activeAccount]);

  // ── Bulk selection handlers ──
  // Note: toggleSelectAll defined later after displayEmails is computed

  const toggleSelect = useCallback((emailId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) {
        next.delete(emailId);
      } else {
        next.add(emailId);
      }
      return next;
    });
  }, []);

  const bulkDelete = useCallback(() => {
    if (!activeAccount || selectedIds.size === 0) return;

    const selectedEmails = emails.filter((e) => selectedIds.has(e.id));

    // Add to undo stack
    setUndoStack((prev) => [...prev, {
      action: "delete",
      emails: selectedEmails,
      timestamp: Date.now(),
    }]);

    // Remove from UI
    setEmails((prev) => prev.filter((e) => !selectedIds.has(e.id)));

    // Delete via API
    selectedIds.forEach((id) => {
      void fetch("/api/mail/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: id,
          homeAccountId: activeAccount.homeAccountId,
        }),
      });
    });

    setSelectedIds(new Set());
    setBulkMode(false);
  }, [activeAccount, selectedIds, emails]);

  const bulkArchive = useCallback(() => {
    if (!activeAccount || selectedIds.size === 0) return;

    const selectedEmails = emails.filter((e) => selectedIds.has(e.id));

    // Add to undo stack
    setUndoStack((prev) => [...prev, {
      action: "archive",
      emails: selectedEmails,
      timestamp: Date.now(),
    }]);

    // Remove from UI
    setEmails((prev) => prev.filter((e) => !selectedIds.has(e.id)));

    // Archive via API
    selectedIds.forEach((id) => {
      void fetch("/api/mail/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: id,
          homeAccountId: activeAccount.homeAccountId,
        }),
      });
    });

    setSelectedIds(new Set());
    setBulkMode(false);
  }, [activeAccount, selectedIds, emails]);

  const bulkMarkRead = useCallback(() => {
    if (!activeAccount || selectedIds.size === 0) return;

    // Update UI
    setEmails((prev) =>
      prev.map((e) =>
        selectedIds.has(e.id) ? { ...e, isRead: true } : e
      )
    );

    // Update via API
    selectedIds.forEach((id) => {
      void fetch("/api/mail/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: id,
          homeAccountId: activeAccount.homeAccountId,
          isRead: true,
        }),
      });
    });

    setSelectedIds(new Set());
    setBulkMode(false);
  }, [activeAccount, selectedIds]);

  // ── Undo handler ──

  const handleUndo = useCallback(() => {
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction) return;

    // Restore emails to UI
    setEmails((prev) => {
      const restored = [...prev, ...lastAction.emails];
      return restored.sort((a, b) =>
        new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime()
      );
    });

    // Remove from undo stack
    setUndoStack((prev) => prev.slice(0, -1));
  }, [undoStack]);

  // Auto-expire undo after 10 seconds
  useEffect(() => {
    if (undoStack.length === 0) return;
    const timer = setTimeout(() => {
      setUndoStack((prev) =>
        prev.filter((item) => Date.now() - item.timestamp < 10000)
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [undoStack]);

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
          const body = await r.json().catch(() => ({} as { error?: string })) as { error?: string };
          if (body.error === "Unauthorized") { window.location.href = "/login"; return null; }
          setRequiresReauth(true); return null;
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

  // Label change from sidebar: switch to label tab
  useEffect(() => {
    if (activeLabel) {
      setActiveTab("label");
    } else if (activeTab === "label") {
      setActiveTab("all");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLabel]);

  // Tab switch: fetch from Graph for filtered tabs, use local list for "all"
  useEffect(() => {
    if (activeTab === "all") { setTabEmails(null); return; }
    if (!activeAccount) return;
    setLoadingTab(true);
    setTabEmails(null);
    const url = activeTab === "label" && activeLabel
      ? `/api/mail/inbox?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&tab=label&label=${encodeURIComponent(activeLabel)}`
      : `/api/mail/inbox?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}&tab=${activeTab}`;
    fetch(url)
      .then(async (r) => {
        if (r.status === 401) {
          const body = await r.json().catch(() => ({} as { error?: string })) as { error?: string };
          if (body.error === "Unauthorized") { window.location.href = "/login"; return null; }
          setRequiresReauth(true); return null;
        }
        if (!r.ok) throw new Error(`inbox-tab ${r.status}`);
        return r.json() as Promise<{ emails: EmailMessage[] }>;
      })
      .then((data) => { if (data) setTabEmails(data.emails); })
      .catch(console.error)
      .finally(() => setLoadingTab(false));
  }, [activeTab, activeAccount?.homeAccountId, activeLabel]);

  // Keep knownIds in sync as emails are added
  useEffect(() => {
    emails.forEach((e) => knownIdsRef.current.add(e.id));
  }, [emails]);

  // Poll every 30s for new emails across ALL connected accounts
  useEffect(() => {
    if (!activeAccount || accounts.length === 0) return;
    const poll = async () => {
      if (document.hidden || activeTab !== "all" || search) return;
      try {
        const results = await Promise.allSettled(
          accounts.map((acc) =>
            fetch(`/api/mail/inbox?homeAccountId=${encodeURIComponent(acc.homeAccountId)}`)
              .then((r) => r.ok ? r.json() as Promise<{ emails: EmailMessage[] }> : Promise.reject())
              .then((data) => data.emails)
          )
        );
        const allFresh: EmailMessage[] = [];
        results.forEach((r) => {
          if (r.status === "fulfilled") {
            allFresh.push(...r.value.filter((e) => !knownIdsRef.current.has(e.id)));
          }
        });
        if (allFresh.length > 0) {
          setPendingNewEmails((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            return [...allFresh.filter((e) => !existingIds.has(e.id)), ...prev];
          });
        }
      } catch {
        // fail silently — inbox still works
      }
    };
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [activeAccount?.homeAccountId, accounts.length, activeTab, search]);

  // Clear pending banner when account switches
  useEffect(() => {
    setPendingNewEmails([]);
    knownIdsRef.current = new Set(emails.map((e) => e.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.homeAccountId]);

  function showNewEmails() {
    pendingNewEmails.forEach((e) => knownIdsRef.current.add(e.id));
    setEmails((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const toAdd = pendingNewEmails.filter((e) => !existingIds.has(e.id));
      return [...toAdd, ...prev];
    });
    setPendingNewEmails([]);
  }

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
        .then(async (r) => {
          if (r.status === 401) {
            const body = await r.json().catch(() => ({} as { error?: string })) as { error?: string };
            if (body.error === "Unauthorized") { window.location.href = "/login"; return null; }
            setRequiresReauth(true); return null;
          }
          return r.json() as Promise<{ emails: EmailMessage[] }>;
        })
        .then((data) => { if (data) setSearchResults(data.emails); })
        .catch(console.error)
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeAccount?.homeAccountId]);

  // "All" tab uses local emails (supports infinite scroll); other tabs use Graph-fetched results
  let baseEmails = activeTab === "all" ? emails : (tabEmails ?? []);

  // Client-side filter for starred tab (until API supports it)
  if (activeTab === "starred" && !tabEmails) {
    baseEmails = emails.filter((e) => e.flag?.flagStatus === "flagged");
  }

  // Search overrides everything
  let displayEmails = searchResults ?? baseEmails;

  // ── Apply advanced filters ──
  if (filters.dateRange !== "all" || filters.hasAttachments || filters.isUnread || filters.sender) {
    displayEmails = displayEmails.filter((email) => {
      // Date range filter
      if (filters.dateRange !== "all") {
        const emailDate = new Date(email.receivedDateTime);
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (filters.dateRange === "today" && emailDate < dayStart) return false;

        if (filters.dateRange === "week") {
          const weekAgo = new Date(dayStart);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (emailDate < weekAgo) return false;
        }

        if (filters.dateRange === "month") {
          const monthAgo = new Date(dayStart);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (emailDate < monthAgo) return false;
        }
      }

      // Has attachments filter
      if (filters.hasAttachments && !email.hasAttachments) return false;

      // Unread filter
      if (filters.isUnread && email.isRead) return false;

      // Sender filter
      if (filters.sender) {
        const senderLower = filters.sender.toLowerCase();
        const fromAddress = (email.from as any).address || (email.from as any).email || "";
        if (!fromAddress.toLowerCase().includes(senderLower) && !email.from.name.toLowerCase().includes(senderLower)) {
          return false;
        }
      }

      return true;
    });
  }

  // ── Conversation grouping ──
  if (conversationView && !search) {
    const conversations = new Map<string, EmailMessage[]>();
    displayEmails.forEach((email) => {
      const convId = (email as any).conversationId || email.id;
      if (!conversations.has(convId)) {
        conversations.set(convId, []);
      }
      conversations.get(convId)!.push(email);
    });

    // Show only the latest email from each conversation
    displayEmails = Array.from(conversations.values()).map((thread) => {
      const latest = thread.sort((a, b) =>
        new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime()
      )[0];
      // Add thread count property
      return { ...latest, __threadCount: thread.length } as EmailMessage & { __threadCount?: number };
    });
  }

  // ── Toggle select all (defined here after displayEmails is computed) ──
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === displayEmails.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayEmails.map((e) => e.id)));
    }
  }, [selectedIds.size, displayEmails]);

  const unreadCount = emails.filter((e) => !e.isRead).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "starred", label: "Starred" },
    { key: "attachments", label: "Attachments" },
    ...(activeLabel ? [{ key: "label" as FilterTab, label: activeLabel }] : []),
  ];

  return (
    <>
    <div className="flex flex-1" style={{ overflow: "hidden" }}>
      {/* Email List — full width */}
      <div className="flex flex-col w-full bg-white flex-shrink-0" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Action Banner */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-b border-primary-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs font-semibold text-primary-700">AI-powered email, ready when you are</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/compose"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-small transition-all flex-shrink-0"
              style={{ background: "rgb(254 242 242)", color: "rgb(138 9 9)", border: "1px solid rgb(220 38 38)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Email
            </a>
            <button
              onClick={() => setShowEventForm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-small transition-all flex-shrink-0"
              style={{ background: "rgb(254 242 242)", color: "rgb(138 9 9)", border: "1px solid rgb(220 38 38)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Create Event
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>
              Inbox {unreadCount > 0 && <span className="ml-1 text-xs font-normal" style={{ color: "rgb(155 155 155)" }}>({unreadCount} unread)</span>}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConversationView(!conversationView)}
                className="p-1.5 rounded-[10px] transition-colors"
                style={{ color: conversationView ? "rgb(138 9 9)" : "rgb(155 155 155)", backgroundColor: conversationView ? "rgb(254 242 242)" : "transparent" }}
                title={conversationView ? "Disable conversation view" : "Enable conversation view"}
                onMouseEnter={(e) => { if (!conversationView) { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; } }}
                onMouseLeave={(e) => { if (!conversationView) { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </button>
              <button
                onClick={() => { setBulkMode(!bulkMode); if (bulkMode) setSelectedIds(new Set()); }}
                className="p-1.5 rounded-[10px] transition-colors"
                style={{ color: bulkMode ? "rgb(138 9 9)" : "rgb(155 155 155)", backgroundColor: bulkMode ? "rgb(254 242 242)" : "transparent" }}
                title={bulkMode ? "Exit bulk mode" : "Enter bulk mode"}
                onMouseEnter={(e) => { if (!bulkMode) { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; } }}
                onMouseLeave={(e) => { if (!bulkMode) { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-[10px] transition-colors flex-shrink-0"
                style={{ color: showFilters ? "rgb(138 9 9)" : "rgb(155 155 155)", backgroundColor: showFilters ? "rgb(254 242 242)" : "rgb(245 245 245)" }}
                title="Filter emails"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>

            {/* Advanced filters */}
            {showFilters && (
              <div className="p-3 rounded-[10px] space-y-2" style={{ backgroundColor: "rgb(245 245 245)" }}>
                <div className="grid grid-cols-2 gap-2">
                  {/* Date range filter */}
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "rgb(82 82 82)" }}>Date Range</label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-[6px] text-xs border focus:outline-none"
                      style={{ backgroundColor: "white", borderColor: "rgb(218 100 100)", color: "rgb(58 58 58)" }}
                    >
                      <option value="all">All time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 days</option>
                      <option value="month">Last 30 days</option>
                    </select>
                  </div>

                  {/* Sender filter */}
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "rgb(82 82 82)" }}>From</label>
                    <input
                      type="text"
                      value={filters.sender}
                      onChange={(e) => setFilters({ ...filters, sender: e.target.value })}
                      placeholder="Filter by sender..."
                      className="w-full px-2 py-1.5 rounded-[6px] text-xs border focus:outline-none"
                      style={{ backgroundColor: "white", borderColor: "rgb(218 100 100)", color: "rgb(58 58 58)" }}
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "rgb(82 82 82)" }}>
                    <input
                      type="checkbox"
                      checked={filters.hasAttachments}
                      onChange={(e) => setFilters({ ...filters, hasAttachments: e.target.checked })}
                      className="w-3.5 h-3.5 rounded"
                      style={{ accentColor: "rgb(138 9 9)" }}
                    />
                    Has attachments
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "rgb(82 82 82)" }}>
                    <input
                      type="checkbox"
                      checked={filters.isUnread}
                      onChange={(e) => setFilters({ ...filters, isUnread: e.target.checked })}
                      className="w-3.5 h-3.5 rounded"
                      style={{ accentColor: "rgb(138 9 9)" }}
                    />
                    Unread only
                  </label>
                </div>

                {/* Clear filters button */}
                <button
                  onClick={() => setFilters({ dateRange: "all", hasAttachments: false, isUnread: false, sender: "" })}
                  className="text-xs font-medium underline"
                  style={{ color: "rgb(138 9 9)" }}
                >
                  Clear all filters
                </button>
              </div>
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

        {/* New emails banner */}
        {pendingNewEmails.length > 0 && (
          <button
            onClick={showNewEmails}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold flex-shrink-0 transition-colors"
            style={{ backgroundColor: "rgb(138 9 9)", color: "white" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {pendingNewEmails.length} new email{pendingNewEmails.length !== 1 ? "s" : ""} — tap to show
          </button>
        )}

        {/* Bulk action toolbar */}
        {bulkMode && selectedIds.size > 0 && (
          <div className="px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between gap-3" style={{ backgroundColor: "rgb(254 242 242)" }}>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size === displayEmails.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-neutral-300 cursor-pointer"
                style={{ accentColor: "rgb(138 9 9)" }}
              />
              <span className="text-xs font-semibold" style={{ color: "rgb(138 9 9)" }}>
                {selectedIds.size} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={bulkMarkRead}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-[6px] transition-colors"
                style={{ backgroundColor: "white", color: "rgb(138 9 9)", border: "1px solid rgb(220 38 38)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
                Mark Read
              </button>
              <button
                onClick={bulkArchive}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-[6px] transition-colors"
                style={{ backgroundColor: "white", color: "rgb(138 9 9)", border: "1px solid rgb(220 38 38)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Archive
              </button>
              <button
                onClick={bulkDelete}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-[6px] transition-colors"
                style={{ backgroundColor: "rgb(138 9 9)", color: "white" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Undo notification banner */}
        {undoStack.length > 0 && (
          <div className="px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between gap-3" style={{ backgroundColor: "rgb(253 235 235)" }}>
            <span className="text-xs" style={{ color: "rgb(83 5 5)" }}>
              {undoStack[undoStack.length - 1].action === "delete" ? "Deleted" : undoStack[undoStack.length - 1].action === "archive" ? "Archived" : "Modified"} {undoStack[undoStack.length - 1].emails.length} email{undoStack[undoStack.length - 1].emails.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={handleUndo}
              className="text-xs font-semibold underline"
              style={{ color: "rgb(138 9 9)" }}
            >
              Undo
            </button>
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
                  if (bulkMode) return; // Don't navigate in bulk mode
                  if (!email.isRead) {
                    setEmails((prev) =>
                      prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
                    );
                  }
                  router.push(`/inbox/${email.id}`);
                }}
                onAiReply={(e) => { e.stopPropagation(); setAiReplyEmail(email); }}
                onStar={(e) => { e.stopPropagation(); handleStarToggle(email); }}
                bulkMode={bulkMode}
                isSelected={selectedIds.has(email.id)}
                onToggleSelect={(e) => { e.stopPropagation(); toggleSelect(email.id); }}
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
        onSelectOption={async (body) => {
          // FIX: Save AI reply to database instead of sessionStorage
          try {
            await fetch("/api/ai-replies", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messageId: aiReplyEmail.id,
                generatedBody: body,
              }),
            });
          } catch (err) {
            console.error("Failed to save AI reply:", err);
            // Continue anyway - user can still compose manually
          }
          router.push(`/compose?mode=reply&messageId=${aiReplyEmail.id}`);
          setAiReplyEmail(null);
        }}
      />
    )}

    {showEventForm && (
      <EventFormModal
        onClose={() => setShowEventForm(false)}
        onSaved={() => setShowEventForm(false)}
      />
    )}
    </>
  );
}
