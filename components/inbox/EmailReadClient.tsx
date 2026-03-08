"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getInitials, getAvatarColor } from "@/lib/utils/email-helpers";
import EventFormModal from "@/components/calendar/EventFormModal";
import type { ParseInviteResponse } from "@/app/api/calendar/parse-invite/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recipient {
  name: string;
  address: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  contentType: string;
}

interface EmailDetail {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { name: string; address: string };
  to: Recipient[];
  cc: Recipient[];
  body: { content: string; contentType: "html" | "text" };
  attachments: Attachment[];
}

// ─── Invite detection ─────────────────────────────────────────────────────────

const INVITE_SUBJECT_KEYWORDS = [
  "invite", "meeting", "call", "conference", "appointment", "webinar",
  "zoom", "teams", "join us", "you're invited", "save the date",
  "sync", "standup", "catchup", "catch-up",
];
const INVITE_BODY_KEYWORDS = [
  "join the meeting", "meeting link", "calendar event", "agenda",
  "meeting id", "passcode", "zoom.us", "teams.microsoft.com",
  "meet.google.com", "webex.com", "gotomeeting",
];

function isLikelyInvite(email: EmailDetail): boolean {
  const sub = email.subject.toLowerCase();
  const preview = email.bodyPreview.toLowerCase();
  const hasIcs = email.attachments.some(
    (a) => a.contentType.includes("calendar") || a.name.toLowerCase().endsWith(".ics")
  );
  return (
    hasIcs ||
    INVITE_SUBJECT_KEYWORDS.some((kw) => sub.includes(kw)) ||
    INVITE_BODY_KEYWORDS.some((kw) => preview.includes(kw))
  );
}

// ─── SafeHtml ─────────────────────────────────────────────────────────────────

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
  return <div ref={ref} className="prose prose-sm max-w-none" />;
}

// ─── EmailReadClient ──────────────────────────────────────────────────────────

