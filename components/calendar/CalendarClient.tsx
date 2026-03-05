"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CalEvent } from "@/lib/types/calendar";
import { useCalendarStore } from "@/lib/stores/calendar-store";
import EventDetailModal from "@/components/calendar/EventDetailModal";
import EventFormModal from "@/components/calendar/EventFormModal";
import type { NlCreateResponse } from "@/app/api/calendar/nl-create/route";

// ─── Re-export for any legacy imports ─────────────────────────────────────────
export type { CalEvent };

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = "rgb(138, 9, 9)";
const BRAND_LIGHT = "rgba(138, 9, 9, 0.08)";
const HOUR_START = 7;
const HOUR_END = 21;
const ROW_HEIGHT = 80; // px per hour
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

// Distinct palette for per-account color coding
const ACCOUNT_PALETTES = [
  { bg: "rgb(219 234 254)", border: "rgb(59 130 246)", text: "rgb(30 64 175)" },
  { bg: "rgb(220 252 231)", border: "rgb(34 197 94)", text: "rgb(21 128 61)" },
  { bg: "rgb(237 233 254)", border: "rgb(139 92 246)", text: "rgb(109 40 217)" },
  { bg: "rgb(255 237 213)", border: "rgb(249 115 22)", text: "rgb(154 52 18)" },
  { bg: "rgb(254 243 199)", border: "rgb(234 179 8)", text: "rgb(133 77 14)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function getMonthYearLabel(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(`${weekStart}T00:00:00`);
  end.setDate(start.getDate() + 6);
  const startMonth = start.toLocaleString("default", { month: "long" });
  const endMonth = end.toLocaleString("default", { month: "long" });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  if (startYear !== endYear) return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
  if (startMonth !== endMonth) return `${startMonth} – ${endMonth} ${startYear}`;
  return `${startMonth} ${startYear}`;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatTimeRange(startIso: string, endIso: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  return `${fmt(startIso)} – ${fmt(endIso)}`;
}

function getEventTop(startIso: string): number {
  const d = new Date(startIso);
  return (d.getHours() - HOUR_START) * ROW_HEIGHT + d.getMinutes() * (ROW_HEIGHT / 60);
}

function getEventHeight(startIso: string, endIso: string): number {
  const mins = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000;
  return Math.max(mins * (ROW_HEIGHT / 60), 24);
}

function getEventDateStr(startIso: string): string {
  return new Date(startIso).toISOString().split("T")[0];
}

/** Derive a stable color palette from a homeAccountId string */
function getAccountPalette(homeAccountId: string) {
  let hash = 0;
  for (const ch of homeAccountId) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return ACCOUNT_PALETTES[Math.abs(hash) % ACCOUNT_PALETTES.length];
}

// ─── Overlap layout ───────────────────────────────────────────────────────────

interface PositionedEvent {
  event: CalEvent;
  colIndex: number;
  colCount: number;
  top: number;
  height: number;
}

/** Graph-coloring approach: assigns non-overlapping column indices to events. */
function computeEventPositions(dayEvents: CalEvent[]): PositionedEvent[] {
  // Only timed events (not all-day) that fall within the visible range
  const timed = dayEvents
    .filter((e) => !e.isAllDay)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  if (!timed.length) return [];

  // Build adjacency list (which events overlap)
  const overlaps: number[][] = timed.map(() => []);
  for (let i = 0; i < timed.length; i++) {
    const aStart = new Date(timed[i].startDateTime).getTime();
    const aEnd = new Date(timed[i].endDateTime).getTime();
    for (let j = i + 1; j < timed.length; j++) {
      const bStart = new Date(timed[j].startDateTime).getTime();
      const bEnd = new Date(timed[j].endDateTime).getTime();
      if (aStart < bEnd && bStart < aEnd) {
        overlaps[i].push(j);
        overlaps[j].push(i);
      }
    }
  }

  // Greedy graph coloring → column index per event
  const colAssignment = new Array<number>(timed.length).fill(-1);
  for (let i = 0; i < timed.length; i++) {
    const usedCols = new Set(overlaps[i].map((j) => colAssignment[j]).filter((c) => c >= 0));
    let col = 0;
    while (usedCols.has(col)) col++;
    colAssignment[i] = col;
  }

  // colCount = max column index across event + its overlapping neighbours + 1
  return timed.map((event, i) => {
    const relevantCols = [colAssignment[i], ...overlaps[i].map((j) => colAssignment[j])];
    const colCount = Math.max(...relevantCols) + 1;
    return {
      event,
      colIndex: colAssignment[i],
      colCount,
      top: getEventTop(event.startDateTime),
      height: getEventHeight(event.startDateTime, event.endDateTime),
    };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="animate-spin">
        <circle cx="16" cy="16" r="13" stroke="rgb(229,231,235)" strokeWidth="3" fill="none" />
        <path d="M16 3 A13 13 0 0 1 29 16" stroke={BRAND} strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function EventCard({ positioned, onClick }: { positioned: PositionedEvent; onClick: () => void }) {
  const { event, colIndex, colCount, top, height } = positioned;
  const palette = getAccountPalette(event.accountHomeId);
  const widthPct = 100 / colCount;
  const leftPct = (colIndex / colCount) * 100;

  return (
    <div
      onClick={onClick}
      className="absolute rounded-[6px] px-2 py-1 overflow-hidden cursor-pointer transition-all hover:brightness-95 hover:shadow-sm"
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        backgroundColor: palette.bg,
        borderLeft: `3px solid ${palette.border}`,
        color: palette.text,
      }}
      title={event.subject}
    >
      <p className="font-semibold text-xs leading-tight truncate">{event.subject}</p>
      {height > 32 && (
        <p className="text-xs opacity-70 truncate">
          {formatTimeRange(event.startDateTime, event.endDateTime)}
        </p>
      )}
      {height > 52 && event.location && (
        <p className="text-xs opacity-60 truncate">{event.location}</p>
      )}
      {event.isRecurring && (
        <span className="absolute top-1 right-1 text-[9px] opacity-50">↻</span>
      )}
    </div>
  );
}

function AllDayEventChip({ event, onClick }: { event: CalEvent; onClick: () => void }) {
  const palette = getAccountPalette(event.accountHomeId);
  return (
    <div
      onClick={onClick}
      className="mx-0.5 mb-0.5 px-1.5 py-0.5 rounded text-xs font-medium truncate cursor-pointer hover:brightness-95 transition-all"
      style={{ backgroundColor: palette.bg, color: palette.text, borderLeft: `2px solid ${palette.border}` }}
      title={event.subject}
    >
      {event.subject}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CalendarClientProps {
  weekStart: string;
  events: CalEvent[];
}

export default function CalendarClient({ weekStart: initialWeekStart, events: initialEvents }: CalendarClientProps) {
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [nlText, setNlText] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);
  const [nlPrefill, setNlPrefill] = useState<NlCreateResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const { selectedEvent, setSelectedEvent, activeView, setActiveView, setCurrentWeekStart } = useCalendarStore();

  // Sync weekStart into store
  useEffect(() => {
    setCurrentWeekStart(weekStart);
  }, [weekStart, setCurrentWeekStart]);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Scroll to 7 AM on mount
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const fetchWeekEvents = useCallback(async (start: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/calendar/week?start=${encodeURIComponent(start)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { events: CalEvent[]; errors?: string[] };
      setEvents(data.events);
    } catch (err) {
      setFetchError("Could not load calendar events. Check your connection.");
      setEvents([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    void fetchWeekEvents(weekStart);
  }, [weekStart, fetchWeekEvents]);

  async function handleNlCreate() {
    const text = nlText.trim();
    if (!text) return;
    setNlLoading(true);
    setNlError(null);
    try {
      const res = await fetch("/api/calendar/nl-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, now: new Date().toISOString() }),
      });
      const data = await res.json() as { ok?: boolean; prefill?: NlCreateResponse; error?: string };
      if (!res.ok || !data.ok || !data.prefill) throw new Error(data.error ?? "Failed to parse");
      setNlPrefill(data.prefill);
      setEditingEvent(null);
      setNlText("");
      setShowForm(true);
    } catch (e) {
      setNlError((e as Error).message);
    } finally {
      setNlLoading(false);
    }
  }

  const goToPrevWeek = () => setWeekStart((w) => addDays(w, -7));
  const goToNextWeek = () => setWeekStart((w) => addDays(w, 7));
  const goToToday = () => {
    const now = new Date();
    const dow = now.getDay();
    const diff = dow === 0 ? 6 : dow - 1;
    const mon = new Date(now);
    mon.setDate(now.getDate() - diff);
    setWeekStart(mon.toISOString().split("T")[0]);
  };

  const weekDates = getWeekDates(weekStart);
  const today = getTodayStr();
  const todayInWeek = weekDates.includes(today);

  // Current time indicator
  const currentHour = currentTime.getHours();
  const currentMins = currentTime.getMinutes();
  const showTimeLine = currentHour >= HOUR_START && currentHour < HOUR_END;
  const timeLineTop = (currentHour - HOUR_START) * ROW_HEIGHT + currentMins * (ROW_HEIGHT / 60);

  // Bucket events by day
  const timedByDay: Record<string, CalEvent[]> = {};
  const allDayByDay: Record<string, CalEvent[]> = {};
  for (const d of weekDates) { timedByDay[d] = []; allDayByDay[d] = []; }
  for (const e of events) {
    const dateStr = getEventDateStr(e.startDateTime);
    if (!weekDates.includes(dateStr)) continue;
    if (e.isAllDay) {
      allDayByDay[dateStr].push(e);
    } else {
      timedByDay[dateStr].push(e);
    }
  }

  const hasAllDay = weekDates.some((d) => allDayByDay[d].length > 0);

  return (
    <div className="flex flex-col flex-1" style={{ height: "100vh", overflow: "hidden", background: "#f9f9f9" }}>

      {/* ── Header ── */}
      <div className="flex flex-col bg-white flex-shrink-0" style={{ boxShadow: "0px 4px 4px 0px rgba(27,29,29,0.10)", zIndex: 10 }}>
      <div className="flex items-center gap-3 px-6 py-4">
        <h1 className="text-xl font-bold text-neutral-900 mr-1">Calendar</h1>

        <button
          onClick={goToPrevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-neutral-100 hover:bg-neutral-200 transition-colors"
          aria-label="Previous week"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-neutral-700 min-w-[140px] text-center">
          {getMonthYearLabel(weekStart)}
        </span>

        <button
          onClick={goToNextWeek}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-neutral-100 hover:bg-neutral-200 transition-colors"
          aria-label="Next week"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={goToToday}
          className="px-3 py-1 text-xs font-medium rounded-[8px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Today
        </button>

        <button
          onClick={() => { setEditingEvent(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] text-white transition-colors"
          style={{ backgroundColor: BRAND }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </button>

        {fetchError && (
          <span className="text-xs font-medium" style={{ color: BRAND }}>{fetchError}</span>
        )}

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex rounded-[10px] overflow-hidden border border-neutral-200" style={{ boxShadow: "0px 2px 4px rgba(27,29,29,0.08)" }}>
          {(["Day", "Week"] as const).map((view) => {
            const viewKey = view.toLowerCase() as "day" | "week";
            const isActive = activeView === viewKey;
            return (
              <button
                key={view}
                onClick={() => setActiveView(viewKey)}
                className="px-4 py-1.5 text-sm font-medium transition-colors"
                style={isActive ? { background: BRAND, color: "#fff" } : { background: "#fff", color: "#6b7280" }}
              >
                {view}
              </button>
            );
          })}
          {(["Month", "Year"] as const).map((view) => (
            <button
              key={view}
              disabled
              className="px-4 py-1.5 text-sm font-medium text-neutral-300 bg-white cursor-not-allowed"
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* ── NL Event Input ── */}
      <div className="px-6 pb-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 border border-neutral-200 rounded-[10px] px-3 py-2 bg-neutral-50 focus-within:border-neutral-400 transition-colors">
          <svg className="w-4 h-4 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <input
            type="text"
            value={nlText}
            onChange={(e) => { setNlText(e.target.value); setNlError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") void handleNlCreate(); }}
            placeholder={'Create event with AI\u2026 e.g. \u201cCoffee with Sarah tomorrow at 2pm for 1 hour\u201d'}
            className="flex-1 text-sm bg-transparent focus:outline-none text-neutral-700 placeholder-neutral-400"
          />
          {nlError && (
            <span className="text-xs font-medium flex-shrink-0" style={{ color: BRAND }}>{nlError}</span>
          )}
        </div>
        <button
          onClick={() => void handleNlCreate()}
          disabled={nlLoading || !nlText.trim()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[10px] text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: BRAND }}
        >
          {nlLoading ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          {nlLoading ? "Parsing…" : "Create"}
        </button>
      </div>
      </div>

      {/* ── Calendar Grid ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Day headers */}
        <div className="flex bg-white border-b border-neutral-200 flex-shrink-0">
          <div className="w-16 shrink-0" />
          {weekDates.map((dateStr, i) => {
            const isToday = dateStr === today;
            const dateNum = new Date(`${dateStr}T00:00:00`).getDate();
            return (
              <div
                key={dateStr}
                className="flex-1 flex flex-col items-center py-2 border-l border-neutral-100"
                style={i >= 5 ? { background: "#fafafa" } : {}}
              >
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{DAY_LABELS[i]}</span>
                <span
                  className="mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold"
                  style={isToday ? { background: BRAND, color: "#fff" } : { color: "#374151" }}
                >
                  {dateNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* All-day row — only shown when there are all-day events */}
        {hasAllDay && (
          <div className="flex bg-white border-b border-neutral-200 flex-shrink-0">
            <div className="w-16 shrink-0 flex items-start justify-end pr-2 pt-1">
              <span className="text-[10px] text-neutral-400 font-medium">All day</span>
            </div>
            {weekDates.map((dateStr, i) => (
              <div
                key={dateStr}
                className="flex-1 border-l border-neutral-100 py-0.5 min-h-[28px]"
                style={i >= 5 ? { background: "#fafafa" } : {}}
              >
                {allDayByDay[dateStr].map((e) => (
                  <AllDayEventChip key={e.id} event={e} onClick={() => setSelectedEvent(e)} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Scrollable time grid */}
        <div ref={scrollRef} className="flex flex-1 overflow-y-auto relative bg-white">
          {loading && <Spinner />}

          {/* Time labels */}
          <div className="w-16 shrink-0 relative flex-shrink-0" style={{ height: ROW_HEIGHT * HOURS.length }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-start justify-end pr-2"
                style={{ top: (h - HOUR_START) * ROW_HEIGHT - 8 }}
              >
                <span className="text-[10px] text-neutral-400 font-medium">
                  {h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex flex-1 relative" style={{ height: ROW_HEIGHT * HOURS.length }}>
            {weekDates.map((dateStr, colIdx) => {
              const isWeekend = colIdx >= 5;
              const isToday = dateStr === today;
              const positioned = computeEventPositions(timedByDay[dateStr] ?? []);

              return (
                <div
                  key={dateStr}
                  className="flex-1 relative border-l border-neutral-100"
                  style={{
                    background: isWeekend ? "#fafafa" : isToday ? BRAND_LIGHT : "#fff",
                    height: ROW_HEIGHT * HOURS.length,
                  }}
                >
                  {/* Hour grid lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-neutral-100"
                      style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
                    />
                  ))}

                  {/* Timed events */}
                  {positioned.map((p) => (
                    <EventCard key={p.event.id} positioned={p} onClick={() => setSelectedEvent(p.event)} />
                  ))}

                  {/* Current time indicator */}
                  {isToday && todayInWeek && showTimeLine && (
                    <div className="absolute left-0 right-0 pointer-events-none z-10" style={{ top: timeLineTop }}>
                      <div className="relative flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "rgb(220,38,38)" }} />
                        <div className="flex-1 h-px" style={{ background: "rgb(220,38,38)" }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {!loading && events.length === 0 && !fetchError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: 120 }}>
            <div className="flex flex-col items-center gap-2 mt-24">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="8" width="32" height="28" rx="4" stroke="#D1D5DB" strokeWidth="2" fill="none" />
                <path d="M4 16H36" stroke="#D1D5DB" strokeWidth="2" />
                <path d="M14 4V10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                <path d="M26 4V10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-neutral-400 font-medium">No events this week</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Event Detail Modal ── */}
      {selectedEvent && (
        <EventDetailModal
          onEdit={() => {
            setEditingEvent(selectedEvent);
            setSelectedEvent(null);
            setShowForm(true);
          }}
        />
      )}

      {/* ── Event Form Modal (create / edit / NL) ── */}
      {showForm && (
        <EventFormModal
          editEvent={editingEvent ?? undefined}
          prefill={!editingEvent && nlPrefill ? {
            subject: nlPrefill.subject,
            start: nlPrefill.start || undefined,
            end: nlPrefill.end || undefined,
            location: nlPrefill.location || undefined,
            attendees: nlPrefill.attendees.length ? nlPrefill.attendees : undefined,
            body: nlPrefill.body || undefined,
          } : undefined}
          onClose={() => { setShowForm(false); setEditingEvent(null); setNlPrefill(null); }}
          onSaved={(savedEvent) => {
            setEvents((prev) => {
              const idx = prev.findIndex((e) => e.id === savedEvent.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = savedEvent;
                return next;
              }
              return [...prev, savedEvent];
            });
            setShowForm(false);
            setEditingEvent(null);
            setNlPrefill(null);
          }}
        />
      )}
    </div>
  );
}
