"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalEvent {
  id: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  attendeeCount: number;
}

interface CalendarClientProps {
  weekStart: string;
  events: CalEvent[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = "rgb(138, 9, 9)";
const BRAND_LIGHT = "rgba(138, 9, 9, 0.08)";
const HOUR_START = 8;
const HOUR_END = 18;
const ROW_HEIGHT = 80; // px per hour
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

const EVENT_COLORS = [
  "bg-blue-50 border-l-4 border-blue-500 text-blue-800",
  "bg-red-50 border-l-4 border-red-600 text-red-900",
  "bg-teal-50 border-l-4 border-teal-500 text-teal-900",
  "bg-orange-50 border-l-4 border-orange-500 text-orange-900",
  "bg-neutral-100 border-l-4 border-neutral-500 text-neutral-800",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isoToDateStr(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toISOString().split("T")[0];
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

  if (startYear !== endYear) {
    return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startMonth} – ${endMonth} ${startYear}`;
  }
  return `${startMonth} ${startYear}`;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatTimeRange(startIso: string, endIso: string): string {
  const fmt = (iso: string): string => {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${hour12} ${ampm}` : `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  return `${fmt(startIso)} – ${fmt(endIso)}`;
}

function getEventTop(startIso: string): number {
  const d = new Date(startIso);
  const h = d.getHours();
  const mins = d.getMinutes();
  return (h - HOUR_START) * ROW_HEIGHT + mins * (ROW_HEIGHT / 60);
}

function getEventHeight(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const durationMins = (end.getTime() - start.getTime()) / 60000;
  return Math.max(durationMins * (ROW_HEIGHT / 60), 40);
}

function getEventDateStr(startIso: string): string {
  return new Date(startIso).toISOString().split("T")[0];
}

function isEventInTimeRange(startIso: string): boolean {
  const d = new Date(startIso);
  const h = d.getHours();
  return h >= HOUR_START && h < HOUR_END;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="animate-spin"
        aria-label="Loading"
      >
        <circle
          cx="16"
          cy="16"
          r="13"
          stroke="rgb(229,231,235)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M16 3 A13 13 0 0 1 29 16"
          stroke={BRAND}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

interface EventCardProps {
  event: CalEvent;
  colorClass: string;
  top: number;
  height: number;
}

function EventCard({ event, colorClass, top, height }: EventCardProps) {
  return (
    <div
      className={`absolute left-1 right-1 rounded-[6px] px-2 py-1 overflow-hidden cursor-pointer hover:brightness-95 transition-all ${colorClass}`}
      style={{ top, height }}
      title={event.subject}
    >
      <p className="font-semibold text-xs leading-tight truncate">{event.subject}</p>
      <p className="text-xs opacity-70 truncate">
        {formatTimeRange(event.startDateTime, event.endDateTime)}
      </p>
      {event.location ? (
        <p className="text-xs opacity-60 truncate">{event.location}</p>
      ) : null}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CalendarClient({ weekStart: initialWeekStart, events: initialEvents }: CalendarClientProps) {
  const [weekStart, setWeekStart] = useState<string>(initialWeekStart);
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef<boolean>(true);

  // Update current time every minute
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to 8 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  // Fetch events when week changes (skip initial render — data already provided)
  const fetchWeekEvents = useCallback(async (start: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar/week?start=${encodeURIComponent(start)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as { events: CalEvent[] };
      setEvents(data.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    void fetchWeekEvents(weekStart);
  }, [weekStart, fetchWeekEvents]);

  const goToPrevWeek = () => setWeekStart((w) => addDays(w, -7));
  const goToNextWeek = () => setWeekStart((w) => addDays(w, 7));

  const weekDates = getWeekDates(weekStart);
  const today = getTodayStr();

  // Current time indicator
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const showTimeLine =
    currentHour >= HOUR_START && currentHour < HOUR_END;
  const timeLineTop =
    (currentHour - HOUR_START) * ROW_HEIGHT + currentMinutes * (ROW_HEIGHT / 60);

  // Map events by day
  const eventsByDay: Record<string, CalEvent[]> = {};
  for (const d of weekDates) {
    eventsByDay[d] = [];
  }
  for (const e of events) {
    const dateStr = getEventDateStr(e.startDateTime);
    if (eventsByDay[dateStr]) {
      eventsByDay[dateStr].push(e);
    }
  }

  // Check if today is in current week view
  const todayInWeek = weekDates.includes(today);

  return (
    <div
      className="flex flex-col flex-1"
      style={{ height: "100vh", overflow: "hidden", background: "#f9f9f9" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-4 px-6 py-4 bg-white"
        style={{ boxShadow: "0px 4px 4px 0px rgba(27,29,29,0.10)", zIndex: 10 }}
      >
        <h1 className="text-xl font-bold text-neutral-900 mr-2">Calendar</h1>

        {/* Prev / Next */}
        <button
          onClick={goToPrevWeek}
          className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-neutral-100 hover:bg-neutral-200 transition-colors"
          aria-label="Previous week"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="#374151"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <span className="text-sm font-semibold text-neutral-700 min-w-[140px] text-center">
          {getMonthYearLabel(weekStart)}
        </span>

        <button
          onClick={goToNextWeek}
          className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-neutral-100 hover:bg-neutral-200 transition-colors"
          aria-label="Next week"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="#374151"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex-1" />

        {/* View toggle */}
        <div
          className="flex rounded-[10px] overflow-hidden border border-neutral-200"
          style={{ boxShadow: "0px 4px 4px 0px rgba(27,29,29,0.10)" }}
        >
          {(["Day", "Week", "Month", "Year"] as const).map((view) => {
            const isActive = view === "Week";
            return (
              <button
                key={view}
                disabled={!isActive}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-neutral-400 bg-white cursor-not-allowed"
                }`}
                style={
                  isActive
                    ? { background: BRAND }
                    : {}
                }
              >
                {view}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Calendar Grid ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Days header row */}
        <div className="flex bg-white border-b border-neutral-200">
          {/* Time gutter spacer */}
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
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {DAY_LABELS[i]}
                </span>
                <span
                  className="mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold"
                  style={
                    isToday
                      ? { background: BRAND, color: "#fff" }
                      : { color: "#374151" }
                  }
                >
                  {dateNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* All-day row */}
        <div className="flex bg-white border-b border-neutral-200">
          <div className="w-16 shrink-0 flex items-center justify-center">
            <span className="text-[10px] text-neutral-400 font-medium">All day</span>
          </div>
          {weekDates.map((dateStr, i) => (
            <div
              key={dateStr}
              className="flex-1 h-8 border-l border-neutral-100"
              style={i >= 5 ? { background: "#fafafa" } : {}}
            />
          ))}
        </div>

        {/* Scrollable time grid */}
        <div
          ref={scrollRef}
          className="flex flex-1 overflow-y-auto relative"
          style={{ background: "#fff" }}
        >
          {loading && <Spinner />}

          {/* Time labels */}
          <div className="w-16 shrink-0 relative" style={{ height: ROW_HEIGHT * HOURS.length }}>
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
              const dayEvents = eventsByDay[dateStr] ?? [];

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

                  {/* Events */}
                  {dayEvents
                    .filter((e) => isEventInTimeRange(e.startDateTime))
                    .map((e, idx) => (
                      <EventCard
                        key={e.id}
                        event={e}
                        colorClass={EVENT_COLORS[idx % EVENT_COLORS.length]}
                        top={getEventTop(e.startDateTime)}
                        height={getEventHeight(e.startDateTime, e.endDateTime)}
                      />
                    ))}

                  {/* Current time indicator (only on today's column) */}
                  {isToday && todayInWeek && showTimeLine && (
                    <div
                      className="absolute left-0 right-0 pointer-events-none z-10"
                      style={{ top: timeLineTop }}
                    >
                      <div className="relative flex items-center">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: "rgb(220,38,38)" }}
                        />
                        <div
                          className="flex-1 h-px"
                          style={{ background: "rgb(220,38,38)" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {!loading && events.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
    </div>
  );
}
