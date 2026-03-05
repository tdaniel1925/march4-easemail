"use client";

import { useEffect, useState } from "react";
import type { EmailMessage } from "@/lib/types/email";
import type { AiReplyResponse } from "@/app/api/mail/ai-reply/route";

const URGENCY_CONFIG = {
  high:   { label: "High priority", color: "rgb(153 27 27)",  bg: "rgb(254 242 242)", dot: "rgb(220 38 38)" },
  medium: { label: "Medium priority", color: "rgb(120 53 15)", bg: "rgb(255 247 237)", dot: "rgb(234 88 12)" },
  low:    { label: "Low priority",  color: "rgb(20 83 45)",  bg: "rgb(240 253 244)", dot: "rgb(34 197 94)" },
};

export default function AiReplyModal({
  email,
  onClose,
  onSelectOption,
}: {
  email: EmailMessage;
  onClose: () => void;
  onSelectOption: (body: string) => void;
}) {
  const [result, setResult] = useState<AiReplyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/mail/ai-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: email.subject,
        from: email.from.name,
        bodyPreview: email.bodyPreview,
        body: email.body?.content ?? email.bodyPreview,
      }),
    })
      .then((r) => r.json())
      .then((data: AiReplyResponse & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        setResult(data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [email.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const urgency = result ? URGENCY_CONFIG[result.urgency] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-[16px] w-full flex flex-col"
        style={{ maxWidth: 560, maxHeight: "85vh", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>AI Reply Assistant</span>
            </div>
            <p className="text-xs truncate" style={{ color: "rgb(115 115 115)" }}>{email.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] transition-colors flex-shrink-0"
            style={{ color: "rgb(155 155 155)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; e.currentTarget.style.color = "rgb(58 58 58)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgb(155 155 155)"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 animate-spin" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>Analyzing email…</p>
            </div>
          )}

          {error && (
            <div className="rounded-[10px] px-4 py-3 text-sm" style={{ backgroundColor: "rgb(254 242 242)", color: "rgb(153 27 27)" }}>
              {error}. Make sure your Anthropic API key is set in .env.local and restart the server.
            </div>
          )}

          {result && urgency && (
            <>
              {/* Summary */}
              <div className="rounded-[10px] px-4 py-3 mb-5" style={{ backgroundColor: "rgb(250 250 250)", border: "1px solid rgb(229 229 229)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: urgency.dot }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: urgency.color }}>{urgency.label}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgb(58 58 58)" }}>{result.summary}</p>
              </div>

              {/* Reply options */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgb(115 115 115)" }}>
                Select a reply to use
              </p>
              <div className="flex flex-col gap-3">
                {result.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { onSelectOption(opt.body); onClose(); }}
                    className="text-left w-full px-4 py-3.5 rounded-[10px] transition-all border"
                    style={{ borderColor: "rgb(229 229 229)", backgroundColor: "white" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgb(138 9 9)";
                      e.currentTarget.style.backgroundColor = "rgb(253 235 235)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgb(229 229 229)";
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    <p className="text-xs font-semibold mb-1.5" style={{ color: "rgb(138 9 9)" }}>{opt.title}</p>
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "rgb(82 82 82)" }}>{opt.body}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex-shrink-0">
          <p className="text-xs text-center" style={{ color: "rgb(185 185 185)" }}>
            Generated by Claude · Always review before sending
          </p>
        </div>
      </div>
    </div>
  );
}
