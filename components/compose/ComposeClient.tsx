"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "professional" | "casual" | "concise" | "persuasive";
type Length = "shorter" | "same" | "longer";
type Formality = "very formal" | "formal" | "semi-formal" | "informal";
type ActivePanel = "remix" | "dictate" | null;

interface RemixVersion {
  id: number;
  label: string;
  body: string;
  timestamp: Date;
}

// ─── ComposeClient ────────────────────────────────────────────────────────────

export default function ComposeClient({
  fromName,
  fromEmail,
}: {
  fromName: string;
  fromEmail: string;
}) {
  const router = useRouter();

  // ── Composer state ──────────────────────────────────────────────────────────
  const [to, setTo] = useState<string[]>([]);
  const [toInput, setToInput] = useState("");
  const [cc, setCc] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [draftIndicator, setDraftIndicator] = useState(false);

  // ── Panel state ─────────────────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  // ── AI Remix state ──────────────────────────────────────────────────────────
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("same");
  const [formality, setFormality] = useState<Formality>("formal");
  const [extras, setExtras] = useState<string[]>([]);
  const [customInstruction, setCustomInstruction] = useState("");
  const [remixing, setRemixing] = useState(false);
  const [remixedBody, setRemixedBody] = useState<string | null>(null);
  const [remixError, setRemixError] = useState<string | null>(null);
  const [versions, setVersions] = useState<RemixVersion[]>([]);
  const versionCountRef = useRef(0);

  // ── AI Dictate state ────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [dictateError, setDictateError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Draft auto-indicator (visual only — does not call Graph drafts API)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!body && !subject) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    setDraftIndicator(false);
    draftTimerRef.current = setTimeout(() => setDraftIndicator(true), 3000);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [body, subject]);

  // Cleanup dictate on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Recipient helpers ───────────────────────────────────────────────────────

  const commitToInput = useCallback(() => {
    const val = toInput.trim();
    if (val && !to.includes(val)) setTo((prev) => [...prev, val]);
    setToInput("");
  }, [toInput, to]);

  const commitCcInput = useCallback(() => {
    const val = ccInput.trim();
    if (val && !cc.includes(val)) setCc((prev) => [...prev, val]);
    setCcInput("");
  }, [ccInput, cc]);

  // ── Send ────────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    const allTo = toInput.trim() ? [...to, toInput.trim()] : to;
    if (!allTo.length) { setSendError("Please add at least one recipient."); return; }
    if (!subject.trim()) { setSendError("Please add a subject."); return; }
    setSendError(null);
    setSending(true);
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: allTo, cc: showCc ? cc : [], subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      router.push("/sent");
    } catch (e) {
      setSendError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  // ── AI Remix ────────────────────────────────────────────────────────────────

  const handleRemix = async () => {
    if (!body.trim()) { setRemixError("Please write something in the email body first."); return; }
    setRemixError(null);
    setRemixing(true);
    setRemixedBody(null);
    try {
      const res = await fetch("/api/mail/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, tone, length, formality, extras, customInstruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Remix failed");
      setRemixedBody(data.remixed);
      versionCountRef.current += 1;
      setVersions((prev) => [
        { id: versionCountRef.current, label: `${tone} · ${length}`, body: data.remixed, timestamp: new Date() },
        ...prev.slice(0, 4),
      ]);
    } catch (e) {
      setRemixError((e as Error).message);
    } finally {
      setRemixing(false);
    }
  };

  const acceptRemix = () => {
    if (remixedBody) {
      setBody(remixedBody);
      setRemixedBody(null);
      setActivePanel(null);
    }
  };

  // ── AI Dictate ──────────────────────────────────────────────────────────────

  const startDictate = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDictateError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        setDictateError(`Microphone error: ${event.error}`);
      }
      setIsRecording(false);
      setInterimTranscript("");
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.start();
    setIsRecording(true);
    setDictateError(null);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopDictate = () => {
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setInterimTranscript("");
  };

  const insertTranscript = () => {
    const text = (transcript + interimTranscript).trim();
    if (!text) return;
    setBody((prev) => (prev ? prev + "\n\n" + text : text));
    setTranscript("");
    setInterimTranscript("");
    setActivePanel(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Tone config ─────────────────────────────────────────────────────────────

  const tones: Array<{ id: Tone; label: string; desc: string; preview: string }> = [
    { id: "professional", label: "Professional", desc: "Formal & polished", preview: '"Please find the action items outlined below for your review."' },
    { id: "casual", label: "Casual", desc: "Friendly & relaxed", preview: '"Hey! Just wanted to loop you in on a few things."' },
    { id: "concise", label: "Concise", desc: "Short & direct", preview: '"3 action items. Deadline: see below."' },
    { id: "persuasive", label: "Persuasive", desc: "Compelling & motivating", preview: '"This is a critical milestone — your input shapes the outcome."' },
  ];

  // ── Shared styles ───────────────────────────────────────────────────────────

  const chipStyle = { backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)", borderColor: "rgb(218 100 100)" };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: "100vh" }}>

      {/* ── COMPOSER ── */}
      <div className="flex flex-col flex-1 bg-white border-r border-neutral-200" style={{ overflow: "hidden" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>New Message</h2>
            {draftIndicator && (
              <span className="text-xs px-2 py-0.5 rounded-[6px] font-medium"
                style={{ backgroundColor: "rgb(245 245 245)", color: "rgb(115 115 115)" }}>
                Draft saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* AI Remix toggle */}
            <button
              onClick={() => setActivePanel(activePanel === "remix" ? null : "remix")}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-[8px] border transition-colors"
              style={{
                backgroundColor: activePanel === "remix" ? "rgb(253 235 235)" : "transparent",
                borderColor: activePanel === "remix" ? "rgb(218 100 100)" : "rgb(229 229 229)",
                color: activePanel === "remix" ? "rgb(138 9 9)" : "rgb(82 82 82)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              AI Remix
            </button>

            {/* AI Dictate toggle */}
            <button
              onClick={() => {
                if (activePanel === "dictate" && isRecording) stopDictate();
                setActivePanel(activePanel === "dictate" ? null : "dictate");
              }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-[8px] border transition-colors"
              style={{
                backgroundColor: activePanel === "dictate" ? "rgb(253 235 235)" : "transparent",
                borderColor: activePanel === "dictate" ? "rgb(218 100 100)" : "rgb(229 229 229)",
                color: activePanel === "dictate" ? "rgb(138 9 9)" : "rgb(82 82 82)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              AI Dictate
              {isRecording && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: "rgb(220 38 38)" }} />}
            </button>

            {/* Close / discard */}
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-[6px] transition-colors"
              style={{ color: "rgb(155 155 155)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(82 82 82)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}
              title="Discard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="border-b border-neutral-200 flex-shrink-0">
          {/* From */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100">
            <span className="text-xs font-semibold w-14 flex-shrink-0" style={{ color: "rgb(155 155 155)" }}>From</span>
            <span className="text-sm font-medium" style={{ color: "rgb(82 82 82)" }}>{fromName}</span>
            <span className="text-sm" style={{ color: "rgb(155 155 155)" }}>&lt;{fromEmail}&gt;</span>
          </div>

          {/* To */}
          <div className="flex items-start gap-3 px-6 py-2.5 border-b border-neutral-100">
            <span className="text-xs font-semibold w-14 flex-shrink-0 mt-1" style={{ color: "rgb(155 155 155)" }}>To</span>
            <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
              {to.map((addr) => (
                <span key={addr} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-xs font-medium border" style={chipStyle}>
                  {addr}
                  <button onClick={() => setTo((prev) => prev.filter((a) => a !== addr))}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
                    e.preventDefault();
                    commitToInput();
                  } else if (e.key === "Backspace" && !toInput && to.length) {
                    setTo((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={commitToInput}
                placeholder={to.length ? "" : "recipients@example.com"}
                className="flex-1 min-w-24 text-sm outline-none"
                style={{ color: "rgb(38 38 38)", backgroundColor: "transparent" }}
              />
            </div>
            <button
              onClick={() => setShowCc(!showCc)}
              className="text-xs flex-shrink-0 mt-1 transition-colors"
              style={{ color: showCc ? "rgb(138 9 9)" : "rgb(155 155 155)" }}
            >
              Cc
            </button>
          </div>

          {/* Cc */}
          {showCc && (
            <div className="flex items-start gap-3 px-6 py-2.5 border-b border-neutral-100">
              <span className="text-xs font-semibold w-14 flex-shrink-0 mt-1" style={{ color: "rgb(155 155 155)" }}>Cc</span>
              <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
                {cc.map((addr) => (
                  <span key={addr} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-xs font-medium border"
                    style={{ backgroundColor: "rgb(245 245 245)", color: "rgb(82 82 82)", borderColor: "rgb(220 220 220)" }}>
                    {addr}
                    <button onClick={() => setCc((prev) => prev.filter((a) => a !== addr))}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
                      e.preventDefault();
                      commitCcInput();
                    } else if (e.key === "Backspace" && !ccInput && cc.length) {
                      setCc((prev) => prev.slice(0, -1));
                    }
                  }}
                  onBlur={commitCcInput}
                  placeholder="cc@example.com"
                  className="flex-1 min-w-24 text-sm outline-none"
                  style={{ color: "rgb(38 38 38)", backgroundColor: "transparent" }}
                />
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="flex items-center gap-3 px-6 py-3">
            <span className="text-xs font-semibold w-14 flex-shrink-0" style={{ color: "rgb(155 155 155)" }}>Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1 text-sm font-medium outline-none"
              style={{ color: "rgb(27 29 29)", backgroundColor: "transparent" }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here…"
            className="w-full h-full min-h-64 text-sm outline-none resize-none leading-relaxed"
            style={{ color: "rgb(38 38 38)", backgroundColor: "transparent" }}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4 flex-shrink-0">
          {sendError && (
            <p className="text-xs mb-3 px-3 py-2 rounded-[8px]" style={{ color: "rgb(138 9 9)", backgroundColor: "rgb(253 235 235)" }}>
              {sendError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-[10px] transition-colors"
              style={{ backgroundColor: sending ? "rgb(180 50 50)" : "rgb(138 9 9)" }}
              onMouseEnter={(e) => { if (!sending) e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
              onMouseLeave={(e) => { if (!sending) e.currentTarget.style.backgroundColor = sending ? "rgb(180 50 50)" : "rgb(138 9 9)"; }}
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              {sending ? "Sending…" : "Send"}
            </button>
            <button
              onClick={() => router.back()}
              className="text-sm px-4 py-2.5 rounded-[10px] border transition-colors"
              style={{ color: "rgb(82 82 82)", borderColor: "rgb(229 229 229)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Discard
            </button>
          </div>
        </div>
      </div>

      {/* ── AI REMIX PANEL ── */}
      {activePanel === "remix" && (
        <div className="w-[480px] flex-shrink-0 flex flex-col bg-white border-l border-neutral-200" style={{ height: "100vh" }}>

          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(138 9 9)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>AI Remix</h2>
                <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>Rewrite your email with a different tone or style</p>
              </div>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1.5 rounded-[6px] transition-colors"
              style={{ color: "rgb(155 155 155)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; e.currentTarget.style.color = "rgb(82 82 82)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgb(155 155 155)"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">

            {/* Tone Selector */}
            <div className="px-6 py-5 border-b border-neutral-200">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "rgb(38 38 38)" }}>Select Tone</h3>
              <div className="grid grid-cols-2 gap-3">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className="flex flex-col gap-2 p-3.5 rounded-[10px] border-2 text-left transition-colors"
                    style={{
                      borderColor: tone === t.id ? "rgb(138 9 9)" : "rgb(229 229 229)",
                      backgroundColor: tone === t.id ? "rgb(253 235 235)" : "transparent",
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: tone === t.id ? "rgb(83 5 5)" : "rgb(38 38 38)" }}>{t.label}</p>
                      <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>{t.desc}</p>
                    </div>
                    <p className="text-xs leading-relaxed px-2 py-1 rounded-[6px]"
                      style={{
                        backgroundColor: tone === t.id ? "rgba(138,9,9,0.08)" : "rgb(245 245 245)",
                        color: tone === t.id ? "rgb(83 5 5)" : "rgb(115 115 115)",
                      }}>
                      {t.preview}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Options */}
            <div className="px-6 py-5 border-b border-neutral-200">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "rgb(38 38 38)" }}>Style Options</h3>

              {/* Length */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgb(115 115 115)" }}>Length</p>
                <div className="flex gap-2">
                  {(["shorter", "same", "longer"] as Length[]).map((l) => (
                    <button key={l} onClick={() => setLength(l)}
                      className="text-xs font-medium px-3 py-1.5 rounded-[8px] border transition-colors"
                      style={{
                        borderColor: length === l ? "rgb(138 9 9)" : "rgb(229 229 229)",
                        backgroundColor: length === l ? "rgb(253 235 235)" : "transparent",
                        color: length === l ? "rgb(138 9 9)" : "rgb(82 82 82)",
                      }}
                    >{l === "same" ? "Same length" : l.charAt(0).toUpperCase() + l.slice(1)}</button>
                  ))}
                </div>
              </div>

              {/* Formality */}
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgb(115 115 115)" }}>Formality</p>
                <div className="flex flex-wrap gap-2">
                  {(["very formal", "formal", "semi-formal", "informal"] as Formality[]).map((f) => (
                    <button key={f} onClick={() => setFormality(f)}
                      className="text-xs font-medium px-3 py-1.5 rounded-[8px] border transition-colors capitalize"
                      style={{
                        borderColor: formality === f ? "rgb(138 9 9)" : "rgb(229 229 229)",
                        backgroundColor: formality === f ? "rgb(253 235 235)" : "transparent",
                        color: formality === f ? "rgb(138 9 9)" : "rgb(82 82 82)",
                      }}
                    >{f}</button>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgb(115 115 115)" }}>Extras</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "bullets", label: "Keep bullet points" },
                    { id: "emoji", label: "Add emoji" },
                    { id: "context", label: "Add context" },
                    { id: "deadline", label: "Include deadline" },
                  ].map((ex) => {
                    const selected = extras.includes(ex.id);
                    return (
                      <button key={ex.id}
                        onClick={() => setExtras((prev) => selected ? prev.filter((e) => e !== ex.id) : [...prev, ex.id])}
                        className="text-xs font-medium px-3 py-1.5 rounded-[8px] border transition-colors"
                        style={{
                          borderColor: selected ? "rgb(138 9 9)" : "rgb(229 229 229)",
                          backgroundColor: selected ? "rgb(253 235 235)" : "transparent",
                          color: selected ? "rgb(138 9 9)" : "rgb(82 82 82)",
                        }}
                      >{ex.label}</button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Instruction */}
            <div className="px-6 py-5 border-b border-neutral-200">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "rgb(38 38 38)" }}>Custom Instruction</h3>
              <p className="text-xs mb-3" style={{ color: "rgb(115 115 115)" }}>Add specific instructions for the AI to follow when remixing.</p>
              <textarea
                rows={3}
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value.slice(0, 200))}
                placeholder="e.g. 'Emphasize the deadline urgency' or 'Start with a thank you'"
                className="w-full text-sm outline-none resize-none rounded-[10px] border px-4 py-3 leading-relaxed"
                style={{ backgroundColor: "rgb(245 245 245)", borderColor: "rgb(229 229 229)", color: "rgb(38 38 38)" }}
                onFocus={(e) => { e.target.style.borderColor = "rgb(218 100 100)"; e.target.style.backgroundColor = "white"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgb(229 229 229)"; e.target.style.backgroundColor = "rgb(245 245 245)"; }}
              />
              <p className="text-xs mt-1 text-right" style={{ color: "rgb(155 155 155)" }}>{customInstruction.length}/200</p>
            </div>

            {/* Remix Error */}
            {remixError && (
              <div className="px-6 py-4 border-b border-neutral-200">
                <p className="text-xs px-3 py-2 rounded-[8px]" style={{ color: "rgb(138 9 9)", backgroundColor: "rgb(253 235 235)" }}>{remixError}</p>
              </div>
            )}

            {/* Remixed Preview */}
            {remixedBody && (
              <div className="px-6 py-5 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: "rgb(38 38 38)" }}>Remixed Preview</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(remixedBody)}
                    className="text-xs flex items-center gap-1"
                    style={{ color: "rgb(115 115 115)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="rounded-[10px] border p-4 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ backgroundColor: "rgb(250 250 250)", borderColor: "rgb(229 229 229)", color: "rgb(38 38 38)" }}>
                  {remixedBody}
                </div>
              </div>
            )}

            {/* Version History */}
            {versions.length > 0 && (
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: "rgb(38 38 38)" }}>Version History</h3>
                  <span className="text-xs" style={{ color: "rgb(155 155 155)" }}>{versions.length} version{versions.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2">
                  {versions.map((v, idx) => (
                    <div key={v.id}
                      className="flex items-center gap-3 p-2.5 rounded-[10px] border"
                      style={{
                        backgroundColor: idx === 0 ? "rgb(253 235 235)" : "rgb(250 250 250)",
                        borderColor: idx === 0 ? "rgb(218 100 100)" : "rgb(229 229 229)",
                      }}>
                      <div className="w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ backgroundColor: idx === 0 ? "rgb(138 9 9)" : "rgb(220 220 220)", color: idx === 0 ? "white" : "rgb(82 82 82)" }}>
                        {versions.length - idx}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold capitalize truncate" style={{ color: "rgb(38 38 38)" }}>{v.label}</p>
                        <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>
                          {idx === 0 ? "Current version" : `${Math.max(1, Math.round((Date.now() - v.timestamp.getTime()) / 60000))} min ago`}
                        </p>
                      </div>
                      {idx === 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-[6px]" style={{ backgroundColor: "rgb(218 100 100)", color: "white" }}>Active</span>
                      ) : (
                        <button onClick={() => setRemixedBody(v.body)} className="text-xs font-medium" style={{ color: "rgb(138 9 9)" }}>
                          Restore
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="border-t border-neutral-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={handleRemix}
                disabled={remixing}
                className="flex items-center gap-2 border text-sm font-semibold px-4 py-2.5 rounded-[10px] transition-colors flex-shrink-0"
                style={{
                  borderColor: "rgb(218 100 100)",
                  color: remixing ? "rgb(155 155 155)" : "rgb(138 9 9)",
                  backgroundColor: remixing ? "rgb(245 245 245)" : "transparent",
                }}
              >
                {remixing ? (
                  <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {remixing ? "Remixing…" : "Remix"}
              </button>

              {remixedBody && (
                <button
                  onClick={acceptRemix}
                  className="flex-1 flex items-center justify-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] transition-colors"
                  style={{ backgroundColor: "rgb(138 9 9)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Accept & Replace
                </button>
              )}

              {remixedBody && (
                <button
                  onClick={() => setRemixedBody(null)}
                  className="p-2.5 rounded-[10px] border transition-colors"
                  style={{ borderColor: "rgb(229 229 229)", color: "rgb(155 155 155)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(138 9 9)"; e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                  title="Discard remix"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AI DICTATE PANEL ── */}
      {activePanel === "dictate" && (
        <div className="w-[480px] flex-shrink-0 flex flex-col bg-white border-l border-neutral-200" style={{ height: "100vh" }}>

          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(138 9 9)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>AI Dictate</h2>
                <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>Speak naturally — transcribed in real-time</p>
              </div>
            </div>
            <button
              onClick={() => { if (isRecording) stopDictate(); setActivePanel(null); }}
              className="p-1.5 rounded-[6px] transition-colors"
              style={{ color: "rgb(155 155 155)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; e.currentTarget.style.color = "rgb(82 82 82)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgb(155 155 155)"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">

            {/* Recording zone */}
            <div
              className="px-6 pt-6 pb-5 border-b border-neutral-200"
              style={{ background: isRecording ? "linear-gradient(to bottom, rgb(253 235 235), white)" : "rgb(250 250 250)" }}
            >
              <div className="flex items-center gap-2 mb-6">
                {isRecording && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: "rgb(220 38 38)" }} />}
                <span className="text-sm font-semibold" style={{ color: "rgb(38 38 38)" }}>
                  {isRecording ? "Recording" : "Ready to record"}
                </span>
                {isRecording && (
                  <span className="text-sm font-mono font-semibold" style={{ color: "rgb(138 9 9)" }}>
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>

              {/* Mic button with pulse rings */}
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative flex items-center justify-center">
                  {isRecording && (
                    <>
                      <span className="absolute w-16 h-16 rounded-full animate-ping"
                        style={{ backgroundColor: "rgba(138,9,9,0.15)" }} />
                      <span className="absolute w-24 h-24 rounded-full animate-ping"
                        style={{ backgroundColor: "rgba(138,9,9,0.08)", animationDelay: "0.4s" }} />
                    </>
                  )}
                  <button
                    onClick={() => isRecording ? stopDictate() : startDictate()}
                    className="relative w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
                    style={{
                      backgroundColor: isRecording ? "rgb(138 9 9)" : "rgb(245 245 245)",
                      color: isRecording ? "white" : "rgb(82 82 82)",
                    }}
                    onMouseEnter={(e) => { if (!isRecording) e.currentTarget.style.backgroundColor = "rgb(229 229 229)"; }}
                    onMouseLeave={(e) => { if (!isRecording) e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-center" style={{ color: "rgb(115 115 115)" }}>
                  {isRecording ? "Click to stop recording" : "Click the mic to start dictating"}
                </p>
              </div>
            </div>

            {/* Error */}
            {dictateError && (
              <div className="px-6 py-4 border-b border-neutral-200">
                <p className="text-xs px-3 py-2 rounded-[8px]" style={{ color: "rgb(138 9 9)", backgroundColor: "rgb(253 235 235)" }}>
                  {dictateError}
                </p>
              </div>
            )}

            {/* Live transcription */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: "rgb(38 38 38)" }}>Transcription</h3>
                  {isRecording && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-[6px] border flex items-center gap-1"
                      style={{ color: "rgb(138 9 9)", borderColor: "rgb(218 100 100)", backgroundColor: "rgb(253 235 235)" }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "rgb(220 38 38)" }} />
                      Live
                    </span>
                  )}
                </div>
                {(transcript || interimTranscript) && (
                  <button onClick={() => { setTranscript(""); setInterimTranscript(""); }}
                    className="text-xs" style={{ color: "rgb(155 155 155)" }}>
                    Clear
                  </button>
                )}
              </div>
              <div className="rounded-[10px] border min-h-32 p-4 text-sm leading-relaxed"
                style={{ backgroundColor: "rgb(250 250 250)", borderColor: "rgb(229 229 229)" }}>
                {(transcript || interimTranscript) ? (
                  <>
                    <span style={{ color: "rgb(38 38 38)" }}>{transcript}</span>
                    {interimTranscript && (
                      <span style={{ color: "rgb(155 155 155)" }}>{interimTranscript}</span>
                    )}
                  </>
                ) : (
                  <span className="text-sm" style={{ color: "rgb(185 185 185)" }}>
                    Your speech will appear here as you dictate…
                  </span>
                )}
              </div>
              {(transcript || interimTranscript) && (
                <p className="text-xs mt-2" style={{ color: "rgb(155 155 155)" }}>
                  {(transcript + interimTranscript).split(/\s+/).filter(Boolean).length} words
                </p>
              )}
            </div>
          </div>

          {/* Panel Footer */}
          <div className="border-t border-neutral-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={insertTranscript}
                disabled={!transcript && !interimTranscript}
                className="flex-1 flex items-center justify-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] transition-colors"
                style={{ backgroundColor: (!transcript && !interimTranscript) ? "rgb(200 200 200)" : "rgb(138 9 9)" }}
                onMouseEnter={(e) => { if (transcript || interimTranscript) e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
                onMouseLeave={(e) => { if (transcript || interimTranscript) e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Insert into email
              </button>
              <button
                onClick={() => { setTranscript(""); setInterimTranscript(""); }}
                className="p-2.5 rounded-[10px] border transition-colors"
                style={{ borderColor: "rgb(229 229 229)", color: "rgb(155 155 155)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(82 82 82)"; e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                title="Clear transcript"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
