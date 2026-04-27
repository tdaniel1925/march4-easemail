"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Sig {
  id: string;
  name: string;
  html: string;
  title: string | null;
  company: string | null;
  phone: string | null;
  defaultNew: boolean;
  defaultReplies: boolean;
  account: string;
  isDefault: boolean;
  createdAt: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

// ─── Rich Editor ──────────────────────────────────────────────────────────────

function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skipRef = useRef(false);

  useEffect(() => {
    if (ref.current && !skipRef.current) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value;
      }
    }
    skipRef.current = false;
  }, [value]);

  function onInput() {
    skipRef.current = true;
    onChange(ref.current?.innerHTML ?? "");
  }

  function execCmd(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  }

  function insertLink() {
    const url = window.prompt("Enter URL", "https://");
    if (url) execCmd("createLink", url);
  }

  return (
    <div className="border border-neutral-200 rounded-[10px] overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-neutral-100 bg-neutral-50">
        {(
          [
            { cmd: "bold", title: "Bold", label: <strong>B</strong> },
            { cmd: "italic", title: "Italic", label: <em>I</em> },
            { cmd: "underline", title: "Underline", label: <span className="underline">U</span> },
          ] as { cmd: string; title: string; label: React.ReactNode }[]
        ).map(({ cmd, title, label }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            onMouseDown={(e) => {
              e.preventDefault();
              execCmd(cmd);
            }}
            className="flex items-center justify-center w-7 h-7 rounded text-neutral-600 hover:bg-neutral-100 transition-colors text-sm font-medium"
          >
            {label}
          </button>
        ))}
        <div className="w-px h-4 bg-neutral-200 mx-1" />
        <button
          type="button"
          title="Insert Link"
          onMouseDown={(e) => {
            e.preventDefault();
            insertLink();
          }}
          className="flex items-center justify-center w-7 h-7 rounded text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <div className="w-px h-4 bg-neutral-200 mx-1" />
        <button
          type="button"
          title="Clear formatting"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("removeFormat");
          }}
          className="flex items-center justify-center w-7 h-7 rounded text-neutral-400 hover:bg-neutral-100 transition-colors text-xs"
        >
          T<sub>x</sub>
        </button>
      </div>

      {/* Editable body */}
      <div
        ref={ref}
        contentEditable
        onInput={onInput}
        suppressContentEditableWarning
        className="min-h-[120px] px-3 py-2.5 text-sm text-neutral-800 outline-none leading-relaxed"
        style={{ caretColor: "rgb(138 9 9)" }}
      />
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: "rgb(27 29 29)" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgb(115 115 115)" }}>
          {desc}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none mt-0.5"
        style={{ backgroundColor: checked ? "rgb(138 9 9)" : "rgb(212 212 212)" }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Signature Editor Panel ───────────────────────────────────────────────────

function SigEditor({
  sig,
  onSave,
  onDelete,
  onCancel,
  isNew,
}: {
  sig: Partial<Sig>;
  onSave: (data: Partial<Sig>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<Partial<Sig>>(sig);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof Sig>(k: K, v: Sig[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.name?.trim()) {
      setError("Signature name is required.");
      return;
    }
    setError("");
    setSaveState("saving");
    try {
      await onSave(form);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setSaveState("error");
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setSaveState("saving");
    try {
      await onDelete();
    } catch {
      setSaveState("error");
      setError("Delete failed.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgb(82 82 82)" }}>
          Signature Name *
        </label>
        <input
          type="text"
          value={form.name ?? ""}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="My Work Signature"
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-[10px] bg-neutral-50 outline-none focus:border-primary-400 transition-colors"
          style={{ color: "rgb(27 29 29)" }}
        />
      </div>

      {/* HTML body editor */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgb(82 82 82)" }}>
          Signature Content
        </label>
        <RichEditor
          value={form.html ?? ""}
          onChange={(html) => setField("html", html)}
        />
        <p className="text-xs mt-1" style={{ color: "rgb(160 160 160)" }}>
          Format with Bold, Italic, Underline, or Link. HTML is saved as-is.
        </p>
      </div>

      {/* Quick fields */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { key: "title" as keyof Sig, placeholder: "Senior Attorney", label: "Title" },
            { key: "company" as keyof Sig, placeholder: "Smith & Associates", label: "Company" },
            { key: "phone" as keyof Sig, placeholder: "+1 (312) 555-0100", label: "Phone" },
          ]
        ).map(({ key, placeholder, label }) => (
          <div key={key as string}>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgb(82 82 82)" }}>
              {label}{" "}
              <span className="font-normal" style={{ color: "rgb(160 160 160)" }}>
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={(form[key] as string | null | undefined) ?? ""}
              onChange={(e) => setField(key, e.target.value as never)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-[10px] bg-neutral-50 outline-none focus:border-primary-400 transition-colors"
              style={{ color: "rgb(27 29 29)" }}
            />
          </div>
        ))}
      </div>

      {/* Toggles */}
      <div className="rounded-[14px] border border-neutral-200 bg-white divide-y divide-neutral-100">
        <div className="p-4">
          <Toggle
            checked={form.isDefault ?? false}
            onChange={(v) => setField("isDefault", v)}
            label="Default signature"
            desc="Fallback when no specific rule matches. Only one can be default."
          />
        </div>
        <div className="p-4">
          <Toggle
            checked={form.defaultNew ?? false}
            onChange={(v) => setField("defaultNew", v)}
            label="Auto-insert on new emails"
            desc="Automatically appended when composing a new email."
          />
        </div>
        <div className="p-4">
          <Toggle
            checked={form.defaultReplies ?? false}
            onChange={(v) => setField("defaultReplies", v)}
            label="Auto-insert on replies &amp; forwards"
            desc="Automatically appended when replying or forwarding an email."
          />
        </div>
      </div>

      {/* Live preview */}
      {(form.name?.trim() || form.html?.trim()) && (
        <div className="rounded-[10px] border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold mb-2" style={{ color: "rgb(160 160 160)" }}>
            PREVIEW
          </p>
          <div className="w-8 h-px bg-neutral-300 mb-2" />
          {form.html?.trim() ? (
            <div
              className="text-sm text-neutral-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: form.html }}
            />
          ) : (
            <>
              {form.name && (
                <p className="text-sm text-neutral-700">{form.name}</p>
              )}
              {form.title && (
                <p className="text-xs text-neutral-500 mt-0.5">{form.title}</p>
              )}
              {form.company && (
                <p className="text-xs text-neutral-500">{form.company}</p>
              )}
              {form.phone && (
                <p className="text-xs text-neutral-500">{form.phone}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Inline error */}
      {error && (
        <p className="text-xs px-3 py-2 bg-red-50 border border-red-200 rounded-[8px] text-red-700">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveState === "saving"}
            className="px-4 py-2 text-sm font-semibold text-white rounded-[10px] transition-colors disabled:opacity-50"
            style={{ backgroundColor: "rgb(138 9 9)" }}
          >
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
              ? "Saved ✓"
              : isNew
              ? "Create Signature"
              : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-[10px] hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {!isNew && onDelete && (
          <div className="flex items-center gap-2">
            {deleteConfirm ? (
              <>
                <span className="text-xs text-neutral-500">Are you sure?</span>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-[8px] hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  Keep
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="text-xs text-neutral-400 hover:text-red-600 transition-colors"
              >
                Delete signature
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar row ──────────────────────────────────────────────────────────────

function SigRow({
  sig,
  active,
  onClick,
}: {
  sig: Sig;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-[10px] border transition-all"
      style={{
        borderColor: active ? "rgb(252 165 165)" : "rgb(229 229 229)",
        backgroundColor: active ? "rgb(254 242 242)" : "rgb(255 255 255)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: active ? "rgb(138 9 9)" : "rgb(27 29 29)" }}
          >
            {sig.name}
          </p>
          {(sig.title ?? sig.company) && (
            <p className="text-xs truncate mt-0.5" style={{ color: "rgb(115 115 115)" }}>
              {[sig.title, sig.company].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {sig.isDefault && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: "rgb(138 9 9)", backgroundColor: "rgb(254 242 242)" }}
            >
              Default
            </span>
          )}
          {sig.defaultNew && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
              New
            </span>
          )}
          {sig.defaultReplies && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
              Replies
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
        style={{ backgroundColor: "rgb(254 242 242)" }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "rgb(138 9 9)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: "rgb(27 29 29)" }}>
        No signatures yet
      </p>
      <p className="text-sm mb-4" style={{ color: "rgb(115 115 115)" }}>
        Create a signature to automatically append to your emails.
      </p>
      <button
        type="button"
        onClick={onNew}
        className="px-4 py-2 text-sm font-semibold text-white rounded-[10px] transition-colors"
        style={{ backgroundColor: "rgb(138 9 9)" }}
      >
        Create your first signature
      </button>
    </div>
  );
}

// ─── Blank template ───────────────────────────────────────────────────────────

const BLANK_SIG: Partial<Sig> = {
  name: "",
  html: "",
  title: "",
  company: "",
  phone: "",
  isDefault: false,
  defaultNew: false,
  defaultReplies: false,
  account: "all",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignaturesPage() {
  const [sigs, setSigs] = useState<Sig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/signatures");
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data = (await res.json()) as Sig[];
      setSigs(data);
      setSelected((prev) => {
        if (prev === "new") return prev;
        const still = data.find((s) => s.id === prev);
        return still ? prev : (data[0]?.id ?? null);
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(data: Partial<Sig>) {
    if (selected === "new") {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to create.");
      }
      const created = (await res.json()) as Sig;
      await load();
      setSelected(created.id);
    } else if (selected) {
      const res = await fetch(`/api/signatures/${selected}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to save.");
      }
      await load();
    }
  }

  async function handleDelete() {
    if (!selected || selected === "new") return;
    const res = await fetch(`/api/signatures/${selected}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete.");
    await load();
    setSelected(null);
  }

  const activeSig =
    selected === "new"
      ? BLANK_SIG
      : (sigs.find((s) => s.id === selected) ?? null);

  const showEmpty = !loading && !loadError && sigs.length === 0 && selected !== "new";

  return (
    <div className="flex flex-col flex-1" style={{ minWidth: 0, height: "100vh" }}>
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside
          className="flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col"
          style={{ width: "16rem" }}
        >
          <div className="px-4 pt-6 pb-3 flex items-center justify-between">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "rgb(160 160 160)" }}
            >
              Signatures
            </p>
            <button
              type="button"
              onClick={() => setSelected("new")}
              title="New Signature"
              className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:bg-neutral-100 transition-colors"
              style={{ color: "rgb(138 9 9)" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <svg
                  className="w-5 h-5 animate-spin text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth={4}
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>
            ) : loadError ? (
              <p className="text-xs text-red-600 px-2 py-3">{loadError}</p>
            ) : (
              <>
                {sigs.map((s) => (
                  <SigRow
                    key={s.id}
                    sig={s}
                    active={selected === s.id}
                    onClick={() => setSelected(s.id)}
                  />
                ))}
                {selected === "new" && (
                  <div
                    className="px-4 py-3 rounded-[10px] border border-dashed"
                    style={{ borderColor: "rgb(252 165 165)", backgroundColor: "rgb(254 242 242)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "rgb(138 9 9)" }}>
                      New Signature
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-3 pb-4 border-t border-neutral-100 pt-3">
            <button
              type="button"
              onClick={() => setSelected("new")}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-dashed border-neutral-300 rounded-[10px] text-neutral-500 hover:border-red-300 hover:text-red-700 hover:bg-red-50 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Signature
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          <div className="px-8 pt-6 pb-4 border-b border-neutral-200 bg-white">
            <h1
              className="text-lg font-semibold"
              style={{ color: "rgb(27 29 29)" }}
            >
              Email Signatures
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgb(115 115 115)" }}>
              Create and manage signatures that automatically appear in your emails.
            </p>
          </div>

          <div className="px-8 py-6 max-w-2xl">
            {showEmpty ? (
              <EmptyState onNew={() => setSelected("new")} />
            ) : selected === null ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-neutral-400">Select a signature to edit.</p>
              </div>
            ) : activeSig !== null ? (
              <SigEditor
                key={selected}
                sig={activeSig}
                isNew={selected === "new"}
                onSave={handleSave}
                onDelete={selected !== "new" ? handleDelete : undefined}
                onCancel={() => setSelected(sigs[0]?.id ?? null)}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
