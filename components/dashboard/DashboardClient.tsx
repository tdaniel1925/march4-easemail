"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/lib/stores/account-store";
import { useDataCacheStore, pathToView } from "@/lib/stores/data-cache";
import type { EmailMessage } from "@/lib/types/email";
import type { DashboardStats } from "@/app/api/dashboard/stats/route";

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

// ─── Account Indicator ────────────────────────────────────────────────────────

function AccountIndicator({ email, displayName }: { email: string; displayName: string | null }) {
  const initial = (displayName ?? email).charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] border border-neutral-200 bg-white mb-4"
      style={{ display: "inline-flex" }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ backgroundColor: "rgb(138 9 9)" }}
      >
        {initial}
      </div>
      <span className="text-sm" style={{ color: "rgb(115 115 115)" }}>
        Viewing: <span className="font-medium" style={{ color: "rgb(27 29 29)" }}>{email}</span>
      </span>
    </div>
  );
}

// ─── Dashboard Client ─────────────────────────────────────────────────────────

export default function DashboardClient({
  userName,
  events,
  recentUnread: initialRecentUnread,
  eventsToday,
  emailsData: initialEmailsData,
  sentData: initialSentData,
  draftsCount: initialDraftsCount,
  hoursWaiting: initialHoursWaiting,
  attachmentsToday: initialAttachmentsToday,
  unreadTrend: initialUnreadTrend,
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
  const activeAccount = useAccountStore((s) => s.activeAccount);
  const accounts = useAccountStore((s) => s.accounts);
  const inboxUnread = useAccountStore((s) => s.inboxUnread);

  // ── Account-scoped stats (refreshed on account change) ────────────────────
  const [statsLoading, setStatsLoading] = useState(false);
  const [recentUnread, setRecentUnread] = useState<(EmailMessage & { accountName?: string })[]>(initialRecentUnread);
  const [emailsData, setEmailsData] = useState<number[]>(initialEmailsData);
  const [sentData, setSentData] = useState<number[]>(initialSentData);
  const [draftsCount, setDraftsCount] = useState(initialDraftsCount);
  const [hoursWaiting, setHoursWaiting] = useState(initialHoursWaiting);
  const [attachmentsToday, setAttachmentsToday] = useState(initialAttachmentsToday);
  const [unreadTrend, setUnreadTrend] = useState(initialUnreadTrend);

  useEffect(() => {
    if (!activeAccount) return;

    // Clear stale data immediately so the old account's numbers vanish
    setRecentUnread([]);
    setEmailsData([0, 0, 0, 0, 0, 0, 0]);
    setSentData([0, 0, 0, 0, 0, 0, 0]);
    setDraftsCount(0);
    setHoursWaiting(0);
    setAttachmentsToday(0);
    setUnreadTrend(0);
    setStatsLoading(true);

    const controller = new AbortController();

    fetch(`/api/dashboard/stats?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data: DashboardStats = await res.json();
        setRecentUnread(data.recentUnread);
        setEmailsData(data.weeklyReceived);
        setSentData(data.weeklySent);
        setDraftsCount(data.draftCount);
        setHoursWaiting(data.hoursWaiting);
        setAttachmentsToday(data.attachmentsToday);
        setUnreadTrend(data.unreadTrend);
      })
      .catch(() => { /* aborted or network error — keep zeroed state */ })
      .finally(() => setStatsLoading(false));

    return () => controller.abort();
  }, [activeAccount?.homeAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** SPA-aware navigation — updates store + pushState instead of server round-trip */
  function navigateTo(href: string) {
    const { view, folderId, emailId } = pathToView(href.split("?")[0]);
    useDataCacheStore.getState().setActiveView(view);
    if (folderId) useDataCacheStore.getState().setActiveFolderId(folderId);
    if (view === "email-read" && emailId) {
      useDataCacheStore.getState().setActiveEmail(emailId);
    }
    if (view === "compose") {
      const sp = new URLSearchParams(href.includes("?") ? href.split("?")[1] : "");
      useDataCacheStore.getState().setComposeParams({
        mode: (sp.get("mode") as "reply" | "replyAll" | "forward") || undefined,
        messageId: sp.get("messageId") || undefined,
        draftId: sp.get("draftId") || undefined,
        homeAccountId: sp.get("homeAccountId") || undefined,
        panel: sp.get("panel") || undefined,
      });
    }
    window.history.pushState(null, "", href);
  }

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

  const greeting = (() => {
    const h = parseInt(timeStr.split(":")[0]) || 0;
    const isPM = timeStr.includes("PM");
    const hour24 = isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h);
    if (hour24 >= 5 && hour24 < 12) return "Good morning";
    if (hour24 >= 12 && hour24 < 17) return "Good afternoon";
    return "Good evening";
  })();
  const nextEvent = events.find((e) => new Date(e.startDateTime) > new Date());
  const pendingTodos = todos.filter((t) => !t.done);

  return (
    <div className="flex flex-col flex-1" style={{ height: "100vh", overflow: "hidden" }}>
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "rgb(250 250 250)" }}>
        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* ── Account Indicator (multi-account only) ── */}
          {accounts.length > 1 && activeAccount && (
            <AccountIndicator
              email={activeAccount.email}
              displayName={activeAccount.displayName}
            />
          )}

          {/* ── Header ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium" style={{ color: "rgb(155 155 155)" }}>{timeStr} · {dateStr}</p>
              <button onClick={() => navigateTo("/compose")} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-[10px] text-white" style={{ backgroundColor: "rgb(138 9 9)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Compose
              </button>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>
              {greeting}, {userName}
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgb(115 115 115)" }}>
              {inboxUnread > 0 ? `You have ${inboxUnread} unread email${inboxUnread !== 1 ? "s" : ""}` : "You're all caught up"}
              {eventsToday > 0 ? ` and ${eventsToday} event${eventsToday !== 1 ? "s" : ""} today` : ""}.
            </p>
          </div>

          {/* ── Focus Card — next event or oldest unanswered ── */}
          {nextEvent ? (
            <button onClick={() => navigateTo("/calendar")} className="block w-full text-left mb-6 p-5 rounded-[14px] border transition-all hover:shadow-md cursor-pointer" style={{ backgroundColor: "white", borderColor: "rgb(219 234 254)" }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgb(37 99 235)" }} />
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(37 99 235)" }}>
                      {timeUntilNext ? `Next up in ${timeUntilNext}` : "Next up"}
                    </p>
                  </div>
                  <p className="text-lg font-semibold truncate" style={{ color: "rgb(27 29 29)" }}>{nextEvent.subject}</p>
                  <p className="text-sm mt-0.5" style={{ color: "rgb(115 115 115)" }}>
                    {formatEventTime(nextEvent.startDateTime)} – {formatEventTime(nextEvent.endDateTime)}
                    {nextEvent.location && ` · ${nextEvent.location}`}
                    {nextEvent.attendeeCount > 0 && ` · ${nextEvent.attendeeCount} attendee${nextEvent.attendeeCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-3xl font-bold flex-shrink-0" style={{ color: "rgb(37 99 235)" }}>{timeUntilNext || "Now"}</div>
              </div>
            </button>
          ) : hoursWaiting > 0 ? (
            <button onClick={() => navigateTo("/inbox")} className="block w-full text-left mb-6 p-5 rounded-[14px] border transition-all hover:shadow-md cursor-pointer" style={{ backgroundColor: "white", borderColor: hoursWaiting > 24 ? "rgb(254 202 202)" : "rgb(254 215 170)" }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoursWaiting > 24 ? "rgb(220 38 38)" : "rgb(234 88 12)" }} />
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: hoursWaiting > 24 ? "rgb(220 38 38)" : "rgb(234 88 12)" }}>Needs attention</p>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: "rgb(27 29 29)" }}>Oldest unanswered email waiting {hoursWaiting}h</p>
                  <p className="text-sm mt-0.5" style={{ color: "rgb(115 115 115)" }}>Open inbox to respond</p>
                </div>
                <div className="text-3xl font-bold flex-shrink-0" style={{ color: hoursWaiting > 24 ? "rgb(220 38 38)" : "rgb(234 88 12)" }}>{hoursWaiting}h</div>
              </div>
            </button>
          ) : null}

          {/* ── Stats Row ── */}
          <div className={`grid grid-cols-3 gap-3 mb-6 transition-opacity duration-200${statsLoading ? " opacity-40 pointer-events-none" : ""}`}>
            <button onClick={() => navigateTo("/inbox")} className="p-4 rounded-[12px] bg-white border border-neutral-200 hover:border-neutral-300 transition-colors text-center cursor-pointer">
              <p className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>{inboxUnread}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "rgb(115 115 115)" }}>Unread{unreadTrend !== 0 && <span style={{ color: unreadTrend > 0 ? "rgb(220 38 38)" : "rgb(22 163 74)" }}> {unreadTrend > 0 ? "↑" : "↓"}{Math.abs(unreadTrend)}</span>}</p>
            </button>
            <button onClick={() => navigateTo("/calendar")} className="p-4 rounded-[12px] bg-white border border-neutral-200 hover:border-neutral-300 transition-colors text-center cursor-pointer">
              <p className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>{eventsToday}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "rgb(115 115 115)" }}>Events</p>
            </button>
            <div className="p-4 rounded-[12px] bg-white border border-neutral-200 text-center">
              <p className="text-2xl font-bold" style={{ color: "rgb(27 29 29)" }}>{pendingTodos.length}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "rgb(115 115 115)" }}>Tasks</p>
            </div>
          </div>

          {/* ── Two Column Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Today's Agenda */}
            <section className="bg-white rounded-[12px] border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>Today&apos;s Agenda</h2>
                <button onClick={() => navigateTo("/calendar")} className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>View all →</button>
              </div>
              {events.length === 0 ? (
                <p className="text-sm py-6 text-center" style={{ color: "rgb(155 155 155)" }}>No events today</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {events.map((event, idx) => {
                    const color = EVENT_COLORS[idx % EVENT_COLORS.length];
                    const isPast = new Date(event.endDateTime) < new Date();
                    const isNow = new Date(event.startDateTime) <= new Date() && new Date(event.endDateTime) >= new Date();
                    return (
                      <div key={event.id} className="flex items-center gap-3 py-2">
                        <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: isPast ? "rgb(220 220 220)" : color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: isPast ? "rgb(155 155 155)" : "rgb(27 29 29)" }}>{event.subject}</p>
                          <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>{formatEventTime(event.startDateTime)} – {formatEventTime(event.endDateTime)}</p>
                        </div>
                        {isNow && <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)" }}>Now</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Needs Attention */}
            <section className="bg-white rounded-[12px] border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>Needs Attention</h2>
                <button onClick={() => navigateTo("/inbox")} className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>View inbox →</button>
              </div>
              {recentUnread.length === 0 ? (
                <p className="text-sm py-6 text-center" style={{ color: "rgb(155 155 155)" }}>All caught up</p>
              ) : (
                <div className="flex flex-col">
                  {recentUnread.slice(0, 5).map((email, i) => (
                    <button key={email.id} onClick={() => navigateTo(`/inbox/${encodeURIComponent(email.id)}`)} className="flex items-start gap-3 py-2.5 text-left group" style={{ borderTop: i > 0 ? "1px solid rgb(245 245 245)" : "none" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white mt-0.5" style={{ backgroundColor: "rgb(138 9 9)" }}>
                        {email.from.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate group-hover:underline" style={{ color: "rgb(27 29 29)" }}>{email.from.name}</p>
                          <span className="text-xs flex-shrink-0" style={{ color: "rgb(155 155 155)" }}>{formatRelative(email.receivedDateTime)}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: "rgb(115 115 115)" }}>{email.subject}</p>
                        {email.accountName && <p className="text-xs mt-0.5" style={{ color: "rgb(138 9 9)" }}>{email.accountName}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Tasks */}
            <section className="bg-white rounded-[12px] border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>
                  Tasks
                  {pendingTodos.length > 0 && <span className="text-xs font-normal ml-1.5" style={{ color: "rgb(155 155 155)" }}>({pendingTodos.length})</span>}
                </h2>
                <button onClick={() => setAddingTodo(true)} className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>+ Add</button>
              </div>
              <div className="flex flex-col gap-0.5">
                {addingTodo && (
                  <div className="flex items-center gap-2 py-2 px-1">
                    <input type="checkbox" disabled className="w-4 h-4 rounded flex-shrink-0" style={{ accentColor: "rgb(138 9 9)" }} />
                    <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTodo(); if (e.key === "Escape") { setAddingTodo(false); setNewTodo(""); } }} placeholder="What needs to be done?" autoFocus className="flex-1 text-sm bg-transparent outline-none" style={{ color: "rgb(38 38 38)" }} />
                    <button onClick={addTodo} className="text-xs font-semibold px-2 py-1 rounded-[6px] text-white" style={{ backgroundColor: "rgb(138 9 9)" }}>Add</button>
                  </div>
                )}
                {todosLoading ? (
                  <div className="py-4 text-center text-xs" style={{ color: "rgb(155 155 155)" }}>Loading...</div>
                ) : pendingTodos.length === 0 && !addingTodo ? (
                  <p className="text-sm py-4 text-center" style={{ color: "rgb(155 155 155)" }}>No tasks</p>
                ) : null}
                {!todosLoading && todos.map((todo) => (
                  <div key={todo.id} className="group flex items-center gap-2 py-2 px-1 rounded-[8px] hover:bg-neutral-50 transition-colors">
                    <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} className="w-4 h-4 rounded flex-shrink-0 cursor-pointer" style={{ accentColor: "rgb(138 9 9)" }} />
                    <span className="flex-1 text-sm" style={{ color: todo.done ? "rgb(155 155 155)" : "rgb(38 38 38)", textDecoration: todo.done ? "line-through" : "none" }}>{todo.text}</span>
                    {todo.priority === "high" && !todo.done && <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ color: "rgb(138 9 9)", backgroundColor: "rgb(253 235 235)" }}>!</span>}
                    <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 transition-all" style={{ color: "rgb(200 200 200)" }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Activity */}
            <section className="bg-white rounded-[12px] border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>This Week</h2>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: "rgba(220,38,38,0.85)" }} /><span style={{ color: "rgb(155 155 155)" }}>In</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: "rgba(37,99,235,0.85)" }} /><span style={{ color: "rgb(155 155 155)" }}>Out</span></div>
                </div>
              </div>
              <WeeklyChart receivedData={emailsData} sentData={sentData} />
              <div className="flex items-center justify-around mt-3 pt-3 border-t border-neutral-100">
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "rgb(220 38 38)" }}>{emailsData.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>Received</p>
                </div>
                <button onClick={() => navigateTo("/sent")} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-lg font-bold" style={{ color: "rgb(37 99 235)" }}>{sentData.reduce((a, b) => a + b, 0)}</p>
                  <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>Sent</p>
                </button>
                <button onClick={() => navigateTo("/drafts")} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-lg font-bold" style={{ color: "rgb(27 29 29)" }}>{draftsCount}</p>
                  <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>Drafts</p>
                </button>
                <button onClick={() => navigateTo("/attachments")} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-lg font-bold" style={{ color: "rgb(27 29 29)" }}>{attachmentsToday}</p>
                  <p className="text-xs" style={{ color: "rgb(155 155 155)" }}>Attachments</p>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
