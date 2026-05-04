"use client";

import { useState, useRef, useEffect } from "react";

interface RemindMeDropdownProps {
  messageId: string;
  subject: string;
  recipient: string; // email address of who should reply
  conversationId?: string;
  homeAccountId?: string;
}

export default function RemindMeDropdown({
  messageId,
  subject,
  recipient,
  conversationId,
  homeAccountId,
}: RemindMeDropdownProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCustom(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Reset success after 3 seconds
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  async function createReminder(remindAt: Date) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          subject,
          recipient,
          conversationId: conversationId || null,
          homeAccountId: homeAccountId || null,
          remindAt: remindAt.toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error((data as { error?: string }).error || "Failed to set reminder");
      }
      setSuccess(true);
      setOpen(false);
      setShowCustom(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handlePreset(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    createReminder(date);
  }

  function handleCustomSubmit() {
    if (!customDate) return;
    const date = new Date(customDate);
    if (isNaN(date.getTime()) || date <= new Date()) {
      setError("Please select a future date");
      return;
    }
    createReminder(date);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); setError(null); }}
        disabled={loading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-small text-xs font-medium transition-colors disabled:opacity-60"
        style={{
          backgroundColor: success ? "rgb(236 253 245)" : "transparent",
          color: success ? "rgb(22 163 74)" : "rgb(82 82 82)",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => { if (!success) e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
        onMouseLeave={(e) => { if (!success) e.currentTarget.style.backgroundColor = "transparent"; }}
        title="Set follow-up reminder"
      >
        {loading ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : success ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {success ? "Reminder set" : "Remind me"}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 bg-white border border-neutral-200 rounded-[10px] shadow-lg py-1 min-w-[200px]"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
        >
          {!showCustom ? (
            <>
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase text-neutral-400 tracking-wider">
                If no reply in...
              </p>
              <button
                onClick={() => handlePreset(1)}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
                style={{ color: "rgb(27 29 29)" }}
              >
                1 day
              </button>
              <button
                onClick={() => handlePreset(3)}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
                style={{ color: "rgb(27 29 29)" }}
              >
                3 days
              </button>
              <button
                onClick={() => handlePreset(7)}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
                style={{ color: "rgb(27 29 29)" }}
              >
                1 week
              </button>
              <div className="border-t border-neutral-100 my-1" />
              <button
                onClick={() => setShowCustom(true)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors"
                style={{ color: "rgb(138 9 9)" }}
              >
                Custom date...
              </button>
            </>
          ) : (
            <div className="px-3 py-2">
              <p className="text-xs font-medium mb-2" style={{ color: "rgb(82 82 82)" }}>
                Remind me on:
              </p>
              <input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-neutral-200 rounded-[6px] px-2 py-1.5 text-sm mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustom(false)}
                  className="flex-1 text-xs py-1.5 rounded-[6px] border border-neutral-200 hover:bg-neutral-50 transition-colors"
                  style={{ color: "rgb(82 82 82)" }}
                >
                  Back
                </button>
                <button
                  onClick={handleCustomSubmit}
                  disabled={loading || !customDate}
                  className="flex-1 text-xs py-1.5 rounded-[6px] text-white font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "rgb(138 9 9)" }}
                >
                  Set
                </button>
              </div>
            </div>
          )}
          {error && (
            <p className="px-3 py-1.5 text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
