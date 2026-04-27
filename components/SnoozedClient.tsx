"use client";

import { useState, useEffect } from "react";

interface SnoozedEmailRecord {
  id: string;
  messageId: string;
  homeAccountId: string;
  subject: string;
  senderName: string | null;
  senderEmail: string;
  snoozeUntil: string;
  isReturned: boolean;
}

export default function SnoozedClient() {
  const [snoozed, setSnoozed] = useState<SnoozedEmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsnoozingId, setUnsnoozingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mail/snooze")
      .then((r) => r.ok ? r.json() as Promise<{ snoozed: SnoozedEmailRecord[] }> : Promise.reject(new Error("Failed to load")))
      .then((data) => setSnoozed(data.snoozed))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load snoozed emails"))
      .finally(() => setLoading(false));
  }, []);

  async function handleUnsnooze(id: string) {
    setUnsnoozingId(id);
    try {
      const res = await fetch(`/api/mail/snooze/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to unsnooze");
      setSnoozed((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unsnooze");
    } finally {
      setUnsnoozingId(null);
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-white" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-neutral-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>Snoozed</h2>
        </div>
        <p className="text-xs mt-1" style={{ color: "rgb(155 155 155)" }}>
          Emails you&rsquo;ve snoozed will return to your inbox at the scheduled time.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <svg className="w-5 h-5 animate-spin" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}

        {error && (
          <div className="mx-4 mt-4 px-4 py-3 rounded-[10px] border" style={{ backgroundColor: "rgb(254 242 242)", borderColor: "rgb(220 180 180)" }}>
            <p className="text-sm" style={{ color: "rgb(138 9 9)" }}>{error}</p>
          </div>
        )}

        {!loading && !error && snoozed.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <svg className="w-10 h-10" style={{ color: "rgb(212 212 212)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm" style={{ color: "rgb(155 155 155)" }}>No snoozed emails</p>
          </div>
        )}

        {!loading && snoozed.length > 0 && (
          <div className="divide-y divide-neutral-100">
            {snoozed.map((item) => {
              const snoozeDate = new Date(item.snoozeUntil);
              const isPast = snoozeDate <= new Date();
              return (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold truncate" style={{ color: "rgb(27 29 29)" }}>
                        {item.senderName ?? item.senderEmail}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{
                          backgroundColor: isPast ? "rgb(254 242 242)" : "rgb(245 245 245)",
                          color: isPast ? "rgb(138 9 9)" : "rgb(115 115 115)",
                        }}
                      >
                        {isPast ? "Returning..." : snoozeDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " " + snoozeDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm truncate" style={{ color: "rgb(82 82 82)" }}>{item.subject}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgb(155 155 155)" }}>{item.senderEmail}</p>
                  </div>
                  <button
                    onClick={() => void handleUnsnooze(item.id)}
                    disabled={unsnoozingId === item.id}
                    className="flex-shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-[8px] border transition-colors disabled:opacity-60"
                    style={{ color: "rgb(138 9 9)", borderColor: "rgb(220 180 180)" }}
                  >
                    {unsnoozingId === item.id ? "..." : "Unsnooze"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
