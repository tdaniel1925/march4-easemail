"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Signature {
  id: string;
  name: string;
  html: string;
  defaultNew: boolean;
  defaultReplies: boolean;
  account: string;
}

const STORAGE_KEY = "easemail_signatures";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const SAMPLE: Signature[] = [
  {
    id: "sig-1",
    name: "Professional",
    html: `<p><strong>{{YOUR NAME}}</strong></p><p style="color:#6b7280">Attorney at Law &middot; Darren Miller Law Firm</p><p style="color:#8a0909">{{YOUR EMAIL}}</p>`,
    defaultNew: true,
    defaultReplies: false,
    account: "all",
  },
  {
    id: "sig-2",
    name: "Casual",
    html: `<p>&mdash; {{YOUR NAME}}</p><p style="color:#6b7280">{{YOUR EMAIL}}</p>`,
    defaultNew: false,
    defaultReplies: true,
    account: "all",
  },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: on ? "rgb(138 9 9)" : "rgb(212 212 212)" }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow"
        style={{ transform: on ? "translateX(24px)" : "translateX(2px)" }}
      />
    </button>
  );
}

// ─── Rich text toolbar button ─────────────────────────────────────────────────

function TBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-600 hover:bg-background-200 transition-colors"
    >
      {children}
    </button>
  );
}

// ─── Signature card ───────────────────────────────────────────────────────────

