"use client";

import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "@/lib/stores/account-store";
import { useCalendarStore } from "@/lib/stores/calendar-store";
import type { CalEvent } from "@/lib/types/calendar";

const BRAND = "rgb(138, 9, 9)";

interface Props {
  prefill?: Partial<{
    subject: string;
    start: string;   // ISO datetime or YYYY-MM-DDTHH:mm
    end: string;
    location: string;
    attendees: string[];
    isAllDay: boolean;
    body: string;
    homeAccountId: string;
  }>;
  onClose: () => void;
  onSaved: (event: CalEvent) => void;
  editEvent?: CalEvent;  // if set, we're editing
}

function toLocalInput(iso: string): string {
  // Converts ISO datetime to YYYY-MM-DDTHH:mm for <input type="datetime-local">
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(localInput: string): string {
  return new Date(localInput).toISOString();
}

export default function EventFormModal({ prefill, onClose, onSaved, editEvent }: Props) {
  const accounts = useAccountStore((s) => s.accounts);
  const defaultAccount = useAccountStore((s) => s.activeAccount);
  const { currentWeekStart } = useCalendarStore();

  // Default start: next full hour today or prefilled
  function defaultStart() {
    if (prefill?.start) return prefill.start.length === 16 ? prefill.start : toLocalInput(prefill.start);
    if (editEvent) return toLocalInput(editEvent.startDateTime);
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocalInput(d.toISOString());
  }
  function defaultEnd() {
    if (prefill?.end) return prefill.end.length === 16 ? prefill.end : toLocalInput(prefill.end);
    if (editEvent) return toLocalInput(editEvent.endDateTime);
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 2);
    return toLocalInput(d.toISOString());
  }

  const [subject, setSubject] = useState(editEvent?.subject ?? prefill?.subject ?? "");
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [isAllDay, setIsAllDay] = useState(editEvent?.isAllDay ?? prefill?.isAllDay ?? false);
  const [location, setLocation] = useState(editEvent?.location ?? prefill?.location ?? "");
  const [body, setBody] = useState(editEvent?.bodyPreview ?? prefill?.body ?? "");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<string[]>(
    editEvent?.attendees.map((a) => a.address) ?? prefill?.attendees ?? []
  );
  const [homeAccountId, setHomeAccountId] = useState(
    editEvent?.accountHomeId ?? prefill?.homeAccountId ?? defaultAccount?.homeAccountId ?? accounts[0]?.homeAccountId ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  useEffect(() => { subjectRef.current?.focus(); }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // When start changes, push end forward to maintain duration
  function handleStartChange(val: string) {
    const prevDuration = new Date(toIso(end)).getTime() - new Date(toIso(start)).getTime();
    setStart(val);
    const newEnd = new Date(new Date(toIso(val)).getTime() + prevDuration);
    setEnd(toLocalInput(newEnd.toISOString()));
  }

  function addAttendee() {
    const trimmed = attendeeInput.trim().toLowerCase();
    if (trimmed && !attendees.includes(trimmed)) {
      setAttendees((prev) => [...prev, trimmed]);
    }
    setAttendeeInput("");
  }

  function removeAttendee(addr: string) {
    setAttendees((prev) => prev.filter((a) => a !== addr));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) { setError("Subject is required."); return; }
    if (!isAllDay && new Date(toIso(end)) <= new Date(toIso(start))) {
      setError("End time must be after start time."); return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      homeAccountId,
      subject: subject.trim(),
      start: isAllDay ? start.split("T")[0] + "T00:00:00" : toIso(start),
      end: isAllDay ? end.split("T")[0] + "T00:00:00" : toIso(end),
      isAllDay,
      location: location.trim() || undefined,
      body: body.trim() || undefined,
      attendees: attendees.length ? attendees : undefined,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(editEvent ? { eventId: editEvent.id } : {}),
    };

    try {
      const res = await fetch("/api/calendar/event", {
        method: editEvent ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { ok?: boolean; event?: CalEvent; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Failed to save event");
      if (data.event) onSaved(data.event);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-xl w-full max-w-lg overflow-hidden"
        style={{ maxHeight: "calc(100vh - 48px)" }}
        onClick={(ev) => ev.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>
            {editEvent ? "Edit Event" : "New Event"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form id="event-form" noValidate onSubmit={(e) => void handleSubmit(e)} className="px-6 py-5 overflow-y-auto space-y-4" style={{ maxHeight: "65vh" }}>

          {/* Subject */}
          <div>
            <input
              ref={subjectRef}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Event title"
              className="w-full text-base font-medium border-0 border-b border-neutral-200 pb-2 focus:outline-none focus:border-neutral-400 bg-transparent"
              style={{ color: "rgb(27 29 29)" }}
            />
          </div>

          {/* All-day toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAllDay((v) => !v)}
              className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
              style={{ backgroundColor: isAllDay ? BRAND : "rgb(209 213 219)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: isAllDay ? "translateX(16px)" : "translateX(0)" }}
              />
            </button>
            <span className="text-sm text-neutral-600">All day</span>
          </div>

          {/* Date/time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Start</label>
              <input
                data-testid="event-start"
                type={isAllDay ? "date" : "datetime-local"}
                value={isAllDay ? start.split("T")[0] : start}
                onChange={(e) => handleStartChange(e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-[8px] px-3 py-2 focus:outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">End</label>
              <input
                data-testid="event-end"
                type={isAllDay ? "date" : "datetime-local"}
                value={isAllDay ? end.split("T")[0] : end}
                onChange={(e) => setEnd(e.target.value)}
                min={isAllDay ? start.split("T")[0] : start}
                className="w-full text-sm border border-neutral-200 rounded-[8px] px-3 py-2 focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="w-full text-sm border border-neutral-200 rounded-[8px] px-3 py-2 focus:outline-none focus:border-neutral-400"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Attendees</label>
            <div className="border border-neutral-200 rounded-[8px] px-3 py-2 min-h-[38px] flex flex-wrap gap-1.5">
              {attendees.map((addr) => (
                <span key={addr} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  {addr}
                  <button type="button" onClick={() => removeAttendee(addr)} className="text-neutral-400 hover:text-neutral-600">×</button>
                </span>
              ))}
              <input
                type="email"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addAttendee(); } }}
                onBlur={addAttendee}
                placeholder={attendees.length === 0 ? "Add email address…" : ""}
                className="flex-1 min-w-[120px] text-sm focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add description"
              rows={3}
              className="w-full text-sm border border-neutral-200 rounded-[8px] px-3 py-2 focus:outline-none focus:border-neutral-400 resize-none"
            />
          </div>

          {/* Account */}
          {accounts.length > 1 && (
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Calendar account</label>
              <select
                value={homeAccountId}
                onChange={(e) => setHomeAccountId(e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-[8px] px-3 py-2 focus:outline-none focus:border-neutral-400 bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.homeAccountId} value={acc.homeAccountId}>{acc.msEmail}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-xs font-medium" style={{ color: BRAND }}>{error}</p>}
        </form>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-[8px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-[8px] text-white transition-colors"
            style={{ backgroundColor: loading ? "rgb(180 30 30)" : BRAND }}
          >
            {loading ? "Saving…" : editEvent ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
