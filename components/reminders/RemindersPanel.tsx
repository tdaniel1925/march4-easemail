"use client";

import { useState, useEffect } from "react";

interface Reminder {
  id: string;
  messageId: string;
  subject: string;
  recipient: string;
  remindAt: string;
  status: string;
  createdAt: string;
  homeAccountId?: string;
}

interface RemindersPanelProps {
  onFollowUp?: (reminder: Reminder) => void;
  onCountChange?: (count: number) => void;
}

export default function RemindersPanel({ onFollowUp, onCountChange }: RemindersPanelProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    setLoading(true);
    try {
      const res = await fetch("/api/reminders?status=triggered");
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
        onCountChange?.(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function dismissReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    onCountChange?.(reminders.length - 1);
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });
    } catch {
      fetchReminders(); // revert on failure
    }
  }

  async function snoozeReminder(id: string) {
    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + 1);

    setReminders((prev) => prev.filter((r) => r.id !== id));
    onCountChange?.(reminders.length - 1);
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending", remindAt: snoozeUntil.toISOString() }),
      });
    } catch {
      fetchReminders();
    }
  }

  function getDaysAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  if (loading) {
    return (
      <div className="rounded-[14px] border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(138 9 9)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>Follow-up Reminders</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgb(220 220 220)", borderTopColor: "rgb(138 9 9)" }} />
        </div>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="rounded-[14px] border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(138 9 9)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>Follow-up Reminders</h3>
        </div>
        <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>
          No pending follow-ups. All caught up!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(138 9 9)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>
          Follow-up Reminders
        </h3>
        <span
          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: "rgb(138 9 9)" }}
        >
          {reminders.length}
        </span>
      </div>

      <div className="space-y-2 max-h-[240px] overflow-y-auto">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="rounded-[10px] border border-neutral-100 p-3 hover:border-neutral-200 transition-colors"
            style={{ backgroundColor: "rgb(254 249 249)" }}
          >
            <p className="text-xs font-medium truncate mb-0.5" style={{ color: "rgb(27 29 29)" }}>
              No reply from <span style={{ color: "rgb(138 9 9)" }}>{reminder.recipient}</span>
            </p>
            <p className="text-[11px] truncate mb-2" style={{ color: "rgb(115 115 115)" }}>
              &ldquo;{reminder.subject}&rdquo; &mdash; sent {getDaysAgo(reminder.createdAt)}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onFollowUp?.(reminder)}
                className="text-[10px] font-semibold px-2 py-1 rounded-[6px] text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "rgb(138 9 9)" }}
              >
                Follow up
              </button>
              <button
                onClick={() => dismissReminder(reminder.id)}
                className="text-[10px] font-medium px-2 py-1 rounded-[6px] border border-neutral-200 hover:bg-neutral-50 transition-colors"
                style={{ color: "rgb(82 82 82)" }}
              >
                Dismiss
              </button>
              <button
                onClick={() => snoozeReminder(reminder.id)}
                className="text-[10px] font-medium px-2 py-1 rounded-[6px] border border-neutral-200 hover:bg-neutral-50 transition-colors"
                style={{ color: "rgb(82 82 82)" }}
              >
                +1 day
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