function SigCard({
  sig,
  selected,
  onSelect,
  onDelete,
}: {
  sig: Signature;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const badge = sig.defaultNew
    ? { label: "Default", bg: "bg-tertiary-100", text: "text-tertiary-700", border: "border-tertiary-200" }
    : sig.defaultReplies
    ? { label: "Replies", bg: "bg-secondary-100", text: "text-secondary-700", border: "border-secondary-200" }
    : { label: "Manual", bg: "bg-neutral-100", text: "text-neutral-600", border: "border-neutral-200" };

  return (
    <div
      onClick={onSelect}
      className={`px-4 py-4 border-b border-neutral-200 cursor-pointer transition-colors ${
        selected ? "border-l-4 border-l-primary-500 bg-primary-50" : "hover:bg-background-100"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-neutral-900">{sig.name}</span>
            <span className={`inline-flex items-center gap-1 ${badge.bg} ${badge.text} text-xs font-semibold px-2 py-0.5 rounded-small border ${badge.border}`}>
              {sig.defaultNew && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            {sig.defaultNew ? "Used for new emails" : sig.defaultReplies ? "Used for replies & forwards" : "Manually assigned"}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onSelect}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-200 rounded-small transition-colors"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mini preview */}
      <div
        className={`${selected ? "bg-background-50 border-primary-200" : "bg-background-100 border-neutral-200"} border rounded-large p-3 mt-2 text-xs pointer-events-none`}
        dangerouslySetInnerHTML={{ __html: sig.html.slice(0, 200) }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SignaturesClient({ userEmail }: { userEmail: string }) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSigName, setNewSigName] = useState("");
  const [newFrom, setNewFrom] = useState<"blank" | "copy">("blank");
  const [copySrcId, setCopySrcId] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Editor fields (mirror of selected signature)
  const [editName, setEditName] = useState("");
  const [editDefaultNew, setEditDefaultNew] = useState(false);
  const [editDefaultReplies, setEditDefaultReplies] = useState(false);
  const [editAccount, setEditAccount] = useState("all");

  const editorRef = useRef<HTMLDivElement>(null);

  // ── Load from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Signature[] = JSON.parse(raw);
        setSignatures(parsed);
        if (parsed.length > 0) selectSig(parsed[0], false);
      } else {
        setSignatures(SAMPLE);
        selectSig(SAMPLE[0], false);
      }
    } catch {
      setSignatures(SAMPLE);
      selectSig(SAMPLE[0], false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(sigs: Signature[]) {
    setSignatures(sigs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sigs));
  }

  function selectSig(sig: Signature, focus = true) {
    setSelectedId(sig.id);
    setEditName(sig.name);
    setEditDefaultNew(sig.defaultNew);
    setEditDefaultReplies(sig.defaultReplies);
    setEditAccount(sig.account);
    if (focus && editorRef.current) {
      editorRef.current.innerHTML = sig.html;
    }
  }

  // When selection changes, load HTML into editor
  useEffect(() => {
    const sig = signatures.find((s) => s.id === selectedId);
    if (sig && editorRef.current) {
      editorRef.current.innerHTML = sig.html;
    }
  }, [selectedId, signatures]);

  function handleSave() {
    if (!selectedId) return;
    const html = editorRef.current?.innerHTML ?? "";
    const updated = signatures.map((s) => {
      if (s.id !== selectedId) return s;
      return { ...s, name: editName.trim() || s.name, html, defaultNew: editDefaultNew, defaultReplies: editDefaultReplies, account: editAccount };
    });
    persist(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCreate() {
    if (!newSigName.trim()) return;
    const src = newFrom === "copy" && copySrcId ? signatures.find((s) => s.id === copySrcId) : null;
    const newSig: Signature = {
      id: makeId(),
      name: newSigName.trim(),
      html: src ? src.html : `<p><strong>${newSigName.trim()}</strong></p>`,
      defaultNew: false,
      defaultReplies: false,
      account: "all",
    };
    const updated = [...signatures, newSig];
    persist(updated);
    setShowNewModal(false);
    setNewSigName("");
    setNewFrom("blank");
    setCopySrcId("");
    selectSig(newSig);
  }

  function handleDelete(id: string) {
    const updated = signatures.filter((s) => s.id !== id);
    persist(updated);
    setDeleteConfirmId(null);
    if (selectedId === id) {
      if (updated.length > 0) {
        selectSig(updated[0]);
      } else {
        setSelectedId(null);
      }
    }
  }

  // Toolbar helpers
  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  }, []);

  const selected = signatures.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="flex flex-col flex-1" style={{ minWidth: 0, height: "100vh" }}>
      <div className="flex flex-1 overflow-hidden">

        {/* ── Settings Nav ── */}
        <aside className="flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col pt-6 px-3 gap-1" style={{ width: "12rem" }}>
          <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: "rgb(160 160 160)" }}>Settings</p>
          <Link href="/settings" className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100">Profile</Link>
          <Link href="/settings" className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100">Notifications</Link>
          <Link href="/settings" className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100">Appearance</Link>
          <div className="my-2 border-t border-neutral-100" />
          <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-1" style={{ color: "rgb(160 160 160)" }}>Email</p>
          <Link
            href="/signatures"
            className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-semibold transition-colors"
            style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(83 5 5)" }}
          >
            Signatures
          </Link>
          <Link href="/email-rules" className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100">Email Rules</Link>
          <div className="mt-auto pt-4">
            <a href="/api/auth/signout" className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors" style={{ color: "rgb(185 28 28)" }}>Sign Out</a>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 bg-background-50 border-b border-neutral-200 flex-shrink-0">
            <div>
              <h1 className="font-heading font-semibold text-neutral-900 text-xl">Signature Management</h1>
              <p className="text-xs text-neutral-500 mt-0.5">Manage your email signatures and assignment rules</p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-2.5 px-4 rounded-small compose-btn-glow transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Signature
            </button>
          </header>

          {/* Split panel */}
          <div className="flex flex-1 overflow-hidden">

            {/* Signature list panel */}
            <div className="w-80 flex-shrink-0 bg-background-50 border-r border-neutral-200 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
                <span className="text-sm font-semibold text-neutral-700">Saved Signatures</span>
                <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small">{signatures.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {signatures.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <p className="text-sm">No signatures yet</p>
                  </div>
                ) : (
                  signatures.map((sig) => (
                    <SigCard
                      key={sig.id}
                      sig={sig}
                      selected={sig.id === selectedId}
                      onSelect={() => selectSig(sig)}
                      onDelete={() => setDeleteConfirmId(sig.id)}
                    />
                  ))
                )}
              </div>
              <div className="px-4 py-3 border-t border-neutral-200 flex-shrink-0">
                <button
                  onClick={() => setShowNewModal(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-primary-600 font-medium py-2.5 px-4 rounded-small border border-dashed border-neutral-300 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Signature
                </button>
              </div>
            </div>

            {/* Editor panel */}
            {selected ? (
              <div className="flex-1 flex flex-col bg-background-100 overflow-y-auto">

                {/* Editor header */}
                <div className="px-6 py-4 bg-background-50 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-small flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-heading font-semibold text-neutral-900 text-base">{editName || selected.name}</h2>
                      <p className="text-xs text-neutral-500">Editing signature</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {saved && (
                      <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: "rgb(22 163 74)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                      </span>
                    )}
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold ai-gradient-bg text-neutral-50 rounded-small compose-btn-glow transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Editor body */}
                <div className="flex-1 px-6 py-5 space-y-5">

                  {/* Signature name */}
                  <section className="bg-background-50 rounded-large shadow-custom p-5">
                    <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Signature Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors"
                    />
                  </section>

                  {/* Rich text editor */}
                  <section className="bg-background-50 rounded-large shadow-custom overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-4 py-2.5 border-b border-neutral-200 flex items-center gap-1 flex-wrap">
                      <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
                        <TBtn title="Bold" onClick={() => exec("bold")}><strong>B</strong></TBtn>
                        <TBtn title="Italic" onClick={() => exec("italic")}><em>I</em></TBtn>
                        <TBtn title="Underline" onClick={() => exec("underline")}><u>U</u></TBtn>
                      </div>
                      <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
                        <TBtn title="Align left" onClick={() => exec("justifyLeft")}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                        </TBtn>
                        <TBtn title="Align center" onClick={() => exec("justifyCenter")}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </TBtn>
                        <TBtn title="Align right" onClick={() => exec("justifyRight")}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8M4 18h16" /></svg>
                        </TBtn>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <select
                          onChange={(e) => exec("fontSize", e.target.value)}
                          defaultValue="3"
                          className="text-xs text-neutral-600 bg-background-100 border border-neutral-200 rounded-small px-2 py-1 focus:outline-none focus:border-primary-300"
                        >
                          <option value="1">10px</option>
                          <option value="2">12px</option>
                          <option value="3">14px</option>
                          <option value="4">16px</option>
                          <option value="5">18px</option>
                        </select>
                      </div>
                    </div>
                    {/* Editor area */}
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      className="p-5 bg-background-50 text-sm text-neutral-800 focus:outline-none"
                      style={{ minHeight: 200 }}
                    />
                  </section>

                  {/* Assignment controls */}
                  <section className="bg-background-50 rounded-large shadow-custom p-5">
                    <h3 className="font-heading font-semibold text-neutral-800 text-sm mb-4">Assignment Controls</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium text-neutral-800">Default for new emails</p>
                          <p className="text-xs text-neutral-500 mt-0.5">Automatically append to all new composed emails</p>
                        </div>
                        <Toggle on={editDefaultNew} onChange={setEditDefaultNew} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium text-neutral-800">Default for replies &amp; forwards</p>
                          <p className="text-xs text-neutral-500 mt-0.5">Append to reply and forwarded email threads</p>
                        </div>
                        <Toggle on={editDefaultReplies} onChange={setEditDefaultReplies} />
                      </div>
                      <div className="flex items-start justify-between pt-1 border-t border-neutral-100">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium text-neutral-800">Assign to account</p>
                          <p className="text-xs text-neutral-500 mt-0.5">Apply this signature to a specific email account</p>
                        </div>
                        <select
                          value={editAccount}
                          onChange={(e) => setEditAccount(e.target.value)}
                          className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-1.5 focus:outline-none focus:border-primary-300 flex-shrink-0"
                        >
                          <option value="all">All accounts</option>
                          <option value={userEmail}>{userEmail}</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Live preview */}
                  <section className="bg-background-50 rounded-large shadow-custom overflow-hidden">
                    <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm font-semibold text-neutral-700">Live Preview</span>
                      </div>
                      <span className="text-xs text-neutral-400">How it appears in emails</span>
                    </div>
                    <div className="p-5 bg-background-100">
                      <div className="bg-background-50 rounded-large border border-neutral-200 p-4">
                        <p className="text-xs text-neutral-400 mb-3 pb-2 border-b border-neutral-100">— Your message above —</p>
                        <div className="border-l-2 border-neutral-200 pl-3 text-sm">
                          <div dangerouslySetInnerHTML={{ __html: selected.html }} />
                        </div>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <p className="text-sm">Select a signature to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── New Signature Modal ── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-40">
          <div className="bg-background-50 rounded-large shadow-custom-hover w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h3 className="font-heading font-semibold text-neutral-900 text-base">Create New Signature</h3>
              <button onClick={() => { setShowNewModal(false); setNewSigName(""); }} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Signature Name</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Professional, Casual, Marketing…"
                  value={newSigName}
                  onChange={(e) => setNewSigName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full px-3 py-2.5 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Start From</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewFrom("blank")}
                    className={`flex flex-col items-center gap-2 p-3 border-2 rounded-large text-center cursor-pointer transition-colors ${newFrom === "blank" ? "border-primary-300 bg-primary-50" : "border-neutral-200 bg-background-100 hover:border-primary-200 hover:bg-primary-50"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${newFrom === "blank" ? "text-primary-600" : "text-neutral-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={`text-xs font-semibold ${newFrom === "blank" ? "text-primary-700" : "text-neutral-600"}`}>Blank</span>
                  </button>
                  <button
                    onClick={() => setNewFrom("copy")}
                    className={`flex flex-col items-center gap-2 p-3 border-2 rounded-large text-center cursor-pointer transition-colors ${newFrom === "copy" ? "border-primary-300 bg-primary-50" : "border-neutral-200 bg-background-100 hover:border-primary-200 hover:bg-primary-50"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${newFrom === "copy" ? "text-primary-600" : "text-neutral-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-xs font-semibold ${newFrom === "copy" ? "text-primary-700" : "text-neutral-600"}`}>Copy Existing</span>
                  </button>
                </div>
              </div>
              {newFrom === "copy" && signatures.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Copy From</label>
                  <select
                    value={copySrcId || signatures[0].id}
                    onChange={(e) => setCopySrcId(e.target.value)}
                    className="w-full text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300"
                  >
                    {signatures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button onClick={() => { setShowNewModal(false); setNewSigName(""); }} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newSigName.trim()}
                className="px-4 py-2 text-sm font-semibold ai-gradient-bg text-neutral-50 rounded-small compose-btn-glow transition-all disabled:opacity-40"
              >
                Create Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-40">
          <div className="bg-background-50 rounded-large shadow-custom-hover w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-5">
              <h3 className="font-heading font-semibold text-neutral-900 text-base mb-2">Delete Signature?</h3>
              <p className="text-sm text-neutral-500">This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-semibold text-white rounded-small transition-all"
                style={{ backgroundColor: "rgb(138 9 9)" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
