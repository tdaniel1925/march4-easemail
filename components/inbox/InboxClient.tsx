"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/lib/stores/account-store";
import { useDataCacheStore, pathToView } from "@/lib/stores/data-cache";
import type { EmailMessage } from "@/lib/types/email";
import { formatDate, getInitials, getAvatarColor } from "@/lib/utils/email-helpers";
import { applyRules } from "@/lib/utils/rule-engine";
import type { SideEffect } from "@/lib/utils/rule-engine";
import type { Rule } from "@/lib/types/rules";
import AiReplyModal from "@/components/inbox/AiReplyModal";
import EventFormModal from "@/components/calendar/EventFormModal";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import SnoozePicker from "@/components/SnoozePicker";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Re-export so existing imports from this file still work
export type { EmailMessage };

type FilterTab = "all" | "unread" | "starred" | "attachments" | "label" | "labeled";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SensitivityBadge({ label }: { label: string | null | undefined }) {
  if (!label) return null;
  const config: Record<string, { text: string; bg: string; color: string }> = {
    "attorney-client-privilege": { text: "A-C Privilege", bg: "rgb(254 226 226)", color: "rgb(153 27 27)" },
    "confidential": { text: "Confidential", bg: "rgb(255 237 213)", color: "rgb(154 52 18)" },
    "work-product": { text: "Work Product", bg: "rgb(219 234 254)", color: "rgb(30 64 175)" },
  };
  const c = config[label];
  if (!c) return null;
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm flex-shrink-0"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.text}
    </span>
  );
}

function PinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 3a1 1 0 0 1 .707.293l4 4a1 1 0 0 1-.464 1.68l-2.243.45-3.5 3.5.5 3.5a1 1 0 0 1-1.707.707L10 13.836l-5.293 5.293a1 1 0 0 1-1.414-1.414L8.586 12.4l-3.293-3.293A1 1 0 0 1 6 7.4l3.5.5 3.5-3.5.449-2.243A1 1 0 0 1 14.68 1.7L16 3z" />
    </svg>
  );
}

