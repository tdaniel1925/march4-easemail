"use client";

import { useState, useEffect } from "react";
import { useCalendarStore } from "@/lib/stores/calendar-store";

const BRAND = "rgb(138, 9, 9)";

function fmt(iso: string, allDay: boolean): string {
  const d = new Date(iso);
  if (allDay) return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function duration(startIso: string, endIso: string): string {
  const mins = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const RESPONSE_LABELS: Record<string, string> = {
  accepted: "Accepted",
  declined: "Declined",
  tentativelyAccepted: "Tentative",
  none: "No response",
  notResponded: "No response",
  organizer: "Organizer",
};

const RESPONSE_COLORS: Record<string, string> = {
  accepted: "rgb(21 128 61)",
  declined: "rgb(138 9 9)",
  tentativelyAccepted: "rgb(133 77 14)",
  none: "rgb(115 115 115)",
  notResponded: "rgb(115 115 115)",
  organizer: "rgb(109 40 217)",
};

export default function EventDetailModal({ onEdit }: { onEdit?: () => void }) {
  const { selectedEvent, setSelectedEvent } = useCalendarStore();
  const [respondLoading, setRespondLoading] = useState<string | null>(null);
  const [respondStatus, setRespondStatus] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(selectedEvent?.responseStatus ?? "none");

  useEffect(() => {
    setCurrentResponse(selectedEvent?.responseStatus ?? "none");
    setRespondStatus(null);
    setDeleteConfirm(false);
  }, [selectedEvent]);

  // Close on Escape
  useEffect(() => {
    if (!selectedEvent) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedEvent(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectedEvent, setSelectedEvent]);

  if (!selectedEvent) return null;
  const e = selectedEvent;

  async function respond(response: "accept" | "decline" | "tentativelyAccept") {
    if (!e) return;
    setRespondLoading(response);
    try {
      const res = await fetch("/api/calendar/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: e.id, homeAccountId: e.accountHomeId, response }),
      });
      if (!res.ok) throw new Error();
      const next =
        response === "accept" ? "accepted" :
        response === "decline" ? "declined" : "tentativelyAccepted";
      setCurrentResponse(next);
      setRespondStatus(RESPONSE_LABELS[next]);
    } catch {
      setRespondStatus("Failed — try again");
    } finally {
      setRespondLoading(null);
    }
  }

  async function handleDelete() {
    if (!e) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/calendar/event", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: e.id, homeAccountId: e.accountHomeId }),
      });
      if (!res.ok) throw new Error();
      setSelectedEvent(null);
      // Trigger a page refresh so the deleted event disappears
      window.location.reload();
    } catch {
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  }

  const canRespond = currentResponse !== "organizer";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={() => setSelectedEvent(null)}
    >
      <div
        className="bg-white rounded-[16px] shadow-xl w-full max-w-md overflow-hidden"
        style={{ maxHeight: "calc(100vh - 48px)" }}
        onClick={(ev) => ev.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-base leading-snug" style={{ color: "rgb(27 29 29)" }}>
                {e.subject}
              </h2>
              {e.isRecurring && (
                <span className="text-xs text-neutral-400 mt-0.5 block">↻ Recurring event</span>
              )}
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
              style={{ color: "rgb(115 115 115)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Account badge */}
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">
            {e.accountEmail}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto space-y-3" style={{ maxHeight: "55vh" }}>

          {/* Time */}
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              {e.isAllDay ? (
                <p className="text-sm text-neutral-700">{fmt(e.startDateTime, true)}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-neutral-700">{fmt(e.startDateTime, false)}</p>
                  <p className="text-xs text-neutral-400">to {fmt(e.endDateTime, false)} · {duration(e.startDateTime, e.endDateTime)}</p>
                </>
              )}
            </div>
          </div>

          {/* Location */}
          {e.location && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-neutral-700">{e.location}</p>
            </div>
          )}

          {/* Join meeting */}
          {e.onlineMeetingUrl && (
            <a
              href={e.onlineMeetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: BRAND }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Join Meeting
            </a>
          )}

          {/* Organizer */}
          {e.organizer && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">Organizer</p>
                <p className="text-sm text-neutral-700">{e.organizer.name || e.organizer.address}</p>
              </div>
            </div>
          )}

          {/* Attendees */}
          {e.attendees.length > 0 && (
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-400 mb-1">{e.attendees.length} attendee{e.attendees.length !== 1 ? "s" : ""}</p>
                <div className="space-y-1">
                  {e.attendees.slice(0, 8).map((a) => (
                    <div key={a.address} className="flex items-center justify-between gap-2">
                      <p className="text-sm text-neutral-700 truncate">{a.name || a.address}</p>
                      {a.responseStatus && (
                        <span className="text-xs flex-shrink-0" style={{ color: RESPONSE_COLORS[a.responseStatus] ?? "rgb(115 115 115)" }}>
                          {RESPONSE_LABELS[a.responseStatus] ?? a.responseStatus}
                        </span>
                      )}
                    </div>
                  ))}
                  {e.attendees.length > 8 && (
                    <p className="text-xs text-neutral-400">+{e.attendees.length - 8} more</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Body preview */}
          {e.bodyPreview && (
            <div className="pt-1 border-t border-neutral-100">
              <p className="text-sm text-neutral-500 line-clamp-4">{e.bodyPreview}</p>
            </div>
          )}

          {/* My response status */}
          {currentResponse && (
            <div className="text-xs font-medium" style={{ color: RESPONSE_COLORS[currentResponse] ?? "rgb(115 115 115)" }}>
              Your response: {RESPONSE_LABELS[currentResponse] ?? currentResponse}
            </div>
          )}
          {respondStatus && (
            <p className="text-xs font-medium" style={{ color: BRAND }}>{respondStatus}</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 pt-3 border-t border-neutral-100 space-y-3">

          {/* RSVP buttons — only if not organizer */}
          {canRespond && (
            <div className="flex gap-2">
              {(["accept", "tentativelyAccept", "decline"] as const).map((r) => {
                const labels = { accept: "Accept", tentativelyAccept: "Maybe", decline: "Decline" };
                const active = currentResponse === (r === "accept" ? "accepted" : r === "decline" ? "declined" : "tentativelyAccepted");
                return (
                  <button
                    key={r}
                    onClick={() => void respond(r)}
                    disabled={respondLoading !== null}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-[8px] border transition-colors"
                    style={active
                      ? { backgroundColor: BRAND, color: "#fff", borderColor: BRAND }
                      : { backgroundColor: "white", color: "rgb(82 82 82)", borderColor: "rgb(229 229 229)" }
                    }
                  >
                    {respondLoading === r ? "…" : labels[r]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Edit / Delete */}
          <div className="flex items-center justify-between gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[8px] border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
            <div className="flex-1" />
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors"
                style={{ color: BRAND }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Delete this event?</span>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-xs px-2 py-1 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleDelete()}
                  disabled={deleteLoading}
                  className="text-xs px-2 py-1 rounded text-white font-medium"
                  style={{ backgroundColor: BRAND }}
                >
                  {deleteLoading ? "Deleting…" : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
