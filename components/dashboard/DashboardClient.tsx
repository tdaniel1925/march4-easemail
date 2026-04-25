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
  "rgb(138 9 9)",
  "rgb(22 163 74)",
  "rgb(37 99 235)",
];

// ─── Weekly Chart ─────────────────────────────────────────────────────────────

function WeeklyChart({ receivedData, sentData }: { receivedData: number[]; sentData: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasData = receivedData.some((v) => v > 0) || sentData.some((v) => v > 0);

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

    const maxVal = Math.max(...receivedData, ...sentData, 1) + 2;
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

    // Bars
    labels.forEach((label, i) => {
      const cx = startX + slotW * i + slotW / 2;
      const r = 3;

      // Received bar (red)
      const receivedVal = receivedData[i];
      const receivedBarH = Math.max((receivedVal / maxVal) * chartH, receivedVal > 0 ? 4 : 0);
      const receivedX = cx - barW - gap / 2;
      const receivedY = chartH - receivedBarH + 4;

      ctx.fillStyle = "rgba(220,38,38,0.85)";
      ctx.beginPath();
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
      const sentBarH = Math.max((sentVal / maxVal) * chartH, sentVal > 0 ? 4 : 0);
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

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "144px", display: "block" }} />
      {!hasData && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <p className="text-xs font-medium" style={{ color: "rgb(155 155 155)" }}>
            No email data yet for this week
          </p>
        </div>
      )}
    </div>
  );
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
  const [newTodoPriority, setNewTodoPriority] = useState<"normal" | "high">("normal");
  const [addingTodo, setAddingTodo] = useState(false);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
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
        hour12: false,
      });
      const hour = parseInt(centralTime);
      if (hour >= 8 && hour < 18) return 5 * 60 * 1000;
      return 30 * 60 * 1000;
    }
    const interval = setInterval(() => router.refresh(), getRefreshInterval());
    return () => clearInterval(interval);
  }, [router]);

  // Next event countdown
  useEffect(() => {
    const nextEvent = events.find((e) => new Date(e.startDateTime) > new Date());
    if (!nextEvent) { setTimeUntilNext(""); return; }

    function updateCountdown() {
      if (!nextEvent) return;
      const ms = new Date(nextEvent.startDateTime).getTime() - Date.now();
      if (ms < 0) { setTimeUntilNext(""); return; }
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
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !todo.done }),
      });
      if (!res.ok) {
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: todo.done } : t)));
      }
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: todo.done } : t)));
    }
  }

  async function deleteTodo(id: string) {
    setDeletingTodoId(id);
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    } finally {
      setDeletingTodoId(null);
    }
  }

  async function addTodo() {
    const text = newTodo.trim();
    if (!text) return;
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, priority: newTodoPriority }),
      });
      if (res.ok) {
        const created = await res.json();
        setTodos((prev) => [created, ...prev]);
        setNewTodo("");
        setNewTodoPriority("normal");
        setAddingTodo(false);
      }
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  }

  return (
    <div className="flex flex-col flex-1" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Welcome Header */}
      <header className="relative flex-shrink-0 overflow-hidden" style={{
        background: (() => {
          const h = parseInt(timeStr.split(":")[0]) || 0;
          const isPM = timeStr.includes("PM");
          const hour24 = isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h);
          if (hour24 >= 6 && hour24 < 12) return "linear-gradient(180deg, rgb(100 5 5) 0%, rgb(138 9 9) 40%, rgb(180 40 40) 80%, rgb(250 250 250) 100%)";
          if (hour24 >= 12 && hour24 < 18) return "linear-gradient(180deg, rgb(110 8 8) 0%, rgb(150 20 20) 40%, rgb(190 50 50) 80%, rgb(250 250 250) 100%)";
          return "linear-gradient(180deg, rgb(60 3 3) 0%, rgb(90 6 6) 40%, rgb(138 9 9) 80%, rgb(250 250 250) 100%)";
        })(),
        minHeight: 160,
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-10 relative z-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-lg font-light mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                {(() => {
                  const h = parseInt(timeStr.split(":")[0]) || 0;
                  const isPM = timeStr.includes("PM");
                  const hour24 = isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h);
                  if (hour24 >= 5 && hour24 < 12) return "Good morning";
                  if (hour24 >= 12 && hour24 < 17) return "Good afternoon";
                  return "Good evening";
                })()}
              </p>
              <h1 className="text-white font-bold" style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", lineHeight: 1.15 }}>
                {userName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-semibold text-white">{timeStr}</span>
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{dateStr}</span>
              </div>
            </div>
            <a
              href="/compose"
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-[10px] shadow-lg transition-all flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "rgb(138 9 9)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Compose
            </a>
          </div>
        </div>
        {/* Subtle mountain silhouette */}
        <svg className="absolute bottom-0 left-0 right-0 w-full" style={{ height: 40 }} viewBox="0 0 1440 40" preserveAspectRatio="none" fill="none">
          <path d="M0 40V28L120 20L240 30L360 15L480 25L600 10L720 22L840 8L960 18L1080 12L1200 24L1320 16L1440 28V40H0Z" fill="rgb(250 250 250)" />
        </svg>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-6" style={{ backgroundColor: "rgb(250 250 250)" }}>
        <div className="max-w-7xl mx-auto">

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            <a href="/inbox" className="bg-white rounded-[12px] border border-neutral-200 p-4 flex items-center gap-4 transition-colors hover:border-neutral-300" style={{ textDecoration: "none" }}>
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(253 235 235)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>{inboxUnread}</p>
                <p className="text-xs font-medium" style={{ color: "rgb(115 115 115)" }}>
                  Unread
                  {unreadTrend !== 0 && (
                    <span className="ml-1.5" style={{ color: unreadTrend > 0 ? "rgb(220 38 38)" : "rgb(22 163 74)" }}>
                      {unreadTrend > 0 ? "↑" : "↓"}{Math.abs(unreadTrend)}
                    </span>
                  )}
                </p>
              </div>
            </a>

            <a href="/calendar" className="bg-white rounded-[12px] border border-neutral-200 p-4 flex items-center gap-4 transition-colors hover:border-neutral-300" style={{ textDecoration: "none" }}>
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(219 234 254)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(37 99 235)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>{eventsToday}</p>
                <p className="text-xs font-medium" style={{ color: "rgb(115 115 115)" }}>Events Today</p>
              </div>
            </a>

            <div className="bg-white rounded-[12px] border border-neutral-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(220 252 231)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(22 163 74)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>{todos.filter((t) => !t.done).length}</p>
                <p className="text-xs font-medium" style={{ color: "rgb(115 115 115)" }}>Tasks Pending</p>
              </div>
            </div>

            <a href="/drafts" className="bg-white rounded-[12px] border border-neutral-200 p-4 flex items-center gap-4 transition-colors hover:border-neutral-300" style={{ textDecoration: "none" }}>
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(254 243 199)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(245 158 11)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>{draftsCount}</p>
                <p className="text-xs font-medium" style={{ color: "rgb(115 115 115)" }}>Drafts</p>
              </div>
            </a>

            <a href="/inbox" className="bg-white rounded-[12px] border border-neutral-200 p-4 flex items-center gap-4 transition-colors hover:border-neutral-300" style={{ textDecoration: "none" }}>
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: hoursWaiting > 24 ? "rgb(254 226 226)" : hoursWaiting > 0 ? "rgb(255 237 213)" : "rgb(220 252 231)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: hoursWaiting > 24 ? "rgb(220 38 38)" : hoursWaiting > 0 ? "rgb(234 88 12)" : "rgb(22 163 74)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>{hoursWaiting > 0 ? `${hoursWaiting}h` : "0"}</p>
                <p className="text-xs font-medium" style={{ color: "rgb(115 115 115)" }}>{hoursWaiting > 0 ? "Oldest Waiting" : "All Addressed"}</p>
              </div>
            </a>
          </div>

          {/* ── Next Event Banner ── */}
          {timeUntilNext && events.length > 0 && (() => {
            const nextEvent = events.find((e) => new Date(e.startDateTime) > new Date());
            return nextEvent ? (
              <div className="bg-blue-50 border border-blue-200 rounded-[12px] p-4 mb-5">
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
                    <a href="/calendar" className="mt-1 inline-block text-xs px-3 py-1 rounded-[8px] text-white font-semibold" style={{ backgroundColor: "rgb(37 99 235)" }}>View</a>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* ── Two Column Grid (50/50) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Today's Agenda */}
            <section className="bg-white rounded-[12px] border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "rgb(27 29 29)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Today&apos;s Agenda
                </h2>
                <a href="/calendar" className="text-xs font-semibold transition-colors" style={{ color: "rgb(138 9 9)" }}>View Calendar →</a>
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
                  {events.map((event, idx) => {
                    const color = EVENT_COLORS[idx % EVENT_COLORS.length];
                    const isPast = new Date(event.endDateTime) < new Date();
                    const isNow = new Date(event.startDateTime) <= new Date() && new Date(event.endDateTime) >= new Date();
                    return (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-[10px] border" style={{ borderColor: isNow ? color : "rgb(229 231 235)", backgroundColor: isNow ? "rgba(138,9,9,0.04)" : isPast ? "rgb(250 250 250)" : "white" }}>
                        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: isPast ? "rgb(200 200 200)" : color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm truncate" style={{ color: isPast ? "rgb(155 155 155)" : "rgb(27 29 29)", textDecoration: isPast ? "line-through" : "none" }}>{event.subject}</p>
                            {isNow && <span className="text-xs font-bold px-2 py-0.5 rounded-[6px] flex-shrink-0" style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)" }}>NOW</span>}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: "rgb(115 115 115)" }}>
                            {formatEventTime(event.startDateTime)} – {formatEventTime(event.endDateTime)}
                            {event.location && ` · ${event.location}`}
                            {event.attendeeCount > 0 && ` · ${event.attendeeCount} attendee${event.attendeeCount !== 1 ? "s" : ""}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* New Emails */}
            <section className="bg-white rounded-[12px] border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "rgb(27 29 29)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  New Emails
                </h2>
                {inboxUnread > 0 && <span className="text-white text-xs font-bold px-2.5 py-1 rounded-[6px]" style={{ backgroundColor: "rgb(138 9 9)" }}>{inboxUnread} New</span>}
              </div>
              {recentUnread.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "rgb(155 155 155)" }}>All caught up!</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {recentUnread.map((email, i) => {
                    const isFlagged = email.flag?.flagStatus === "flagged";
                    const hoursOld = Math.floor((Date.now() - new Date(email.receivedDateTime).getTime()) / 3600000);
                    const isOld = hoursOld > 24;
                    return (
                      <div key={email.id}>
                        {email.accountName && <div className="text-xs font-semibold mb-1" style={{ color: "rgb(138 9 9)" }}>{email.accountName}</div>}
                        <button onClick={() => router.push(`/inbox/${email.id}`)} className="w-full text-left group">
                          <div className="flex justify-between items-start mb-0.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {isFlagged && <span className="text-sm flex-shrink-0">⭐</span>}
                              <h4 className="font-semibold text-sm truncate group-hover:underline" style={{ color: "rgb(27 29 29)" }}>{email.from.name}</h4>
                            </div>
                            <span className="text-xs flex-shrink-0 ml-2" style={{ color: "rgb(155 155 155)" }}>{formatRelative(email.receivedDateTime)}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <p className="text-sm font-medium truncate flex-1" style={{ color: "rgb(58 58 58)" }}>{email.subject}</p>
                            {isOld && <span className="text-xs px-2 py-0.5 rounded-[6px] font-semibold flex-shrink-0" style={{ backgroundColor: "rgb(254 226 226)", color: "rgb(153 27 27)" }}>REPLY</span>}
                          </div>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "rgb(115 115 115)" }}>{email.bodyPreview}</p>
                        </button>
                        {i < recentUnread.length - 1 && <div className="h-px mt-4" style={{ backgroundColor: "rgb(245 245 245)" }} />}
                      </div>
                    );
                  })}
                </div>
              )}
              <a href="/inbox" className="w-full mt-5 py-2.5 text-sm font-semibold rounded-[8px] transition-colors border flex items-center justify-center" style={{ color: "rgb(82 82 82)", backgroundColor: "rgb(245 245 245)", borderColor: "rgb(229 229 229)" }}>View All Inbox</a>
            </section>

            {/* To Do List */}
            <section className="bg-white rounded-[12px] border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "rgb(27 29 29)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(22 163 74)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  To Do List
                  {todos.filter((t) => !t.done).length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-[6px]" style={{ backgroundColor: "rgb(220 252 231)", color: "rgb(21 128 61)" }}>
                      {todos.filter((t) => !t.done).length} pending
                    </span>
                  )}
                </h2>
                <button onClick={() => setAddingTodo(true)} className="p-2 rounded-[10px] transition-colors" style={{ color: "rgb(155 155 155)" }} title="Add task">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {addingTodo && (
                  <div className="flex flex-col gap-2 p-3 mb-2 rounded-[10px] border" style={{ backgroundColor: "rgb(253 251 235)", borderColor: "rgb(253 224 132)" }}>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled className="w-5 h-5 rounded flex-shrink-0" style={{ accentColor: "rgb(138 9 9)" }} />
                      <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTodo(); if (e.key === "Escape") { setAddingTodo(false); setNewTodo(""); setNewTodoPriority("normal"); } }} placeholder="What needs to be done?" autoFocus className="flex-1 text-sm font-medium bg-transparent outline-none border-none" style={{ color: "rgb(38 38 38)" }} />
                    </div>
                    <div className="flex items-center justify-between pl-7">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setNewTodoPriority("normal")} className="text-xs font-semibold px-2.5 py-1 rounded-[6px] border transition-colors" style={newTodoPriority === "normal" ? { backgroundColor: "rgb(243 244 246)", borderColor: "rgb(156 163 175)", color: "rgb(55 65 81)" } : { backgroundColor: "transparent", borderColor: "rgb(229 231 235)", color: "rgb(156 163 175)" }}>Normal</button>
                        <button onClick={() => setNewTodoPriority("high")} className="text-xs font-semibold px-2.5 py-1 rounded-[6px] border transition-colors" style={newTodoPriority === "high" ? { backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 165 165)", color: "rgb(153 27 27)" } : { backgroundColor: "transparent", borderColor: "rgb(229 231 235)", color: "rgb(156 163 175)" }}>High</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={addTodo} className="text-xs font-semibold px-3 py-1 rounded-[6px] text-white" style={{ backgroundColor: "rgb(138 9 9)" }}>Add</button>
                        <button onClick={() => { setAddingTodo(false); setNewTodo(""); setNewTodoPriority("normal"); }} className="text-xs font-medium" style={{ color: "rgb(115 115 115)" }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                {todosLoading ? (
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-[10px]" style={{ backgroundColor: "rgb(245 245 245)" }}>
                        <div className="w-5 h-5 rounded flex-shrink-0 mt-0.5" style={{ backgroundColor: "rgb(229 231 235)" }} />
                        <div className="flex-1"><div className="h-4 rounded" style={{ backgroundColor: "rgb(229 231 235)", width: `${60 + i * 15}%` }} /></div>
                      </div>
                    ))}
                  </div>
                ) : todos.length === 0 && !addingTodo ? (
                  <div className="flex flex-col items-center justify-center py-6 text-sm" style={{ color: "rgb(155 155 155)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    No tasks yet — click + to add one
                  </div>
                ) : null}
                {!todosLoading && todos.map((todo) => (
                  <div key={todo.id} className="group flex items-start gap-3 p-3 rounded-[10px] transition-colors hover:bg-neutral-50">
                    <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} className="mt-0.5 w-5 h-5 rounded flex-shrink-0 cursor-pointer" style={{ accentColor: "rgb(138 9 9)" }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block" style={{ color: todo.done ? "rgb(155 155 155)" : "rgb(38 38 38)", textDecoration: todo.done ? "line-through" : "none" }}>{todo.text}</span>
                      {todo.priority === "high" && !todo.done && <span className="text-xs font-semibold px-2 py-0.5 rounded-[6px] border mt-1 inline-block" style={{ color: "rgb(83 5 5)", backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 216 216)" }}>High Priority</span>}
                    </div>
                    <button onClick={() => deleteTodo(todo.id)} disabled={deletingTodoId === todo.id} className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded transition-all hover:text-red-600 hover:bg-red-50" style={{ color: "rgb(155 155 155)" }} title="Delete task">
                      {deletingTodoId === todo.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly Activity */}
            <section className="bg-white rounded-[12px] border border-neutral-200 p-6">
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
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                <div className="text-center flex-1">
                  <p className="text-lg font-bold" style={{ color: "rgb(220 38 38)" }}>{emailsData.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>Received</p>
                </div>
                <div className="w-px h-8" style={{ backgroundColor: "rgb(229 231 235)" }} />
                <div className="text-center flex-1">
                  <p className="text-lg font-bold" style={{ color: "rgb(37 99 235)" }}>{sentData.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>Sent</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