function EmailRow({
  email,
  onClick,
  onAiReply,
  onStar,
  onPin,
  onSnooze,
  onArchive,
  onDelete,
  onMarkUnread,
  bulkMode = false,
  isSelected = false,
  isActive = false,
  isKeyboardSelected = false,
  onToggleSelect,
  priority = null,
}: {
  email: EmailMessage;
  onClick: () => void;
  onAiReply: (e: React.MouseEvent) => void;
  onStar: (e: React.MouseEvent) => void;
  onPin?: (e: React.MouseEvent) => void;
  onSnooze?: (e: React.MouseEvent) => void;
  onArchive?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onMarkUnread?: (e: React.MouseEvent) => void;
  bulkMode?: boolean;
  isSelected?: boolean;
  isActive?: boolean;
  isKeyboardSelected?: boolean;
  onToggleSelect?: (e: React.MouseEvent) => void;
  priority?: { priority: "urgent" | "normal" | "low"; reason: string } | null;
}) {
  const [hovered, setHovered] = React.useState(false);
  const color = getAvatarColor(email.from.name);
  const isStarred = email.flag?.flagStatus === "flagged";
  const threadCount = (email as EmailMessage & { __threadCount?: number }).__threadCount;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-neutral-50"
      style={{
        borderLeft: isActive ? "3px solid rgb(138 9 9)" : isKeyboardSelected ? "3px solid rgb(59 130 246)" : priority?.priority === "urgent" ? "2px solid rgb(239 68 68)" : "3px solid transparent",
        backgroundColor: isActive ? "rgb(254 242 242)" : isKeyboardSelected ? "rgb(239 246 255)" : undefined,
        opacity: priority?.priority === "low" ? 0.65 : 1,
      }}
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

      {/* AI Priority dot */}
      {priority && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-3 -mr-1"
          title={priority.reason}
          style={{
            backgroundColor:
              priority.priority === "urgent" ? "rgb(239 68 68)" :
              priority.priority === "low" ? "rgb(212 212 212)" :
              "rgb(156 163 175)",
          }}
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
          {email.isPinned && (
            <span className="flex-shrink-0" style={{ color: "rgb(138 9 9)" }}>
              <PinIcon className="w-3 h-3" />
            </span>
          )}
          {email.subject}
          {threadCount && threadCount > 1 && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgb(254 242 242)", color: "rgb(138 9 9)" }}>
              {threadCount}
            </span>
          )}
          <SensitivityBadge label={email.sensitivityLabel} />
        </p>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: email.isRead ? "rgb(155 155 155)" : "rgb(115 115 115)" }}>
          {email.bodyPreview}
        </p>
      </div>

      {/* Right side: Star + unread dot (hidden when hover actions visible) */}
      {!hovered && (
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
          {!email.isRead && (
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgb(138 9 9)" }} />
          )}
        </div>
      )}

      {/* Hover action bar — Feature 10 */}
      {hovered && (
        <div
          className="flex items-center gap-1 flex-shrink-0 mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onStar}
            title={isStarred ? "Unstar" : "Star"}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-400 transition-colors"
            style={{ color: isStarred ? "rgb(234 179 8)" : "rgb(115 115 115)" }}
          >
            {isStarred ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            )}
          </button>
          <button
            onClick={onPin}
            title={email.isPinned ? "Unpin" : "Pin"}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-400 transition-colors"
            style={{ color: email.isPinned ? "rgb(138 9 9)" : "rgb(115 115 115)" }}
          >
            <PinIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onArchive}
            title="Archive"
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-400 transition-colors"
            style={{ color: "rgb(115 115 115)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </button>
          <button
            onClick={onSnooze}
            title="Snooze"
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-400 transition-colors"
            style={{ color: "rgb(115 115 115)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-neutral-200 bg-white hover:border-red-300 transition-colors"
            style={{ color: "rgb(115 115 115)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <button
            onClick={onMarkUnread}
            title="Mark unread"
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-400 transition-colors"
            style={{ color: "rgb(115 115 115)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function InboxClient({
  initialEmails,
  initialNextLink,
  totalUnread,
}: {
  initialEmails: EmailMessage[];
  initialNextLink?: string | null;
  totalUnread?: number;
}) {
  const router = useRouter();

  /** SPA-aware navigation — updates store + pushState instead of server round-trip */
  function navigateTo(href: string) {
    const { view, folderId, emailId } = pathToView(href.split("?")[0]);
    useDataCacheStore.getState().setActiveView(view);
    if (folderId) useDataCacheStore.getState().setActiveFolderId(folderId);
    if (view === "email-read" && emailId) {
      useDataCacheStore.getState().setActiveEmail(emailId);
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

  // Sync when AppShell prepends new emails via polling.
  // Only prepend emails whose IDs don't exist in current list.
  // Use a ref to track the last seen initialEmails reference so we
  // don't re-run on account switch (which replaces the whole list).
  const lastInitialRef = useRef(initialEmails);
  useEffect(() => {
    // Skip on first render — emails already initialised via useState above
    if (initialEmails === lastInitialRef.current) return;
    lastInitialRef.current = initialEmails;
    if (initialEmails.length === 0) return;
    setEmails((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const fresh = initialEmails.filter((e) => !existingIds.has(e.id));
      // Only prepend — never replace. If fresh === all of initialEmails it's
      // an account-switch full-replace, not a polling prepend — skip it.
      if (fresh.length === 0 || fresh.length === initialEmails.length) return prev;
      return [...fresh, ...prev];
    });
  }, [initialEmails]);

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
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Inline email expansion
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [expandedBody, setExpandedBody] = useState<{ content: string; contentType: "html" | "text" } | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<{
    to: { name: string; address: string }[];
    cc: { name: string; address: string }[];
    attachments: { id: string; name: string; size: number; contentType: string }[];
  } | null>(null);

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

  // ── Keyboard shortcuts ──
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // ── Snooze ──
  const [snoozeEmail, setSnoozeEmail] = useState<EmailMessage | null>(null);
  const [snoozeError, setSnoozeError] = useState<string | null>(null);

  // ── Split pane ──
  const [readingPane, setReadingPane] = useState<"list" | "split">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("easemail:readingPane") as "list" | "split") ?? "list";
    }
    return "list";
  });
  const [splitPaneEmailId, setSplitPaneEmailId] = useState<string | null>(null);
  const [splitPaneBody, setSplitPaneBody] = useState<{ content: string; contentType: "html" | "text" } | null>(null);
  const [splitPaneLoading, setSplitPaneLoading] = useState(false);
  const [splitPaneDetails, setSplitPaneDetails] = useState<{
    to: { name: string; address: string }[];
    cc: { name: string; address: string }[];
    attachments: { id: string; name: string; size: number; contentType: string }[];
  } | null>(null);

  // ── AI Priority ──
  const [emailPriorities, setEmailPriorities] = useState<Record<string, { priority: "urgent" | "normal" | "low"; reason: string }>>({});
  const [aiPriorityEnabled, setAiPriorityEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("easemail:aiPriority") === "true";
    }
    return false;
  });

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
  const selectedEmailIndex = useDataCacheStore((s) => s.selectedEmailIndex);
  const setSelectedEmailIndex = useDataCacheStore((s) => s.setSelectedEmailIndex);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<Rule[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set(initialEmails.map((e) => e.id)));

  // Pending actions for delayed undo (C5 fix) — actions fire after 10s unless undone
  const pendingActionsRef = useRef<Map<number, { timer: ReturnType<typeof setTimeout>; action: () => void }>>(new Map());

  const scheduleAction = useCallback((key: number, action: () => void) => {
    const timer = setTimeout(() => {
      action();
      pendingActionsRef.current.delete(key);
    }, 10_000);
    pendingActionsRef.current.set(key, { timer, action });
  }, []);

  // Flush all pending actions on unmount (so navigation doesn't lose deletes)
  useEffect(() => {
    return () => {
      pendingActionsRef.current.forEach(({ timer, action }) => {
        clearTimeout(timer);
        action();
      });
      pendingActionsRef.current.clear();
    };
  }, []);

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

  // ── Pin toggle handler ──

  const handlePinToggle = useCallback((email: EmailMessage) => {
    if (!activeAccount) return;
    const newPinned = !email.isPinned;

    // Optimistically update UI
    setEmails((prev) =>
      prev.map((e) =>
        e.id === email.id ? { ...e, isPinned: newPinned } : e
      )
    );

    void fetch("/api/mail/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: email.id,
        homeAccountId: activeAccount.homeAccountId,
        pinned: newPinned,
      }),
    }).catch(() => {
      // Revert on error
      setEmails((prev) =>
        prev.map((e) =>
          e.id === email.id ? { ...e, isPinned: email.isPinned } : e
        )
      );
    });
  }, [activeAccount]);

  // ── Single email quick actions (for hover + keyboard shortcuts) ──

  const handleArchiveEmail = useCallback((email: EmailMessage) => {
    if (!activeAccount) return;
    const ts = Date.now();
    setUndoStack((prev) => [...prev, { action: "archive", emails: [email], timestamp: ts }]);
    setEmails((prev) => prev.filter((e) => e.id !== email.id));
    scheduleAction(ts, () => {
      void fetch("/api/mail/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", messageIds: [email.id], homeAccountId: activeAccount.homeAccountId }),
      });
    });
  }, [activeAccount, scheduleAction]);

  const handleDeleteEmail = useCallback((email: EmailMessage) => {
    if (!activeAccount) return;
    const ts = Date.now();
    setUndoStack((prev) => [...prev, { action: "delete", emails: [email], timestamp: ts }]);
    setEmails((prev) => prev.filter((e) => e.id !== email.id));
    scheduleAction(ts, () => {
      void fetch("/api/mail/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", messageIds: [email.id], homeAccountId: activeAccount.homeAccountId }),
      });
    });
  }, [activeAccount, scheduleAction]);

  const handleMarkUnread = useCallback((email: EmailMessage) => {
    if (!activeAccount) return;
    setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, isRead: false } : e));
    void fetch("/api/mail/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: email.id, homeAccountId: activeAccount.homeAccountId, isRead: false }),
    }).catch(() => {
      setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, isRead: true } : e));
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
    const ts = Date.now();
    const idsToDelete = [...selectedIds];
    const hid = activeAccount.homeAccountId;

    // Add to undo stack
    setUndoStack((prev) => [...prev, {
      action: "delete",
      emails: selectedEmails,
      timestamp: ts,
    }]);

    // Remove from UI immediately
    setEmails((prev) => prev.filter((e) => !selectedIds.has(e.id)));

    // Delay API call — cancel on undo (C5 fix)
    scheduleAction(ts, () => {
      void fetch("/api/mail/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", messageIds: idsToDelete, homeAccountId: hid }),
      });
    });

    setSelectedIds(new Set());
    setBulkMode(false);
  }, [activeAccount, selectedIds, emails, scheduleAction]);

  const bulkArchive = useCallback(() => {
    if (!activeAccount || selectedIds.size === 0) return;

    const selectedEmails = emails.filter((e) => selectedIds.has(e.id));
    const ts = Date.now();
    const idsToArchive = [...selectedIds];
    const hid = activeAccount.homeAccountId;

    // Add to undo stack
    setUndoStack((prev) => [...prev, {
      action: "archive",
      emails: selectedEmails,
      timestamp: ts,
    }]);

    // Remove from UI immediately
    setEmails((prev) => prev.filter((e) => !selectedIds.has(e.id)));

    // Delay API call — cancel on undo (C5 fix)
    scheduleAction(ts, () => {
      void fetch("/api/mail/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", messageIds: idsToArchive, homeAccountId: hid }),
      });
    });

    setSelectedIds(new Set());
    setBulkMode(false);
  }, [activeAccount, selectedIds, emails, scheduleAction]);

  const bulkMarkRead = useCallback(() => {
    if (!activeAccount || selectedIds.size === 0) return;

    // Update UI
    setEmails((prev) =>
      prev.map((e) =>
        selectedIds.has(e.id) ? { ...e, isRead: true } : e
      )
    );

    // Update via batch API
    void fetch("/api/mail/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "markRead",
        messageIds: [...selectedIds],
        homeAccountId: activeAccount.homeAccountId,
      }),
    });

    setSelectedIds(new Set());
    setBulkMode(false);
  }, [activeAccount, selectedIds]);

  // ── Undo handler ──

  const handleUndo = useCallback(() => {
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction) return;

    // Cancel the pending server action (C5 fix)
    const pending = pendingActionsRef.current.get(lastAction.timestamp);
    if (pending) {
      clearTimeout(pending.timer);
      pendingActionsRef.current.delete(lastAction.timestamp);
    }

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

  // Load rules on mount and when account changes; apply to current email batch
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.homeAccountId]);

  // Keep sidebar unread badge in sync — use server total if available, otherwise count loaded
  const loadedUnread = emails.filter((e) => !e.isRead).length;
  const serverUnread = totalUnread ?? 0;
  // Use whichever is higher — server total is accurate, loaded count tracks local mark-read actions
  const effectiveUnread = Math.max(serverUnread, loadedUnread);
  useEffect(() => {
    setInboxUnread(effectiveUnread);
  }, [effectiveUnread, setInboxUnread]);

  // Account switch: reload from scratch
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!activeAccount) return;
    // Clear email list immediately so stale emails aren't shown during fetch
    setEmails([]);
    setRequiresReauth(false);
    setFetchError(null);
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
        if (!r.ok) {
          const errBody = await r.json().catch(() => ({} as { error?: string })) as { error?: string };
          throw new Error(errBody.error ?? `inbox ${r.status}`);
        }
        return r.json() as Promise<{ emails: EmailMessage[]; nextLink: string | null; unreadCount?: number }>;
      })
      .then((data) => {
        if (!data) return;
        setEmails(processWithRules(data.emails, activeAccount.homeAccountId));
        setNextLink(data.nextLink ?? null);
        // Update unread count from the new account's response
        if (data.unreadCount != null) {
          setInboxUnread(data.unreadCount);
        }
      })
      .catch((err) => {
        console.error("[inbox] account switch error:", err);
        setFetchError(err instanceof Error ? err.message : "Failed to load emails");
      })
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
    if (activeTab === "all" || activeTab === "labeled") { setTabEmails(null); return; }
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

  // Poll every 30s for new emails in the active account only (C3 fix)
  useEffect(() => {
    if (!activeAccount) return;
    const poll = async () => {
      if (document.hidden || activeTab !== "all" || search) return;
      try {
        const res = await fetch(`/api/mail/inbox?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`);
        if (!res.ok) return;
        const data = await res.json() as { emails: EmailMessage[] };
        const fresh = data.emails.filter((e) => !knownIdsRef.current.has(e.id));
        if (fresh.length > 0) {
          setPendingNewEmails((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            return [...fresh.filter((e) => !existingIds.has(e.id)), ...prev];
          });
        }
      } catch {
        // fail silently — inbox still works
      }
    };
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [activeAccount?.homeAccountId, activeTab, search]);

  // Clear pending banner when account switches
  useEffect(() => {
    setPendingNewEmails([]);
    knownIdsRef.current = new Set(emails.map((e) => e.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.homeAccountId]);

  // AI Priority — score first 20 emails after load
  useEffect(() => {
    if (!aiPriorityEnabled || emails.length === 0 || !activeAccount) return;
    const unscored = emails.slice(0, 20).filter((e) => !emailPriorities[e.id]);
    if (unscored.length === 0) return;
    const payload = unscored.map((e) => ({
      id: e.id,
      subject: e.subject,
      from: e.from.address,
      bodyPreview: e.bodyPreview,
    }));
    void fetch("/api/mail/ai-priority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: payload }),
    })
      .then((r) => r.ok ? r.json() as Promise<{ scores: { id: string; priority: "urgent" | "normal" | "low"; reason: string }[] }> : null)
      .then((data) => {
        if (!data?.scores) return;
        setEmailPriorities((prev) => {
          const next = { ...prev };
          data.scores.forEach((s) => { next[s.id] = { priority: s.priority, reason: s.reason }; });
          return next;
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiPriorityEnabled, emails.length, activeAccount?.homeAccountId]);

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
      { rootMargin: "600px" }
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

  // Client-side filter for labeled tab
  if (activeTab === "labeled") {
    baseEmails = emails.filter((e) => !!e.sensitivityLabel);
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
      const convId = email.conversationId || email.id;
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

  // ── Sort pinned emails to the top ──
  displayEmails = [...displayEmails].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // preserve existing order within pinned/unpinned groups
  });

  // ── Toggle select all (defined here after displayEmails is computed) ──
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === displayEmails.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayEmails.map((e) => e.id)));
    }
  }, [selectedIds.size, displayEmails]);

  const unreadCount = effectiveUnread;

  // Wire keyboard shortcuts
  useKeyboardShortcuts(
    displayEmails,
    {
      onOpen: (email) => {
        if (readingPane === "split") {
          fetchSplitEmail(email);
          return;
        }
        setExpandedEmailId(email.id);
        setExpandedBody(null);
        setExpandedDetails(null);
        if (activeAccount) {
          setExpandedLoading(true);
          fetch(`/api/mail/message/${encodeURIComponent(email.id)}?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data: Record<string, unknown> | null) => {
              if (data) {
                const body = data.body as { content?: string; contentType?: string } | undefined;
                const toRaw = data.toRecipients as { emailAddress?: { name?: string; address?: string }; name?: string; address?: string }[] | undefined;
                const ccRaw = data.ccRecipients as { emailAddress?: { name?: string; address?: string }; name?: string; address?: string }[] | undefined;
                const mapR = (arr?: typeof toRaw) => (arr ?? []).map((r) => ({ name: r.emailAddress?.name ?? r.name ?? "", address: r.emailAddress?.address ?? r.address ?? "" }));
                setExpandedBody({ content: body?.content ?? email.bodyPreview, contentType: (body?.contentType as "html" | "text") ?? "text" });
                setExpandedDetails({ to: mapR(toRaw), cc: mapR(ccRaw), attachments: (data.attachments as { id: string; name: string; size: number; contentType: string }[]) ?? [] });
              } else {
                setExpandedBody({ content: email.bodyPreview, contentType: "text" });
              }
            })
            .catch(() => setExpandedBody({ content: email.bodyPreview, contentType: "text" }))
            .finally(() => setExpandedLoading(false));
        }
      },
      onArchive: handleArchiveEmail,
      onDelete: handleDeleteEmail,
      onReply: (email) => navigateTo(`/compose?mode=reply&messageId=${encodeURIComponent(email.id)}&homeAccountId=${encodeURIComponent(activeAccount?.homeAccountId ?? "")}`),
      onReplyAll: (email) => navigateTo(`/compose?mode=replyAll&messageId=${encodeURIComponent(email.id)}&homeAccountId=${encodeURIComponent(activeAccount?.homeAccountId ?? "")}`),
      onForward: (email) => navigateTo(`/compose?mode=forward&messageId=${encodeURIComponent(email.id)}&homeAccountId=${encodeURIComponent(activeAccount?.homeAccountId ?? "")}`),
      onMarkUnread: handleMarkUnread,
      onStar: handleStarToggle,
      onCompose: () => navigateTo("/compose"),
      onFocusSearch: () => searchInputRef.current?.focus(),
      onEscape: () => { setExpandedEmailId(null); setExpandedBody(null); setExpandedDetails(null); setShowShortcutsHelp(false); },
      onShowHelp: () => setShowShortcutsHelp(true),
    },
    !showShortcutsHelp,
  );

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "starred", label: "Starred" },
    { key: "attachments", label: "Attachments" },
    { key: "labeled", label: "Labeled" },
    ...(activeLabel ? [{ key: "label" as FilterTab, label: activeLabel }] : []),
  ];

  // ── Split pane fetch helper ──
  const fetchSplitEmail = useCallback((email: EmailMessage) => {
    setSplitPaneEmailId(email.id);
    setSplitPaneBody(null);
    setSplitPaneDetails(null);
    if (!activeAccount) return;
    setSplitPaneLoading(true);
    fetch(`/api/mail/message/${encodeURIComponent(email.id)}?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: Record<string, unknown> | null) => {
        if (data) {
          const body = data.body as { content?: string; contentType?: string } | undefined;
          const toRaw = data.toRecipients as { emailAddress?: { name?: string; address?: string }; name?: string; address?: string }[] | undefined;
          const ccRaw = data.ccRecipients as { emailAddress?: { name?: string; address?: string }; name?: string; address?: string }[] | undefined;
          const mapR = (arr?: typeof toRaw) => (arr ?? []).map((r) => ({ name: r.emailAddress?.name ?? r.name ?? "", address: r.emailAddress?.address ?? r.address ?? "" }));
          setSplitPaneBody({ content: body?.content ?? email.bodyPreview, contentType: (body?.contentType as "html" | "text") ?? "text" });
          setSplitPaneDetails({ to: mapR(toRaw), cc: mapR(ccRaw), attachments: (data.attachments as { id: string; name: string; size: number; contentType: string }[]) ?? [] });
        } else {
          setSplitPaneBody({ content: email.bodyPreview, contentType: "text" });
        }
      })
      .catch(() => setSplitPaneBody({ content: email.bodyPreview, contentType: "text" }))
      .finally(() => setSplitPaneLoading(false));
  }, [activeAccount]);

  return (
    <>
    <div className="flex flex-1" style={{ overflow: "hidden" }}>
      {/* Email List — left column */}
      <div
        className="flex flex-col bg-white flex-shrink-0 border-r border-neutral-200"
        style={{ height: "100vh", overflow: "hidden", width: readingPane === "split" ? 340 : 380 }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>
              Inbox {unreadCount > 0 && (
                <span className="ml-1 text-xs font-normal" style={{ color: "rgb(155 155 155)" }}>
                  ({unreadCount} unread{nextLink ? ` · ${emails.length} loaded` : ""})
                </span>
              )}
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
              <button
                onClick={() => {
                  const next = readingPane === "list" ? "split" : "list";
                  setReadingPane(next);
                  localStorage.setItem("easemail:readingPane", next);
                  if (next === "list") { setSplitPaneEmailId(null); setSplitPaneBody(null); setSplitPaneDetails(null); }
                }}
                className="p-1.5 rounded-[10px] transition-colors"
                style={{ color: readingPane === "split" ? "rgb(138 9 9)" : "rgb(155 155 155)", backgroundColor: readingPane === "split" ? "rgb(254 242 242)" : "transparent" }}
                title={readingPane === "split" ? "List view" : "Split pane view"}
                onMouseEnter={(e) => { if (readingPane === "list") { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; } }}
                onMouseLeave={(e) => { if (readingPane === "list") { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M9 3h10a2 2 0 012 2v14a2 2 0 01-2 2H9M9 3v18" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const next = !aiPriorityEnabled;
                  setAiPriorityEnabled(next);
                  localStorage.setItem("easemail:aiPriority", String(next));
                  if (!next) setEmailPriorities({});
                }}
                className="p-1.5 rounded-[10px] transition-colors"
                style={{ color: aiPriorityEnabled ? "rgb(138 9 9)" : "rgb(155 155 155)", backgroundColor: aiPriorityEnabled ? "rgb(254 242 242)" : "transparent" }}
                title={aiPriorityEnabled ? "Disable AI priority" : "Enable AI priority inbox"}
                onMouseEnter={(e) => { if (!aiPriorityEnabled) { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; } }}
                onMouseLeave={(e) => { if (!aiPriorityEnabled) { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
              <button
                onClick={() => setShowShortcutsHelp(true)}
                className="p-1.5 rounded-[10px] transition-colors"
                style={{ color: "rgb(155 155 155)" }}
                title="Keyboard shortcuts (?)"
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  ref={searchInputRef}
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

        {/* Fetch error banner */}
        {fetchError && (
          <div className="mx-4 mt-3 px-4 py-3 rounded-[10px] border flex items-center justify-between gap-3" style={{ backgroundColor: "rgb(254 243 199)", borderColor: "rgb(253 224 71)" }}>
            <p className="text-xs" style={{ color: "rgb(113 63 18)" }}>{fetchError}</p>
            <button onClick={() => setFetchError(null)} className="text-xs font-semibold flex-shrink-0" style={{ color: "rgb(113 63 18)" }}>Dismiss</button>
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
            <div className="absolute inset-0 z-10 bg-white/90">
              <div className="space-y-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse border-b border-neutral-50">
                    <div className="w-9 h-9 rounded-full bg-neutral-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3.5 bg-neutral-200 rounded" style={{ width: `${35 + (i % 3) * 15}%` }} />
                      <div className="h-3 bg-neutral-100 rounded" style={{ width: `${55 + (i % 4) * 10}%` }} />
                      <div className="h-2.5 bg-neutral-100 rounded" style={{ width: `${30 + (i % 5) * 8}%` }} />
                    </div>
                    <div className="h-2.5 bg-neutral-100 rounded w-10 flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {displayEmails.length === 0 && !searching ? (
            <div className="flex flex-col items-center justify-center h-32 text-sm" style={{ color: "rgb(155 155 155)" }}>
              {search ? `No results for "${search}"` : "No emails found"}
            </div>
          ) : (
            displayEmails.map((email) => (
              <React.Fragment key={email.id}>
              <EmailRow
                email={email}
                onClick={() => {
                  if (bulkMode) return;
                  const idx = displayEmails.findIndex((e) => e.id === email.id);
                  setSelectedEmailIndex(idx);
                  if (!email.isRead) {
                    setEmails((prev) =>
                      prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
                    );
                    // Mark as read on server
                    if (activeAccount) {
                      void fetch("/api/mail/read", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ messageId: email.id, homeAccountId: activeAccount.homeAccountId, isRead: true }),
                      }).catch(() => {});
                    }
                  }
                  if (readingPane === "split") {
                    fetchSplitEmail(email);
                    return;
                  }
                  setExpandedEmailId(email.id);
                  setExpandedBody(null);
                  setExpandedDetails(null);
                  // Always fetch full message body for proper formatting
                  if (activeAccount) {
                    setExpandedLoading(true);
                    const acctParam = encodeURIComponent(activeAccount.homeAccountId);
                    fetch(`/api/mail/message/${encodeURIComponent(email.id)}?homeAccountId=${acctParam}`)
                      .then((r) => r.ok ? r.json() : null)
                      .then((data: Record<string, unknown> | null) => {
                        if (data) {
                          const body = data.body as { content?: string; contentType?: string } | undefined;
                          // Handle both Graph-style (nested emailAddress) and flat formats
                          const toRaw = data.toRecipients as { emailAddress?: { name?: string; address?: string }; name?: string; address?: string }[] | undefined;
                          const ccRaw = data.ccRecipients as { emailAddress?: { name?: string; address?: string }; name?: string; address?: string }[] | undefined;
                          const mapRecipients = (arr?: typeof toRaw) => (arr ?? []).map((r) => ({
                            name: r.emailAddress?.name ?? r.name ?? "",
                            address: r.emailAddress?.address ?? r.address ?? "",
                          }));
                          setExpandedBody({
                            content: body?.content ?? email.bodyPreview,
                            contentType: (body?.contentType as "html" | "text") ?? "text",
                          });
                          setExpandedDetails({
                            to: mapRecipients(toRaw),
                            cc: mapRecipients(ccRaw),
                            attachments: (data.attachments as { id: string; name: string; size: number; contentType: string }[]) ?? [],
                          });
                        } else {
                          setExpandedBody({ content: email.bodyPreview, contentType: "text" });
                        }
                      })
                      .catch(() => setExpandedBody({ content: email.bodyPreview, contentType: "text" }))
                      .finally(() => setExpandedLoading(false));
                  }
                }}
                onAiReply={(e) => { e.stopPropagation(); setAiReplyEmail(email); }}
                onStar={(e) => { e.stopPropagation(); handleStarToggle(email); }}
                onPin={(e) => { e.stopPropagation(); handlePinToggle(email); }}
                onArchive={(e) => { e.stopPropagation(); handleArchiveEmail(email); }}
                onDelete={(e) => { e.stopPropagation(); handleDeleteEmail(email); }}
                onMarkUnread={(e) => { e.stopPropagation(); handleMarkUnread(email); }}
                onSnooze={(e) => { e.stopPropagation(); setSnoozeEmail(email); }}
                bulkMode={bulkMode}
                isSelected={selectedIds.has(email.id)}
                isActive={readingPane === "split" ? splitPaneEmailId === email.id : expandedEmailId === email.id}
                isKeyboardSelected={selectedEmailIndex === displayEmails.findIndex((e) => e.id === email.id)}
                priority={aiPriorityEnabled ? (emailPriorities[email.id] ?? null) : null}
                onToggleSelect={(e) => { e.stopPropagation(); toggleSelect(email.id); }}
              />
            </React.Fragment>
            ))

          )}

          {/* Infinite scroll sentinel */}
          {!search && <div ref={sentinelRef} className="h-1" />}
          {loadingMore && (
            <div className="py-2 space-y-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-neutral-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-neutral-200 rounded w-1/3" />
                    <div className="h-3 bg-neutral-100 rounded w-2/3" />
                    <div className="h-2.5 bg-neutral-100 rounded w-1/2" />
                  </div>
                  <div className="h-2.5 bg-neutral-100 rounded w-12 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Split Pane Reading View ── */}
      {readingPane === "split" && (() => {
        const splitSelected = splitPaneEmailId ? displayEmails.find((e) => e.id === splitPaneEmailId) : null;
        if (!splitSelected) {
          return (
            <div className="flex flex-col flex-1 items-center justify-center bg-white border-l border-neutral-200" style={{ height: "100vh" }}>
              <svg className="w-12 h-12 mb-3" style={{ color: "rgb(200 200 200)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "rgb(155 155 155)" }}>Select an email to read</p>
            </div>
          );
        }
        const acctId = activeAccount?.homeAccountId ?? "";
        const senderColor = getAvatarColor(splitSelected.from.name);
        const emailDate = new Date(splitSelected.receivedDateTime);
        const dateFormatted = emailDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        const timeFormatted = emailDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        const fileIcon = (type: string) => {
          if (type.startsWith("image/")) return "🖼";
          if (type.includes("pdf")) return "📄";
          if (type.includes("word") || type.includes("document")) return "📝";
          if (type.includes("sheet") || type.includes("excel")) return "📊";
          if (type.includes("zip") || type.includes("compressed")) return "📦";
          return "📎";
        };
        const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
        const raw = splitPaneBody?.content ?? splitSelected.bodyPreview;
        const isHtml = splitPaneBody?.contentType === "html" && /<[a-z][\s\S]*>/i.test(raw);
        let bodyHtml: string;
        if (isHtml) {
          bodyHtml = raw;
        } else {
          const escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const withLinks = escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:#8a0909">$1</a>');
          const paragraphs = withLinks.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
          bodyHtml = paragraphs.map(p => `<p style="margin:0 0 12px">${p.replace(/\n/g, "<br>")}</p>`).join("") || `<p>${withLinks.replace(/\n/g, "<br>")}</p>`;
        }
        return (
          <div className="flex flex-col flex-1 bg-white border-l border-neutral-200" style={{ height: "100vh", overflow: "hidden" }}>
            {/* Action toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-200 flex-shrink-0" style={{ backgroundColor: "rgb(250 250 250)" }}>
              <button
                onClick={() => setAiReplyEmail(splitSelected)}
                title="Reply (r)"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[8px] text-white"
                style={{ backgroundColor: "rgb(138 9 9)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                Reply
              </button>
              <button
                onClick={() => navigateTo(`/compose?mode=replyAll&messageId=${encodeURIComponent(splitSelected.id)}&homeAccountId=${encodeURIComponent(acctId)}`)}
                title="Reply All (a)"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[8px] border border-neutral-200 bg-white hover:bg-neutral-50"
                style={{ color: "rgb(82 82 82)" }}
              >
                Reply All
              </button>
              <button
                onClick={() => handleArchiveEmail(splitSelected)}
                title="Archive (e)"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[8px] border border-neutral-200 bg-white hover:bg-neutral-50"
                style={{ color: "rgb(82 82 82)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Archive
              </button>
              <button
                onClick={() => handleDeleteEmail(splitSelected)}
                title="Delete (#)"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[8px] border border-neutral-200 bg-white hover:bg-red-50"
                style={{ color: "rgb(82 82 82)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
              <div className="flex-1" />
              <button
                onClick={() => { setSplitPaneEmailId(null); setSplitPaneBody(null); setSplitPaneDetails(null); }}
                className="p-1.5 rounded-[8px] hover:bg-neutral-100"
                style={{ color: "rgb(155 155 155)" }}
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Subject + sender */}
              <div className="px-5 py-4 border-b border-neutral-100">
                <h2 className="text-base font-semibold mb-3" style={{ color: "rgb(27 29 29)" }}>{splitSelected.subject}</h2>
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: senderColor.bg, color: senderColor.text }}>
                    {getInitials(splitSelected.from.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>{splitSelected.from.name}</span>
                        <span className="text-xs ml-1.5" style={{ color: "rgb(155 155 155)" }}>&lt;{splitSelected.from.address}&gt;</span>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "rgb(155 155 155)" }}>{dateFormatted} at {timeFormatted}</span>
                    </div>
                    {splitPaneDetails?.to && splitPaneDetails.to.length > 0 && (
                      <p className="text-xs mt-1" style={{ color: "rgb(155 155 155)" }}>
                        <span className="font-medium" style={{ color: "rgb(115 115 115)" }}>To:</span>{" "}
                        {splitPaneDetails.to.map((r) => r.name || r.address).join(", ")}
                      </p>
                    )}
                    {splitPaneDetails?.cc && splitPaneDetails.cc.length > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: "rgb(155 155 155)" }}>
                        <span className="font-medium" style={{ color: "rgb(115 115 115)" }}>CC:</span>{" "}
                        {splitPaneDetails.cc.map((r) => r.name || r.address).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {splitPaneDetails?.attachments && splitPaneDetails.attachments.length > 0 && (
                <div className="px-5 py-3 border-b border-neutral-100" style={{ backgroundColor: "rgb(252 252 252)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "rgb(115 115 115)" }}>
                    {splitPaneDetails.attachments.length} attachment{splitPaneDetails.attachments.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {splitPaneDetails.attachments.map((att) => {
                      const attUrl = `/api/mail/attachments/${encodeURIComponent(splitSelected.id)}/${encodeURIComponent(att.id)}?homeAccountId=${encodeURIComponent(acctId)}`;
                      return (
                        <a key={att.id} href={attUrl} className="flex items-center gap-2 px-3 py-2 rounded-[8px] border border-neutral-200 bg-white hover:border-neutral-300 text-xs" style={{ minWidth: 160 }}>
                          <span className="text-base">{fileIcon(att.contentType)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate" style={{ color: "rgb(27 29 29)" }}>{att.name}</p>
                            <p style={{ color: "rgb(155 155 155)" }}>{formatSize(att.size)}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="px-5 py-4">
                {splitPaneLoading ? (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <svg className="w-5 h-5 animate-spin" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: "rgb(155 155 155)" }}>Loading email...</span>
                  </div>
                ) : (
                  <div className="email-body-render" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Reading Pane — right column (list mode only) ── */}
      {readingPane === "list" && !expandedEmailId && (
        <div className="flex flex-col flex-1 items-center justify-center bg-white" style={{ height: "100vh" }}>
          <svg className="w-12 h-12 mb-3" style={{ color: "rgb(200 200 200)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium" style={{ color: "rgb(155 155 155)" }}>Select an email to read</p>
        </div>
      )}
      {readingPane === "list" && expandedEmailId && (() => {
        const selectedEmail = displayEmails.find((e) => e.id === expandedEmailId);
        if (!selectedEmail) return null;
        const senderColor = getAvatarColor(selectedEmail.from.name);
        const acctId = activeAccount?.homeAccountId ?? "";
        const emailDate = new Date(selectedEmail.receivedDateTime);
        const dateFormatted = emailDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        const timeFormatted = emailDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        const fileIcon = (type: string) => {
          if (type.startsWith("image/")) return "🖼";
          if (type.includes("pdf")) return "📄";
          if (type.includes("word") || type.includes("document")) return "📝";
          if (type.includes("sheet") || type.includes("excel")) return "📊";
          if (type.includes("zip") || type.includes("compressed")) return "📦";
          return "📎";
        };
        const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

        // Build body HTML
        const raw = expandedBody?.content ?? selectedEmail.bodyPreview;
        const isHtml = expandedBody?.contentType === "html" && /<[a-z][\s\S]*>/i.test(raw);
        let bodyHtml: string;
        if (isHtml) {
          bodyHtml = raw;
        } else {
          const escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const withLinks = escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:#8a0909">$1</a>');
          const replyPattern = /(?:^|\n)((?:From:|On .+ wrote:|Sent from|_{5,}|-{5,}).*)$/m;
          const parts = withLinks.split(replyPattern);
          const sections: string[] = [];
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            if (!part) continue;
            if (/^(?:From:|On .+ wrote:|Sent from|_{5,}|-{5,})/.test(part.replace(/&[a-z]+;/g, m => m === "&gt;" ? ">" : m === "&lt;" ? "<" : m))) {
              const remaining = parts.slice(i).join("").trim();
              if (remaining) sections.push(`<div style="border-left:3px solid #e0e0e0;padding:12px 16px;margin:16px 0;color:#6b7280;font-size:13px;line-height:1.5">${remaining.replace(/\n/g, "<br>")}</div>`);
              break;
            }
            const paragraphs = part.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
            sections.push(paragraphs.map(p => `<p style="margin:0 0 12px">${p.replace(/\n/g, "<br>")}</p>`).join(""));
          }
          bodyHtml = sections.join("") || `<p>${withLinks.replace(/\n/g, "<br>")}</p>`;
        }
        // Email body styles are in globals.css under .email-body-render

        return (
          <div className="flex flex-col flex-1 bg-white" style={{ height: "100vh", overflow: "hidden" }}>
            {/* Action bar top */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-neutral-200 flex-shrink-0" style={{ backgroundColor: "rgb(250 250 250)" }}>
              <button onClick={() => { setAiReplyEmail(selectedEmail); }} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-[8px] text-white" style={{ backgroundColor: "rgb(138 9 9)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                Reply
              </button>
              <button onClick={() => navigateTo(`/compose?mode=replyAll&messageId=${encodeURIComponent(selectedEmail.id)}&homeAccountId=${encodeURIComponent(acctId)}`)} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-[8px] border border-neutral-200 bg-white hover:bg-neutral-50" style={{ color: "rgb(82 82 82)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                Reply All
              </button>
              <button onClick={() => navigateTo(`/compose?mode=forward&messageId=${encodeURIComponent(selectedEmail.id)}&homeAccountId=${encodeURIComponent(acctId)}`)} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-[8px] border border-neutral-200 bg-white hover:bg-neutral-50" style={{ color: "rgb(82 82 82)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                Forward
              </button>
              <div className="flex-1" />
              <button onClick={() => { setAiReplyEmail(selectedEmail); }} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-[8px]" style={{ backgroundColor: "rgb(254 242 242)", color: "rgb(138 9 9)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                AI Reply
              </button>
              <button onClick={() => { setExpandedEmailId(null); setExpandedBody(null); setExpandedDetails(null); }} className="p-1.5 rounded-[8px] hover:bg-neutral-100" style={{ color: "rgb(155 155 155)" }} title="Close">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Sender + subject header */}
              <div className="px-6 py-5 border-b border-neutral-100">
                <h2 className="text-lg font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>{selectedEmail.subject}</h2>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: senderColor.bg, color: senderColor.text }}>
                    {getInitials(selectedEmail.from.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>{selectedEmail.from.name}</span>
                        <span className="text-xs ml-1.5" style={{ color: "rgb(155 155 155)" }}>&lt;{selectedEmail.from.address}&gt;</span>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "rgb(155 155 155)" }}>{dateFormatted} at {timeFormatted}</span>
                    </div>
                    {expandedDetails?.to && expandedDetails.to.length > 0 && (
                      <p className="text-xs mt-1" style={{ color: "rgb(155 155 155)" }}>
                        <span className="font-medium" style={{ color: "rgb(115 115 115)" }}>To:</span>{" "}
                        {expandedDetails.to.map((r) => r.name || r.address).join(", ")}
                      </p>
                    )}
                    {expandedDetails?.cc && expandedDetails.cc.length > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: "rgb(155 155 155)" }}>
                        <span className="font-medium" style={{ color: "rgb(115 115 115)" }}>CC:</span>{" "}
                        {expandedDetails.cc.map((r) => r.name || r.address).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {expandedDetails?.attachments && expandedDetails.attachments.length > 0 && (
                <div className="px-6 py-3 border-b border-neutral-100" style={{ backgroundColor: "rgb(252 252 252)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "rgb(115 115 115)" }}>
                    {expandedDetails.attachments.length} attachment{expandedDetails.attachments.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {expandedDetails.attachments.map((att) => {
                      const attUrl = `/api/mail/attachments/${encodeURIComponent(selectedEmail.id)}/${encodeURIComponent(att.id)}?homeAccountId=${encodeURIComponent(acctId)}`;
                      const isImage = att.contentType.startsWith("image/");
                      return isImage ? (
                        <a key={att.id} href={`${attUrl}&mode=inline`} target="_blank" rel="noopener noreferrer" className="flex flex-col rounded-[10px] border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm transition-all overflow-hidden" style={{ width: 160 }}>
                          <div className="h-24 bg-neutral-50 flex items-center justify-center overflow-hidden">
                            <img src={`${attUrl}&mode=inline`} alt={att.name} className="max-w-full max-h-full object-cover" loading="lazy" />
                          </div>
                          <div className="px-2.5 py-2">
                            <p className="text-xs font-medium truncate" style={{ color: "rgb(27 29 29)" }}>{att.name}</p>
                            <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>{formatSize(att.size)}</p>
                          </div>
                        </a>
                      ) : (
                        <a key={att.id} href={attUrl} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm transition-all" style={{ minWidth: 180, maxWidth: 260 }}>
                          <span className="text-lg flex-shrink-0">{fileIcon(att.contentType)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: "rgb(27 29 29)" }}>{att.name}</p>
                            <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>{formatSize(att.size)}</p>
                          </div>
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(155 155 155)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Email body */}
              <div className="px-6 py-4">
                {expandedLoading ? (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <svg className="w-5 h-5 animate-spin" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: "rgb(155 155 155)" }}>Loading email...</span>
                  </div>
                ) : (
                  <div
                    className="email-body-render"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
          navigateTo(`/compose?mode=reply&messageId=${encodeURIComponent(aiReplyEmail.id)}`);
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

    {showShortcutsHelp && (
      <KeyboardShortcutsModal onClose={() => setShowShortcutsHelp(false)} />
    )}

    {snoozeEmail && activeAccount && (
      <SnoozePicker
        email={snoozeEmail}
        homeAccountId={activeAccount.homeAccountId}
        onSnoozed={() => {
          setEmails((prev) => prev.filter((e) => e.id !== snoozeEmail.id));
          setSnoozeEmail(null);
        }}
        onClose={() => setSnoozeEmail(null)}
        error={snoozeError}
        onError={setSnoozeError}
      />
    )}
    </>
  );
}
