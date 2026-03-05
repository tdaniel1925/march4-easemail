"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Browser Speech API types ─────────────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = "professional" | "casual" | "persuasive" | "concise";
type Length = "shorter" | "same" | "longer";
type ActivePanel = "remix" | "dictate" | "voice" | null;

const STYLE_PRESETS = [
  "Executive Brief",
  "Team Update",
  "Client Proposal",
  "Follow-up",
  "Cold Outreach",
  "Apology",
  "Thank You",
] as const;
type StylePreset = (typeof STYLE_PRESETS)[number];

const TONE_CARDS: { key: Tone; label: string; sub: string; iconPath: string; iconBg: string; iconColor: string }[] = [
  {
    key: "professional",
    label: "Professional",
    sub: "Formal & clear",
    iconBg: "bg-white bg-opacity-20",
    iconColor: "text-neutral-50",
    iconPath: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    key: "casual",
    label: "Casual",
    sub: "Friendly & warm",
    iconBg: "bg-secondary-100",
    iconColor: "text-secondary-600",
    iconPath: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    key: "persuasive",
    label: "Persuasive",
    sub: "Compelling & bold",
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    key: "concise",
    label: "Concise",
    sub: "Short & direct",
    iconBg: "bg-tertiary-100",
    iconColor: "text-tertiary-600",
    iconPath: "M4 6h16M4 12h8m-8 6h16",
  },
];

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
  const [bcc, setBcc] = useState<string[]>([]);
  const [bccInput, setBccInput] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Panel state ─────────────────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  // ── AI Remix state ──────────────────────────────────────────────────────────
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("same");
  const [formality, setFormality] = useState(75);
  const [emojiOn, setEmojiOn] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<StylePreset | null>(null);
  const [remixing, setRemixing] = useState(false);
  const [remixedBody, setRemixedBody] = useState<string | null>(null);
  const [remixError, setRemixError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(true);

  // ── AI Dictate state ────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [dictateError, setDictateError] = useState<string | null>(null);
  const [autoPunctuate, setAutoPunctuate] = useState(true);
  const [fixGrammar, setFixGrammar] = useState(true);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Voice Message state ──────────────────────────────────────────────────────
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceTime, setVoiceTime] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceTimeRef = useRef(0);

  // ── Draft indicator ─────────────────────────────────────────────────────────
  const onBodyChange = useCallback(() => {
    setDraftSaved(false);
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => setDraftSaved(true), 2000);
  }, []);

  // ── Rich text format ────────────────────────────────────────────────────────
  function execFormat(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    bodyRef.current?.focus();
  }

  // ── Recipient helpers ───────────────────────────────────────────────────────
  function commitTo(e: React.KeyboardEvent<HTMLInputElement>) {
    if (["Enter", ",", "Tab"].includes(e.key) && toInput.trim()) {
      e.preventDefault();
      setTo((prev) => [...prev, toInput.trim()]);
      setToInput("");
    } else if (e.key === "Backspace" && !toInput && to.length) {
      setTo((prev) => prev.slice(0, -1));
    }
  }
  function commitCc(e: React.KeyboardEvent<HTMLInputElement>) {
    if (["Enter", ",", "Tab"].includes(e.key) && ccInput.trim()) {
      e.preventDefault();
      setCc((prev) => [...prev, ccInput.trim()]);
      setCcInput("");
    } else if (e.key === "Backspace" && !ccInput && cc.length) {
      setCc((prev) => prev.slice(0, -1));
    }
  }
  function commitBcc(e: React.KeyboardEvent<HTMLInputElement>) {
    if (["Enter", ",", "Tab"].includes(e.key) && bccInput.trim()) {
      e.preventDefault();
      setBcc((prev) => [...prev, bccInput.trim()]);
      setBccInput("");
    } else if (e.key === "Backspace" && !bccInput && bcc.length) {
      setBcc((prev) => prev.slice(0, -1));
    }
  }

  // ── Send ────────────────────────────────────────────────────────────────────
  async function handleSend() {
    if (!to.length) { setSendError("Add at least one recipient."); return; }
    setSending(true);
    setSendError(null);
    try {
      const bodyHtml = bodyRef.current?.innerHTML ?? "";
      let voiceAttachment: { name: string; contentType: string; data: string } | undefined;
      if (voiceBlob) {
        const buf = await voiceBlob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const ext = voiceBlob.type.includes("ogg") ? "ogg" : "webm";
        voiceAttachment = { name: `voice-message.${ext}`, contentType: voiceBlob.type, data: btoa(binary) };
      }
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.map((addr) => ({ emailAddress: { address: addr } })),
          cc: cc.map((addr) => ({ emailAddress: { address: addr } })),
          bcc: bcc.map((addr) => ({ emailAddress: { address: addr } })),
          subject,
          body: { contentType: "HTML", content: bodyHtml },
          ...(voiceAttachment ? { attachment: voiceAttachment } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Send failed" }));
        setSendError((err as { error?: string }).error ?? "Send failed");
        return;
      }
      router.push("/sent");
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  // ── AI Remix ────────────────────────────────────────────────────────────────
  async function handleRemix() {
    const bodyText = bodyRef.current?.innerText ?? "";
    if (!bodyText.trim()) { setRemixError("Write something in the email body first."); return; }
    setRemixing(true);
    setRemixError(null);
    setRemixedBody(null);
    try {
      const res = await fetch("/api/mail/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: bodyText, tone, length, formality: formalityLabel(formality), emoji: emojiOn }),
      });
      const data = await res.json() as { remixed?: string; error?: string };
      if (!res.ok || data.error) { setRemixError(data.error ?? "Remix failed"); return; }
      setRemixedBody(data.remixed ?? null);
    } catch {
      setRemixError("Network error. Please try again.");
    } finally {
      setRemixing(false);
    }
  }

  function acceptRemix() {
    if (!remixedBody || !bodyRef.current) return;
    bodyRef.current.innerText = remixedBody;
    setActivePanel(null);
    setRemixedBody(null);
  }

  function formalityLabel(val: number) {
    if (val >= 80) return "Very Formal";
    if (val >= 60) return "Formal";
    if (val >= 40) return "Semi-Formal";
    return "Informal";
  }

  // ── AI Dictate ──────────────────────────────────────────────────────────────
  function startRecording() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { setDictateError("Speech recognition not supported in this browser."); return; }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: ISpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final) setTranscript((prev) => prev + final + " ");
      setInterimTranscript(interim);
    };
    rec.onerror = () => setDictateError("Microphone error. Please check permissions.");
    rec.onend = () => { setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current); };

    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
    setDictateError(null);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function pauseRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function restartRecording() {
    stopRecording();
    setTranscript("");
    setInterimTranscript("");
    setRecordingTime(0);
  }

  function insertTranscript() {
    if (!bodyRef.current) return;
    const text = transcript + interimTranscript;
    if (!text.trim()) return;
    bodyRef.current.focus();
    document.execCommand("insertText", false, text);
    setTranscript("");
    setInterimTranscript("");
    setActivePanel(null);
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ── Voice recording helpers ──────────────────────────────────────────────────
  async function startVoiceRecording() {
    setVoiceError(null);
    setVoiceBlob(null);
    if (voiceUrl) { URL.revokeObjectURL(voiceUrl); setVoiceUrl(null); }
    setVoiceTime(0);
    setVoiceDuration(0);
    voiceTimeRef.current = 0;
    voiceChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
        ? "audio/webm;codecs=opus"
        : (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/ogg;codecs=opus"))
          ? "audio/ogg;codecs=opus"
          : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      voiceRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) voiceChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const baseType = mimeType.split(";")[0];
        const blob = new Blob(voiceChunksRef.current, { type: baseType });
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
      };
      recorder.start(1000);
      setVoiceRecording(true);
      voiceTimerRef.current = setInterval(() => {
        voiceTimeRef.current += 1;
        setVoiceTime(voiceTimeRef.current);
        if (voiceTimeRef.current >= 600) stopVoiceRecording();
      }, 1000);
    } catch {
      setVoiceError("Microphone access denied. Allow microphone access in your browser settings.");
    }
  }

  function stopVoiceRecording() {
    if (voiceTimerRef.current) { clearInterval(voiceTimerRef.current); voiceTimerRef.current = null; }
    if (voiceRecorderRef.current && voiceRecorderRef.current.state !== "inactive") {
      setVoiceDuration(voiceTimeRef.current);
      voiceRecorderRef.current.stop();
      voiceRecorderRef.current = null;
    }
    setVoiceRecording(false);
  }

  function clearVoiceRecording() {
    stopVoiceRecording();
    setVoiceBlob(null);
    if (voiceUrl) { URL.revokeObjectURL(voiceUrl); setVoiceUrl(null); }
    setVoiceTime(0);
    setVoiceDuration(0);
    voiceTimeRef.current = 0;
    voiceChunksRef.current = [];
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, []);

  const wordCount = bodyRef.current?.innerText?.trim().split(/\s+/).filter(Boolean).length ?? 0;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 bg-background-200 relative" style={{ height: "100vh", overflow: "hidden" }}>

      {/* TOP HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-background-50 border-b border-neutral-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/inbox" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back to Inbox
          </Link>
          <span className="text-neutral-300">/</span>
          <h1 className="font-heading font-semibold text-neutral-900 text-base">New Message</h1>
          {draftSaved && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-tertiary-50 border border-tertiary-200 rounded-small">
              <span className="draft-saved-dot w-1.5 h-1.5 rounded-full bg-tertiary-500 flex-shrink-0" />
              <span className="text-xs font-medium text-tertiary-700">Draft saved</span>
            </div>
          )}
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom"
          onClick={() => setDraftSaved(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Draft
        </button>
      </header>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-hidden px-6 py-5 flex flex-col">
        <div className="max-w-4xl w-full mx-auto bg-background-50 rounded-large composer-shadow border border-neutral-200 flex flex-col overflow-hidden flex-1 min-h-0">

          {/* COMPOSER HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 ai-gradient-bg rounded-small flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="font-heading font-semibold text-neutral-900 text-sm">Compose New Email</h2>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/inbox" className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors" title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          </div>

          {/* FROM */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-400 w-14 flex-shrink-0">From</span>
            <span className="text-sm text-neutral-700">{fromName} &lt;{fromEmail}&gt;</span>
          </div>

          {/* TO */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-400 w-14 flex-shrink-0">To</span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {to.map((addr) => (
                <span key={addr} className="recipient-chip">
                  {addr}
                  <button onClick={() => setTo((p) => p.filter((a) => a !== addr))}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add recipient…"
                className="flex-1 min-w-32 text-sm text-neutral-700 placeholder-neutral-400 bg-transparent border-none outline-none"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={commitTo}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!showCc && (
                <button className="text-xs font-medium text-neutral-500 hover:text-primary-600 px-2 py-1 rounded-small hover:bg-primary-50 transition-colors" onClick={() => setShowCc(true)}>CC</button>
              )}
              {!showBcc && (
                <button className="text-xs font-medium text-neutral-500 hover:text-primary-600 px-2 py-1 rounded-small hover:bg-primary-50 transition-colors" onClick={() => setShowBcc(true)}>BCC</button>
              )}
            </div>
          </div>

          {/* CC */}
          {showCc && (
            <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-400 w-14 flex-shrink-0">CC</span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {cc.map((addr) => (
                  <span key={addr} className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-small px-2 py-0.5 text-xs font-medium">
                    {addr}
                    <button className="text-neutral-400 hover:text-neutral-600" onClick={() => setCc((p) => p.filter((a) => a !== addr))}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add CC…"
                  className="flex-1 min-w-32 text-sm text-neutral-700 placeholder-neutral-400 bg-transparent border-none outline-none"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={commitCc}
                />
              </div>
            </div>
          )}

          {/* BCC */}
          {showBcc && (
            <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-400 w-14 flex-shrink-0">BCC</span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {bcc.map((addr) => (
                  <span key={addr} className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-small px-2 py-0.5 text-xs font-medium">
                    {addr}
                    <button className="text-neutral-400 hover:text-neutral-600" onClick={() => setBcc((p) => p.filter((a) => a !== addr))}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add BCC…"
                  className="flex-1 min-w-32 text-sm text-neutral-700 placeholder-neutral-400 bg-transparent border-none outline-none"
                  value={bccInput}
                  onChange={(e) => setBccInput(e.target.value)}
                  onKeyDown={commitBcc}
                />
              </div>
            </div>
          )}

          {/* SUBJECT */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-200">
            <span className="text-xs font-semibold text-neutral-400 w-14 flex-shrink-0">Subject</span>
            <input
              type="text"
              placeholder="Subject…"
              className="flex-1 text-sm font-semibold text-neutral-900 bg-transparent border-none outline-none placeholder-neutral-400"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* AI FEATURE BUTTONS */}
          <div className="px-6 py-3 border-b border-neutral-200 ai-section-glow flex-shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-neutral-500 flex-shrink-0 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Features
              </span>
              <div className="w-px h-5 bg-neutral-200 flex-shrink-0" />

              <button
                onClick={() => setActivePanel(activePanel === "remix" ? null : "remix")}
                className="flex items-center gap-2 ai-remix-btn text-white font-semibold text-xs py-2 px-3.5 rounded-small transition-all flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                AI Remix
                <span className="bg-white bg-opacity-20 text-white text-xs px-1.5 py-0.5 rounded-small font-medium">Rewrite</span>
              </button>

              <button
                onClick={() => setActivePanel(activePanel === "dictate" ? null : "dictate")}
                className="flex items-center gap-2 ai-dictate-btn text-white font-semibold text-xs py-2 px-3.5 rounded-small transition-all flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                AI Dictate
                <span className="bg-white bg-opacity-20 text-white text-xs px-1.5 py-0.5 rounded-small font-medium">Speak</span>
              </button>

              <button
                onClick={() => setActivePanel(activePanel === "voice" ? null : "voice")}
                className="flex items-center gap-2 text-white font-semibold text-xs py-2 px-3.5 rounded-small transition-all flex-shrink-0"
                style={{ backgroundColor: voiceBlob ? "rgb(21 128 61)" : "rgb(138 9 9)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Message
                {voiceBlob && <span className="bg-white bg-opacity-20 text-white text-xs px-1.5 py-0.5 rounded-small font-medium">Attached</span>}
              </button>

              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-xs text-neutral-400">Powered by</span>
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-small">EaseMail AI</span>
              </div>
            </div>
          </div>

          {/* RICH TEXT TOOLBAR */}
          <div className="flex items-center gap-1 px-5 py-2.5 border-b border-neutral-200 bg-background-50 flex-wrap flex-shrink-0">
            <button className="toolbar-btn" title="Bold" onClick={() => execFormat("bold")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
              </svg>
            </button>
            <button className="toolbar-btn" title="Italic" onClick={() => execFormat("italic")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4M8 20h4M12 4l-4 16" />
              </svg>
            </button>
            <button className="toolbar-btn" title="Underline" onClick={() => execFormat("underline")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v6a5 5 0 0010 0V4M5 20h14" />
              </svg>
            </button>
            <button className="toolbar-btn" title="Strikethrough" onClick={() => execFormat("strikeThrough")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15s1.5 2 4.5 2 4.5-2 4.5-2M9 9s1.5-2 4.5-2 4.5 2 4.5 2M4 12h16" />
              </svg>
            </button>
            <div className="format-divider" />
            <button className="toolbar-btn" title="Bullet List" onClick={() => execFormat("insertUnorderedList")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button className="toolbar-btn" title="Numbered List" onClick={() => execFormat("insertOrderedList")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
            <div className="format-divider" />
            <button className="toolbar-btn" title="Align Left" onClick={() => execFormat("justifyLeft")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h12M3 18h15" />
              </svg>
            </button>
            <button className="toolbar-btn" title="Align Center" onClick={() => execFormat("justifyCenter")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M4 18h16" />
              </svg>
            </button>
          </div>

          {/* EMAIL BODY */}
          <div className="flex-1 overflow-y-auto px-8 py-6 bg-background-50" style={{ minHeight: 0 }}>
            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              onInput={onBodyChange}
              className="text-sm text-neutral-700 leading-relaxed outline-none min-h-[200px]"
              data-placeholder="Write your email…"
              style={{
                caretColor: "rgb(138 9 9)",
              }}
            />
          </div>

          {/* VOICE ATTACHMENT CHIP */}
          {voiceBlob && (
            <div className="px-6 py-3 border-t border-neutral-200 bg-background-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-small flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(220 252 231)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: "rgb(21 128 61)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "rgb(27 29 29)" }}>Voice Message</p>
                  <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>
                    {formatTime(voiceDuration)} · {voiceBlob.size < 1024 * 1024 ? `${Math.round(voiceBlob.size / 1024)} KB` : `${(voiceBlob.size / (1024 * 1024)).toFixed(1)} MB`} · will be attached to email
                  </p>
                </div>
                <button
                  onClick={clearVoiceRecording}
                  className="p-1.5 rounded-small transition-colors"
                  style={{ color: "rgb(155 155 155)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(138 9 9)"; e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(155 155 155)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                  title="Remove voice attachment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* FOOTER / SEND BAR */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-background-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 ai-gradient-bg compose-btn-glow text-white font-semibold text-sm py-2.5 px-5 rounded-small transition-all disabled:opacity-60"
              >
                {sending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">{wordCount} words</span>
              <Link href="/inbox" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 transition-colors px-2 py-1.5 rounded-small hover:bg-background-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Discard
              </Link>
            </div>
          </div>

          {/* Send Error */}
          {sendError && (
            <div className="px-6 py-3 bg-primary-50 border-t border-primary-200 text-xs text-primary-700">
              {sendError}
            </div>
          )}

        </div>
      </div>

      {/* ── AI REMIX OVERLAY ───────────────────────────────────────────────────── */}
      {activePanel === "remix" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-6">
          {/* Backdrop */}
          <div className="absolute inset-0 overlay-bg z-10" onClick={() => setActivePanel(null)} />

          {/* Panel */}
          <div className="relative z-20 w-full max-w-2xl bg-background-50 rounded-large remix-panel-shadow flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 ai-gradient-bg rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-neutral-900 text-base leading-tight">AI Remix</h2>
                  <p className="text-xs text-neutral-500">Rewrite your email with a different tone or style</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-small ai-badge-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  EaseMail AI
                </span>
              </div>
              <button onClick={() => setActivePanel(null)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Tone cards */}
              <div className="px-6 pt-5 pb-5 border-b border-neutral-200" style={{ background: "rgb(var(--color-primary-50))" }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-sm font-semibold text-neutral-800">Select Tone</h3>
                  <span className="text-xs text-neutral-400">Choose how your email should sound</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {TONE_CARDS.map((card) => (
                    <button
                      key={card.key}
                      onClick={() => setTone(card.key)}
                      className={`rounded-large p-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                        tone === card.key ? "tone-card-active" : "tone-card-hover border-2 border-neutral-200 bg-background-50"
                      }`}
                    >
                      <div className={`w-9 h-9 ${tone === card.key ? "bg-white bg-opacity-20" : card.iconBg} rounded-small flex items-center justify-center flex-shrink-0`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4.5 h-4.5 ${tone === card.key ? "text-white" : card.iconColor}`} style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={card.iconPath} />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-semibold leading-tight ${tone === card.key ? "text-white" : "text-neutral-800"}`}>{card.label}</p>
                        <p className={`leading-tight mt-0.5 ${tone === card.key ? "text-white text-opacity-70" : "text-neutral-500"}`} style={{ fontSize: 10 }}>{card.sub}</p>
                      </div>
                      <div className={`w-4 h-4 ${tone === card.key ? "bg-white bg-opacity-30" : "border-2 border-neutral-300 bg-background-50"} rounded-small flex items-center justify-center flex-shrink-0`}>
                        {tone === card.key && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Presets */}
              <div className="px-6 py-4 border-b border-neutral-200 bg-background-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-sm font-semibold text-neutral-800">Style Presets</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSelectedPreset(selectedPreset === preset ? null : preset)}
                      className={`preset-chip text-xs font-medium px-3 py-1.5 rounded-small border-2 transition-all ${
                        selectedPreset === preset ? "preset-chip-active" : "text-neutral-600 border-neutral-200 bg-background-50"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remix Settings */}
              <div className="px-6 py-3.5 border-b border-neutral-200 bg-background-100">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500 flex-shrink-0">Length</span>
                    <div className="flex items-center gap-1">
                      {(["shorter", "same", "longer"] as Length[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLength(l)}
                          className={`text-xs px-2.5 py-1 rounded-small border transition-all capitalize ${
                            length === l
                              ? "border-2 border-primary-300 text-primary-700 bg-primary-50 font-medium"
                              : "border-neutral-200 text-neutral-500 hover:border-primary-300 hover:text-primary-600 bg-background-50"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-px h-5 bg-neutral-200 flex-shrink-0" />
                  <div className="flex items-center gap-2 flex-1 min-w-40">
                    <span className="text-xs font-semibold text-neutral-500 flex-shrink-0">Formality</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formality}
                      onChange={(e) => setFormality(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs font-semibold text-primary-600 flex-shrink-0 w-16">{formalityLabel(formality)}</span>
                  </div>
                  <div className="w-px h-5 bg-neutral-200 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500">Emoji</span>
                    <button onClick={() => setEmojiOn(!emojiOn)} className={`toggle-track ${emojiOn ? "on" : "off"}`}>
                      <div className="toggle-thumb" />
                    </button>
                    <span className="text-xs text-neutral-400">{emojiOn ? "On" : "Off"}</span>
                  </div>
                </div>
              </div>

              {/* Remixed Preview or Generate button */}
              <div className="px-6 py-5 border-b border-neutral-200 bg-background-50">
                {!remixedBody && !remixing && !remixError && (
                  <button
                    onClick={handleRemix}
                    className="w-full flex items-center justify-center gap-2 ai-gradient-bg compose-btn-glow text-white font-semibold text-sm py-3 rounded-small transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Remix
                  </button>
                )}

                {remixing && (
                  <div className="flex items-center justify-center gap-3 py-6 text-sm text-neutral-500">
                    <svg className="w-5 h-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Remixing your email…
                  </div>
                )}

                {remixError && (
                  <div className="text-xs text-primary-700 bg-primary-50 border border-primary-200 rounded-small px-4 py-3">
                    {remixError}
                    <button onClick={handleRemix} className="ml-2 font-semibold underline">Try again</button>
                  </div>
                )}

                {remixedBody && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-sm font-semibold text-neutral-800">Remixed Preview</h3>
                        <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-small border border-primary-100 capitalize">
                          {tone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowDiff(!showDiff)}
                          className="flex items-center gap-1 text-xs font-medium text-tertiary-700 bg-tertiary-50 border border-tertiary-200 px-2.5 py-1 rounded-small hover:bg-tertiary-100 transition-colors"
                        >
                          {showDiff ? "Hide Diff" : "Show Diff"}
                        </button>
                        <button
                          onClick={handleRemix}
                          className="flex items-center gap-1 text-xs font-medium text-neutral-600 border border-neutral-200 px-2.5 py-1 rounded-small hover:bg-background-100 transition-colors shadow-custom"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Regenerate
                        </button>
                      </div>
                    </div>

                    <div className="bg-background-100 border border-neutral-200 rounded-large p-4 shadow-custom" style={{ maxHeight: 240, overflowY: "auto" }}>
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs text-neutral-500">AI Quality Score</span>
                        <div className="flex-1 h-1.5 bg-neutral-200 rounded-small overflow-hidden">
                          <div className="remix-shimmer h-full rounded-small" style={{ width: "88%" }} />
                        </div>
                        <span className="text-xs font-semibold text-primary-600">88%</span>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{remixedBody}</p>
                    </div>

                    {showDiff && (
                      <div className="flex items-center gap-4 mt-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="diff-added text-xs px-1.5 py-0.5">Added</span>
                          <span className="text-xs text-neutral-400">New content</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="diff-removed text-xs px-1.5 py-0.5">Removed</span>
                          <span className="text-xs text-neutral-400">Original content</span>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {[
                        { label: "Words", value: remixedBody.split(/\s+/).length.toString(), iconPath: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z", bg: "bg-primary-100", color: "text-primary-600" },
                        { label: "Length", value: length === "shorter" ? "-15%" : length === "longer" ? "+15%" : "Same", iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", bg: "bg-secondary-100", color: "text-secondary-600" },
                        { label: "Clarity", value: "High", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", bg: "bg-tertiary-100", color: "text-tertiary-600" },
                        { label: "Tone", value: tone.charAt(0).toUpperCase() + tone.slice(1), iconPath: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", bg: "bg-primary-100", color: "text-primary-600" },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2.5 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                          <div className={`w-7 h-7 ${s.bg} rounded-small flex items-center justify-center flex-shrink-0`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{s.value}</p>
                            <p className="text-xs text-neutral-500">{s.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-neutral-200 bg-background-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setRemixedBody(null); setActivePanel(null); }}
                  className="flex items-center gap-2 border-2 border-neutral-200 text-neutral-600 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50 font-medium text-sm py-2.5 px-4 rounded-small transition-all shadow-custom flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
                <button
                  onClick={handleRemix}
                  disabled={remixing}
                  className="flex items-center gap-2 border-2 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-all shadow-custom flex-shrink-0 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Another
                </button>
                <button
                  onClick={() => setActivePanel(null)}
                  className="flex items-center gap-2 border-2 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-all shadow-custom flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit First
                </button>
                {remixedBody && (
                  <button
                    onClick={acceptRemix}
                    className="flex-1 flex items-center justify-center gap-2 ai-gradient-bg accept-btn-glow text-white font-semibold text-sm py-2.5 px-5 rounded-small transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Remix
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI DICTATE PANEL (right slide-in) ─────────────────────────────────── */}
      {activePanel === "dictate" && (
        <div className="absolute inset-0 z-20 flex">
          {/* Dimmed left area */}
          <div className="flex-1 overlay-bg" onClick={() => { stopRecording(); setActivePanel(null); }} />

          {/* Dictate panel */}
          <div className="w-full max-w-md bg-background-50 border-l border-neutral-200 flex flex-col shadow-custom-hover overflow-hidden" style={{ height: "100%" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 ai-gradient-bg rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-neutral-900 text-base leading-tight">AI Dictate</h2>
                  <div className="flex items-center gap-1.5">
                    {isRecording && <span className="timer-dot w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />}
                    <span className="text-xs text-neutral-500">{isRecording ? `Recording — ${formatTime(recordingTime)}` : `${formatTime(recordingTime)}`}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => { stopRecording(); setActivePanel(null); }} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Waveform */}
              <div className="px-6 py-5 border-b border-neutral-200 bg-background-50">
                <div className="flex items-center justify-center gap-1 h-10">
                  {isRecording ? (
                    Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="wave-bar" style={{ height: `${8 + Math.random() * 20}px` }} />
                    ))
                  ) : (
                    Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-[3px] rounded-sm bg-neutral-200" style={{ height: "8px" }} />
                    ))
                  )}
                </div>
              </div>

              {/* Live transcription */}
              <div className="px-6 py-5 border-b border-neutral-200 bg-background-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-sm font-semibold text-neutral-800">Live Transcription</h3>
                    {isRecording && (
                      <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-small border border-primary-100">
                        <span className="timer-dot w-1.5 h-1.5 rounded-full bg-primary-500" />
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setTranscript(""); setInterimTranscript(""); }}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors px-2 py-1 hover:bg-neutral-100 rounded-small"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear
                    </button>
                  </div>
                </div>

                <div className="bg-background-100 border border-neutral-200 rounded-large p-4 relative shadow-custom" style={{ minHeight: 80, maxHeight: 200, overflowY: "auto" }}>
                  {(transcript || interimTranscript) ? (
                    <p className="text-sm text-neutral-800 leading-relaxed">
                      {transcript}
                      {interimTranscript && <span className="text-neutral-400">{interimTranscript}</span>}
                      {isRecording && <span className="cursor-blink inline-block w-0.5 h-4 bg-primary-500 ml-0.5 align-middle" />}
                    </p>
                  ) : (
                    <p className="text-sm text-neutral-400 italic">
                      {isRecording ? "Listening…" : "Press Record to start dictating your email."}
                    </p>
                  )}
                  {(transcript || interimTranscript) && (
                    <div className="absolute bottom-3 right-3">
                      <span className="text-xs text-neutral-400 bg-background-50 border border-neutral-200 px-2 py-0.5 rounded-small">
                        {(transcript + interimTranscript).trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                  )}
                </div>

                {dictateError && (
                  <p className="mt-2 text-xs text-primary-700 bg-primary-50 border border-primary-200 rounded-small px-3 py-2">{dictateError}</p>
                )}
              </div>

              {/* Mic Controls */}
              <div className="px-6 py-6 border-b border-neutral-200 bg-background-50">
                <div className="flex items-center justify-center gap-6">
                  {/* Restart */}
                  <button onClick={restartRecording} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-large border-2 border-neutral-200 group-hover:border-neutral-300 bg-background-50 group-hover:bg-background-100 flex items-center justify-center transition-all shadow-custom">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <span className="text-xs text-neutral-500 group-hover:text-neutral-700 font-medium">Restart</span>
                  </button>

                  {/* Pause */}
                  <button onClick={pauseRecording} className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-large border-2 border-secondary-300 group-hover:border-secondary-400 bg-secondary-50 group-hover:bg-secondary-100 flex items-center justify-center transition-all shadow-custom">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary-600 group-hover:text-secondary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-secondary-600 font-medium">Pause</span>
                  </button>

                  {/* Main mic button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className="flex flex-col items-center gap-2 group relative"
                  >
                    <div className="relative flex items-center justify-center">
                      {isRecording && (
                        <>
                          <div className="mic-pulse absolute w-20 h-20 rounded-large border-2 border-primary-400 opacity-40" />
                          <div className="mic-pulse-2 absolute w-20 h-20 rounded-large border-2 border-primary-300 opacity-30" />
                          <div className="mic-pulse-3 absolute w-20 h-20 rounded-large border-2 border-primary-200 opacity-20" />
                        </>
                      )}
                      <div className="w-20 h-20 rounded-large ai-gradient-bg flex items-center justify-center shadow-custom-hover relative z-10 group-hover:opacity-90 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs text-primary-600 font-semibold">{isRecording ? "Recording…" : "Record"}</span>
                  </button>

                  {/* Stop */}
                  <button onClick={stopRecording} className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-large border-2 border-primary-200 group-hover:border-primary-300 bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-all shadow-custom">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    </div>
                    <span className="text-xs text-primary-500 font-medium">Stop</span>
                  </button>
                </div>
              </div>

              {/* Dictation Settings */}
              <div className="px-6 py-4 border-b border-neutral-200 bg-background-100">
                <h3 className="font-heading text-sm font-semibold text-neutral-800 mb-3">Dictation Settings</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-secondary-100 rounded-small flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-800">Auto-Punctuate</p>
                        <p className="text-xs text-neutral-500">Insert commas & periods</p>
                      </div>
                    </div>
                    <button onClick={() => setAutoPunctuate(!autoPunctuate)} className={`toggle-track ${autoPunctuate ? "on" : "off"}`}>
                      <div className="toggle-thumb" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-tertiary-100 rounded-small flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-tertiary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-800">Fix Grammar</p>
                        <p className="text-xs text-neutral-500">Auto-correct errors</p>
                      </div>
                    </div>
                    <button onClick={() => setFixGrammar(!fixGrammar)} className={`toggle-track ${fixGrammar ? "on" : "off"}`}>
                      <div className="toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-4 border-b border-neutral-200 bg-background-100">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Duration", value: formatTime(recordingTime), iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", bg: "bg-primary-100", color: "text-primary-600", mono: true },
                    { label: "Words", value: (transcript + interimTranscript).trim().split(/\s+/).filter(Boolean).length.toString(), iconPath: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z", bg: "bg-secondary-100", color: "text-secondary-600", mono: false },
                    { label: "Speed", value: recordingTime > 0 ? `${Math.round((transcript.split(/\s+/).filter(Boolean).length / (recordingTime / 60)))} wpm` : "—", iconPath: "M13 10V3L4 14h7v7l9-11h-7z", bg: "bg-tertiary-100", color: "text-tertiary-600", mono: false },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                      <div className={`w-8 h-8 ${s.bg} rounded-small flex items-center justify-center flex-shrink-0`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold text-neutral-900 ${s.mono ? "font-mono" : ""}`}>{s.value}</p>
                        <p className="text-xs text-neutral-500">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-neutral-200 bg-background-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { stopRecording(); setTranscript(""); setInterimTranscript(""); setActivePanel(null); }}
                  className="flex items-center gap-2 border border-neutral-200 text-neutral-600 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-colors shadow-custom flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Discard
                </button>
                <button
                  onClick={insertTranscript}
                  disabled={!transcript && !interimTranscript}
                  className="flex-1 flex items-center justify-center gap-2 ai-gradient-bg text-white font-semibold text-sm py-2.5 px-5 rounded-small transition-all shadow-custom hover:shadow-custom-hover disabled:opacity-40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Insert into Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VOICE MESSAGE PANEL (right slide-in) ───────────────────────────────── */}
      {activePanel === "voice" && (
        <div className="absolute inset-0 z-20 flex">
          {/* Dimmed left area */}
          <div className="flex-1 overlay-bg" onClick={() => { if (!voiceRecording) setActivePanel(null); }} />

          {/* Voice panel */}
          <div className="w-full max-w-md bg-background-50 border-l border-neutral-200 flex flex-col shadow-custom-hover overflow-hidden" style={{ height: "100%" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-small flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(138 9 9)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-neutral-900 text-base leading-tight">Voice Message</h2>
                  <div className="flex items-center gap-1.5">
                    {voiceRecording && <span className="timer-dot w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />}
                    <span className="text-xs text-neutral-500">
                      {voiceRecording ? `Recording — ${formatTime(voiceTime)} / 10:00` : voiceBlob ? `Recorded · ${formatTime(voiceDuration)}` : "Up to 10 minutes"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { if (!voiceRecording) setActivePanel(null); }}
                disabled={voiceRecording}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-small transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Waveform / visual */}
              <div className="px-6 py-6 border-b border-neutral-200 bg-background-50 flex flex-col items-center gap-4">
                {/* Progress ring / timer */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(229 229 229)" strokeWidth="6" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={voiceRecording ? "rgb(138 9 9)" : voiceBlob ? "rgb(21 128 61)" : "rgb(212 212 212)"}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - (voiceBlob ? voiceDuration : voiceTime) / 600)}`}
                      style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-semibold font-heading" style={{ color: voiceRecording ? "rgb(138 9 9)" : "rgb(27 29 29)" }}>
                      {formatTime(voiceBlob ? voiceDuration : voiceTime)}
                    </span>
                    <span className="text-xs" style={{ color: "rgb(115 115 115)" }}>
                      {voiceRecording ? "recording" : voiceBlob ? "recorded" : "ready"}
                    </span>
                  </div>
                </div>

                {/* Waveform bars */}
                <div className="flex items-center justify-center gap-1 h-8 w-full">
                  {Array.from({ length: 24 }).map((_, i) => (
                    voiceRecording ? (
                      <div key={i} className="wave-bar" style={{ height: `${6 + Math.random() * 18}px` }} />
                    ) : (
                      <div key={i} className="w-[3px] rounded-sm" style={{ height: voiceBlob ? `${4 + (i % 5) * 4}px` : "4px", backgroundColor: voiceBlob ? "rgb(21 128 61)" : "rgb(212 212 212)" }} />
                    )
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="px-6 py-6 border-b border-neutral-200 bg-background-50 flex flex-col items-center gap-4">
                {!voiceBlob ? (
                  /* Record / Stop button */
                  <button
                    onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording}
                    className="w-20 h-20 rounded-large flex items-center justify-center shadow-custom-hover transition-all"
                    style={{ backgroundColor: voiceRecording ? "rgb(220 38 38)" : "rgb(138 9 9)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    {voiceRecording ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                ) : (
                  /* Re-record button */
                  <button
                    onClick={clearVoiceRecording}
                    className="flex items-center gap-2 border border-neutral-200 text-neutral-600 hover:bg-background-100 font-medium text-sm py-2.5 px-5 rounded-small transition-colors shadow-custom"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Re-record
                  </button>
                )}
                <p className="text-xs text-center" style={{ color: "rgb(155 155 155)" }}>
                  {voiceRecording ? "Recording will auto-stop at 10:00" : voiceBlob ? "Recording complete" : "Tap to start recording"}
                </p>
              </div>

              {/* Playback (shown after recording) */}
              {voiceUrl && (
                <div className="px-6 py-5 border-b border-neutral-200 bg-background-50">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgb(115 115 115)" }}>Preview</p>
                  <audio controls src={voiceUrl} className="w-full" style={{ height: 36 }} />
                  <p className="text-xs mt-2" style={{ color: "rgb(155 155 155)" }}>
                    {voiceBlob && (voiceBlob.size < 1024 * 1024 ? `${Math.round(voiceBlob.size / 1024)} KB` : `${(voiceBlob.size / (1024 * 1024)).toFixed(1)} MB`)}
                  </p>
                </div>
              )}

              {/* Error */}
              {voiceError && (
                <div className="mx-6 mt-4 px-4 py-3 rounded-small border text-sm" style={{ backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 216 216)", color: "rgb(138 9 9)" }}>
                  {voiceError}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-neutral-200 bg-background-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { clearVoiceRecording(); setActivePanel(null); }}
                  disabled={voiceRecording}
                  className="flex items-center gap-2 border border-neutral-200 text-neutral-600 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-colors shadow-custom flex-shrink-0 disabled:opacity-40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={() => setActivePanel(null)}
                  disabled={!voiceBlob}
                  className="flex-1 flex items-center justify-center gap-2 text-white font-semibold text-sm py-2.5 px-5 rounded-small transition-all shadow-custom hover:shadow-custom-hover disabled:opacity-40"
                  style={{ backgroundColor: "rgb(138 9 9)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attach to Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
