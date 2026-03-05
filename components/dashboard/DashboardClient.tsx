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

function WeeklyChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const emailsData = [5, 8, 6, 11, 9, 3, 2];
    const barW = 14;
    const gap = 8;
    const groupW = barW * 2 + gap;
    const groupGap = 14;
    const totalW = canvas.offsetWidth || 260;
    const totalH = canvas.offsetHeight || 144;
    canvas.width = totalW * window.devicePixelRatio;
    canvas.height = totalH * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const maxVal = Math.max(...emailsData) + 2;
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
      const val = emailsData[i];
      const barH = (val / maxVal) * chartH;
      const x = cx - barW / 2;
      const y = chartH - barH + 4;

      ctx.fillStyle = "rgba(220,38,38,0.85)";
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, cx, totalH - 4);
    });
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "144px", display: "block" }} />;
}

// ─── Dashboard Client ─────────────────────────────────────────────────────────

export default function DashboardClient({
  userName,
  events,
  recentUnread,
  eventsToday,
}: {
  userName: string;
  events: CalendarEvent[];
  recentUnread: EmailMessage[];
  eventsToday: number;
}) {
  const router = useRouter();
  const inboxUnread = useAccountStore((s) => s.inboxUnread);

  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "1", text: "Review client contracts", done: false, priority: "high" },
    { id: "2", text: "Send meeting summary email", done: true },
    { id: "3", text: "Prepare case notes for Thursday", done: false, priority: "normal" },
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [addingTodo, setAddingTodo] = useState(false);

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

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  function addTodo() {
    const text = newTodo.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: Date.now().toString(), text, done: false }]);
    setNewTodo("");
    setAddingTodo(false);
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
            className="flex items-center gap-2 ai-gradient-bg text-white text-sm font-semibold px-4 py-2.5 rounded-small shadow-custom transition-all flex-shrink-0"
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left Column (2/3) ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

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
                {todos.map((todo) => (
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
                  {recentUnread.map((email, i) => (
                    <div key={email.id}>
                      <button
                        onClick={() => router.push(`/inbox/${email.id}`)}
                        className="w-full text-left group"
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className="font-semibold text-sm truncate group-hover:underline" style={{ color: "rgb(27 29 29)" }}>
                            {email.from.name}
                          </h4>
                          <span className="text-xs flex-shrink-0 ml-2" style={{ color: "rgb(155 155 155)" }}>
                            {formatRelative(email.receivedDateTime)}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate" style={{ color: "rgb(58 58 58)" }}>{email.subject}</p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "rgb(115 115 115)" }}>{email.bodyPreview}</p>
                      </button>
                      {i < recentUnread.length - 1 && <div className="h-px mt-4" style={{ backgroundColor: "rgb(245 245 245)" }} />}
                    </div>
                  ))}
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
                <span className="text-xs font-medium" style={{ color: "rgb(155 155 155)" }}>Emails received</span>
              </div>
              <WeeklyChart />
            </section>

            {/* Quick Stats */}
            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-large shadow-custom p-4 flex flex-col gap-1" style={{ backgroundColor: "rgb(138 9 9)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(252 216 216)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span className="text-2xl font-bold text-white">{inboxUnread}</span>
                <span className="text-xs font-medium" style={{ color: "rgb(252 216 216)" }}>Unread</span>
              </div>
              <div className="rounded-large shadow-custom p-4 flex flex-col gap-1" style={{ backgroundColor: "rgb(22 163 74)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-2xl font-bold text-white">{todos.filter((t) => !t.done).length}</span>
                <span className="text-xs font-medium text-white opacity-70">Tasks Pending</span>
              </div>
              <div className="rounded-large shadow-custom p-4 flex flex-col gap-1" style={{ backgroundColor: "rgb(37 99 235)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-2xl font-bold text-white">{eventsToday}</span>
                <span className="text-xs font-medium text-white opacity-70">Events Today</span>
              </div>
              <div className="rounded-large shadow-custom p-4 flex flex-col gap-1" style={{ backgroundColor: "rgb(38 38 38)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgba(255,255,255,0.4)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-2xl font-bold text-white">0</span>
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Notifications</span>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
