"use client";

import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "@/lib/stores/account-store";
import type { CalEvent } from "@/lib/types/calendar";
import type { SpeechRecognitionInstance, SpeechRecognitionConstructor } from "@/lib/types/speech";

const BRAND = "rgb(138, 9, 9)";

const DEFAULT_LOCATION_PRESETS = ["Conference Room A", "Conference Room B", "Zoom", "Teams", "Remote"];
const LOCATION_STORAGE_KEY = "easemail:locationPresets";

const REMINDER_OPTIONS = [
  { label: "None", value: null },
  { label: "5 min before", value: 5 },
  { label: "15 min before", value: 15 },
  { label: "30 min before", value: 30 },
  { label: "1 hour before", value: 60 },
  { label: "1 day before", value: 1440 },
];

type Recurrence = "none" | "daily" | "weekly" | "monthly";

interface Props {
  prefill?: Partial<{
    subject: string;
    start: string;
    end: string;
    location: string;
    attendees: string[];
    isAllDay: boolean;
    body: string;
    homeAccountId: string;
  }>;
  onClose: () => void;
  onSaved: (event: CalEvent) => void;
  editEvent?: CalEvent;
}

// ── Date/time helpers ─────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

function toLocalDate(iso: string): string {
  // Parse directly from ISO string to avoid timezone conversion
  // Handles both "2026-04-24T22:00:00" (local) and "2026-04-24T22:00:00Z" (UTC)
  if (iso.includes("T") && !iso.endsWith("Z") && !iso.includes("+")) {
    // Local time string — extract date directly
    return iso.split("T")[0];
  }
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toLocalTime(iso: string): string {
  // Parse directly from ISO string to avoid timezone conversion
  if (iso.includes("T") && !iso.endsWith("Z") && !iso.includes("+")) {
    // Local time string — extract time directly
    const timePart = iso.split("T")[1].split(":"); // ["22", "00", "00"]
    return `${timePart[0]}:${timePart[1]}`;
  }
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function combineToIso(date: string, time: string): string {
  // Keep as local time — do NOT convert to UTC via toISOString()
  // The Graph API will interpret this with the timeZone field we pass alongside it
  return `${date}T${time}:00`;
}
function defaultStartDate(): string {
  return toLocalDate(new Date().toISOString());
}
function defaultStartTime(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return `${pad(d.getHours())}:00`;
}
function defaultEndTime(startTime: string): string {
  const [h, m] = startTime.split(":").map(Number);
  const end = new Date();
  end.setHours(h + 1, m, 0, 0);
  return `${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function EventFormModal({ prefill, onClose, onSaved, editEvent, userTimeZone }: Props & { userTimeZone?: string }) {
  const accounts = useAccountStore((s) => s.accounts);
  const defaultAccount = useAccountStore((s) => s.activeAccount);

  // ── Core fields ──────────────────────────────────────────────────────────────
  const [subject, setSubject] = useState(editEvent?.subject ?? prefill?.subject ?? "");
  const [isAllDay, setIsAllDay] = useState(editEvent?.isAllDay ?? prefill?.isAllDay ?? false);

  const initStartDate = () => {
    if (prefill?.start) return toLocalDate(prefill.start.includes("T") ? prefill.start : prefill.start + "T00:00:00");
    if (editEvent) return toLocalDate(editEvent.startDateTime);
    return defaultStartDate();
  };
  const initStartTime = () => {
    if (prefill?.start && prefill.start.includes("T")) return toLocalTime(prefill.start);
    if (editEvent) return toLocalTime(editEvent.startDateTime);
    return defaultStartTime();
  };
  const initEndDate = () => {
    if (prefill?.end) return toLocalDate(prefill.end.includes("T") ? prefill.end : prefill.end + "T00:00:00");
    if (editEvent) return toLocalDate(editEvent.endDateTime);
    return defaultStartDate();
  };
  const initEndTime = () => {
    if (prefill?.end && prefill.end.includes("T")) return toLocalTime(prefill.end);
    if (editEvent) return toLocalTime(editEvent.endDateTime);
    return defaultEndTime(defaultStartTime());
  };

  const [startDate, setStartDate] = useState(initStartDate);
  const [startTime, setStartTime] = useState(initStartTime);
  const [endDate, setEndDate] = useState(initEndDate);
  const [endTime, setEndTime] = useState(initEndTime);

  const [location, setLocation] = useState(editEvent?.location ?? prefill?.location ?? "");
  const [body, setBody] = useState(editEvent?.bodyPreview ?? prefill?.body ?? "");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<string[]>(
    editEvent?.attendees.map((a) => a.address) ?? prefill?.attendees ?? []
  );
  const [homeAccountId, setHomeAccountId] = useState(
    editEvent?.accountHomeId ?? prefill?.homeAccountId ?? defaultAccount?.homeAccountId ?? accounts[0]?.homeAccountId ?? ""
  );

  // ── New fields ────────────────────────────────────────────────────────────────
  const [recurrence, setRecurrence] = useState<Recurrence>(editEvent?.recurrence as Recurrence ?? "none");
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(editEvent?.reminderMinutes ?? 30);
  const [showAs, setShowAs] = useState<"busy" | "free" | "tentative">(editEvent?.showAs as "busy" | "free" | "tentative" ?? "busy");
  const [teamsEnabled, setTeamsEnabled] = useState(false);
  const [teamsMeetingUrl, setTeamsMeetingUrl] = useState("");
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Location presets (persisted to localStorage) ─────────────────────────────
  const [locationPresets, setLocationPresets] = useState<string[]>(DEFAULT_LOCATION_PRESETS);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocationText, setNewLocationText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) setLocationPresets(parsed);
      }
    } catch { /* use defaults */ }
  }, []);

  function savePresets(next: string[]) {
    setLocationPresets(next);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(next));
  }

  function addLocationPreset() {
    const trimmed = newLocationText.trim();
    if (trimmed && !locationPresets.includes(trimmed)) {
      savePresets([...locationPresets, trimmed]);
    }
    setNewLocationText("");
    setShowAddLocation(false);
  }

  function removeLocationPreset(preset: string) {
    savePresets(locationPresets.filter((p) => p !== preset));
  }

  // ── NL / voice ────────────────────────────────────────────────────────────────
  const [nlText, setNlText] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechRef = useRef<SpeechRecognitionInstance | null>(null);

  // ── NL auto-parse debounce ──────────────────────────────────────────────────
  const nlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Attendee autocomplete ──────────────────────────────────────────────────
  const [attendeeSuggestions, setAttendeeSuggestions] = useState<{ name: string; email: string }[]>([]);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fetchAttendeeSuggestions(q: string) {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (q.trim().length < 2) { setAttendeeSuggestions([]); return; }
    suggestTimer.current = setTimeout(() => {
      fetch(`/api/contacts?q=${encodeURIComponent(q)}`)
        .then((r) => r.json() as Promise<{ name: string; email: string }[]>)
        .then(setAttendeeSuggestions)
        .catch(() => setAttendeeSuggestions([]));
    }, 250);
  }

  // ── UI ────────────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const tz = userTimeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => { subjectRef.current?.focus(); }, []);
  // Clean up NL debounce timer on unmount
  useEffect(() => {
    return () => { if (nlDebounceRef.current) clearTimeout(nlDebounceRef.current); };
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function handleStartDateChange(val: string) {
    setStartDate(val);
    if (val > endDate) setEndDate(val);
  }
  function handleStartTimeChange(val: string) {
    const prevDuration =
      new Date(combineToIso(endDate, endTime)).getTime() -
      new Date(combineToIso(startDate, startTime)).getTime();
    setStartTime(val);
    const newEnd = new Date(new Date(combineToIso(startDate, val)).getTime() + prevDuration);
    setEndDate(toLocalDate(newEnd.toISOString()));
    setEndTime(toLocalTime(newEnd.toISOString()));
  }

  function addAttendee(email?: string) {
    const trimmed = (email ?? attendeeInput).trim().toLowerCase();
    if (trimmed && !attendees.includes(trimmed)) setAttendees((p) => [...p, trimmed]);
    setAttendeeInput("");
    setAttendeeSuggestions([]);
  }
  function removeAttendee(addr: string) {
    setAttendees((p) => p.filter((a) => a !== addr));
  }

  // ── NL parse ─────────────────────────────────────────────────────────────────
  // Pass text explicitly so voice can call this with the captured transcript
  // before React state has flushed.
  async function parseFill(text: string) {
    if (!text.trim()) return;
    setNlLoading(true);
    // Send LOCAL time so AI resolves "tomorrow / next Monday" in the user's timezone
    const d = new Date();
    const localNow = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    try {
      const res = await fetch("/api/calendar/nl-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, now: localNow, timeZone: tz }),
      });
      const data = await res.json() as { ok?: boolean; prefill?: { subject: string; start: string; end: string; location: string; attendees: string[]; body: string } };
      if (data.prefill) {
        const p = data.prefill;
        if (p.subject) setSubject(p.subject);
        if (p.start) { setStartDate(toLocalDate(p.start)); setStartTime(toLocalTime(p.start)); }
        if (p.end) { setEndDate(toLocalDate(p.end)); setEndTime(toLocalTime(p.end)); }
        if (p.location) setLocation(p.location);
        if (p.body) setBody(p.body);
        if (p.attendees?.length) setAttendees(p.attendees);
      }
    } catch { /* ignore */ }
    setNlLoading(false);
  }

  async function handleParseFill() { await parseFill(nlText); }

  // ── Voice input ───────────────────────────────────────────────────────────────
  function toggleVoice() {
    const SR = typeof window !== "undefined"
      ? ((window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
        ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition)
      : null;
    if (!SR) return;
    if (isListening) { speechRef.current?.stop(); setIsListening(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    // Collect final transcript in a closure variable — avoids React state staleness
    // when onend fires before the last setState call has flushed.
    let finalTranscript = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setNlText(finalTranscript + interim);
    };
    rec.onend = () => {
      setIsListening(false);
      // Auto-parse as soon as speech ends — no need to click Parse & Fill
      if (finalTranscript.trim()) void parseFill(finalTranscript.trim());
    };
    rec.onerror = () => setIsListening(false);
    rec.start();
    speechRef.current = rec;
    setIsListening(true);
  }

  // ── Teams meeting ─────────────────────────────────────────────────────────────
  async function handleTeamsToggle() {
    if (teamsEnabled) { setTeamsEnabled(false); setTeamsMeetingUrl(""); return; }
    setTeamsLoading(true);
    try {
      // Graph /me/onlineMeetings expects UTC datetime strings
      const startUtc = new Date(combineToIso(startDate, startTime)).toISOString();
      const endUtc = new Date(combineToIso(endDate, endTime)).toISOString();
      const res = await fetch("/api/calendar/teams-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim() || "New Meeting",
          startDateTime: startUtc,
          endDateTime: endUtc,
          homeAccountId,
        }),
      });
      const data = await res.json() as { joinWebUrl?: string; error?: string; message?: string };
      if (data.joinWebUrl) {
        setTeamsMeetingUrl(data.joinWebUrl);
        setTeamsEnabled(true);
        if (!location) setLocation(data.joinWebUrl);
      } else if (data.error === "teams_consent_required") {
        setError("Teams access not granted. Redirecting to grant permissions...");
        setTimeout(() => { window.location.href = "/api/auth/microsoft/teams-consent"; }, 1500);
      } else if (data.error === "account_requires_reauth") {
        setError("Your Microsoft session has expired. Please reconnect your account in Settings.");
      } else {
        setError(data.message ?? data.error ?? `Failed to create Teams meeting (${res.status}). Please try again.`);
      }
    } catch {
      setError("Failed to create Teams meeting. Check your connection and try again.");
    }
    setTeamsLoading(false);
  }

  async function copyTeamsUrl() {
    await navigator.clipboard.writeText(teamsMeetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) { setError("Event title is required."); return; }
    const startIso = combineToIso(startDate, startTime);
    const endIso = combineToIso(endDate, endTime);
    if (!isAllDay && new Date(endIso) <= new Date(startIso)) {
      setError("End time must be after start time."); return;
    }
    setLoading(true); setError(null);

    const bodyText = teamsEnabled && teamsMeetingUrl
      ? (body.trim()
          ? `${body.trim()}<br><br><b>Join Teams Meeting:</b> <a href="${teamsMeetingUrl}">${teamsMeetingUrl}</a>`
          : `<b>Join Teams Meeting:</b> <a href="${teamsMeetingUrl}">${teamsMeetingUrl}</a>`)
      : body.trim() || undefined;

    const payload = {
      homeAccountId,
      subject: subject.trim(),
      start: isAllDay ? startDate + "T00:00:00" : startIso,
      end: isAllDay ? endDate + "T00:00:00" : endIso,
      isAllDay,
      location: location.trim() || undefined,
      body: bodyText,
      attendees: attendees.length ? attendees : undefined,
      timeZone: tz,
      reminderMinutes,
      showAs,
      recurrence: recurrence !== "none" ? recurrence : null,
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

  const activeColor = BRAND;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: 860, maxHeight: "calc(100vh - 48px)", boxShadow: "0 24px 64px rgba(27,29,29,0.28)" }}
        onClick={(ev) => ev.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded flex-shrink-0 transition-colors" style={{ background: activeColor }} />
            <h2 className="font-semibold text-neutral-900 text-lg">
              {editEvent ? "Edit Event" : "Create New Event"}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Scheduling
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── AI Input Bar ── */}
        <div className="px-6 py-4 border-b border-neutral-100 flex-shrink-0" style={{ background: "linear-gradient(to right, rgb(254,242,242), rgb(255,255,255))" }}>
          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: BRAND }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Quick Schedule — describe your event in natural language
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={nlText}
                onChange={(e) => {
                  const val = e.target.value;
                  setNlText(val);
                  // Auto-parse after 2s pause in typing
                  if (nlDebounceRef.current) clearTimeout(nlDebounceRef.current);
                  if (val.trim()) {
                    nlDebounceRef.current = setTimeout(() => { void parseFill(val); }, 2000);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // Immediate parse on Enter — cancel any pending debounce
                    if (nlDebounceRef.current) clearTimeout(nlDebounceRef.current);
                    void handleParseFill();
                  }
                }}
                placeholder="e.g. Client deposition next Tuesday at 2pm for 2 hours with sarah@firm.com"
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-red-300 bg-white"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleVoice}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-white flex-shrink-0 transition-colors"
              style={{ backgroundColor: isListening ? "#dc2626" : BRAND }}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? (
                <span className="w-3 h-3 bg-white rounded-sm" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                // Immediate parse on click — cancel any pending debounce
                if (nlDebounceRef.current) clearTimeout(nlDebounceRef.current);
                void handleParseFill();
              }}
              disabled={nlLoading || !nlText.trim()}
              className="px-4 py-2 text-white rounded-lg text-sm font-semibold flex-shrink-0 transition-opacity disabled:opacity-40"
              style={{ backgroundColor: BRAND }}
            >
              {nlLoading ? "Parsing…" : "Parse & Fill"}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-neutral-400">Suggestions:</span>
            {["Team standup tomorrow 9am", "Client call Friday 3pm", "Deposition next Monday 10am 2 hours"].map((s) => (
              <button key={s} type="button" onClick={() => { setNlText(s); }} className="text-xs px-2.5 py-1 bg-white border border-neutral-200 rounded-full text-neutral-600 hover:border-red-300 hover:text-red-700 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <form id="event-form" noValidate onSubmit={(e) => void handleSubmit(e)} className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">Event Title</label>
            <input
              ref={subjectRef}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Add event title…"
              className="w-full text-base font-semibold border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-400"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Date & Time</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-500 block mb-1">Start</label>
                <div className="flex gap-2">
                  <input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)}
                    className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-400" />
                  {!isAllDay && (
                    <input type="time" value={startTime} onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-28 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-400" />
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-1">End</label>
                <div className="flex gap-2">
                  <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-400" />
                  {!isAllDay && (
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                      className="w-28 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-400" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-3">
              <button
                type="button"
                onClick={() => setIsAllDay((v) => !v)}
                className="flex items-center gap-2.5"
              >
                <div className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0" style={{ backgroundColor: isAllDay ? BRAND : "rgb(209 213 219)" }}>
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: isAllDay ? "translateX(16px)" : "translateX(0)" }} />
                </div>
                <span className="text-sm text-neutral-600">All day</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                {tz}
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Attendees & Guests</label>
            <div className="flex gap-2 mb-2">
              <div className="flex-1 relative">
                <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={attendeeInput}
                  onChange={(e) => { setAttendeeInput(e.target.value); fetchAttendeeSuggestions(e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addAttendee(); } }}
                  onBlur={() => { setTimeout(() => setAttendeeSuggestions([]), 200); }}
                  placeholder="Search people or add email…"
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 pl-9 focus:outline-none focus:border-neutral-400"
                />
                {attendeeSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {attendeeSuggestions.map((s) => (
                      <button
                        key={s.email}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addAttendee(s.email)}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: BRAND }}>
                          {(s.name || s.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-800 truncate">{s.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{s.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => addAttendee()} className="px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-200 transition-colors flex-shrink-0">
                Add
              </button>
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attendees.map((addr) => (
                  <div key={addr} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-neutral-100 border border-neutral-200 rounded-full text-neutral-700">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: BRAND }}>
                      {addr[0].toUpperCase()}
                    </div>
                    <span className="max-w-[160px] truncate">{addr}</span>
                    <button type="button" onClick={() => removeAttendee(addr)} className="text-neutral-400 hover:text-neutral-600 ml-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location + Teams */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Location</label>
              <div className="relative">
                <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location or meeting link…"
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 pl-9 focus:outline-none focus:border-neutral-400"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                {locationPresets.map((s) => (
                  <span key={s} className="group relative inline-flex items-center">
                    <button type="button" onClick={() => setLocation(s)}
                      className="text-xs px-2 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-neutral-500 hover:bg-neutral-200 transition-colors pr-5">
                      {s}
                    </button>
                    <button type="button" onClick={() => removeLocationPreset(s)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`Remove ${s}`}>
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {showAddLocation ? (
                  <span className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={newLocationText}
                      onChange={(e) => setNewLocationText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLocationPreset(); } if (e.key === "Escape") { setShowAddLocation(false); setNewLocationText(""); } }}
                      autoFocus
                      placeholder="Location name"
                      className="text-xs px-2 py-1 border border-neutral-300 rounded-full w-32 focus:outline-none focus:border-neutral-400"
                    />
                    <button type="button" onClick={addLocationPreset}
                      className="text-xs px-1.5 py-1 text-green-600 hover:text-green-700 font-medium">Save</button>
                    <button type="button" onClick={() => { setShowAddLocation(false); setNewLocationText(""); }}
                      className="text-xs px-1 py-1 text-neutral-400 hover:text-neutral-600">Cancel</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setShowAddLocation(true)}
                    className="text-xs w-6 h-6 flex items-center justify-center bg-neutral-100 border border-neutral-200 rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition-colors"
                    title="Add custom location">
                    +
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Online Meeting</label>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#5059c9" }}>
                      <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                        <path d="M20.625 7.5h-7.5a1.875 1.875 0 00-1.875 1.875v7.5c0 1.035.84 1.875 1.875 1.875h7.5c1.035 0 1.875-.84 1.875-1.875v-7.5A1.875 1.875 0 0020.625 7.5z" />
                        <path d="M9.375 9.375H3.75A1.875 1.875 0 001.875 11.25v5.625c0 1.035.84 1.875 1.875 1.875h5.625a1.875 1.875 0 001.875-1.875V11.25a1.875 1.875 0 00-1.875-1.875z" opacity=".7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800">MS Teams Meeting</p>
                      <p className="text-xs text-neutral-400">{teamsEnabled ? "Link generated" : "Add online meeting"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleTeamsToggle()}
                    disabled={teamsLoading}
                    className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                    style={{ backgroundColor: teamsEnabled ? "#5059c9" : "rgb(209 213 219)" }}
                  >
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: teamsEnabled ? "translateX(16px)" : "translateX(0)" }} />
                  </button>
                </div>
                {teamsEnabled && teamsMeetingUrl && (
                  <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5">
                    <svg className="w-3 h-3 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-xs text-neutral-500 truncate flex-1">{teamsMeetingUrl.slice(0, 48)}…</span>
                    <button type="button" onClick={() => void copyTeamsUrl()} className="text-xs font-semibold flex-shrink-0 transition-colors" style={{ color: copied ? "#10b981" : BRAND }}>
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
                {teamsLoading && <p className="text-xs text-neutral-400 mt-1">Creating meeting…</p>}
              </div>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Recurrence</label>
            <div className="flex border border-neutral-200 rounded-lg overflow-hidden w-fit">
              {(["none", "daily", "weekly", "monthly"] as Recurrence[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecurrence(r)}
                  className="px-3.5 py-2 text-xs font-medium transition-colors capitalize"
                  style={recurrence === r
                    ? { backgroundColor: BRAND, color: "white" }
                    : { backgroundColor: "white", color: "rgb(107 114 128)" }
                  }
                >
                  {r === "none" ? "Does not repeat" : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Reminder</label>
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <select
                  value={reminderMinutes ?? "null"}
                  onChange={(e) => setReminderMinutes(e.target.value === "null" ? null : Number(e.target.value))}
                  className="flex-1 text-sm bg-transparent border-0 focus:outline-none text-neutral-700"
                >
                  {REMINDER_OPTIONS.map((o) => (
                    <option key={String(o.value)} value={o.value ?? "null"}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Show As</label>
              <div className="relative">
                <select
                  value={showAs}
                  onChange={(e) => setShowAs(e.target.value as typeof showAs)}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-400 bg-white appearance-none"
                >
                  <option value="busy">Busy</option>
                  <option value="free">Free</option>
                  <option value="tentative">Tentative</option>
                </select>
                <svg className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add description, agenda, or notes…"
              rows={4}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-400 resize-none"
            />
          </div>

          {/* Account selector (multi-account only) */}
          {accounts.length > 1 && (
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Calendar Account</label>
              <select
                value={homeAccountId}
                onChange={(e) => setHomeAccountId(e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-400 bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.homeAccountId} value={acc.homeAccountId}>{acc.email ?? acc.msEmail}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="text-xs font-medium px-3 py-2 bg-red-50 border border-red-200 rounded-lg" style={{ color: BRAND }}>
              {error}
            </p>
          )}
        </form>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 flex-shrink-0 bg-neutral-50">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            {attendees.length > 0 && (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Invites will be sent to {attendees.length} attendee{attendees.length !== 1 ? "s" : ""}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="event-form"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              {loading ? "Saving…" : editEvent ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
