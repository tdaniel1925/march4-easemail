"use client";

import { useState, useEffect, useCallback } from "react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string | null;
  body: string;
  variables: string[];
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [varInput, setVarInput] = useState("");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const categories = Array.from(new Set(templates.map((t) => t.category).filter(Boolean))) as string[];

  const filteredTemplates = filterCategory
    ? templates.filter((t) => t.category === filterCategory)
    : templates;

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setName("");
    setSubject("");
    setBody("");
    setVariables([]);
    setCategory("");
    setVarInput("");
    setError(null);
  }

  function openEdit(t: EmailTemplate) {
    setIsNew(false);
    setEditing(t);
    setName(t.name);
    setSubject(t.subject ?? "");
    setBody(t.body);
    setVariables(t.variables);
    setCategory(t.category ?? "");
    setVarInput("");
    setError(null);
  }

  function closeEditor() {
    setEditing(null);
    setIsNew(false);
    setError(null);
  }

  function addVariable() {
    const v = varInput.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (v && !variables.includes(v)) {
      setVariables([...variables, v]);
      // Insert placeholder in body
      setBody((prev) => prev + `{{${v}}}`);
    }
    setVarInput("");
  }

  function removeVariable(v: string) {
    setVariables(variables.filter((x) => x !== v));
  }

  async function handleSave() {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!body.trim()) { setError("Body is required"); return; }
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        subject: subject.trim() || null,
        body: body.trim(),
        variables,
        category: category.trim() || null,
      };

      let res: Response;
      if (isNew) {
        res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/templates/${editing!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
        return;
      }

      await fetchTemplates();
      closeEditor();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setDeleteConfirmId(null);
    await fetchTemplates();
  }

  const showEditor = isNew || editing !== null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Email Templates</h1>
          <p className="text-sm text-neutral-500 mt-1">Create reusable templates with variable placeholders</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 text-white font-medium text-sm py-2.5 px-4 rounded-[10px] transition-colors"
          style={{ backgroundColor: "rgb(138 9 9)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(110 7 7)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(138 9 9)")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </button>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-neutral-400">Filter:</span>
          <button
            onClick={() => setFilterCategory("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filterCategory ? "border-[rgb(138,9,9)] text-[rgb(138,9,9)] bg-red-50" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterCategory === cat ? "border-[rgb(138,9,9)] text-[rgb(138,9,9)] bg-red-50" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Template list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-[10px] bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="font-medium">No templates yet</p>
          <p className="text-sm mt-1">Create your first template to speed up composing emails</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTemplates.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-[10px] hover:border-neutral-300 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-neutral-900 truncate">{t.name}</h3>
                  {t.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">{t.category}</span>
                  )}
                </div>
                {t.subject && <p className="text-xs text-neutral-500 mt-0.5 truncate">Subject: {t.subject}</p>}
                <p className="text-xs text-neutral-400 mt-1 truncate">{t.body.replace(/<[^>]*>/g, "").slice(0, 100)}</p>
                {t.variables.length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    {t.variables.map((v) => (
                      <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">{`{{${v}}}`}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(t)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(t.id)}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-[14px] shadow-xl border border-neutral-200 p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-neutral-900 text-base mb-1.5">Delete template?</h3>
            <p className="text-sm text-neutral-500 mb-5">This action cannot be undone.</p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-[8px] hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white rounded-[8px] transition-colors"
                style={{ backgroundColor: "rgb(220 38 38)" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-[14px] shadow-xl border border-neutral-200 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Editor header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-semibold text-lg text-neutral-900">
                {isNew ? "New Template" : "Edit Template"}
              </h2>
              <button onClick={closeEditor} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Editor body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">{error}</div>
              )}

              <div>
                <label className="text-xs font-semibold text-neutral-500 mb-1 block">Template Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Client Follow-up"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-[8px] focus:outline-none focus:border-[rgb(138,9,9)] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 mb-1 block">Category (optional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Legal, Sales, HR"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-[8px] focus:outline-none focus:border-[rgb(138,9,9)] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 mb-1 block">Subject (optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Follow-up: {{matterNumber}}"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-[8px] focus:outline-none focus:border-[rgb(138,9,9)] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-500 mb-1 block">Body *</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your template body here. Use {{variableName}} for placeholders."
                  rows={10}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-[8px] focus:outline-none focus:border-[rgb(138,9,9)] transition-colors resize-y font-mono"
                />
              </div>

              {/* Variables */}
              <div>
                <label className="text-xs font-semibold text-neutral-500 mb-1 block">Variables</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={varInput}
                    onChange={(e) => setVarInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariable(); } }}
                    placeholder="variableName"
                    className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-[8px] focus:outline-none focus:border-[rgb(138,9,9)] transition-colors font-mono"
                  />
                  <button
                    onClick={addVariable}
                    className="px-3 py-2 text-sm font-medium text-white rounded-[8px] transition-colors"
                    style={{ backgroundColor: "rgb(138 9 9)" }}
                  >
                    Add
                  </button>
                </div>
                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-mono">
                        {`{{${v}}}`}
                        <button onClick={() => removeVariable(v)} className="text-blue-400 hover:text-blue-700">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Editor footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200">
              <button
                onClick={closeEditor}
                className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-[8px] hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white rounded-[8px] transition-colors disabled:opacity-50"
                style={{ backgroundColor: "rgb(138 9 9)" }}
              >
                {saving ? "Saving..." : isNew ? "Create Template" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
