"use client";

import { useState, useRef, useEffect } from "react";
import type { EmailMessage } from "@/lib/types/email";
import { getInitials, getAvatarColor } from "@/lib/utils/email-helpers";

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

type ComposeMode = "reply" | "replyAll" | "forward";

export function ReadingPane({
  email,
  replyText,
  setReplyText,
  onMarkRead,
  emptyLabel = "Select an email to read",
}: {
  email: EmailMessage | null;
  replyText: string;
  setReplyText: (v: string) => void;
  onMarkRead?: (id: string) => void;
  emptyLabel?: string;
}) {
  const [composeMode, setComposeMode] = useState<ComposeMode | null>(null);
  const [toField, setToField] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset compose panel when email changes
  useEffect(() => {
    setComposeMode(null);
    setToField("");
    setReplySent(false);
    setReplyError(null);
  }, [email?.id]);

  // Auto-open reply when AI Reply pre-fills replyText
  useEffect(() => {
    if (replyText && !composeMode) {
      setComposeMode("reply");
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyText]);

  const openCompose = (mode: ComposeMode) => {
    setComposeMode(mode);
    setReplyError(null);
    setReplySent(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const closeCompose = () => {
    setComposeMode(null);
    setReplyText("");
    setToField("");
    setReplyError(null);
  };

  const handleSend = async () => {
    if (!email || !replyText.trim() || replySending) return;
    if (composeMode === "forward" && !toField.trim()) {
      setReplyError("Please enter a recipient email address.");
      return;
    }
    setReplySending(true);
    setReplyError(null);
    try {
      const res = await fetch("/api/mail/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: email.id,
          comment: replyText.trim(),
          type: composeMode,
          ...(composeMode === "forward" ? { toRecipients: [toField.trim()] } : {}),
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to send");
      }
      setReplySent(true);
      setReplyText("");
      setToField("");
      if (onMarkRead) onMarkRead(email.id);
      setTimeout(() => { setReplySent(false); setComposeMode(null); }, 2000);
    } catch (e) {
      setReplyError((e as Error).message);
    } finally {
      setReplySending(false);
    }
  };

  if (!email) {
    return (
      <div className="hidden lg:flex flex-col flex-1 items-center justify-center" style={{ backgroundColor: "rgb(250 250 250)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-[10px] flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgb(253 235 235)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "rgb(115 115 115)" }}>{emptyLabel}</p>
        </div>
      </div>
    );
  }

  const composeModeLabel =
    composeMode === "replyAll" ? "Reply to all" :
    composeMode === "forward"  ? "Forward" :
    `Reply to ${email.from.name}`;

  const sendLabel =
    composeMode === "forward" ? "Forward" :
    composeMode === "replyAll" ? "Reply All" :
    "Reply";

  return (
    <div className="hidden lg:flex flex-col flex-1 bg-white" style={{ overflow: "hidden" }}>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 flex-shrink-0 bg-white gap-2">

        {/* Reply / Reply All / Forward */}
        <div className="flex items-center gap-1">
          {([
            { mode: "reply" as ComposeMode, label: "Reply", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /> },
            { mode: "replyAll" as ComposeMode, label: "Reply All", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6M7 6l-4 4 4 4" /> },
            { mode: "forward" as ComposeMode, label: "Forward", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" /> },
          ] as { mode: ComposeMode; label: string; icon: React.ReactNode }[]).map(({ mode, label, icon }) => {
            const active = composeMode === mode;
            return (
              <button
                key={mode}
                onClick={() => active ? closeCompose() : openCompose(mode)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? "rgb(253 235 235)" : "transparent",
                  color: active ? "rgb(138 9 9)" : "rgb(82 82 82)",
                  border: active ? "1px solid rgb(238 180 180)" : "1px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; e.currentTarget.style.color = "rgb(38 38 38)"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgb(82 82 82)"; } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icon}</svg>
                {label}
              </button>
            );
          })}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5">
          {[
            { title: "Archive", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /> },
            { title: "Delete",  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> },
            { title: "Mark unread", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
            { title: "Star", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
          ].map((btn) => (
            <button key={btn.title} title={btn.title}
              className="p-1.5 rounded-[8px] transition-colors"
              style={{ color: "rgb(155 155 155)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{btn.icon}</svg>
            </button>
          ))}
          <button title="More" className="p-1.5 rounded-[8px] transition-colors" style={{ color: "rgb(155 155 155)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Sticky Compose Panel ──────────────────────────────── */}
      {composeMode && (
        <div className="flex-shrink-0 border-b border-neutral-200 bg-white" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {/* Compose header */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {composeMode === "forward"
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />}
              </svg>
              <span className="text-xs font-semibold" style={{ color: "rgb(38 38 38)" }}>{composeModeLabel}</span>
            </div>
            <button onClick={closeCompose} className="p-1 rounded-[6px] transition-colors" style={{ color: "rgb(155 155 155)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(58 58 58)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* To field — forward only */}
          {composeMode === "forward" && (
            <div className="flex items-center gap-2 px-5 py-2 border-b border-neutral-100">
              <span className="text-xs font-medium flex-shrink-0" style={{ color: "rgb(115 115 115)" }}>To:</span>
              <input
                type="email"
                value={toField}
                onChange={(e) => setToField(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 text-xs focus:outline-none bg-transparent"
                style={{ color: "rgb(38 38 38)" }}
              />
            </div>
          )}

          {/* Compose textarea */}
          <textarea
            ref={textareaRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={composeMode === "forward" ? "Add a message…" : "Write your reply…"}
            className="w-full px-5 py-3 text-sm resize-none focus:outline-none"
            style={{ minHeight: 96, maxHeight: 200, color: "rgb(38 38 38)", backgroundColor: "white" }}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
          />

          {/* Error */}
          {replyError && (
            <div className="px-5 py-2 text-xs border-t border-neutral-100" style={{ color: "rgb(153 27 27)", backgroundColor: "rgb(254 242 242)" }}>
              {replyError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-t border-neutral-100" style={{ backgroundColor: "rgb(250 250 250)" }}>
            <button
              onClick={handleSend}
              disabled={replySending || replySent || !replyText.trim()}
              className="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-1.5 rounded-[8px] transition-colors disabled:opacity-60"
              style={{ backgroundColor: replySent ? "rgb(16 185 129)" : "rgb(138 9 9)" }}
              onMouseEnter={(e) => { if (!replySent && !replySending) e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
              onMouseLeave={(e) => { if (!replySent && !replySending) e.currentTarget.style.backgroundColor = replySent ? "rgb(16 185 129)" : "rgb(138 9 9)"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {replySending ? "Sending…" : replySent ? "Sent!" : `Send ${sendLabel}`}
            </button>
            <button
              onClick={closeCompose}
              className="text-xs px-3 py-1.5 rounded-[8px] transition-colors"
              style={{ color: "rgb(115 115 115)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(238 238 238)"; e.currentTarget.style.color = "rgb(38 38 38)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgb(115 115 115)"; }}
            >
              Discard
            </button>
            <span className="ml-auto text-xs" style={{ color: "rgb(185 185 185)" }}>⌘↵ to send</span>
          </div>
        </div>
      )}

      {/* ── Email body (scrollable) ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
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

        <div className="text-sm leading-relaxed" style={{ color: "rgb(58 58 58)" }}>
          {email.body?.contentType === "html" ? (
            <SafeHtml html={email.body.content} />
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{email.body?.content ?? email.bodyPreview}</pre>
          )}
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgb(115 115 115)" }}>
              Attachments ({email.attachments.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {email.attachments.map((att) => (
                <div key={att.id} className="inline-flex items-center gap-3 p-3 border border-neutral-200 rounded-[10px] bg-white cursor-pointer">
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
      </div>
    </div>
  );
}
