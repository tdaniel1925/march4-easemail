"use client";

import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "@/lib/stores/account-store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmailMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  isRead: boolean;
  from: {
    name: string;
    address: string;
  };
  hasAttachments: boolean;
  flag?: { flagStatus: "flagged" | "notFlagged" };
  body?: {
    content: string;
    contentType: "html" | "text";
  };
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    contentType: string;
  }>;
}

type FilterTab = "all" | "unread" | "starred" | "attachments";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en", { weekday: "short" });
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  { bg: "rgb(253 235 235)", text: "rgb(83 5 5)" },
  { bg: "rgb(209 250 229)", text: "rgb(4 120 87)" },
  { bg: "rgb(253 237 237)", text: "rgb(56 2 2)" },
  { bg: "rgb(240 240 240)", text: "rgb(58 58 58)" },
];

function getAvatarColor(name: string) {
  const i = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[i];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmailRow({
  email,
  selected,
  onClick,
}: {
  email: EmailMessage;
  selected: boolean;
  onClick: () => void;
}) {
  const color = getAvatarColor(email.from.name);

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors"
      style={{
        backgroundColor: selected ? "rgb(253 235 235)" : "transparent",
        borderLeft: selected ? "2px solid rgb(138 9 9)" : "2px solid transparent",
      }}
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
          <span className="text-xs flex-shrink-0" style={{ color: "rgb(155 155 155)" }}>
            {formatDate(email.receivedDateTime)}
          </span>
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

      {/* Unread dot */}
      {!email.isRead && (
        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: "rgb(138 9 9)" }} />
      )}
    </div>
  );
}

// ─── Safe HTML renderer (DOMPurify sanitization) ─────────────────────────────

function SafeHtml({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    import("dompurify").then(({ default: DOMPurify }) => {
      if (ref.current) {
        ref.current.innerHTML = DOMPurify.sanitize(html, {
          FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
          FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
        });
      }
    });
  }, [html]);
  return <div ref={ref} />;
}

// ─── Reading Pane ─────────────────────────────────────────────────────────────

