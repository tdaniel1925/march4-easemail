"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/lib/stores/account-store";
import type { EmailMessage } from "@/lib/types/email";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  attendeeCount: number;
}

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  priority?: "high" | "normal";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEventTime(dt: string): string {
  return new Date(dt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatRelative(dt: string): string {
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const EVENT_COLORS = [
  "rgb(138 9 9)",   // primary
  "rgb(22 163 74)", // green
  "rgb(37 99 235)", // blue
];

// ─── Weekly Chart ─────────────────────────────────────────────────────────────

function WeeklyChart({ receivedData, sentData }: { receivedData: number[]; sentData: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const barW = 10;
    const gap = 4;
    const totalW = canvas.offsetWidth || 260;
    const totalH = canvas.offsetHeight || 144;
    canvas.width = totalW * window.devicePixelRatio;
    canvas.height = totalH * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const maxVal = Math.max(...receivedData, ...sentData) + 2;
    const chartH = totalH - 28;
    const startX = 20;
    const availW = totalW - startX - 10;
    const slotW = availW / labels.length;

    // Grid lines
    ctx.strokeStyle = "rgba(214,215,215,0.5)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = 4 + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(totalW - 10, y); ctx.stroke();
      ctx.fillStyle = "#9ca3af";
      ctx.font = "9px Inter, sans-serif";
      ctx.fillText(String(Math.round(maxVal - (maxVal / 4) * i)), 2, y + 4);
    }

    // Bars (Received and Sent)
    labels.forEach((label, i) => {
      const cx = startX + slotW * i + slotW / 2;

      // Received bar (red)
      const receivedVal = receivedData[i];
      const receivedBarH = (receivedVal / maxVal) * chartH;
      const receivedX = cx - barW - gap / 2;
      const receivedY = chartH - receivedBarH + 4;

      ctx.fillStyle = "rgba(220,38,38,0.85)";
      ctx.beginPath();
      const r = 3;
      ctx.moveTo(receivedX + r, receivedY);
      ctx.lineTo(receivedX + barW - r, receivedY);
      ctx.quadraticCurveTo(receivedX + barW, receivedY, receivedX + barW, receivedY + r);
      ctx.lineTo(receivedX + barW, receivedY + receivedBarH);
      ctx.lineTo(receivedX, receivedY + receivedBarH);
      ctx.lineTo(receivedX, receivedY + r);
      ctx.quadraticCurveTo(receivedX, receivedY, receivedX + r, receivedY);
      ctx.closePath();
      ctx.fill();

      // Sent bar (blue)
      const sentVal = sentData[i];
      const sentBarH = (sentVal / maxVal) * chartH;
      const sentX = cx + gap / 2;
      const sentY = chartH - sentBarH + 4;

      ctx.fillStyle = "rgba(37,99,235,0.85)";
      ctx.beginPath();
      ctx.moveTo(sentX + r, sentY);
      ctx.lineTo(sentX + barW - r, sentY);
      ctx.quadraticCurveTo(sentX + barW, sentY, sentX + barW, sentY + r);
      ctx.lineTo(sentX + barW, sentY + sentBarH);
      ctx.lineTo(sentX, sentY + sentBarH);
      ctx.lineTo(sentX, sentY + r);
      ctx.quadraticCurveTo(sentX, sentY, sentX + r, sentY);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, cx, totalH - 4);
    });
  }, [receivedData, sentData]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "144px", display: "block" }} />;
}

// ─── Dashboard Client ─────────────────────────────────────────────────────────