export default function EmailReadClient({ email, homeAccountId }: { email: EmailDetail; homeAccountId: string }) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(email.isRead);
  const [isStarred, setIsStarred] = useState(email.flag.flagStatus === "flagged");
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [calError, setCalError] = useState<string | null>(null);
  const [showCalForm, setShowCalForm] = useState(false);
  const [calPrefill, setCalPrefill] = useState<ParseInviteResponse | null>(null);

  const isInvite = isLikelyInvite(email);

  // Mark as read on mount
  useEffect(() => {
    if (!email.isRead) {
      setIsRead(true);
      fetch("/api/mail/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: email.id }),
      }).catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email.id]);

  function openCompose(mode: "reply" | "replyAll" | "forward") {
    router.push(`/compose?mode=${mode}&messageId=${email.id}`);
  }

  async function handleAddToCalendar() {
    setCalLoading(true);
    setCalError(null);
    try {
      const res = await fetch("/api/calendar/parse-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: email.subject,
          fromAddress: email.from.address,
          body: email.body.content,
          bodyPreview: email.bodyPreview,
          receivedDateTime: email.receivedDateTime,
        }),
      });
      const data = await res.json() as { ok?: boolean; prefill?: ParseInviteResponse; error?: string };
      if (!res.ok || !data.ok || !data.prefill) throw new Error(data.error ?? "Failed to parse invite");
      setCalPrefill(data.prefill);
      setShowCalForm(true);
    } catch (e) {
      setCalError((e as Error).message);
    } finally {
      setCalLoading(false);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  const color = getAvatarColor(email.from.name);
  const receivedAt = new Date(email.receivedDateTime).toLocaleString("en", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col flex-1 bg-background-100" style={{ height: "100vh", overflow: "hidden" }}>

      {/* ── Top toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-neutral-200 flex-shrink-0">
        {/* Left: back + actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/inbox"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors px-2.5 py-1.5 rounded-small hover:bg-background-100 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Inbox
          </Link>

          <div className="w-px h-5 bg-neutral-200" />

          {/* Reply / Reply All / Forward — open full composer */}
          {([
            { mode: "reply" as const, label: "Reply", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" },
            { mode: "replyAll" as const, label: "Reply All", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6M7 6l-4 4 4 4" },
            { mode: "forward" as const, label: "Forward", icon: "M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" },
          ]).map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => openCompose(mode)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-small text-xs font-medium transition-colors"
              style={{ backgroundColor: "transparent", color: "rgb(82 82 82)", border: "1px solid transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </button>
          ))}

          {/* Add to Calendar */}
          <button
            onClick={() => void handleAddToCalendar()}
            disabled={calLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-small text-xs font-medium transition-colors disabled:opacity-60"
            style={isInvite
              ? { backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)", border: "1px solid rgb(238 180 180)" }
              : { backgroundColor: "transparent", color: "rgb(82 82 82)", border: "1px solid transparent" }
            }
            title="Add this email to your calendar"
          >
            {calLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {isInvite ? "Add to Calendar" : "Calendar"}
          </button>
          {calError && (
            <span className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>{calError}</span>
          )}
        </div>

        {/* Right: action icons */}
        <div className="flex items-center gap-0.5">
          <button
            title={isStarred ? "Unstar" : "Star"}
            onClick={() => setIsStarred(!isStarred)}
            className="p-1.5 rounded-small transition-colors"
            style={{ color: isStarred ? "rgb(138 9 9)" : "rgb(155 155 155)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={isStarred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          <button
            title={isRead ? "Mark unread" : "Mark read"}
            onClick={() => setIsRead(!isRead)}
            className="p-1.5 rounded-small transition-colors hover:bg-background-100"
            style={{ color: "rgb(155 155 155)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button title="Archive" className="p-1.5 rounded-small transition-colors hover:bg-background-100" style={{ color: "rgb(155 155 155)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
          <button title="Delete" className="p-1.5 rounded-small transition-colors hover:bg-background-100" style={{ color: "rgb(155 155 155)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Scrollable email body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">

          {/* Subject */}
          <h1 className="text-2xl font-bold text-neutral-900 mb-6 leading-tight">{email.subject}</h1>

          {/* Sender + meta */}
          <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-neutral-200">
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-large flex items-center justify-center flex-shrink-0 text-sm font-bold"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {getInitials(email.from.name)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-neutral-900">{email.from.name}</span>
                  <span className="text-sm text-neutral-400">&lt;{email.from.address}&gt;</span>
                  {!isRead && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-small" style={{ color: "rgb(83 5 5)", backgroundColor: "rgb(253 235 235)" }}>
                      Unread
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500">{receivedAt}</p>

                {/* To / CC */}
                <div className="mt-2 space-y-1">
                  {email.to.length > 0 && (
                    <p className="text-xs text-neutral-500">
                      <span className="font-medium text-neutral-600">To: </span>
                      {(showAllRecipients ? email.to : email.to.slice(0, 2)).map((r, i) => (
                        <span key={r.address}>
                          {i > 0 && ", "}
                          <span className="text-neutral-700">{r.name || r.address}</span>
                        </span>
                      ))}
                      {!showAllRecipients && email.to.length > 2 && (
                        <button
                          onClick={() => setShowAllRecipients(true)}
                          className="ml-1 text-primary-600 hover:underline"
                        >
                          +{email.to.length - 2} more
                        </button>
                      )}
                    </p>
                  )}
                  {email.cc.length > 0 && (
                    <p className="text-xs text-neutral-500">
                      <span className="font-medium text-neutral-600">CC: </span>
                      {email.cc.map((r, i) => (
                        <span key={r.address}>{i > 0 && ", "}{r.name || r.address}</span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Email body */}
          <div className="text-sm leading-relaxed text-neutral-700 mb-8">
            {email.body.contentType === "html" ? (
              <SafeHtml html={email.body.content} />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">{email.body.content || email.bodyPreview}</pre>
            )}
          </div>

          {/* Attachments */}
          {email.attachments.length > 0 && (
            <div className="mb-8 pt-6 border-t border-neutral-200">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Attachments ({email.attachments.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {email.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={`/api/mail/attachments/${encodeURIComponent(email.id)}/${encodeURIComponent(att.id)}?homeAccountId=${encodeURIComponent(homeAccountId)}`}
                    download={att.name}
                    className="inline-flex items-center gap-3 p-3 border border-neutral-200 rounded-large bg-white cursor-pointer hover:border-primary-300 hover:shadow-custom transition-all"
                  >
                    <div className="p-2 bg-primary-50 border border-primary-100 rounded-small text-primary-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800 max-w-[180px] truncate">{att.name}</p>
                      <p className="text-xs text-neutral-400">{formatSize(att.size)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="h-16" />
        </div>
      </div>

      {/* ── Calendar event form ────────────────────────────────────────────────── */}
      {showCalForm && (
        <EventFormModal
          prefill={calPrefill ? {
            subject: calPrefill.subject,
            start: calPrefill.start || undefined,
            end: calPrefill.end || undefined,
            location: calPrefill.location || undefined,
            attendees: calPrefill.attendees.length ? calPrefill.attendees : undefined,
            body: calPrefill.body || undefined,
            homeAccountId,
          } : { homeAccountId }}
          onClose={() => { setShowCalForm(false); setCalPrefill(null); }}
          onSaved={() => { setShowCalForm(false); setCalPrefill(null); }}
        />
      )}
    </div>
  );
}
