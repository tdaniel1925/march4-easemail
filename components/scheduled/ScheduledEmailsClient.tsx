"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccountStore } from "@/lib/stores/account-store";

interface ScheduledDraft {
  id: string;
  subject: string | null;
  toRecipients: unknown;
  scheduledAt: string | null;
  createdAt: string;
}

function formatRecipients(raw: unknown): string {
  if (!raw || !Array.isArray(raw)) return "(no recipient)";
  return (raw as { emailAddress?: { address?: string } }[])
    .map((r) => r?.emailAddress?.address ?? "")
    .filter(Boolean)
    .join(", ");
}

function formatScheduled(iso: string | null): string {
  if (!iso) return "Unknown time";
  return new Date(iso).toLocaleString([], {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ScheduledEmailsClient() {
  const [drafts, setDrafts] = useState<ScheduledDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const setScheduledCount = useAccountStore((s) => s.setScheduledCount);
  const activeAccountId = useAccountStore((s) => s.activeAccount?.homeAccountId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/drafts?scheduled=1");
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Failed to load scheduled emails");
        return;
      }
      const d = await res.json() as { drafts?: ScheduledDraft[] };
      const loaded = d.drafts ?? [];
      setDrafts(loaded);
      setScheduledCount(loaded.length);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [setScheduledCount]);

  // Re-fetch whenever the active account changes
  useEffect(() => {
    setDrafts([]);
    void load();
  }, [activeAccountId, load]);

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      const res = await fetch(`/api/drafts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Failed to cancel");
        return;
      }
      setDrafts((prev) => {
        const next = prev.filter((d) => d.id !== id);
        setScheduledCount(next.length);
        return next;
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-white overflow-y-auto" style={{ height: "100vh" }}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-200 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "rgb(27 29 29)" }}>Scheduled</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgb(115 115 115)" }}>
            Emails queued to send at a future time
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="text-xs font-medium px-3 py-1.5 rounded-[8px] border transition-colors"
          style={{ borderColor: "rgb(229 231 235)", color: "rgb(82 82 82)" }}
        >
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-[10px] text-sm flex items-center justify-between" style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)" }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-medium underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "rgb(155 155 155)" }}>
          Loading…
        </div>
      )}

      {/* Empty state */}
      {!loading && drafts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "rgb(209 213 219)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium" style={{ color: "rgb(115 115 115)" }}>No scheduled emails</p>
          <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>
            Use the Schedule Send option in Compose to queue emails for later.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && drafts.length > 0 && (
        <ul className="divide-y divide-neutral-100">
          {drafts.map((draft) => (
            <li key={draft.id} className="px-6 py-4 flex items-start gap-4 hover:bg-neutral-50 transition-colors">
              {/* Clock icon */}
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgb(254 242 242)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(138 9 9)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "rgb(27 29 29)" }}>
                  {draft.subject || "(No subject)"}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "rgb(115 115 115)" }}>
                  To: {formatRecipients(draft.toRecipients)}
                </p>
                <p className="text-xs mt-1 font-medium" style={{ color: "rgb(138 9 9)" }}>
                  Sends {formatScheduled(draft.scheduledAt)}
                </p>
              </div>

              {/* Cancel */}
              <button
                onClick={() => void handleCancel(draft.id)}
                disabled={cancelling === draft.id}
                className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-[8px] border transition-colors"
                style={{
                  borderColor: "rgb(229 231 235)",
                  color: cancelling === draft.id ? "rgb(155 155 155)" : "rgb(82 82 82)",
                  opacity: cancelling === draft.id ? 0.6 : 1,
                }}
              >
                {cancelling === draft.id ? "Cancelling…" : "Cancel"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