export default function DashboardClient({
  userName,
  events,
  recentUnread,
  eventsToday,
  emailsData,
  sentData,
  draftsCount,
  hoursWaiting,
  attachmentsToday,
  unreadTrend,
}: {
  userName: string;
  events: CalendarEvent[];
  recentUnread: (EmailMessage & { accountName?: string })[];
  eventsToday: number;
  emailsData: number[];
  sentData: number[];
  draftsCount: number;
  hoursWaiting: number;
  attachmentsToday: number;
  unreadTrend: number;
}) {
  const router = useRouter();
  const inboxUnread = useAccountStore((s) => s.inboxUnread);

  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");
  const [addingTodo, setAddingTodo] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setDateStr(now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function fetchTodos() {
      setTodosLoading(true);
      try {
        const res = await fetch("/api/todos");
        if (res.ok) {
          const data = await res.json();
          setTodos(data);
        }
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      } finally {
        setTodosLoading(false);
      }
    }
    fetchTodos();
  }, []);

  useEffect(() => {
    function getRefreshInterval() {
      const now = new Date();
      const centralTime = now.toLocaleString("en-US", {
        timeZone: "America/Chicago",
        hour: "numeric",
        hour12: false
      });
      const hour = parseInt(centralTime);

      if (hour >= 8 && hour < 18) return 5 * 60 * 1000; // 5 min
      return 30 * 60 * 1000; // 30 min
    }

    const interval = setInterval(() => {
      router.refresh();
    }, getRefreshInterval());

    return () => clearInterval(interval);
  }, [router]);

  // Next event countdown
  useEffect(() => {
    const nextEvent = events.find(e => new Date(e.startDateTime) > new Date());
    if (!nextEvent) {
      setTimeUntilNext("");
      return;
    }

    function updateCountdown() {
      if (!nextEvent) return;
      const ms = new Date(nextEvent.startDateTime).getTime() - Date.now();
      if (ms < 0) {
        setTimeUntilNext("");
        return;
      }
      const mins = Math.floor(ms / 60000);
      const hrs = Math.floor(mins / 60);

      if (mins < 60) setTimeUntilNext(`${mins}m`);
      else if (hrs < 24) setTimeUntilNext(`${hrs}h ${mins % 60}m`);
      else setTimeUntilNext(`${Math.floor(hrs / 24)}d`);
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [events]);

  async function toggleTodo(id: string) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !todo.done }),
      });

      if (!res.ok) {
        // Revert on error
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: todo.done } : t));
      }
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      // Revert on error
      setTodos(prev => prev.map(t => t.id === id ? { ...t, done: todo.done } : t));
    }
  }

  async function addTodo() {
    const text = newTodo.trim();
    if (!text) return;

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const created = await res.json();
        setTodos(prev => [created, ...prev]);
        setNewTodo("");
        setAddingTodo(false);
      }
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  }

  return (
    <div className="flex flex-col flex-1" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Welcome Header */}
      <header className="bg-white border-b border-neutral-200 px-6 lg:px-10 py-5 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgb(155 155 155)" }}>Dashboard</p>
            <h1 className="font-bold" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", lineHeight: 1.15, color: "rgb(27 29 29)" }}>
              Welcome back, <span style={{ color: "rgb(138 9 9)" }}>{userName}</span>
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: "rgb(115 115 115)" }}>
              {dateStr} &nbsp;·&nbsp; {timeStr}
            </p>
          </div>
          <a
            href="/compose"
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-small shadow-custom transition-all flex-shrink-0"
            style={{ backgroundColor: "rgb(138 9 9)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Compose
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-6" style={{ backgroundColor: "rgb(250 250 250)" }}>
        <div className="max-w-7xl mx-auto">
          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <a
              href="/inbox"
              className="flex items-center gap-2 px-4 py-2.5 rounded-small text-sm font-medium transition-colors border"
              style={{ backgroundColor: "white", borderColor: "rgb(229 229 229)", color: "rgb(82 82 82)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Inbox
            </a>
            <a
              href="/compose"
              className="flex items-center gap-2 px-4 py-2.5 rounded-small text-sm font-medium transition-colors border"
              style={{ backgroundColor: "white", borderColor: "rgb(229 229 229)", color: "rgb(82 82 82)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Compose
            </a>
            <a
              href="/calendar"
              className="flex items-center gap-2 px-4 py-2.5 rounded-small text-sm font-medium transition-colors border"
              style={{ backgroundColor: "white", borderColor: "rgb(229 229 229)", color: "rgb(82 82 82)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </a>
            <a
              href="/attachments"
              className="flex items-center gap-2 px-4 py-2.5 rounded-small text-sm font-medium transition-colors border"
              style={{ backgroundColor: "white", borderColor: "rgb(229 229 229)", color: "rgb(82 82 82)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attachments
            </a>
            <a
              href="/settings"
              className="flex items-center gap-2 px-4 py-2.5 rounded-small text-sm font-medium transition-colors border"
              style={{ backgroundColor: "white", borderColor: "rgb(229 229 229)", color: "rgb(82 82 82)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left Column (2/3) ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Next Event Countdown Banner */}
            {timeUntilNext && events.length > 0 && (() => {
              const nextEvent = events.find(e => new Date(e.startDateTime) > new Date());
              return nextEvent ? (
                <div className="bg-blue-50 border border-blue-200 rounded-large p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-1" style={{ color: "rgb(37 99 235)" }}>NEXT EVENT</p>
                      <p className="text-sm font-bold truncate" style={{ color: "rgb(27 29 29)" }}>{nextEvent.subject}</p>
                      {nextEvent.location && (
                        <p className="text-xs mt-0.5" style={{ color: "rgb(115 115 115)" }}>{nextEvent.location}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold" style={{ color: "rgb(37 99 235)" }}>{timeUntilNext}</p>
                      <a
                        href="/calendar"
                        className="mt-1 inline-block text-xs px-3 py-1 rounded-small text-white font-semibold transition-colors"
                        style={{ backgroundColor: "rgb(37 99 235)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(29 78 216)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(37 99 235)"; }}
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Today's Agenda */}
            <section className="bg-white rounded-large border border-neutral-200 shadow-custom p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "rgb(27 29 29)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Today&apos;s Agenda
                </h2>
                <a href="/calendar" className="text-sm font-medium transition-colors" style={{ color: "rgb(138 9 9)" }}>
                  View Calendar →
                </a>
              </div>

              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm" style={{ color: "rgb(155 155 155)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  No events scheduled for today
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {events.map((event, i) => {
                    const color = EVENT_COLORS[i % EVENT_COLORS.length];
                    const now = new Date();
                    const month = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
                    const day = now.getDate();
                    return (
                      <a
                        key={event.id}
                        href="/calendar"
                        className="flex gap-4 p-4 rounded-large border border-neutral-200 hover:border-neutral-300 transition-colors group"
                        style={{ backgroundColor: "rgb(250 250 250)", textDecoration: "none" }}
                      >
                        <div className="flex-shrink-0 w-14 flex flex-col items-center justify-center rounded-large" style={{ backgroundColor: color }}>
                          <span className="text-xs font-bold uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>{month}</span>
                          <span className="text-2xl font-bold text-white leading-none">{day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <h3 className="font-semibold truncate group-hover:underline" style={{ color: "rgb(27 29 29)" }}>{event.subject}</h3>
                            <span className="text-xs font-semibold px-2 py-1 rounded-small border flex-shrink-0"
                              style={{ color: "rgb(138 9 9)", backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 216 216)" }}>
                              {formatEventTime(event.startDateTime)}
                            </span>
                          </div>
                          {event.location && (
                            <p className="text-sm mt-1" style={{ color: "rgb(115 115 115)" }}>{event.location}</p>
                          )}
                          {event.attendeeCount > 0 && (
                            <p className="text-xs mt-2" style={{ color: "rgb(155 155 155)" }}>+{event.attendeeCount} attendees</p>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            {/* To Do List */}
            <section className="bg-white rounded-large border border-neutral-200 shadow-custom p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "rgb(27 29 29)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(22 163 74)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  To Do List
                </h2>
                <button
                  onClick={() => setAddingTodo(true)}
                  className="p-2 rounded-large transition-colors"
                  style={{ color: "rgb(155 155 155)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(138 9 9)"; e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {todosLoading ? (
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-large"
                        style={{ backgroundColor: "rgb(245 245 245)" }}
                      >
                        <div className="w-5 h-5 rounded flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgb(229 231 235)" }} />
                        <div className="flex-1 min-w-0">
                          <div className="h-4 rounded" style={{ backgroundColor: "rgb(229 231 235)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : todos.length === 0 && !addingTodo ? (
                  <div className="flex flex-col items-center justify-center py-6 text-sm" style={{ color: "rgb(155 155 155)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    No tasks yet
                  </div>
                ) : null}
                {!todosLoading && todos.map((todo) => (
                  <label
                    key={todo.id}
                    className="flex items-start gap-3 p-3 rounded-large cursor-pointer transition-colors"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                      className="mt-0.5 w-5 h-5 rounded flex-shrink-0"
                      style={{ accentColor: "rgb(138 9 9)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block" style={{ color: todo.done ? "rgb(155 155 155)" : "rgb(38 38 38)", textDecoration: todo.done ? "line-through" : "none" }}>
                        {todo.text}
                      </span>
                      {todo.priority && !todo.done && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-small border mt-1 inline-block"
                          style={todo.priority === "high"
                            ? { color: "rgb(83 5 5)", backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 216 216)" }
                            : { color: "rgb(75 85 99)", backgroundColor: "rgb(243 244 246)", borderColor: "rgb(229 231 235)" }
                          }>
                          {todo.priority === "high" ? "High Priority" : "Normal"}
                        </span>
                      )}
                    </div>
                  </label>
                ))}

                {addingTodo && (
                  <div className="flex items-center gap-3 p-3 rounded-large border" style={{ backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 216 216)" }}>
                    <input type="checkbox" disabled className="mt-0.5 w-5 h-5 rounded flex-shrink-0" style={{ accentColor: "rgb(138 9 9)" }} />
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addTodo(); if (e.key === "Escape") { setAddingTodo(false); setNewTodo(""); } }}
                      placeholder="New task…"
                      autoFocus
                      className="flex-1 text-sm font-medium bg-transparent outline-none border-none"
                      style={{ color: "rgb(38 38 38)" }}
                    />
                    <button onClick={addTodo} className="text-xs font-semibold flex-shrink-0" style={{ color: "rgb(138 9 9)" }}>Add</button>
                    <button onClick={() => { setAddingTodo(false); setNewTodo(""); }} className="text-xs flex-shrink-0" style={{ color: "rgb(115 115 115)" }}>Cancel</button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── Right Column (1/3) ── */}
          <div className="flex flex-col gap-5">

            {/* Recent Unread */}
            <section className="bg-white rounded-large border border-neutral-200 shadow-custom p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "rgb(27 29 29)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  New Emails
                </h2>
                {inboxUnread > 0 && (
                  <span className="text-white text-xs font-bold px-2.5 py-1 rounded-small" style={{ backgroundColor: "rgb(138 9 9)" }}>
                    {inboxUnread} New
                  </span>
                )}
              </div>

              {recentUnread.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "rgb(155 155 155)" }}>All caught up!</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {recentUnread.map((email, i) => {
                    const isFlagged = email.flag?.flagStatus === "flagged";
                    const hoursOld = Math.floor((Date.now() - new Date(email.receivedDateTime).getTime()) / 3600000);
                    const isOld = hoursOld > 24;

                    return (
                      <div key={email.id}>
                        {email.accountName && (
                          <div className="text-xs font-semibold mb-1" style={{ color: "rgb(138 9 9)" }}>
                            {email.accountName}
                          </div>
                        )}
                        <button
                          onClick={() => router.push(`/inbox/${email.id}`)}
                          className="w-full text-left group"
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {isFlagged && (
                                <span className="text-sm flex-shrink-0">⭐</span>
                              )}
                              <h4 className="font-semibold text-sm truncate group-hover:underline" style={{ color: "rgb(27 29 29)" }}>
                                {email.from.name}
                              </h4>
                            </div>
                            <span className="text-xs flex-shrink-0 ml-2" style={{ color: "rgb(155 155 155)" }}>
                              {formatRelative(email.receivedDateTime)}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <p className="text-sm font-medium truncate flex-1" style={{ color: "rgb(58 58 58)" }}>{email.subject}</p>
                            {isOld && (
                              <span className="text-xs px-2 py-0.5 rounded-small font-semibold flex-shrink-0" style={{ backgroundColor: "rgb(254 226 226)", color: "rgb(153 27 27)" }}>
                                REPLY
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "rgb(115 115 115)" }}>{email.bodyPreview}</p>
                        </button>
                        {i < recentUnread.length - 1 && <div className="h-px mt-4" style={{ backgroundColor: "rgb(245 245 245)" }} />}
                      </div>
                    );
                  })}
                </div>
              )}

              <a
                href="/inbox"
                className="w-full mt-5 py-2.5 text-sm font-semibold rounded-small transition-colors border flex items-center justify-center"
                style={{ color: "rgb(82 82 82)", backgroundColor: "rgb(245 245 245)", borderColor: "rgb(229 229 229)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(238 238 238)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              >
                View All Inbox
              </a>
            </section>

            {/* Weekly Activity */}
            <section className="bg-white rounded-large border border-neutral-200 shadow-custom p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold" style={{ color: "rgb(27 29 29)" }}>Weekly Activity</h2>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(220,38,38,0.85)" }} />
                    <span style={{ color: "rgb(115 115 115)" }}>Received</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(37,99,235,0.85)" }} />
                    <span style={{ color: "rgb(115 115 115)" }}>Sent</span>
                  </div>
                </div>
              </div>
              <WeeklyChart receivedData={emailsData} sentData={sentData} />
            </section>

            {/* Quick Stats */}
            <section className="grid grid-cols-2 gap-3">
              {/* Unread with Trend */}
              <div className="rounded-large shadow-custom p-4 flex flex-col gap-1" style={{ backgroundColor: "rgb(138 9 9)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(252 216 216)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span className="text-2xl font-bold text-white">{inboxUnread}</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "rgb(252 216 216)" }}>Unread</span>
                  {unreadTrend !== 0 && (
                    <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: "rgb(252 216 216)" }}>
                      {unreadTrend > 0 ? "↑" : "↓"} {Math.abs(unreadTrend)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="rounded-large shadow-custom p-4 flex flex-col gap-1" style={{ backgroundColor: "rgb(22 163 74)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-2xl font-bold text-white">{todos.filter((t) => !t.done).length}</span>
                <span className="text-xs font-medium text-white opacity-70">Tasks Pending</span>
              </div>

              {/* Events */}
              <div className="rounded-large shadow-custom p-4 flex flex-col gap-1" style={{ backgroundColor: "rgb(37 99 235)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-2xl font-bold text-white">{eventsToday}</span>
                <span className="text-xs font-medium text-white opacity-70">Events Today</span>
              </div>

              {/* Drafts */}
              <div className="rounded-large shadow-custom p-4 flex flex-col gap-1" style={{ backgroundColor: "rgb(245 158 11)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-2xl font-bold text-white">{draftsCount}</span>
                <span className="text-xs font-medium text-white opacity-70">Drafts</span>
              </div>

              {/* Response Time */}
              <a
                href="/inbox"
                className="rounded-large shadow-custom p-4 flex flex-col gap-1 transition-opacity hover:opacity-90"
                style={{ backgroundColor: hoursWaiting > 24 ? "rgb(220 38 38)" : hoursWaiting > 0 ? "rgb(251 146 60)" : "rgb(22 163 74)", textDecoration: "none" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-2xl font-bold text-white">{hoursWaiting}h</span>
                <span className="text-xs font-medium text-white opacity-70">
                  {hoursWaiting > 24 ? "NEEDS REPLY" : hoursWaiting > 0 ? "Oldest Unread" : "All Caught Up"}
                </span>
              </a>

              {/* Attachments */}
              <a
                href="/attachments"
                className="rounded-large shadow-custom p-4 flex flex-col gap-1 transition-opacity hover:opacity-90"
                style={{ backgroundColor: "rgb(139 92 246)", textDecoration: "none" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-2xl font-bold text-white">{attachmentsToday}</span>
                <span className="text-xs font-medium text-white opacity-70">Today&apos;s Attachments</span>
              </a>
            </section>

          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
