"use client";

import { useState } from "react";
import type { EmailMessage } from "@/lib/types/email";

interface SnoozePickerProps {
  email: EmailMessage;
  homeAccountId: string;
  onSnoozed: () => void;
  onClose: () => void;
  error: string | null;
  onError: (err: string | null) => void;
}

function getQuickOptions(): { label: string; date: Date }[] {
  const now = new Date();
  const hour = now.getHours();

  const laterToday = new Date(now);
  if (hour < 15) {
    laterToday.setHours(15, 0, 0, 0); // 3pm
  } else if (hour < 17) {
    laterToday.setHours(17, 0, 0, 0); // 5pm
  } else {
    laterToday.setDate(laterToday.getDate() + 1);
    laterToday.setHours(8, 0, 0, 0); // tomorrow 8am if past 5pm
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const nextMonday = new Date(now);
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(8, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(8, 0, 0, 0);

  return [
    { label: hour < 17 ? "Later today" : "Tomorrow morning", date: laterToday },
    { label: "Tomorrow morning (8am)", date: tomorrow },
    { label: "Next Monday (8am)", date: nextMonday },
    { label: "In 1 week", date: nextWeek },
  ];
}

export default function SnoozePicker({ email, homeAccountId, onSnoozed, onClose, error, onError }: SnoozePickerProps) {
  const [loading, setLoading] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("08:00");
  const [showCustom, setShowCustom] = useState(false);

  const quickOptions = getQuickOptions();

  async function snoozeUntil(date: Date) {
    setLoading(true);
    onError(null);
    try {
      const res = await fetch("/api/mail/snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: email.id,
          homeAccountId,
          snoozeUntil: date.toISOString(),
          subject: email.subject,
          senderName: email.from.name,
          senderEmail: email.from.address,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string })) as { error?: string };
        throw new Error(data.error ?? "Snooze failed");
      }
      onSnoozed();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to snooze email");
    } finally {
      setLoading(false);
    }
  }

  function handleCustomSnooze() {
    if (!customDate) { onError("Please select a date"); return; }
    const [y, m, d] = customDate.split("-").map(Number);
    const [h, min] = customTime.split(":").map(Number);
    const date = new Date(y, m - 1, d, h, min, 0, 0);
    if (date <= new Date()) { onError("Snooze time must be in the future"); return; }
    void snoozeUntil(date);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-xl w-full max-w-sm mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>Snooze email</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100" style={{ color: "rgb(155 155 155)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs mb-3 truncate" style={{ color: "rgb(115 115 115)" }}>
          &ldquo;{email.subject}&rdquo;
        </p>

        {/* Quick options */}
        <div className="space-y-1.5 mb-3">
          {quickOptions.map(({ label, date }) => (
            <button
              key={label}
              onClick={() => void snoozeUntil(date)}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] border border-neutral-200 hover:border-neutral-400 transition-colors text-sm text-left disabled:opacity-60"
              style={{ color: "rgb(38 38 38)" }}
            >
              <span>{label}</span>
              <span className="text-xs" style={{ color: "rgb(155 155 155)" }}>
                {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                {" "}
                {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </button>
          ))}
        </div>

        {/* Custom date/time */}
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full text-xs font-medium py-2 rounded-[8px] border border-dashed border-neutral-300 hover:border-neutral-400 transition-colors"
            style={{ color: "rgb(115 115 115)" }}
          >
            Custom date &amp; time...
          </button>
        ) : (
          <div className="space-y-2 border-t border-neutral-100 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "rgb(82 82 82)" }}>Date</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-2 py-1.5 rounded-[8px] border text-xs focus:outline-none"
                  style={{ borderColor: "rgb(218 100 100)", color: "rgb(38 38 38)" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "rgb(82 82 82)" }}>Time</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-[8px] border text-xs focus:outline-none"
                  style={{ borderColor: "rgb(218 100 100)", color: "rgb(38 38 38)" }}
                />
              </div>
            </div>
            <button
              onClick={handleCustomSnooze}
              disabled={loading}
              className="w-full py-2 rounded-[8px] text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: "rgb(138 9 9)" }}
            >
              {loading ? "Snoozing..." : "Snooze"}
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <p className="mt-2 text-xs" style={{ color: "rgb(138 9 9)" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
