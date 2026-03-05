"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DOMPurify from "dompurify";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamsChat {
  id: string;
  topic: string | null;
  chatType: "oneOnOne" | "group" | "meeting" | "unknownFutureValue";
  lastUpdatedDateTime: string;
  members?: { displayName: string; email?: string }[];
}

interface TeamsMessage {
  id: string;
  createdDateTime: string;
  from: { user?: { displayName: string; id: string } } | null;
  body: { contentType: "text" | "html"; content: string };
}

interface TeamsTeam {
  id: string;
  displayName: string;
  description: string | null;
}

interface TeamsChannel {
  id: string;
  displayName: string;
  description: string | null;
  membershipType: string;
}

type PresenceAvailability =
  | "Available" | "AvailableIdle" | "Away" | "BeRightBack"
  | "Busy" | "BusyIdle" | "DoNotDisturb" | "Offline" | "PresenceUnknown";

type ActiveThread =
  | { type: "chat"; id: string; name: string }
  | { type: "channel"; teamId: string; channelId: string; name: string; teamName: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function presenceColor(a: PresenceAvailability): string {
  if (a === "Available") return "#22c55e";
  if (a === "Busy" || a === "DoNotDisturb") return "#ef4444";
  if (a === "Away" || a === "BeRightBack" || a === "AvailableIdle" || a === "BusyIdle") return "#f59e0b";
  return "#9ca3af";
}

function presenceLabel(a: PresenceAvailability): string {
  const map: Record<string, string> = {
    Available: "Available", AvailableIdle: "Available (idle)",
    Away: "Away", BeRightBack: "Be right back",
    Busy: "Busy", BusyIdle: "Busy (idle)",
    DoNotDisturb: "Do not disturb", Offline: "Offline",
    PresenceUnknown: "Unknown",
  };
  return map[a] ?? a;
}

function chatDisplayName(chat: TeamsChat, myDisplayName: string): string {
  if (chat.topic) return chat.topic;
  if (chat.chatType === "oneOnOne" && chat.members) {
    const other = chat.members.find((m) => m.displayName !== myDisplayName);
    return other?.displayName ?? "Direct Message";
  }
  if (chat.members && chat.members.length > 0) {
    return chat.members.map((m) => m.displayName.split(" ")[0]).join(", ");
  }
  return "Chat";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "rgb(138 9 9)", "rgb(16 100 65)", "rgb(30 58 138)",
  "rgb(92 45 145)", "rgb(180 83 9)", "rgb(6 78 59)",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = 8 }: { name: string; size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-[8px] flex items-center justify-center flex-shrink-0 text-white font-semibold`}
      style={{ backgroundColor: avatarColor(name), fontSize: size <= 7 ? "10px" : "12px" }}
    >
      {getInitials(name)}
    </div>
  );
}

function PresenceDot({ availability }: { availability: PresenceAvailability }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: presenceColor(availability) }}
      title={presenceLabel(availability)}
    />
  );
}

function MessageBubble({ msg, isMe }: { msg: TeamsMessage; isMe: boolean }) {
  const name = msg.from?.user?.displayName ?? "Unknown";
  const rawContent = msg.body.contentType === "html"
    ? DOMPurify.sanitize(msg.body.content, { ALLOWED_TAGS: ["b", "i", "u", "br", "p", "span", "a"] })
    : msg.body.content;

  return (
    <div className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && <Avatar name={name} size={7} />}
      <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        {!isMe && (
          <span className="text-xs font-medium px-1" style={{ color: "rgb(115 115 115)" }}>{name}</span>
        )}
        <div
          className="px-3 py-2 rounded-[12px] text-sm leading-relaxed"
          style={{
            backgroundColor: isMe ? "rgb(138 9 9)" : "rgb(245 245 245)",
            color: isMe ? "white" : "rgb(27 29 29)",
            borderBottomRightRadius: isMe ? "4px" : undefined,
            borderBottomLeftRadius: !isMe ? "4px" : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: rawContent }}
        />
        <span className="text-xs px-1" style={{ color: "rgb(170 170 170)" }}>
          {formatTime(msg.createdDateTime)}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TeamsClientProps {
  userName: string;
  userEmail: string;
}

export default function TeamsClient({ userName, userEmail }: TeamsClientProps) {
  const [tab, setTab] = useState<"chats" | "teams">("chats");

  // Chats state
  const [chats, setChats] = useState<TeamsChat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState<string | null>(null);

  // Teams/channels state
  const [teams, setTeams] = useState<TeamsTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [channelsByTeam, setChannelsByTeam] = useState<Record<string, TeamsChannel[]>>({});
  const [channelsLoading, setChannelsLoading] = useState<Record<string, boolean>>({});

  // Active thread
  const [activeThread, setActiveThread] = useState<ActiveThread | null>(null);
  const [messages, setMessages] = useState<TeamsMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Compose
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load chats ──────────────────────────────────────────────────────────────
  const loadChats = useCallback(async () => {
    try {
      const res = await fetch("/api/teams/chats");
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        if (body.error === "account_requires_reauth" || body.error === "teams_scope_required" || res.status === 403) {
          setChatsError("reauth");
        } else {
          setChatsError(body.error ?? "Failed to load chats");
        }
        return;
      }
      const data = await res.json() as { chats: TeamsChat[] };
      setChats(data.chats);
      setChatsError(null);
    } catch {
      setChatsError("Network error");
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => { loadChats(); }, [loadChats]);

  // ── Load teams ──────────────────────────────────────────────────────────────
  const loadTeams = useCallback(async () => {
    if (teams.length > 0) return;
    setTeamsLoading(true);
    try {
      const res = await fetch("/api/teams/teams");
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        if (body.error === "teams_scope_required" || res.status === 403 || body.error === "account_requires_reauth") {
          setTeamsError("reauth");
        } else {
          setTeamsError(body.error ?? "Failed to load teams");
        }
        return;
      }
      const data = await res.json() as { teams: TeamsTeam[] };
      setTeams(data.teams);
      setTeamsError(null);
    } catch {
      setTeamsError("Network error");
    } finally {
      setTeamsLoading(false);
    }
  }, [teams.length]);

  useEffect(() => {
    if (tab === "teams") loadTeams();
  }, [tab, loadTeams]);

  // ── Load channels for a team ────────────────────────────────────────────────
  async function loadChannels(teamId: string) {
    if (channelsByTeam[teamId]) return;
    setChannelsLoading((prev) => ({ ...prev, [teamId]: true }));
    try {
      const res = await fetch(`/api/teams/teams/${teamId}/channels`);
      if (!res.ok) return;
      const data = await res.json() as { channels: TeamsChannel[] };
      setChannelsByTeam((prev) => ({ ...prev, [teamId]: data.channels }));
    } finally {
      setChannelsLoading((prev) => ({ ...prev, [teamId]: false }));
    }
  }

  function toggleTeam(teamId: string) {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamId);
      loadChannels(teamId);
    }
  }

  // ── Load messages ───────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (thread: ActiveThread) => {
    setMessagesLoading(true);
    try {
      let url: string;
      if (thread.type === "chat") {
        url = `/api/teams/chats/${thread.id}/messages`;
      } else {
        url = `/api/teams/channels/${thread.channelId}/messages?teamId=${thread.teamId}`;
      }
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json() as { messages: TeamsMessage[] };
      setMessages(data.messages);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // ── Poll for new messages every 30s ────────────────────────────────────────
  useEffect(() => {
    if (!activeThread) return;
    loadMessages(activeThread);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(activeThread), 30000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeThread, loadMessages]);

  // ── Scroll to bottom on new messages ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Open a chat ─────────────────────────────────────────────────────────────
  function openChat(chat: TeamsChat) {
    const name = chatDisplayName(chat, userName);
    setActiveThread({ type: "chat", id: chat.id, name });
    setMessages([]);
    setSendError(null);
    setDraft("");
  }

  // ── Open a channel ──────────────────────────────────────────────────────────
  function openChannel(team: TeamsTeam, channel: TeamsChannel) {
    setActiveThread({
      type: "channel",
      teamId: team.id,
      channelId: channel.id,
      name: channel.displayName,
      teamName: team.displayName,
    });
    setMessages([]);
    setSendError(null);
    setDraft("");
  }

  // ── Send message ────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!draft.trim() || !activeThread || sending) return;
    setSending(true);
    setSendError(null);

    try {
      let url: string;
      let body: Record<string, string>;

      if (activeThread.type === "chat") {
        url = `/api/teams/chats/${activeThread.id}/send`;
        body = { content: draft.trim() };
      } else {
        url = `/api/teams/channels/${activeThread.channelId}/send`;
        body = { content: draft.trim(), teamId: activeThread.teamId };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setSendError(err.error ?? "Failed to send");
        return;
      }

      setDraft("");
      // Reload messages to show the sent message
      await loadMessages(activeThread);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: "100vh" }}>

      {/* ── Left Panel ────────────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 border-r border-neutral-200 flex flex-col bg-white">

        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "rgb(76 29 149)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="font-semibold text-lg" style={{ color: "rgb(27 29 29)" }}>MS Teams</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-[10px]" style={{ backgroundColor: "rgb(245 245 245)" }}>
            {(["chats", "teams"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-1.5 text-sm font-medium rounded-[8px] transition-all capitalize"
                style={{
                  backgroundColor: tab === t ? "white" : "transparent",
                  color: tab === t ? "rgb(27 29 29)" : "rgb(115 115 115)",
                  boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Chats Tab ─────────────────────────────────────────────────── */}
          {tab === "chats" && (
            <>
              {chatsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-200 animate-spin" style={{ borderTopColor: "rgb(138 9 9)" }} />
                </div>
              )}
              {!chatsLoading && chatsError === "reauth" && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm mb-3" style={{ color: "rgb(115 115 115)" }}>
                    Teams access requires reconnecting your account with new permissions.
                  </p>
                  <a
                    href="/accounts"
                    className="text-sm font-medium px-3 py-1.5 rounded-[8px] inline-block"
                    style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)" }}
                  >
                    Reconnect account
                  </a>
                </div>
              )}
              {!chatsLoading && chatsError && chatsError !== "reauth" && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>{chatsError}</p>
                  <button onClick={loadChats} className="text-sm mt-2 underline" style={{ color: "rgb(138 9 9)" }}>Retry</button>
                </div>
              )}
              {!chatsLoading && !chatsError && chats.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm" style={{ color: "rgb(155 155 155)" }}>No chats found</p>
                </div>
              )}
              {!chatsLoading && !chatsError && chats.map((chat) => {
                const name = chatDisplayName(chat, userName);
                const isActive = activeThread?.type === "chat" && activeThread.id === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-neutral-50"
                    style={{
                      backgroundColor: isActive ? "rgb(253 235 235)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <Avatar name={name} size={8} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: isActive ? "rgb(83 5 5)" : "rgb(27 29 29)" }}>
                          {name}
                        </span>
                        <span className="text-xs flex-shrink-0" style={{ color: "rgb(155 155 155)" }}>
                          {formatTime(chat.lastUpdatedDateTime)}
                        </span>
                      </div>
                      <span className="text-xs capitalize" style={{ color: "rgb(155 155 155)" }}>
                        {chat.chatType === "oneOnOne" ? "Direct message" : chat.chatType === "group" ? `${chat.members?.length ?? 0} people` : chat.chatType}
                      </span>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* ── Teams Tab ─────────────────────────────────────────────────── */}
          {tab === "teams" && (
            <>
              {teamsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-200 animate-spin" style={{ borderTopColor: "rgb(138 9 9)" }} />
                </div>
              )}
              {!teamsLoading && teamsError === "reauth" && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm mb-3" style={{ color: "rgb(115 115 115)" }}>
                    Teams access requires reconnecting your account with new permissions.
                  </p>
                  <a
                    href="/accounts"
                    className="text-sm font-medium px-3 py-1.5 rounded-[8px] inline-block"
                    style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)" }}
                  >
                    Reconnect account
                  </a>
                </div>
              )}
              {!teamsLoading && teamsError && teamsError !== "reauth" && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>{teamsError}</p>
                </div>
              )}
              {!teamsLoading && !teamsError && teams.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm" style={{ color: "rgb(155 155 155)" }}>Not a member of any team</p>
                </div>
              )}
              {!teamsLoading && !teamsError && teams.map((team) => {
                const expanded = expandedTeam === team.id;
                const channels = channelsByTeam[team.id] ?? [];
                const loading = channelsLoading[team.id];
                return (
                  <div key={team.id}>
                    <button
                      onClick={() => toggleTeam(team.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-neutral-50"
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgb(237 233 254)" }}>
                        <span className="text-xs font-bold" style={{ color: "rgb(76 29 149)" }}>
                          {getInitials(team.displayName)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "rgb(27 29 29)" }}>{team.displayName}</p>
                      </div>
                      <svg
                        className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        style={{ color: "rgb(155 155 155)" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expanded && (
                      <div className="pl-4 border-b border-neutral-50">
                        {loading && (
                          <div className="py-3 flex justify-center">
                            <div className="w-4 h-4 rounded-full border-2 border-neutral-200 animate-spin" style={{ borderTopColor: "rgb(76 29 149)" }} />
                          </div>
                        )}
                        {!loading && channels.map((ch) => {
                          const isActive = activeThread?.type === "channel"
                            && activeThread.channelId === ch.id;
                          return (
                            <button
                              key={ch.id}
                              onClick={() => openChannel(team, ch)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
                              style={{
                                backgroundColor: isActive ? "rgb(237 233 254)" : "transparent",
                                color: isActive ? "rgb(76 29 149)" : "rgb(82 82 82)",
                              }}
                              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgb(250 250 250)"; }}
                              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <span style={{ color: "rgb(155 155 155)" }}>#</span>
                              <span className="truncate">{ch.displayName}</span>
                              {ch.membershipType === "private" && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgb(155 155 155)" }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Right Panel: Thread ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">

        {/* No thread selected */}
        {!activeThread && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: "rgb(155 155 155)" }}>
            <div className="w-16 h-16 rounded-[16px] flex items-center justify-center" style={{ backgroundColor: "rgb(245 245 245)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Select a chat or channel</p>
            <p className="text-xs" style={{ color: "rgb(185 185 185)" }}>Messages will appear here</p>
          </div>
        )}

        {/* Thread header */}
        {activeThread && (
          <>
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "rgb(27 29 29)" }}>
                  {activeThread.type === "channel"
                    ? `# ${activeThread.name}`
                    : activeThread.name}
                </p>
                {activeThread.type === "channel" && (
                  <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>{activeThread.teamName}</p>
                )}
              </div>
              <button
                onClick={() => activeThread && loadMessages(activeThread)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "rgb(155 155 155)" }}
                title="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messagesLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-200 animate-spin" style={{ borderTopColor: "rgb(138 9 9)" }} />
                </div>
              )}
              {!messagesLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm" style={{ color: "rgb(155 155 155)" }}>No messages yet. Say hello!</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.from?.user?.displayName === userName;
                return <MessageBubble key={msg.id} msg={msg} isMe={isMe} />;
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Compose bar */}
            <div className="px-6 py-4 border-t border-neutral-100 flex-shrink-0">
              {sendError && (
                <p className="text-xs mb-2 px-1" style={{ color: "rgb(220 38 38)" }}>{sendError}</p>
              )}
              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeThread.type === "channel" ? `#${activeThread.name}` : activeThread.name}…`}
                  rows={1}
                  className="flex-1 resize-none rounded-[10px] px-3 py-2.5 text-sm outline-none border border-neutral-200 focus:border-neutral-400 transition-colors"
                  style={{ color: "rgb(27 29 29)", maxHeight: "120px", overflowY: "auto" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!draft.trim() || sending}
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: draft.trim() && !sending ? "rgb(138 9 9)" : "rgb(220 220 220)",
                    color: "white",
                  }}
                >
                  {sending ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs mt-1.5 px-1" style={{ color: "rgb(185 185 185)" }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Export presence helpers for use in ContactsClient
export { presenceColor, presenceLabel, PresenceDot };
export type { PresenceAvailability };