function ReadingPane({ email, onMarkRead }: { email: EmailMessage | null; onMarkRead?: (id: string) => void }) {
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  if (!email) {
    return (
      <div className="hidden lg:flex flex-col flex-1 items-center justify-center" style={{ backgroundColor: "rgb(250 250 250)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-[10px] flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgb(253 235 235)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "rgb(115 115 115)" }}>Select an email to read</p>
        </div>
      </div>
    );
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || replySending) return;
    setReplySending(true);
    setReplyError(null);
    try {
      const res = await fetch("/api/mail/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: email.id, comment: replyText.trim() }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to send reply");
      }
      setReplySent(true);
      setReplyText("");
      setTimeout(() => setReplySent(false), 3000);
    } catch (e) {
      setReplyError((e as Error).message);
    } finally {
      setReplySending(false);
    }
  };

  return (
    <div className="hidden lg:flex flex-col flex-1 bg-white" style={{ overflow: "hidden" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200 flex-shrink-0 bg-white">
        <div className="flex items-center gap-1">
          {[
            { title: "Archive", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /> },
            { title: "Delete", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> },
            { title: "Mark unread", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
            { title: "Star", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
          ].map((btn) => (
            <button key={btn.title} title={btn.title} className="p-1.5 rounded-[10px] transition-colors" style={{ color: "rgb(155 155 155)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{btn.icon}</svg>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button title="AI Remix" className="p-1.5 rounded-[10px] transition-colors" style={{ color: "rgb(155 155 155)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(138 9 9)"; e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button title="More" className="p-1.5 rounded-[10px] transition-colors" style={{ color: "rgb(155 155 155)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Email body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Subject + sender */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-4" style={{ color: "rgb(27 29 29)" }}>{email.subject}</h1>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 text-sm font-bold"
                style={{ backgroundColor: getAvatarColor(email.from.name).bg, color: getAvatarColor(email.from.name).text }}
              >
                {getInitials(email.from.name)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "rgb(27 29 29)" }}>{email.from.name}</span>
                  <span className="text-xs" style={{ color: "rgb(155 155 155)" }}>&lt;{email.from.address}&gt;</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "rgb(115 115 115)" }}>
                  {new Date(email.receivedDateTime).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
            {!email.isRead && (
              <span className="text-xs font-semibold px-2 py-1 rounded-[10px] flex-shrink-0" style={{ color: "rgb(83 5 5)", backgroundColor: "rgb(253 235 235)" }}>
                Unread
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="text-sm leading-relaxed" style={{ color: "rgb(58 58 58)" }}>
          {email.body?.contentType === "html" ? (
            <SafeHtml html={email.body.content} />
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{email.body?.content ?? email.bodyPreview}</pre>
          )}
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgb(115 115 115)" }}>
              Attachments ({email.attachments.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {email.attachments.map((att) => (
                <div key={att.id} className="inline-flex items-center gap-3 p-3 border border-neutral-200 rounded-[10px] bg-white cursor-pointer transition-colors hover:border-primary-300">
                  <div className="p-2 bg-white border border-neutral-200 rounded-[10px] shadow-sm" style={{ color: "rgb(138 9 9)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "rgb(38 38 38)" }}>{att.name}</p>
                    <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>
                      {att.size < 1024 ? `${att.size} B` : att.size < 1048576 ? `${Math.round(att.size / 1024)} KB` : `${(att.size / 1048576).toFixed(1)} MB`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inline Reply */}
        <div className="mt-8 border border-neutral-200 rounded-[10px] overflow-hidden shadow-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 text-xs" style={{ color: "rgb(115 115 115)" }}>
            <span>Reply to</span>
            <span className="font-semibold" style={{ color: "rgb(58 58 58)" }}>{email.from.name}</span>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Click to reply..."
            className="w-full px-4 py-3 min-h-[80px] text-sm resize-none focus:outline-none"
            style={{ color: replyText ? "rgb(38 38 38)" : "rgb(155 155 155)", backgroundColor: "white" }}
          />
          {replyError && (
            <div className="px-4 py-2 text-xs" style={{ color: "rgb(153 27 27)", backgroundColor: "rgb(254 242 242)" }}>
              {replyError}
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200" style={{ backgroundColor: "rgb(250 250 250)" }}>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendReply}
                disabled={replySending || replySent}
                className="flex items-center gap-2 text-white text-xs font-semibold px-4 py-2 rounded-[10px] transition-colors disabled:opacity-60"
                style={{ backgroundColor: replySent ? "rgb(16 185 129)" : "rgb(138 9 9)" }}
                onMouseEnter={(e) => { if (!replySent && !replySending) e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
                onMouseLeave={(e) => { if (!replySent && !replySending) e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {replySending ? "Sending…" : replySent ? "Sent!" : "Send Reply"}
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-[10px] transition-colors"
                style={{ color: "rgb(115 115 115)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(138 9 9)"; e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(115 115 115)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                AI Remix
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-[10px] transition-colors"
                style={{ color: "rgb(115 115 115)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(138 9 9)"; e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(115 115 115)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                AI Dictate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function InboxClient({ initialEmails }: { initialEmails: EmailMessage[] }) {
  const [emails, setEmails] = useState<EmailMessage[]>(initialEmails);
  const [selectedId, setSelectedId] = useState<string | null>(initialEmails[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [loadingEmails, setLoadingEmails] = useState(false);

  const activeAccount = useAccountStore((s) => s.activeAccount);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!activeAccount) return;
    setLoadingEmails(true);
    setSelectedId(null);
    fetch(`/api/mail/inbox?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`)
      .then((r) => r.json())
      .then((data: { emails: EmailMessage[] }) => {
        setEmails(data.emails);
        setSelectedId(data.emails[0]?.id ?? null);
      })
      .catch(console.error)
      .finally(() => setLoadingEmails(false));
  }, [activeAccount?.homeAccountId]);

  const selectedEmail = emails.find((e) => e.id === selectedId) ?? null;

  const filteredEmails = emails.filter((e) => {
    if (activeTab === "unread" && e.isRead) return false;
    if (activeTab === "starred" && e.flag?.flagStatus !== "flagged") return false;
    if (activeTab === "attachments" && !e.hasAttachments) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.subject.toLowerCase().includes(q) ||
        e.from.name.toLowerCase().includes(q) ||
        e.bodyPreview.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = emails.filter((e) => !e.isRead).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "starred", label: "Starred" },
    { key: "attachments", label: "Attachments" },
  ];

  return (
    <div className="flex flex-1" style={{ overflow: "hidden" }}>
      {/* Email List Panel */}
      <div className="flex flex-col w-full lg:w-80 xl:w-96 bg-white border-r border-neutral-200 flex-shrink-0" style={{ height: "100vh", overflow: "hidden" }}>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgb(155 155 155)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-9 pr-4 py-2 rounded-[10px] text-sm placeholder-neutral-400 focus:outline-none transition-colors border"
              style={{ backgroundColor: "rgb(245 245 245)", borderColor: "transparent", color: "rgb(58 58 58)" }}
              onFocus={(e) => { e.target.style.backgroundColor = "white"; e.target.style.borderColor = "rgb(218 100 100)"; }}
              onBlur={(e) => { e.target.style.backgroundColor = "rgb(245 245 245)"; e.target.style.borderColor = "transparent"; }}
            />
          </div>

          {/* Filter tabs */}
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
        </div>

        {/* Email rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 relative">
          {loadingEmails && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: "rgba(255,255,255,0.80)" }}>
              <p className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>Loading emails…</p>
            </div>
          )}
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-sm" style={{ color: "rgb(155 155 155)" }}>
              No emails found
            </div>
          ) : (
            filteredEmails.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                selected={selectedId === email.id}
                onClick={() => {
                  setSelectedId(email.id);
                  if (!email.isRead) {
                    setEmails((prev) =>
                      prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
                    );
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
        </div>
      </div>

      {/* Reading Pane */}
      <ReadingPane email={selectedEmail} onMarkRead={(id) => setEmails((prev) => prev.map((e) => e.id === id ? { ...e, isRead: true } : e))} />
    </div>
  );
}
