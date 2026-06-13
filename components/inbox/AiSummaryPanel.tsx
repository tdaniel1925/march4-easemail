"use client";

import { useEffect, useRef, useState } from "react";

interface ActionItem {
  type: "date" | "amount" | "request" | "decision" | "contact" | "attachment";
  label: string;
}
interface Insight {
  tldr: string;
  bullets: string[];
  actionItems: ActionItem[];
  suggestedAction: string;
}

const ACTION_LABEL: Record<string, string> = {
  reply: "Reply",
  reply_all: "Reply all",
  forward: "Forward",
  schedule: "Add to calendar",
  archive: "Archive",
  snooze: "Snooze",
  none: "",
};

const CHIP_ICON: Record<ActionItem["type"], string> = {
  date: "📅",
  amount: "💵",
  request: "✋",
  decision: "⚖️",
  contact: "👤",
  attachment: "📎",
};

/**
 * Collapsible AI summary panel shown above an email's body. Generates lazily
 * on first open (cached server-side by message + thread time), so re-opening is
 * instant and free. Never blocks the email — failures show a quiet notice.
 */
export function AiSummaryPanel(props: {
  messageId: string;
  homeAccountId?: string;
  subject?: string;
  from?: string;
  /** Plain-text or stripped body the reading pane already has. */
  body: string;
  latestReceivedAt: string;
  onSuggestedAction?: (action: string) => void;
  onAddDate?: (label: string) => void;
}) {
  const { messageId, homeAccountId, subject, from, body, latestReceivedAt } = props;
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!body.trim()) {
      setLoading(false);
      setError("No content to summarize");
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setInsight(null);

    fetch("/api/mail/ai-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, homeAccountId, subject, from, body, latestReceivedAt }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 429) throw new Error("AI is busy — try again in a moment");
          throw new Error("Summary unavailable");
        }
        return res.json();
      })
      .then((data: Insight) => {
        if (ctrl.signal.aborted) return;
        setInsight(data);
        setLoading(false);
      })
      .catch((e) => {
        if (ctrl.signal.aborted || (e as Error).name === "AbortError") return;
        setError((e as Error).message);
        setLoading(false);
      });

    return () => ctrl.abort();
    // Regenerate when the opened message or its thread time changes.
  }, [messageId, latestReceivedAt, body, homeAccountId, subject, from]);

  // Quiet failure — don't take up space or alarm the user.
  if (error && !insight) {
    return (
      <div className="mx-5 mt-4 text-xs" style={{ color: "rgb(155 155 155)" }}>
        AI summary unavailable.
      </div>
    );
  }

  return (
    <div
      className="mx-5 mt-4 rounded-[12px] border"
      style={{ borderColor: "rgb(230 230 230)", backgroundColor: "rgb(250 250 252)" }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-2.5"
      >
        <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: "rgb(90 70 160)" }}>
          <span>✨</span> AI summary
        </span>
        <span className="text-xs" style={{ color: "rgb(155 155 155)" }}>{collapsed ? "Show" : "Hide"}</span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4">
          {loading ? (
            <div className="space-y-2 animate-pulse pt-1">
              <div className="h-3.5 bg-neutral-200 rounded w-11/12" />
              <div className="h-3 bg-neutral-200 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 rounded w-5/6" />
            </div>
          ) : insight ? (
            <>
              <p className="text-sm font-medium mb-2" style={{ color: "rgb(40 40 40)" }}>{insight.tldr}</p>
              {insight.bullets.length > 0 && (
                <ul className="text-xs space-y-1 mb-3" style={{ color: "rgb(90 90 90)" }}>
                  {insight.bullets.map((b, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span style={{ color: "rgb(180 180 180)" }}>•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {insight.actionItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {insight.actionItems.map((a, i) => {
                    const clickable = a.type === "date" && props.onAddDate;
                    return (
                      <button
                        key={i}
                        onClick={clickable ? () => props.onAddDate!(a.label) : undefined}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-xs border"
                        style={{
                          borderColor: "rgb(225 225 230)",
                          backgroundColor: "white",
                          color: "rgb(70 70 70)",
                          cursor: clickable ? "pointer" : "default",
                        }}
                        title={clickable ? "Add to calendar" : undefined}
                      >
                        <span>{CHIP_ICON[a.type]}</span>
                        <span>{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {insight.suggestedAction && insight.suggestedAction !== "none" && props.onSuggestedAction && (
                <button
                  onClick={() => props.onSuggestedAction!(insight.suggestedAction)}
                  className="text-xs font-medium px-3 py-1.5 rounded-[8px]"
                  style={{ backgroundColor: "rgb(90 70 160)", color: "white" }}
                >
                  Suggested: {ACTION_LABEL[insight.suggestedAction] ?? insight.suggestedAction}
                </button>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
