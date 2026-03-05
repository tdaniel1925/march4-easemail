"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CalEvent } from "@/lib/types/calendar";
import { useCalendarStore } from "@/lib/stores/calendar-store";
import EventDetailModal from "@/components/calendar/EventDetailModal";
import EventFormModal from "@/components/calendar/EventFormModal";
import type { NlCreateResponse } from "@/app/api/calendar/nl-create/route";

// ─── Re-export for any legacy imports ─────────────────────────────────────────
export type { CalEvent };

// ─── Speech Recognition types (browser API, not in all TS libs) ───────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = "rgb(138, 9, 9)";
const BRAND_LIGHT = "rgba(138, 9, 9, 0.08)";
const HOUR_START = 7;
const HOUR_END = 21;
const ROW_HEIGHT = 80; // px per hour
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

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

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`;
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

function getAccountPalette(homeAccountId: string) {
  let hash = 0;
  for (const ch of homeAccountId) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return ACCOUNT_PALETTES[Math.abs(hash) % ACCOUNT_PALETTES.length];
}

/** Returns 6×7 date strings for the month grid (may include prev/next month days) */
function getMonthGrid(yearMonth: string): string[][] {
  const [year, month] = yearMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysBack = startDow === 0 ? 6 : startDow - 1;
  const gridStart = new Date(firstDay);
  gridStart.setDate(1 - daysBack);
  const weeks: string[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      week.push(date.toISOString().split("T")[0]);
    }
    weeks.push(week);
  }
  return weeks;
}

function getMondayOf(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = d.getDay();
  const diff = dow === 0 ? 6 : dow - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

// ─── Overlap layout ───────────────────────────────────────────────────────────

interface PositionedEvent {
  event: CalEvent;
  colIndex: number;
  colCount: number;
  top: number;
  height: number;
}

function computeEventPositions(dayEvents: CalEvent[]): PositionedEvent[] {
  const timed = dayEvents
    .filter((e) => !e.isAllDay)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  if (!timed.length) return [];

  const overlaps: number[][] = timed.map(() => []);
  for (let i = 0; i < timed.length; i++) {
    const aStart = new Date(timed[i].startDateTime).getTime();
    const aEnd = new Date(timed[i].endDateTime).getTime();
    for (let j = i + 1; j < timed.length; j++) {
      const bStart = new Date(timed[j].startDateTime).getTime();
      const bEnd = new Date(timed[j].endDateTime).getTime();
      if (aStart < bEnd && bStart < aEnd) { overlaps[i].push(j); overlaps[j].push(i); }
    }
  }

  const colAssignment = new Array<number>(timed.length).fill(-1);
  for (let i = 0; i < timed.length; i++) {
    const usedCols = new Set(overlaps[i].map((j) => colAssignment[j]).filter((c) => c >= 0));
    let col = 0;
    while (usedCols.has(col)) col++;
    colAssignment[i] = col;
  }

  return timed.map((event, i) => {
    const relevantCols = [colAssignment[i], ...overlaps[i].map((j) => colAssignment[j])];
    const colCount = Math.max(...relevantCols) + 1;
    return { event, colIndex: colAssignment[i], colCount, top: getEventTop(event.startDateTime), height: getEventHeight(event.startDateTime, event.endDateTime) };
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
      style={{ top, height, left: `calc(${leftPct}% + 2px)`, width: `calc(${widthPct}% - 4px)`, backgroundColor: palette.bg, borderLeft: `3px solid ${palette.border}`, color: palette.text }}
      title={event.subject}
    >
      <p className="font-semibold text-xs leading-tight truncate">{event.subject}</p>
      {height > 32 && <p className="text-xs opacity-70 truncate">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>}
      {height > 52 && event.location && <p className="text-xs opacity-60 truncate">{event.location}</p>}
      {event.isRecurring && <span className="absolute top-1 right-1 text-[9px] opacity-50">↻</span>}
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

// ─── Time Grid (shared by week + day views) ───────────────────────────────────

function TimeGrid({
  dayDateStrs,
  timedByDay,
  allDayByDay,
  today,
  showTimeLine,
  timeLineTop,
  loading,
  scrollRef,
  onEventClick,
  onAllDayClick,
}: {
  dayDateStrs: string[];
  timedByDay: Record<string, CalEvent[]>;
  allDayByDay: Record<string, CalEvent[]>;
  today: string;
  showTimeLine: boolean;
  timeLineTop: number;
  loading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onEventClick: (e: CalEvent) => void;
  onAllDayClick: (e: CalEvent) => void;
}) {
  const hasAllDay = dayDateStrs.some((d) => (allDayByDay[d]?.length ?? 0) > 0);
  const todayInView = dayDateStrs.includes(today);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day headers */}
      <div className="flex bg-white border-b border-neutral-200 flex-shrink-0">
        <div className="w-16 shrink-0" />
        {dayDateStrs.map((dateStr, i) => {
          const isToday = dateStr === today;
          const dateNum = new Date(`${dateStr}T00:00:00`).getDate();
          const isSingleDay = dayDateStrs.length === 1;
          return (
            <div key={dateStr} className="flex-1 flex flex-col items-center py-2 border-l border-neutral-100"
              style={!isSingleDay && i >= 5 ? { background: "#fafafa" } : {}}>
              {!isSingleDay && <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{DAY_LABELS[i]}</span>}
              {isSingleDay && (
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  {new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" })}
                </span>
              )}
              <span className="mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold"
                style={isToday ? { background: BRAND, color: "#fff" } : { color: "#374151" }}>
                {dateNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      {hasAllDay && (
        <div className="flex bg-white border-b border-neutral-200 flex-shrink-0">
          <div className="w-16 shrink-0 flex items-start justify-end pr-2 pt-1">
            <span className="text-[10px] text-neutral-400 font-medium">All day</span>
          </div>
          {dayDateStrs.map((dateStr, i) => (
            <div key={dateStr} className="flex-1 border-l border-neutral-100 py-0.5 min-h-[28px]"
              style={!isSingleColumn(dayDateStrs) && i >= 5 ? { background: "#fafafa" } : {}}>
              {(allDayByDay[dateStr] ?? []).map((e) => (
                <AllDayEventChip key={e.id} event={e} onClick={() => onAllDayClick(e)} />
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
            <div key={h} className="absolute left-0 right-0 flex items-start justify-end pr-2" style={{ top: (h - HOUR_START) * ROW_HEIGHT - 8 }}>
              <span className="text-[10px] text-neutral-400 font-medium">
                {h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex flex-1 relative" style={{ height: ROW_HEIGHT * HOURS.length }}>
          {dayDateStrs.map((dateStr, colIdx) => {
            const isWeekend = dayDateStrs.length > 1 && colIdx >= 5;
            const isToday = dateStr === today;
            const positioned = computeEventPositions(timedByDay[dateStr] ?? []);
            return (
              <div key={dateStr} className="flex-1 relative border-l border-neutral-100"
                style={{ background: isWeekend ? "#fafafa" : isToday ? BRAND_LIGHT : "#fff", height: ROW_HEIGHT * HOURS.length }}>
                {HOURS.map((h) => (
                  <div key={h} className="absolute left-0 right-0 border-t border-neutral-100" style={{ top: (h - HOUR_START) * ROW_HEIGHT }} />
                ))}
                {positioned.map((p) => (
                  <EventCard key={p.event.id} positioned={p} onClick={() => onEventClick(p.event)} />
                ))}
                {isToday && todayInView && showTimeLine && (
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
    </div>
  );
}

function isSingleColumn(arr: string[]) { return arr.length === 1; }

// ─── Main Component ───────────────────────────────────────────────────────────

interface CalendarClientProps {
  weekStart: string;
  events: CalEvent[];
}

export default function CalendarClient({ weekStart: initialWeekStart, events: initialEvents }: CalendarClientProps) {
  // ── State ────────────────────────────────────────────────────────────────────
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
  const [teamsMeetingLoading, setTeamsMeetingLoading] = useState(false);
  const [teamsMeetingUrl, setTeamsMeetingUrl] = useState<string | null>(null);
  const [nlPrefill, setNlPrefill] = useState<NlCreateResponse | null>(null);

  // Voice + confirmation
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [savedConfirmation, setSavedConfirmation] = useState<string | null>(null);

  // Multi-view
  const [selectedDay, setSelectedDay] = useState(getTodayStr());
  const [currentMonth, setCurrentMonth] = useState(initialWeekStart.substring(0, 7));
  const [rangeEvents, setRangeEvents] = useState<CalEvent[]>([]);
  const [rangeLoading, setRangeLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);

  const { selectedEvent, setSelectedEvent, activeView, setActiveView, setCurrentWeekStart } = useCalendarStore();

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => { setCurrentWeekStart(weekStart); }, [weekStart, setCurrentWeekStart]);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => { recogRef.current?.stop(); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeView]);

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const fetchWeekEvents = useCallback(async (start: string) => {
    setLoading(true); setFetchError(null);
    try {
      const res = await fetch(`/api/calendar/week?start=${encodeURIComponent(start)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { events: CalEvent[] };
      setEvents(data.events);
    } catch { setFetchError("Could not load calendar events."); setEvents([]); }
    finally { setLoading(false); }
  }, []);

  const fetchRangeEvents = useCallback(async (start: string, end: string) => {
    setRangeLoading(true); setFetchError(null);
    try {
      const res = await fetch(`/api/calendar/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { events: CalEvent[] };
      setRangeEvents(data.events);
    } catch { setFetchError("Could not load calendar events."); setRangeEvents([]); }
    finally { setRangeLoading(false); }
  }, []);

  // Week view re-fetch on navigation
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    if (activeView === "week") void fetchWeekEvents(weekStart);
  }, [weekStart, activeView, fetchWeekEvents]);

  // Day view: fetch the week containing selectedDay
  useEffect(() => {
    if (activeView !== "day") return;
    void fetchWeekEvents(getMondayOf(selectedDay));
  }, [selectedDay, activeView, fetchWeekEvents]);

  // Month / agenda / year: fetch range
  useEffect(() => {
    if (activeView === "month") {
      const [year, month] = currentMonth.split("-").map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const startDow = firstDay.getDay();
      const daysBack = startDow === 0 ? 6 : startDow - 1;
      const gridStart = new Date(firstDay);
      gridStart.setDate(1 - daysBack);
      const gridEnd = new Date(gridStart);
      gridEnd.setDate(gridStart.getDate() + 41);
      void fetchRangeEvents(gridStart.toISOString().split("T")[0], gridEnd.toISOString().split("T")[0]);
    } else if (activeView === "agenda") {
      const today = getTodayStr();
      void fetchRangeEvents(today, addDays(today, 60));
    } else if (activeView === "year") {
      const year = currentMonth.substring(0, 4);
      void fetchRangeEvents(`${year}-01-01`, `${year}-12-31`);
    }
  }, [activeView, currentMonth, fetchRangeEvents]);

  // ── Voice input ───────────────────────────────────────────────────────────────

  function startVoiceInput() {
    const SR = typeof window !== "undefined"
      ? ((window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
        ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition)
      : null;
    if (!SR) { setMicError("Voice not supported in this browser"); return; }
    if (isListening) { recogRef.current?.stop(); return; }

    const r = new SR();
    recogRef.current = r;
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    setIsListening(true); setMicError(null);

    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setNlText(transcript);
      setIsListening(false);
      void handleNlCreateWithText(transcript);
    };
    r.onerror = (e) => {
      setMicError(
        e.error === "no-speech" ? "No speech detected" :
        e.error === "not-allowed" ? "Mic access denied" : "Voice error"
      );
      setIsListening(false);
    };
    r.onend = () => setIsListening(false);
    r.start();
  }

  // ── NL create ─────────────────────────────────────────────────────────────────

  async function handleNlCreateWithText(text: string) {
    if (!text.trim()) return;
    setNlLoading(true); setNlError(null);
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
    } catch (e) { setNlError((e as Error).message); }
    finally { setNlLoading(false); }
  }

  async function handleNlCreate() { await handleNlCreateWithText(nlText.trim()); }

  // ── Navigation ────────────────────────────────────────────────────────────────

  function goToPrev() {
    if (activeView === "week") setWeekStart((w) => addDays(w, -7));
    else if (activeView === "day") setSelectedDay((d) => addDays(d, -1));
    else if (activeView === "month") setCurrentMonth((m) => {
      const [y, mo] = m.split("-").map(Number);
      return new Date(y, mo - 2, 1).toISOString().substring(0, 7);
    });
    else if (activeView === "year") setCurrentMonth((m) => `${parseInt(m.substring(0, 4)) - 1}${m.substring(4)}`);
  }

  function goToNext() {
    if (activeView === "week") setWeekStart((w) => addDays(w, 7));
    else if (activeView === "day") setSelectedDay((d) => addDays(d, 1));
    else if (activeView === "month") setCurrentMonth((m) => {
      const [y, mo] = m.split("-").map(Number);
      return new Date(y, mo, 1).toISOString().substring(0, 7);
    });
    else if (activeView === "year") setCurrentMonth((m) => `${parseInt(m.substring(0, 4)) + 1}${m.substring(4)}`);
  }

  function goToToday() {
    const today = getTodayStr();
    setWeekStart(getMondayOf(today));
    setSelectedDay(today);
    setCurrentMonth(today.substring(0, 7));
  }

  // ── Derived values ────────────────────────────────────────────────────────────

  const weekDates = getWeekDates(weekStart);
  const today = getTodayStr();
  const currentHour = currentTime.getHours();
  const currentMins = currentTime.getMinutes();
  const showTimeLine = currentHour >= HOUR_START && currentHour < HOUR_END;
  const timeLineTop = (currentHour - HOUR_START) * ROW_HEIGHT + currentMins * (ROW_HEIGHT / 60);

  // Bucket week events by day
  const timedByDay: Record<string, CalEvent[]> = {};
  const allDayByDay: Record<string, CalEvent[]> = {};
  for (const d of weekDates) { timedByDay[d] = []; allDayByDay[d] = []; }
  for (const e of events) {
    const dateStr = getEventDateStr(e.startDateTime);
    if (!weekDates.includes(dateStr)) continue;
    if (e.isAllDay) allDayByDay[dateStr].push(e);
    else timedByDay[dateStr].push(e);
  }

  // Header label per view
  function getViewLabel(): string {
    if (activeView === "week") return getMonthYearLabel(weekStart);
    if (activeView === "day") {
      const d = new Date(`${selectedDay}T00:00:00`);
      return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
    if (activeView === "month") {
      const [y, mo] = currentMonth.split("-").map(Number);
      return new Date(y, mo - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
    }
    if (activeView === "agenda") return "Upcoming";
    if (activeView === "year") return currentMonth.substring(0, 4);
    return "";
  }

  // ── View renderers ────────────────────────────────────────────────────────────

  function renderWeekView() {
    return (
      <TimeGrid
        dayDateStrs={weekDates}
        timedByDay={timedByDay}
        allDayByDay={allDayByDay}
        today={today}
        showTimeLine={showTimeLine}
        timeLineTop={timeLineTop}
        loading={loading}
        scrollRef={scrollRef}
        onEventClick={setSelectedEvent}
        onAllDayClick={setSelectedEvent}
      />
    );
  }

  function renderDayView() {
    // Use week events filtered to the selected day
    const dayTimedByDay: Record<string, CalEvent[]> = { [selectedDay]: timedByDay[selectedDay] ?? events.filter((e) => !e.isAllDay && getEventDateStr(e.startDateTime) === selectedDay) };
    const dayAllDayByDay: Record<string, CalEvent[]> = { [selectedDay]: allDayByDay[selectedDay] ?? events.filter((e) => e.isAllDay && getEventDateStr(e.startDateTime) === selectedDay) };

    return (
      <TimeGrid
        dayDateStrs={[selectedDay]}
        timedByDay={dayTimedByDay}
        allDayByDay={dayAllDayByDay}
        today={today}
        showTimeLine={showTimeLine}
        timeLineTop={timeLineTop}
        loading={loading}
        scrollRef={scrollRef}
        onEventClick={setSelectedEvent}
        onAllDayClick={setSelectedEvent}
      />
    );
  }

  function renderMonthView() {
    const grid = getMonthGrid(currentMonth);
    const eventsByDay: Record<string, CalEvent[]> = {};
    for (const e of rangeEvents) {
      const day = getEventDateStr(e.startDateTime);
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(e);
    }
    return (
      <div className="flex-1 overflow-y-auto relative">
        {rangeLoading && <Spinner />}
        <div className="flex bg-white border-b border-neutral-200">
          {DAY_LABELS.map((d) => (
            <div key={d} className="flex-1 text-center text-xs font-medium text-neutral-400 py-2 uppercase tracking-wide">{d}</div>
          ))}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="flex border-b border-neutral-100" style={{ minHeight: 110 }}>
            {week.map((dateStr) => {
              const isThisMonth = dateStr.substring(0, 7) === currentMonth;
              const isToday = dateStr === today;
              const dayEvents = eventsByDay[dateStr] ?? [];
              const dateNum = new Date(`${dateStr}T00:00:00`).getDate();
              return (
                <div key={dateStr} className="flex-1 border-l border-neutral-100 p-1 min-w-0"
                  style={{ background: isToday ? BRAND_LIGHT : !isThisMonth ? "#fafafa" : "#fff" }}>
                  <div className="flex justify-start mb-1 pl-0.5">
                    <button
                      onClick={() => { setSelectedDay(dateStr); setActiveView("day"); }}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold hover:bg-neutral-100 transition-colors"
                      style={isToday ? { background: BRAND, color: "#fff" } : { color: isThisMonth ? "#374151" : "#d1d5db" }}
                    >{dateNum}</button>
                  </div>
                  {dayEvents.slice(0, 3).map((e) => {
                    const palette = getAccountPalette(e.accountHomeId);
                    return (
                      <div key={e.id} onClick={() => setSelectedEvent(e)}
                        className="text-[11px] px-1.5 py-0.5 rounded mb-0.5 truncate cursor-pointer hover:brightness-95 transition-all"
                        style={{ backgroundColor: palette.bg, color: palette.text }}>
                        {!e.isAllDay && <span className="opacity-70">{formatTime(e.startDateTime)} </span>}{e.subject}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <button onClick={() => { setSelectedDay(dateStr); setActiveView("day"); }}
                      className="text-[11px] text-neutral-400 pl-1 hover:underline">
                      +{dayEvents.length - 3} more
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  function renderAgendaView() {
    const grouped: Record<string, CalEvent[]> = {};
    for (const e of rangeEvents) {
      const day = getEventDateStr(e.startDateTime);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(e);
    }
    const days = Object.keys(grouped).sort();

    if (!rangeLoading && days.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="8" width="32" height="28" rx="4" stroke="#D1D5DB" strokeWidth="2" fill="none" />
            <path d="M4 16H36" stroke="#D1D5DB" strokeWidth="2" />
            <path d="M14 4V10M26 4V10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium">No upcoming events in the next 60 days</p>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto relative">
        {rangeLoading && <Spinner />}
        <div className="max-w-2xl mx-auto py-4 px-6 space-y-6">
          {days.map((dateStr) => {
            const d = new Date(`${dateStr}T00:00:00`);
            const isToday = dateStr === today;
            const isTomorrow = dateStr === addDays(today, 1);
            const label = isToday ? "Today" : isTomorrow ? "Tomorrow" :
              d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
            return (
              <div key={dateStr}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider flex-shrink-0"
                    style={{ color: isToday ? BRAND : "#6b7280" }}>{label}</span>
                  <div className="flex-1 h-px bg-neutral-100" />
                  {isToday && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ background: BRAND }}>Today</span>
                  )}
                </div>
                <div className="space-y-2">
                  {grouped[dateStr].map((e) => {
                    const palette = getAccountPalette(e.accountHomeId);
                    return (
                      <div key={e.id} onClick={() => setSelectedEvent(e)}
                        className="flex items-start gap-3 p-3 rounded-[10px] cursor-pointer hover:shadow-sm transition-all bg-white border border-neutral-100"
                        style={{ borderLeftWidth: 3, borderLeftColor: palette.border }}>
                        <div className="flex-shrink-0 text-xs text-neutral-400 w-24 pt-0.5 font-medium">
                          {e.isAllDay ? "All day" : formatTimeRange(e.startDateTime, e.endDateTime)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-800 truncate">{e.subject}</p>
                          {e.location && <p className="text-xs text-neutral-400 truncate mt-0.5">{e.location}</p>}
                          {e.bodyPreview && <p className="text-xs text-neutral-400 truncate mt-0.5">{e.bodyPreview}</p>}
                          {e.attendees.length > 0 && (
                            <p className="text-xs text-neutral-400 truncate mt-0.5">
                              {e.attendees.slice(0, 3).map((a) => a.name || a.address).join(", ")}
                              {e.attendees.length > 3 ? ` +${e.attendees.length - 3}` : ""}
                            </p>
                          )}
                        </div>
                        {e.onlineMeetingUrl && (
                          <a href={e.onlineMeetingUrl} target="_blank" rel="noopener noreferrer"
                            onClick={(ev) => ev.stopPropagation()}
                            className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-[6px] text-white transition-colors hover:opacity-90"
                            style={{ background: BRAND }}>Join</a>
                        )}
                        {e.isRecurring && (
                          <span className="flex-shrink-0 text-[11px] text-neutral-300 pt-0.5">↻</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderYearView() {
    const year = parseInt(currentMonth.substring(0, 4));
    const eventDays = new Set(rangeEvents.map((e) => getEventDateStr(e.startDateTime)));
    return (
      <div className="flex-1 overflow-y-auto py-6 px-6 relative">
        {rangeLoading && <Spinner />}
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 12 }, (_, i) => {
            const monthStr = `${year}-${String(i + 1).padStart(2, "0")}`;
            const grid = getMonthGrid(monthStr);
            const monthLabel = new Date(year, i, 1).toLocaleString("default", { month: "long" });
            return (
              <div key={monthStr} className="bg-white rounded-[12px] p-4 border border-neutral-100 shadow-sm">
                <button onClick={() => { setCurrentMonth(monthStr); setActiveView("month"); }}
                  className="text-sm font-bold mb-3 w-full text-left transition-colors hover:opacity-70"
                  style={{ color: BRAND }}>{monthLabel}</button>
                <div className="grid grid-cols-7 mb-1">
                  {["M","T","W","T","F","S","S"].map((d, idx) => (
                    <div key={idx} className="text-center text-[9px] text-neutral-300 font-medium">{d}</div>
                  ))}
                </div>
                {grid.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7">
                    {week.map((dateStr) => {
                      const isThisMonth = dateStr.substring(0, 7) === monthStr;
                      const isToday = dateStr === today;
                      const hasEvent = isThisMonth && eventDays.has(dateStr);
                      const dateNum = new Date(`${dateStr}T00:00:00`).getDate();
                      return (
                        <button key={dateStr}
                          onClick={() => { setSelectedDay(dateStr); setActiveView("day"); }}
                          className="relative flex items-center justify-center w-full aspect-square text-[10px] rounded-full transition-colors hover:bg-neutral-100"
                          style={isToday ? { background: BRAND, color: "#fff" } : { color: isThisMonth ? "#374151" : "#e5e7eb" }}>
                          {dateNum}
                          {hasEvent && !isToday && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: BRAND }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1" style={{ height: "100vh", overflow: "hidden", background: "#f9f9f9" }}>

      {/* ── Header ── */}
      <div className="flex flex-col bg-white flex-shrink-0" style={{ boxShadow: "0px 4px 4px 0px rgba(27,29,29,0.10)", zIndex: 10 }}>
        <div className="flex items-center gap-3 px-6 py-4">
          <h1 className="text-xl font-bold text-neutral-900 mr-1">Calendar</h1>

          <button onClick={goToPrev}
            className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-neutral-100 hover:bg-neutral-200 transition-colors"
            aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="text-sm font-semibold text-neutral-700 min-w-[200px] text-center">
            {getViewLabel()}
          </span>

          <button onClick={goToNext}
            className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-neutral-100 hover:bg-neutral-200 transition-colors"
            aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button onClick={goToToday}
            className="px-3 py-1 text-xs font-medium rounded-[8px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
            Today
          </button>

          {activeView !== "agenda" && (
            <button
              onClick={() => { setEditingEvent(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] text-white transition-colors"
              style={{ backgroundColor: BRAND }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Event
            </button>
          )}

          {/* Teams Meeting quick-create */}
          <button
            disabled={teamsMeetingLoading}
            onClick={async () => {
              setTeamsMeetingLoading(true);
              setTeamsMeetingUrl(null);
              try {
                const now = new Date();
                const end = new Date(now.getTime() + 60 * 60 * 1000);
                const res = await fetch("/api/calendar/teams-meeting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    subject: "Teams Meeting",
                    startDateTime: now.toISOString(),
                    endDateTime: end.toISOString(),
                  }),
                });
                if (res.ok) {
                  const data = await res.json() as { joinWebUrl: string };
                  setTeamsMeetingUrl(data.joinWebUrl);
                }
              } finally {
                setTeamsMeetingLoading(false);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors"
            style={{ backgroundColor: "rgb(237 233 254)", color: "rgb(76 29 149)" }}
            title="Create instant Teams meeting"
          >
            {teamsMeetingLoading ? (
              <div className="w-3 h-3 rounded-full border-2 animate-spin" style={{ borderColor: "rgb(167 139 250)", borderTopColor: "rgb(76 29 149)" }} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            Teams Meeting
          </button>
          {teamsMeetingUrl && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs" style={{ backgroundColor: "rgb(237 233 254)", color: "rgb(76 29 149)" }}>
              <span className="font-medium">Meeting ready —</span>
              <a href={teamsMeetingUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                Join now
              </a>
              <button onClick={() => { navigator.clipboard.writeText(teamsMeetingUrl); }} title="Copy link" className="opacity-60 hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button onClick={() => setTeamsMeetingUrl(null)} className="opacity-60 hover:opacity-100 ml-1">✕</button>
            </div>
          )}

          {fetchError && <span className="text-xs font-medium" style={{ color: BRAND }}>{fetchError}</span>}

          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex rounded-[10px] overflow-hidden border border-neutral-200" style={{ boxShadow: "0px 2px 4px rgba(27,29,29,0.08)" }}>
            {(["Day", "Week", "Month", "Agenda", "Year"] as const).map((view) => {
              const viewKey = view.toLowerCase() as typeof activeView;
              const isActive = activeView === viewKey;
              return (
                <button key={view} onClick={() => setActiveView(viewKey)}
                  className="px-3 py-1.5 text-sm font-medium transition-colors"
                  style={isActive ? { background: BRAND, color: "#fff" } : { background: "#fff", color: "#6b7280" }}>
                  {view}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── NL + Voice Input ── */}
        <div className="px-6 pb-3 flex flex-col gap-1.5">
          {/* Saved confirmation banner */}
          {savedConfirmation && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-medium text-white"
              style={{ background: "rgb(22 163 74)" }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Event created: {savedConfirmation}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 border border-neutral-200 rounded-[10px] px-3 py-2 bg-neutral-50 focus-within:border-neutral-400 transition-colors">
              <svg className="w-4 h-4 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <input
                type="text"
                value={nlText}
                onChange={(e) => { setNlText(e.target.value); setNlError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") void handleNlCreate(); }}
                placeholder={isListening ? "Listening…" : 'Create event with AI… e.g. "Coffee with Sarah tomorrow at 2pm for 1 hour"'}
                className="flex-1 text-sm bg-transparent focus:outline-none text-neutral-700 placeholder-neutral-400"
              />
              {(nlError || micError) && (
                <span className="text-xs font-medium flex-shrink-0" style={{ color: BRAND }}>{nlError ?? micError}</span>
              )}
            </div>

            {/* Mic button */}
            <button
              onClick={startVoiceInput}
              title={isListening ? "Stop listening" : "Speak to create event"}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-neutral-200 bg-neutral-50 transition-colors hover:bg-neutral-100 flex-shrink-0"
              style={isListening ? { background: BRAND, borderColor: BRAND } : {}}>
              {isListening ? (
                <svg className="w-4 h-4 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="2" />
                  <rect x="14" y="4" width="4" height="16" rx="2" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z" />
                </svg>
              )}
            </button>

            {/* Create button */}
            <button
              onClick={() => void handleNlCreate()}
              disabled={nlLoading || !nlText.trim()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[10px] text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: BRAND }}>
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
      </div>

      {/* ── View Content ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {activeView === "week" && renderWeekView()}
        {activeView === "day" && renderDayView()}
        {activeView === "month" && renderMonthView()}
        {activeView === "agenda" && renderAgendaView()}
        {activeView === "year" && renderYearView()}

        {/* Empty state — week/day only */}
        {(activeView === "week" || activeView === "day") && !loading && events.length === 0 && !fetchError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: 120 }}>
            <div className="flex flex-col items-center gap-2 mt-24">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="8" width="32" height="28" rx="4" stroke="#D1D5DB" strokeWidth="2" fill="none" />
                <path d="M4 16H36" stroke="#D1D5DB" strokeWidth="2" />
                <path d="M14 4V10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                <path d="M26 4V10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-neutral-400 font-medium">No events {activeView === "day" ? "today" : "this week"}</p>
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

      {/* ── Event Form Modal ── */}
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
              if (idx >= 0) { const next = [...prev]; next[idx] = savedEvent; return next; }
              return [...prev, savedEvent];
            });
            setShowForm(false);
            setEditingEvent(null);
            setNlPrefill(null);
            // Show confirmation banner, auto-dismiss after 4s
            setSavedConfirmation(savedEvent.subject);
            setTimeout(() => setSavedConfirmation(null), 4000);
          }}
        />
      )}
    </div>
  );
}
