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

// ─── Toolbar helpers ──────────────────────────────────────────────────────────

function ToolBtn({
  onClick, title, active, children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`toolbar-btn${active ? " active" : ""}`}
    >
      {children}
    </button>
  );
}

const TEXT_COLORS = [
  "#000000","#374151","#6b7280","#9ca3af","#d1d5db",
  "#dc2626","#ea580c","#d97706","#ca8a04","#16a34a",
  "#0891b2","#2563eb","#7c3aed","#db2777","#ffffff",
  "#fca5a5","#fed7aa","#fef08a","#bbf7d0","#bfdbfe",
];

const HIGHLIGHT_COLORS = [
  "transparent","#fef08a","#bbf7d0","#bfdbfe","#ddd6fe",
  "#fbcfe8","#fed7aa","#fca5a5","#e0f2fe","#f0fdf4",
];

function ColorPicker({
  colors, onSelect, onClose, label,
}: {
  colors: string[];
  onSelect: (c: string) => void;
  onClose: () => void;
  label: string;
}) {
  return (
    <div
      className="absolute top-full left-0 mt-1 z-50 bg-white border border-neutral-200 rounded-[10px] p-3 shadow-custom-hover"
      style={{ minWidth: 176 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <p className="text-xs font-semibold text-neutral-500 mb-2">{label}</p>
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => { onSelect(c); onClose(); }}
            className="w-7 h-7 rounded-[6px] border border-neutral-200 transition-transform hover:scale-110 flex-shrink-0"
            style={{ backgroundColor: c === "transparent" ? "white" : c, backgroundImage: c === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)" : "none", backgroundSize: "8px 8px", backgroundPosition: "0 0, 4px 4px" }}
            title={c}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
        <span className="text-xs text-neutral-400">Custom</span>
        <input
          type="color"
          className="w-7 h-7 rounded cursor-pointer border-0 p-0"
          onChange={(e) => onSelect(e.target.value)}
          onBlur={onClose}
        />
      </div>
    </div>
  );
}

// ─── Email spacing formatter ──────────────────────────────────────────────────
// Rules:
//   • If first line is a salutation → blank line after it
//   • One blank line before closing valediction (Best regards, Thank you, etc.)
//   • One blank line between closing and signature name

const SALUTATION_RE = /^(hey|hi+|hello|dear|to whom it may concern|good (morning|afternoon|evening))\b/i;
const CLOSING_RE = /^(best( regards)?|kind regards|warm(ly| regards)?|sincerely(,| yours)?|yours (truly|sincerely)?|thank you|thanks|regards|with (appreciation|gratitude|best regards)|respectfully|cheers|take care|looking forward|cordially|all the best|best wishes|many thanks|much appreciated),?\.?\s*$/i;

function formatEmailSpacing(text: string): string {
  const lines = text.split("\n").map((l) => l.trimEnd());
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length) return text;

  // Split salutation off the top
  let salutation: string[] = [];
  const rest = [...lines];
  if (SALUTATION_RE.test(rest[0].trim())) {
    salutation = [rest.shift()!];
    while (rest.length && !rest[0].trim()) rest.shift(); // consume blanks after
  }

  // Find last closing line
  let closingIdx = -1;
  for (let i = rest.length - 1; i >= 0; i--) {
    if (CLOSING_RE.test(rest[i].trim())) { closingIdx = i; break; }
  }

  let body: string[];
  let closing: string[] = [];
  let signature: string[] = [];

  if (closingIdx !== -1) {
    body = rest.slice(0, closingIdx);
    while (body.length && !body[body.length - 1].trim()) body.pop();
    closing = [rest[closingIdx]];
    signature = rest.slice(closingIdx + 1);
    while (signature.length && !signature[0].trim()) signature.shift();
    while (signature.length && !signature[signature.length - 1].trim()) signature.pop();
  } else {
    body = rest;
    while (body.length && !body[body.length - 1].trim()) body.pop();
  }

  // Assemble: each present section separated by exactly one blank line
  const sections = [salutation, body, closing, signature].filter((s) => s.length > 0);
  const result: string[] = [];
  sections.forEach((section, i) => {
    result.push(...section);
    if (i < sections.length - 1) result.push("");
  });

  return result.join("\n");
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
  const [selectedPreset, setSelectedPreset] = useState<StylePreset | null>(null);
  const [remixing, setRemixing] = useState(false);
  const [remixedBody, setRemixedBody] = useState<string | null>(null);
  const [remixError, setRemixError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(true);
  const [remixTarget, setRemixTarget] = useState<"selection" | "full">("full");
  const remixRangeRef = useRef<Range | null>(null);

  // ── AI Dictate state ────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [dictateError, setDictateError] = useState<string | null>(null);
  const [autoPunctuate, setAutoPunctuate] = useState(true);
  const [fixGrammar, setFixGrammar] = useState(true);
  const [dictateFormatted, setDictateFormatted] = useState<string | null>(null);
  const [dictateFormatting, setDictateFormatting] = useState(false);
  const [dictateFormatError, setDictateFormatError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intentionalStopRef = useRef(false);
  const dictateTimeRef = useRef(0);

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

  // ── Toolbar formatting state ─────────────────────────────────────────────────
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const savedSelectionRef = useRef<Range | null>(null);
  const [bodyExpanded, setBodyExpanded] = useState(false);

  // ── Signature state ──────────────────────────────────────────────────────────
  const [sig, setSig] = useState<{ name: string; title: string } | null>(null);
  const [showSigEditor, setShowSigEditor] = useState(false);
  const [sigName, setSigName] = useState("");
  const [sigTitle, setSigTitle] = useState("");
  const [sigInserted, setSigInserted] = useState(false);

  // ── Draft indicator ─────────────────────────────────────────────────────────
  const onBodyChange = useCallback(() => {
    setDraftSaved(false);
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => setDraftSaved(true), 2000);
  }, []);

  // ── Track active formats at cursor ───────────────────────────────────────────
  useEffect(() => {
    function update() {
      if (!bodyRef.current?.contains(document.getSelection()?.anchorNode ?? null)) return;
      const s = new Set<string>();
      const cmds = ["bold","italic","underline","strikeThrough","insertUnorderedList","insertOrderedList","justifyLeft","justifyCenter","justifyRight","justifyFull","superscript","subscript"];
      for (const c of cmds) { try { if (document.queryCommandState(c)) s.add(c); } catch {} }
      setActiveFormats(s);
    }
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  // ── Rich text format ────────────────────────────────────────────────────────
  function execFormat(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    bodyRef.current?.focus();
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
  }

  function restoreAndExec(cmd: string, value: string) {
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
    bodyRef.current?.focus();
    document.execCommand(cmd, false, value);
  }

  function insertLink() {
    const url = window.prompt("Enter URL (include https://):");
    if (url?.trim()) execFormat("createLink", url.trim());
  }

  function insertCode() {
    const sel = window.getSelection();
    const text = sel?.toString() ?? "";
    if (text) {
      document.execCommand("insertHTML", false, `<code style="font-family:monospace;background:rgb(245 245 245);padding:1px 4px;border-radius:4px;font-size:0.875em">${text.replace(/</g,"&lt;")}</code>`);
    } else {
      document.execCommand("insertHTML", false, `<code style="font-family:monospace;background:rgb(245 245 245);padding:1px 4px;border-radius:4px;font-size:0.875em">code</code>`);
    }
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
    const bodyText = remixTarget === "selection" && remixRangeRef.current
      ? remixRangeRef.current.toString()
      : (bodyRef.current?.innerText ?? "");
    if (!bodyText.trim()) { setRemixError("Write something in the email body first."); return; }
    setRemixing(true);
    setRemixError(null);
    setRemixedBody(null);
    try {
      const res = await fetch("/api/mail/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: bodyText,
          tone,
          length,
          formality: formalityLabel(formality),
          extras: [],
          customInstruction: selectedPreset ? `Format this as a ${selectedPreset} email.` : undefined,
        }),
      });
      const data = await res.json() as { remixed?: string; error?: string };
      if (!res.ok || data.error) { setRemixError(data.error ?? "Remix failed"); return; }
      setRemixedBody(data.remixed ? formatEmailSpacing(data.remixed) : null);
    } catch {
      setRemixError("Network error. Please try again.");
    } finally {
      setRemixing(false);
    }
  }

  function remixTextToHtml(text: string) {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Join sections with <div><br></div> so blank lines are visible in contenteditable
    return escaped.split(/\n\n+/).map((p) => `<div>${p.replace(/\n/g, "<br>")}</div>`).join("<div><br></div>") || "<div><br></div>";
  }

  function acceptRemix() {
    if (!remixedBody || !bodyRef.current) return;
    if (remixTarget === "selection" && remixRangeRef.current) {
      // Replace only the selected range
      bodyRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(remixRangeRef.current);
        document.execCommand("insertHTML", false, remixTextToHtml(remixedBody));
      }
      remixRangeRef.current = null;
    } else {
      bodyRef.current.innerHTML = remixTextToHtml(remixedBody);
    }
    setActivePanel(null);
    setRemixedBody(null);
    setTimeout(() => bodyRef.current?.focus(), 50);
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
    rec.onend = () => {
      // Browser auto-stops after silence — restart unless user intentionally stopped
      if (!intentionalStopRef.current) {
        try { rec.start(); } catch { /* already stopped */ }
      } else {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    intentionalStopRef.current = false;
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
    setDictateError(null);
    dictateTimeRef.current = recordingTime; // resume from current time if paused
    timerRef.current = setInterval(() => {
      dictateTimeRef.current += 1;
      setRecordingTime(dictateTimeRef.current);
      if (dictateTimeRef.current >= 600) stopRecording(); // auto-stop at 10 min
    }, 1000);
  }

  function stopRecording() {
    intentionalStopRef.current = true;
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function pauseRecording() {
    intentionalStopRef.current = true;
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function restartRecording() {
    stopRecording();
    setTranscript("");
    setInterimTranscript("");
    setRecordingTime(0);
    dictateTimeRef.current = 0;
    setDictateFormatted(null);
    setDictateFormatError(null);
  }

  async function generateEmail() {
    const text = (transcript + interimTranscript).trim();
    if (!text || dictateFormatting) return;
    stopRecording();
    setDictateFormatting(true);
    setDictateFormatError(null);
    setDictateFormatted(null);
    try {
      const res = await fetch("/api/mail/dictate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json() as { formatted?: string; error?: string };
      if (!res.ok || data.error) {
        setDictateFormatError(data.error ?? "Failed to format email");
        return;
      }
      setDictateFormatted(data.formatted ? formatEmailSpacing(data.formatted) : null);
    } catch {
      setDictateFormatError("Network error. Please try again.");
    } finally {
      setDictateFormatting(false);
    }
  }

  function insertDictated() {
    if (!dictateFormatted || !bodyRef.current) return;
    bodyRef.current.innerHTML = remixTextToHtml(dictateFormatted);
    bodyRef.current.focus();
    const sel = window.getSelection();
    if (sel) { sel.selectAllChildren(bodyRef.current); sel.collapseToEnd(); }
    setDictateFormatted(null);
    setTranscript("");
    setInterimTranscript("");
    setRecordingTime(0);
    dictateTimeRef.current = 0;
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

  // Load signature from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("easemail_sig");
      if (stored) {
        const s = JSON.parse(stored) as { name: string; title: string };
        setSig(s);
        setSigName(s.name);
        setSigTitle(s.title);
      }
    } catch {}
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, []);

  // ── Signature helpers ────────────────────────────────────────────────────────
  function saveSig() {
    if (!sigName.trim()) return;
    const s = { name: sigName.trim(), title: sigTitle.trim() };
    setSig(s);
    localStorage.setItem("easemail_sig", JSON.stringify(s));
    setShowSigEditor(false);
  }

  function insertSignature(s?: { name: string; title: string }) {
    const target = s ?? sig;
    if (!bodyRef.current || !target) return;
    bodyRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(bodyRef.current);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const titleHtml = target.title ? `<div>${esc(target.title)}</div>` : "";
    document.execCommand("insertHTML", false, `<div><br></div><div>--</div><div>${esc(target.name)}</div>${titleHtml}`);
    setSigInserted(true);
  }

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
          {!bodyExpanded && <div className="px-6 py-3 border-b border-neutral-200 ai-section-glow flex-shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-neutral-500 flex-shrink-0 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Features
              </span>
              <div className="w-px h-5 bg-neutral-200 flex-shrink-0" />

              <div className="relative group flex-shrink-0">
                <button
                  onClick={() => {
                    if (activePanel === "remix") { setActivePanel(null); return; }
                    // Capture selection inside body before panel steals focus
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0 && sel.toString().trim() && bodyRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
                      remixRangeRef.current = sel.getRangeAt(0).cloneRange();
                      setRemixTarget("selection");
                    } else {
                      remixRangeRef.current = null;
                      setRemixTarget("full");
                    }
                    setRemixedBody(null);
                    setRemixError(null);
                    setActivePanel("remix");
                  }}
                  className="flex items-center gap-2 ai-remix-btn text-white font-semibold text-xs py-2 px-3.5 rounded-small transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  AI Remix
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="px-2.5 py-1.5 rounded-[6px] text-xs text-white whitespace-nowrap" style={{ backgroundColor: "rgb(27 29 29)" }}>
                    Rewrite your email in a different tone or style
                  </div>
                  <div className="mx-auto w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgb(27 29 29)", width: "fit-content" }} />
                </div>
              </div>

              <div className="relative group flex-shrink-0">
                <button
                  onClick={() => setActivePanel(activePanel === "dictate" ? null : "dictate")}
                  className="flex items-center gap-2 ai-dictate-btn text-white font-semibold text-xs py-2 px-3.5 rounded-small transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  AI Dictate
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="px-2.5 py-1.5 rounded-[6px] text-xs text-white whitespace-nowrap" style={{ backgroundColor: "rgb(27 29 29)" }}>
                    Speak your email — transcribed live as you talk
                  </div>
                  <div className="mx-auto w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgb(27 29 29)", width: "fit-content" }} />
                </div>
              </div>

              <div className="relative group flex-shrink-0">
                <button
                  onClick={() => setActivePanel(activePanel === "voice" ? null : "voice")}
                  className="flex items-center gap-2 text-white font-semibold text-xs py-2 px-3.5 rounded-small transition-all"
                  style={{ backgroundColor: voiceBlob ? "rgb(21 128 61)" : "rgb(138 9 9)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice Message
                  {voiceBlob && <span className="bg-white bg-opacity-20 text-white text-xs px-1.5 py-0.5 rounded-small font-medium">Attached</span>}
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="px-2.5 py-1.5 rounded-[6px] text-xs text-white whitespace-nowrap" style={{ backgroundColor: "rgb(27 29 29)" }}>
                    Record a voice message — attached as audio to the email
                  </div>
                  <div className="mx-auto w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgb(27 29 29)", width: "fit-content" }} />
                </div>
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-xs text-neutral-400">Powered by</span>
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-small">EaseMail AI</span>
              </div>
            </div>
          </div>}

          {/* RICH TEXT TOOLBAR */}
          {!bodyExpanded && <div className="border-b border-neutral-200 bg-background-50 flex-shrink-0">
            <div className="flex items-center gap-0.5 px-3 py-1.5 flex-wrap">

              {/* Undo / Redo */}
              <ToolBtn title="Undo" onClick={() => execFormat("undo")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </ToolBtn>
              <ToolBtn title="Redo" onClick={() => execFormat("redo")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
              </ToolBtn>

              <div className="format-divider mx-1" />

              {/* Paragraph / Heading style */}
              <select
                className="toolbar-select"
                title="Paragraph style"
                onMouseDown={saveSelection}
                onChange={(e) => { restoreAndExec("formatBlock", e.target.value); e.target.value = "div"; }}
                defaultValue="div"
              >
                <option value="div">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="blockquote">Quote</option>
                <option value="pre">Preformatted</option>
              </select>

              {/* Font family */}
              <select
                className="toolbar-select"
                title="Font family"
                onMouseDown={saveSelection}
                onChange={(e) => { restoreAndExec("fontName", e.target.value); }}
                defaultValue=""
              >
                <option value="" disabled>Font</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Tahoma, sans-serif">Tahoma</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
              </select>

              {/* Font size */}
              <select
                className="toolbar-select"
                title="Font size"
                onMouseDown={saveSelection}
                onChange={(e) => { restoreAndExec("fontSize", e.target.value); }}
                defaultValue=""
              >
                <option value="" disabled>Size</option>
                <option value="1">Tiny</option>
                <option value="2">Small</option>
                <option value="3">Normal</option>
                <option value="4">Large</option>
                <option value="5">X-Large</option>
                <option value="6">Huge</option>
                <option value="7">Massive</option>
              </select>

              <div className="format-divider mx-1" />

              {/* Bold / Italic / Underline / Strikethrough */}
              <ToolBtn title="Bold (Ctrl+B)" active={activeFormats.has("bold")} onClick={() => execFormat("bold")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
              </ToolBtn>
              <ToolBtn title="Italic (Ctrl+I)" active={activeFormats.has("italic")} onClick={() => execFormat("italic")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4M8 20h4M12 4l-4 16" /></svg>
              </ToolBtn>
              <ToolBtn title="Underline (Ctrl+U)" active={activeFormats.has("underline")} onClick={() => execFormat("underline")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v6a5 5 0 0010 0V4M5 20h14" /></svg>
              </ToolBtn>
              <ToolBtn title="Strikethrough" active={activeFormats.has("strikeThrough")} onClick={() => execFormat("strikeThrough")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15s1.5 2 4.5 2 4.5-2 4.5-2M9 9s1.5-2 4.5-2 4.5 2 4.5 2M4 12h16" /></svg>
              </ToolBtn>
              <ToolBtn title="Superscript" active={activeFormats.has("superscript")} onClick={() => execFormat("superscript")}>
                <span className="text-xs font-bold leading-none">x<sup style={{ fontSize: "0.6em" }}>2</sup></span>
              </ToolBtn>
              <ToolBtn title="Subscript" active={activeFormats.has("subscript")} onClick={() => execFormat("subscript")}>
                <span className="text-xs font-bold leading-none">x<sub style={{ fontSize: "0.6em" }}>2</sub></span>
              </ToolBtn>

              <div className="format-divider mx-1" />

              {/* Text color */}
              <div className="relative">
                <ToolBtn title="Text color" onClick={() => { setShowHighlightPicker(false); setShowTextColorPicker((v) => !v); }}>
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-bold leading-none" style={{ color: "rgb(58 58 58)" }}>A</span>
                    <span className="w-3.5 h-1 rounded-sm" style={{ backgroundColor: "rgb(138 9 9)" }} />
                  </span>
                </ToolBtn>
                {showTextColorPicker && (
                  <ColorPicker
                    label="Text color"
                    colors={TEXT_COLORS}
                    onSelect={(c) => execFormat("foreColor", c)}
                    onClose={() => setShowTextColorPicker(false)}
                  />
                )}
              </div>

              {/* Highlight color */}
              <div className="relative">
                <ToolBtn title="Highlight color" onClick={() => { setShowTextColorPicker(false); setShowHighlightPicker((v) => !v); }}>
                  <span className="flex flex-col items-center gap-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    <span className="w-3.5 h-1 rounded-sm" style={{ backgroundColor: "#fef08a" }} />
                  </span>
                </ToolBtn>
                {showHighlightPicker && (
                  <ColorPicker
                    label="Highlight"
                    colors={HIGHLIGHT_COLORS}
                    onSelect={(c) => execFormat("hiliteColor", c === "transparent" ? "transparent" : c)}
                    onClose={() => setShowHighlightPicker(false)}
                  />
                )}
              </div>

              <div className="format-divider mx-1" />

              {/* Alignment */}
              <ToolBtn title="Align left" active={activeFormats.has("justifyLeft")} onClick={() => execFormat("justifyLeft")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h12M3 18h15" /></svg>
              </ToolBtn>
              <ToolBtn title="Align center" active={activeFormats.has("justifyCenter")} onClick={() => execFormat("justifyCenter")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M4 18h16" /></svg>
              </ToolBtn>
              <ToolBtn title="Align right" active={activeFormats.has("justifyRight")} onClick={() => execFormat("justifyRight")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 12h12M6 18h15" /></svg>
              </ToolBtn>
              <ToolBtn title="Justify" active={activeFormats.has("justifyFull")} onClick={() => execFormat("justifyFull")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" /></svg>
              </ToolBtn>

              <div className="format-divider mx-1" />

              {/* Lists + indent */}
              <ToolBtn title="Bullet list" active={activeFormats.has("insertUnorderedList")} onClick={() => execFormat("insertUnorderedList")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /><circle cx="1.5" cy="6" r="1" fill="currentColor" /><circle cx="1.5" cy="12" r="1" fill="currentColor" /><circle cx="1.5" cy="18" r="1" fill="currentColor" /></svg>
              </ToolBtn>
              <ToolBtn title="Numbered list" active={activeFormats.has("insertOrderedList")} onClick={() => execFormat("insertOrderedList")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
              </ToolBtn>
              <ToolBtn title="Indent" onClick={() => execFormat("indent")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 12h12M9 18h12M3 12l4-3v6l-4-3z" /></svg>
              </ToolBtn>
              <ToolBtn title="Outdent" onClick={() => execFormat("outdent")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 12h12M9 18h12M7 12l-4 3V9l4 3z" /></svg>
              </ToolBtn>

              <div className="format-divider mx-1" />

              {/* Blockquote / Code / Link / HR */}
              <ToolBtn title="Blockquote" onClick={() => execFormat("formatBlock", "blockquote")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </ToolBtn>
              <ToolBtn title="Inline code" onClick={insertCode}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </ToolBtn>
              <ToolBtn title="Insert link" onClick={insertLink}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </ToolBtn>
              <ToolBtn title="Horizontal rule" onClick={() => execFormat("insertHorizontalRule")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" /></svg>
              </ToolBtn>

              <div className="format-divider mx-1" />

              {/* Clear formatting */}
              <ToolBtn title="Clear formatting" onClick={() => execFormat("removeFormat")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L17.94 6M17.94 18L6 6" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 20h7" /></svg>
              </ToolBtn>

            </div>
          </div>}

          {/* EMAIL BODY */}
          <div className="flex-1 overflow-y-auto px-8 py-6 bg-background-50 relative" style={{ minHeight: 0 }}>

            {/* Focus mode controls */}
            <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
              {bodyExpanded && (
                <div className="flex items-center gap-0.5 bg-white border border-neutral-200 rounded-[10px] px-1.5 py-1 shadow-custom">
                  <ToolBtn title="Bold (Ctrl+B)" active={activeFormats.has("bold")} onClick={() => execFormat("bold")}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
                  </ToolBtn>
                  <ToolBtn title="Italic (Ctrl+I)" active={activeFormats.has("italic")} onClick={() => execFormat("italic")}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4M8 20h4M12 4l-4 16" /></svg>
                  </ToolBtn>
                  <ToolBtn title="Underline (Ctrl+U)" active={activeFormats.has("underline")} onClick={() => execFormat("underline")}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v6a5 5 0 0010 0V4M5 20h14" /></svg>
                  </ToolBtn>
                  <div className="w-px h-4 bg-neutral-200 mx-0.5" />
                  <ToolBtn title="Bullet list" active={activeFormats.has("insertUnorderedList")} onClick={() => execFormat("insertUnorderedList")}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /><circle cx="1.5" cy="6" r="1" fill="currentColor" /><circle cx="1.5" cy="12" r="1" fill="currentColor" /><circle cx="1.5" cy="18" r="1" fill="currentColor" /></svg>
                  </ToolBtn>
                  <ToolBtn title="Numbered list" active={activeFormats.has("insertOrderedList")} onClick={() => execFormat("insertOrderedList")}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                  </ToolBtn>
                </div>
              )}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setBodyExpanded((v) => !v); setTimeout(() => bodyRef.current?.focus(), 50); }}
                title={bodyExpanded ? "Exit focus mode" : "Expand — focus mode for long emails"}
                className="p-1.5 rounded-[8px] border border-neutral-200 bg-white text-neutral-400 hover:text-primary-600 hover:border-primary-300 shadow-custom transition-all"
              >
                {bodyExpanded ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>

            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              onInput={onBodyChange}
              className="text-sm text-neutral-700 leading-relaxed outline-none min-h-[200px]"
              data-placeholder="Write your email…"
              style={{ caretColor: "rgb(138 9 9)" }}
            />

            {/* Ghost signature — click to insert for real */}
            {sig && !sigInserted && (
              <div
                onClick={() => insertSignature()}
                className="mt-6 cursor-pointer group select-none"
                title="Click to insert your signature"
              >
                <div className="w-8 h-px bg-neutral-200 mb-2 group-hover:bg-primary-300 transition-colors" />
                <p className="text-sm text-neutral-300 group-hover:text-neutral-500 transition-colors">{sig.name}</p>
                {sig.title && <p className="text-xs text-neutral-300 group-hover:text-neutral-400 transition-colors mt-0.5">{sig.title}</p>}
                <p className="text-xs text-neutral-200 group-hover:text-primary-400 transition-colors mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Insert signature
                </p>
              </div>
            )}
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

          {/* SIGNATURE EDITOR (inline, slides in above footer) */}
          {showSigEditor && (
            <div className="border-t border-neutral-200 bg-background-100 px-6 py-4 flex-shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1.5">Name</label>
                    <input
                      type="text"
                      value={sigName}
                      onChange={(e) => setSigName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveSig()}
                      placeholder="John Smith"
                      autoFocus
                      className="w-full text-sm border border-neutral-200 rounded-small px-3 py-2 outline-none bg-background-50 focus:border-primary-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1.5">Title <span className="font-normal text-neutral-400">(optional)</span></label>
                    <input
                      type="text"
                      value={sigTitle}
                      onChange={(e) => setSigTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveSig()}
                      placeholder="Senior Attorney"
                      className="w-full text-sm border border-neutral-200 rounded-small px-3 py-2 outline-none bg-background-50 focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pb-0.5">
                  <button
                    onClick={saveSig}
                    disabled={!sigName.trim()}
                    className="text-xs font-semibold text-white px-3 py-2 rounded-small transition-colors disabled:opacity-40"
                    style={{ backgroundColor: "rgb(138 9 9)" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSigEditor(false)}
                    className="text-xs text-neutral-500 px-3 py-2 rounded-small hover:bg-background-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {sigName.trim() && (
                <div className="mt-3 px-3 py-2.5 bg-background-50 border border-neutral-200 rounded-small">
                  <p className="text-xs text-neutral-400 mb-1.5">Preview</p>
                  <div className="w-6 h-px bg-neutral-300 mb-1.5" />
                  <p className="text-sm text-neutral-700">{sigName}</p>
                  {sigTitle && <p className="text-xs text-neutral-400 mt-0.5">{sigTitle}</p>}
                </div>
              )}
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

              {/* Signature pill */}
              {sig ? (
                sigInserted ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-small" style={{ color: "rgb(21 128 61)", backgroundColor: "rgb(220 252 231)" }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Sig added
                  </span>
                ) : (
                  <button
                    onClick={() => insertSignature()}
                    className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-primary-600 px-2.5 py-1.5 rounded-small border border-dashed border-neutral-300 hover:border-primary-300 hover:bg-primary-50 transition-all"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    + Sig
                  </button>
                )
              ) : (
                <button
                  onClick={() => setShowSigEditor(true)}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 px-2.5 py-1.5 rounded-small hover:bg-background-100 transition-colors"
                  title="Set your email signature"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Set signature
                </button>
              )}

              <Link href="/email-rules" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-600 transition-colors px-2 py-1.5 rounded-small hover:bg-background-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Rules
              </Link>
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

              {/* Remix target indicator */}
              <div className="px-6 py-3 border-b border-neutral-200 bg-background-100 flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-500 flex-shrink-0">Remixing:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { remixRangeRef.current = null; setRemixTarget("full"); setRemixedBody(null); }}
                    className={`text-xs px-2.5 py-1 rounded-small border transition-all ${remixTarget === "full" ? "border-primary-300 text-primary-700 bg-primary-50 font-semibold" : "border-neutral-200 text-neutral-500 hover:border-primary-200 hover:text-primary-600 bg-background-50"}`}
                  >
                    Full email
                  </button>
                  <button
                    onClick={() => setRemixTarget("selection")}
                    disabled={!remixRangeRef.current}
                    className={`text-xs px-2.5 py-1 rounded-small border transition-all ${remixTarget === "selection" ? "border-primary-300 text-primary-700 bg-primary-50 font-semibold" : "border-neutral-200 text-neutral-500 hover:border-primary-200 hover:text-primary-600 bg-background-50"} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {remixRangeRef.current
                      ? `Selection (${remixRangeRef.current.toString().trim().split(/\s+/).filter(Boolean).length} words)`
                      : "Selection — highlight text first"}
                  </button>
                </div>
                {remixTarget === "selection" && remixRangeRef.current && (
                  <span className="ml-auto text-xs text-neutral-400 italic truncate max-w-[180px]">
                    "{remixRangeRef.current.toString().trim().slice(0, 60)}{remixRangeRef.current.toString().trim().length > 60 ? "…" : ""}"
                  </span>
                )}
              </div>

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

              {/* Style Preset dropdown + Settings row */}
              <div className="px-6 py-3.5 border-b border-neutral-200 bg-background-50">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-neutral-500">Style</span>
                    <select
                      className="toolbar-select"
                      value={selectedPreset ?? ""}
                      onChange={(e) => setSelectedPreset((e.target.value as StylePreset) || null)}
                      style={{ maxWidth: 140 }}
                    >
                      <option value="">None</option>
                      {STYLE_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="w-px h-5 bg-neutral-200 flex-shrink-0" />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-neutral-500">Length</span>
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
                  onClick={() => { setActivePanel(null); setTimeout(() => bodyRef.current?.focus(), 80); }}
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

              {/* Waveform — always visible */}
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

              {/* ── Phase: AI formatting loading ── */}
              {dictateFormatting && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 px-6">
                  <svg className="animate-spin w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <p className="text-sm font-medium text-neutral-600">Formatting your email…</p>
                  <p className="text-xs text-neutral-400 text-center">AI is turning your dictation into a perfectly structured email</p>
                </div>
              )}

              {/* ── Phase: Formatted preview ── */}
              {!dictateFormatting && dictateFormatted !== null && (
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 ai-gradient-bg rounded-small flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-neutral-800">Formatted Email</h3>
                    <span className="text-xs text-neutral-400 ml-auto">{dictateFormatted.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <div className="bg-background-100 border border-neutral-200 rounded-large p-4 shadow-custom" style={{ minHeight: 160, maxHeight: 400, overflowY: "auto" }}>
                    <div className="text-sm text-neutral-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: remixTextToHtml(dictateFormatted) }} />
                  </div>
                  {dictateFormatError && (
                    <p className="mt-2 text-xs text-primary-700 bg-primary-50 border border-primary-200 rounded-small px-3 py-2">{dictateFormatError}</p>
                  )}
                </div>
              )}

              {/* ── Phase: Recording UI (transcript + controls + settings + stats) ── */}
              {!dictateFormatting && dictateFormatted === null && (<>

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

                {!sigName && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No signature set —{" "}
                    <a href="/signatures" className="underline hover:text-neutral-600 transition-colors">add one in Signatures →</a>
                  </p>
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

              </>)}

            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-neutral-200 bg-background-50 px-6 py-4">
              <div className="flex items-center gap-3">

                {/* Phase: preview — Retake | Insert */}
                {!dictateFormatting && dictateFormatted !== null ? (<>
                  <button
                    onClick={restartRecording}
                    className="flex items-center gap-2 border border-neutral-200 text-neutral-600 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-colors shadow-custom flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retake
                  </button>
                  <button
                    onClick={insertDictated}
                    className="flex-1 flex items-center justify-center gap-2 ai-gradient-bg text-white font-semibold text-sm py-2.5 px-5 rounded-small transition-all shadow-custom hover:shadow-custom-hover"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Insert into Email
                  </button>
                </>) : (<>

                {/* Phase: recording / formatting — Discard | Generate Email */}
                  <button
                    onClick={() => { stopRecording(); setTranscript(""); setInterimTranscript(""); setDictateFormatted(null); setActivePanel(null); }}
                    className="flex items-center gap-2 border border-neutral-200 text-neutral-600 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-colors shadow-custom flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Discard
                  </button>
                  <button
                    onClick={() => void generateEmail()}
                    disabled={(!transcript && !interimTranscript) || dictateFormatting}
                    className="flex-1 flex items-center justify-center gap-2 ai-gradient-bg text-white font-semibold text-sm py-2.5 px-5 rounded-small transition-all shadow-custom hover:shadow-custom-hover disabled:opacity-40"
                  >
                    {dictateFormatting ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {dictateFormatting ? "Formatting…" : "Generate Email"}
                  </button>
                </>)}
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
