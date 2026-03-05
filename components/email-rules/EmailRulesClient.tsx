"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConditionField = "subject" | "from" | "to" | "keywords";
type ConditionOperator = "contains" | "is" | "starts_with" | "ends_with" | "not_contains";
type ActionType = "archive" | "label" | "forward" | "mark_important" | "skip_inbox" | "mark_read" | "delete";
type Logic = "AND" | "OR";

interface Condition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
  logic: Logic;
}

interface RuleAction {
  id: string;
  type: ActionType;
  value: string;
}

interface Rule {
  id: string;
  name: string;
  priority: number;
  active: boolean;
  conditions: Condition[];
  actions: RuleAction[];
  emailCount: number;
  stopProcessing: boolean;
}

const STORAGE_KEY = "easemail_rules";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const SAMPLE_RULES: Rule[] = [
  {
    id: "r1", name: "Work Newsletters → Archive", priority: 1, active: true, emailCount: 142, stopProcessing: false,
    conditions: [
      { id: "c1", field: "subject", operator: "contains", value: "newsletter", logic: "OR" },
      { id: "c2", field: "subject", operator: "contains", value: "digest", logic: "AND" },
    ],
    actions: [
      { id: "a1", type: "archive", value: "" },
      { id: "a2", type: "label", value: "Newsletters" },
    ],
  },
  {
    id: "r2", name: "VIP Clients → Priority Label", priority: 2, active: true, emailCount: 38, stopProcessing: false,
    conditions: [
      { id: "c3", field: "from", operator: "contains", value: "@acmecorp.com", logic: "OR" },
      { id: "c4", field: "from", operator: "contains", value: "@bigclient.io", logic: "AND" },
    ],
    actions: [
      { id: "a3", type: "label", value: "VIP" },
      { id: "a4", type: "mark_important", value: "" },
    ],
  },
  {
    id: "r3", name: "Internal Team Emails → Skip Inbox", priority: 3, active: false, emailCount: 0, stopProcessing: false,
    conditions: [
      { id: "c5", field: "from", operator: "contains", value: "@firm.law", logic: "AND" },
    ],
    actions: [
      { id: "a5", type: "skip_inbox", value: "" },
      { id: "a6", type: "mark_read", value: "" },
    ],
  },
];

// ─── Chip labels ──────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<ConditionField, string> = {
  subject: "Subject",
  from: "From",
  to: "To",
  keywords: "Keywords",
};

const OP_LABELS: Record<ConditionOperator, string> = {
  contains: "contains",
  is: "is",
  starts_with: "starts with",
  ends_with: "ends with",
  not_contains: "does not contain",
};

const ACTION_LABELS: Record<ActionType, string> = {
  archive: "Archive",
  label: "Label",
  forward: "Forward",
  mark_important: "Mark Important",
  skip_inbox: "Skip Inbox",
  mark_read: "Mark Read",
  delete: "Delete",
};

const ACTION_COLORS: Record<ActionType, { bg: string; text: string; border: string }> = {
  archive: { bg: "bg-primary-100", text: "text-primary-700", border: "border-primary-200" },
  label: { bg: "bg-secondary-100", text: "text-secondary-700", border: "border-secondary-200" },
  forward: { bg: "bg-neutral-100", text: "text-neutral-700", border: "border-neutral-200" },
  mark_important: { bg: "bg-tertiary-100", text: "text-tertiary-700", border: "border-tertiary-200" },
  skip_inbox: { bg: "bg-neutral-100", text: "text-neutral-600", border: "border-neutral-200" },
  mark_read: { bg: "bg-neutral-100", text: "text-neutral-600", border: "border-neutral-200" },
  delete: { bg: "bg-primary-100", text: "text-primary-700", border: "border-primary-200" },
};

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

// ─── Rule Form (shared between new + edit modal) ──────────────────────────────

interface RuleFormState {
  name: string;
  conditions: Condition[];
  actions: RuleAction[];
  stopProcessing: boolean;
}

function emptyForm(): RuleFormState {
  return {
    name: "",
    conditions: [{ id: makeId(), field: "subject", operator: "contains", value: "", logic: "AND" }],
    actions: [{ id: makeId(), type: "archive", value: "" }],
    stopProcessing: false,
  };
}

function ruleToForm(rule: Rule): RuleFormState {
  return { name: rule.name, conditions: rule.conditions, actions: rule.actions, stopProcessing: rule.stopProcessing };
}

function RuleForm({ form, onChange }: { form: RuleFormState; onChange: (f: RuleFormState) => void }) {
  function setName(name: string) { onChange({ ...form, name }); }
  function setStopProcessing(v: boolean) { onChange({ ...form, stopProcessing: v }); }

  function updateCondition(id: string, updates: Partial<Condition>) {
    onChange({ ...form, conditions: form.conditions.map((c) => c.id === id ? { ...c, ...updates } : c) });
  }
  function addCondition() {
    onChange({ ...form, conditions: [...form.conditions, { id: makeId(), field: "subject", operator: "contains", value: "", logic: "AND" }] });
  }
  function removeCondition(id: string) {
    if (form.conditions.length === 1) return;
    onChange({ ...form, conditions: form.conditions.filter((c) => c.id !== id) });
  }

  function updateAction(id: string, updates: Partial<RuleAction>) {
    onChange({ ...form, actions: form.actions.map((a) => a.id === id ? { ...a, ...updates } : a) });
  }
  function addAction() {
    onChange({ ...form, actions: [...form.actions, { id: makeId(), type: "mark_read", value: "" }] });
  }
  function removeAction(id: string) {
    if (form.actions.length === 1) return;
    onChange({ ...form, actions: form.actions.filter((a) => a.id !== id) });
  }

  return (
    <div className="space-y-5">
      {/* Rule name */}
      <div>
        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Rule Name</label>
        <input
          type="text"
          autoFocus
          value={form.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Work Newsletters → Archive"
          className="w-full px-3 py-2.5 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors"
        />
      </div>

      {/* Conditions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Conditions (IF)</label>
          <button onClick={addCondition} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add condition
          </button>
        </div>
        <div className="space-y-2">
          {form.conditions.map((cond, idx) => (
            <div key={cond.id} className="flex items-center gap-2 flex-wrap">
              {idx > 0 && (
                <select
                  value={form.conditions[idx - 1].logic}
                  onChange={(e) => updateCondition(form.conditions[idx - 1].id, { logic: e.target.value as Logic })}
                  className="text-xs font-semibold text-neutral-500 bg-background-100 border border-neutral-200 rounded-small px-2 py-1 focus:outline-none focus:border-primary-300"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}
              <select
                value={cond.field}
                onChange={(e) => updateCondition(cond.id, { field: e.target.value as ConditionField })}
                className="text-xs text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-2 py-1.5 focus:outline-none focus:border-primary-300"
              >
                <option value="subject">Subject</option>
                <option value="from">From</option>
                <option value="to">To</option>
                <option value="keywords">Keywords</option>
              </select>
              <select
                value={cond.operator}
                onChange={(e) => updateCondition(cond.id, { operator: e.target.value as ConditionOperator })}
                className="text-xs text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-2 py-1.5 focus:outline-none focus:border-primary-300"
              >
                <option value="contains">contains</option>
                <option value="is">is</option>
                <option value="starts_with">starts with</option>
                <option value="ends_with">ends with</option>
                <option value="not_contains">does not contain</option>
              </select>
              <input
                type="text"
                value={cond.value}
                onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                placeholder="value…"
                className="flex-1 min-w-24 px-2 py-1.5 text-xs bg-background-100 border border-neutral-200 rounded-small text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-300 transition-colors"
              />
              {form.conditions.length > 1 && (
                <button onClick={() => removeCondition(cond.id)} className="p-1 text-neutral-400 hover:text-primary-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions (THEN)</label>
          <button onClick={addAction} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add action
          </button>
        </div>
        <div className="space-y-2">
          {form.actions.map((action) => (
            <div key={action.id} className="flex items-center gap-2 flex-wrap">
              <select
                value={action.type}
                onChange={(e) => updateAction(action.id, { type: e.target.value as ActionType, value: "" })}
                className="text-xs text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-2 py-1.5 focus:outline-none focus:border-primary-300"
              >
                <option value="archive">Archive</option>
                <option value="label">Label as…</option>
                <option value="forward">Forward to…</option>
                <option value="mark_important">Mark Important</option>
                <option value="skip_inbox">Skip Inbox</option>
                <option value="mark_read">Mark as Read</option>
                <option value="delete">Delete</option>
              </select>
              {(action.type === "label" || action.type === "forward") && (
                <input
                  type="text"
                  value={action.value}
                  onChange={(e) => updateAction(action.id, { value: e.target.value })}
                  placeholder={action.type === "label" ? "Label name…" : "Email address…"}
                  className="flex-1 min-w-24 px-2 py-1.5 text-xs bg-background-100 border border-neutral-200 rounded-small text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-300 transition-colors"
                />
              )}
              {form.actions.length > 1 && (
                <button onClick={() => removeAction(action.id)} className="p-1 text-neutral-400 hover:text-primary-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stop processing */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
        <div>
          <p className="text-sm font-medium text-neutral-800">Stop processing more rules</p>
          <p className="text-xs text-neutral-500 mt-0.5">If this rule matches, skip all lower-priority rules</p>
        </div>
        <Toggle on={form.stopProcessing} onChange={setStopProcessing} />
      </div>
    </div>
  );
}

// ─── Rule card ────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onToggle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  rule: Rule;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`rule-card bg-background-50 rounded-large shadow-custom border overflow-hidden transition-colors ${isDragOver ? "border-primary-400 bg-primary-50" : "border-neutral-200"}`}
    >
      <div className="flex items-start gap-0">
        {/* Priority + drag handle */}
        <div className="flex flex-col items-center justify-center px-3 py-4 bg-background-100 border-r border-neutral-200 self-stretch gap-2 flex-shrink-0">
          <span className="text-xs font-bold text-neutral-400">#{rule.priority}</span>
          <button className="text-neutral-300 cursor-grab active:cursor-grabbing transition-colors" title="Drag to reorder">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>

        {/* Rule content */}
        <div className="flex-1 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Name + status badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-neutral-900">{rule.name}</span>
                {rule.active ? (
                  <span className="inline-flex items-center gap-1 bg-tertiary-100 text-tertiary-700 text-xs font-semibold px-2 py-0.5 rounded-small border border-tertiary-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-500 text-xs font-semibold px-2 py-0.5 rounded-small border border-neutral-200">
                    Inactive
                  </span>
                )}
              </div>

              {/* Conditions */}
              <div className="flex items-center flex-wrap gap-1.5 mb-2">
                <span className="text-xs text-neutral-500 font-medium mr-0.5">IF</span>
                {rule.conditions.map((cond, idx) => (
                  <span key={cond.id} className="flex items-center gap-1">
                    {idx > 0 && <span className="text-xs text-neutral-400 font-medium">{rule.conditions[idx - 1].logic}</span>}
                    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-small bg-background-200 text-neutral-700 border border-neutral-200">
                      {FIELD_LABELS[cond.field]} {OP_LABELS[cond.operator]} &quot;{cond.value}&quot;
                    </span>
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-xs text-neutral-500 font-medium mr-0.5">THEN</span>
                {rule.actions.map((action) => {
                  const colors = ACTION_COLORS[action.type];
                  return (
                    <span key={action.id} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-small border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {ACTION_LABELS[action.type]}{action.value ? `: ${action.value}` : ""}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-col gap-0.5">
                <button onClick={onMoveUp} disabled={!canMoveUp} className="p-1 text-neutral-300 hover:text-neutral-600 disabled:opacity-20 transition-colors" title="Move up">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={onMoveDown} disabled={!canMoveDown} className="p-1 text-neutral-300 hover:text-neutral-600 disabled:opacity-20 transition-colors" title="Move down">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <span className="text-xs text-neutral-400">{rule.emailCount > 0 ? `${rule.emailCount} emails` : "—"}</span>
              <Toggle on={rule.active} onChange={onToggle} />
              <button onClick={onEdit} className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-background-200 rounded-small transition-colors" title="Edit rule">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button onClick={onDelete} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors" title="Delete rule">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EmailRulesClient() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [newForm, setNewForm] = useState<RuleFormState>(emptyForm());
  const [editForm, setEditForm] = useState<RuleFormState>(emptyForm());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const dragIdRef = useRef<string>("");
  const [dragOverId, setDragOverId] = useState<string>("");

  // ── Load ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setRules(JSON.parse(raw));
      } else {
        setRules(SAMPLE_RULES);
      }
    } catch {
      setRules(SAMPLE_RULES);
    }
  }, []);

  function persist(updated: Rule[]) {
    setRules(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function reorder(arr: Rule[]): Rule[] {
    return arr.map((r, idx) => ({ ...r, priority: idx + 1 }));
  }

  // ── Filters ──
  const filtered = rules
    .filter((r) => {
      if (statusFilter === "active") return r.active;
      if (statusFilter === "inactive") return !r.active;
      return true;
    })
    .filter((r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // ── Stats ──
  const totalRules = rules.length;
  const activeRules = rules.filter((r) => r.active).length;
  const totalProcessed = rules.reduce((sum, r) => sum + r.emailCount, 0);

  // ── Mutations ──
  function toggleRule(id: string) {
    persist(rules.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  }

  function deleteRule(id: string) {
    persist(reorder(rules.filter((r) => r.id !== id)));
    setDeleteConfirmId(null);
  }

  function moveRule(id: string, direction: "up" | "down") {
    const idx = rules.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const newRules = [...rules];
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= newRules.length) return;
    [newRules[idx], newRules[swap]] = [newRules[swap], newRules[idx]];
    persist(reorder(newRules));
  }

  function handleCreate() {
    if (!newForm.name.trim()) return;
    const rule: Rule = {
      id: makeId(),
      name: newForm.name.trim(),
      priority: rules.length + 1,
      active: true,
      conditions: newForm.conditions,
      actions: newForm.actions,
      emailCount: 0,
      stopProcessing: newForm.stopProcessing,
    };
    persist([...rules, rule]);
    setShowNewModal(false);
    setNewForm(emptyForm());
  }

  function openEdit(rule: Rule) {
    setEditingRule(rule);
    setEditForm(ruleToForm(rule));
    setShowEditModal(true);
  }

  function handleSaveEdit() {
    if (!editingRule || !editForm.name.trim()) return;
    persist(rules.map((r) => r.id === editingRule.id ? {
      ...r,
      name: editForm.name.trim(),
      conditions: editForm.conditions,
      actions: editForm.actions,
      stopProcessing: editForm.stopProcessing,
    } : r));
    setShowEditModal(false);
    setEditingRule(null);
  }

  // ── Drag-n-drop ──
  function handleDragStart(id: string) {
    dragIdRef.current = id;
  }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }
  function handleDrop(targetId: string) {
    setDragOverId("");
    const fromId = dragIdRef.current;
    if (!fromId || fromId === targetId) return;
    const fromIdx = rules.findIndex((r) => r.id === fromId);
    const toIdx = rules.findIndex((r) => r.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const newRules = [...rules];
    const [moved] = newRules.splice(fromIdx, 1);
    newRules.splice(toIdx, 0, moved);
    persist(reorder(newRules));
  }

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
          <Link href="/signatures" className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100">Signatures</Link>
          <Link
            href="/email-rules"
            className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-semibold transition-colors"
            style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(83 5 5)" }}
          >
            Email Rules
          </Link>
          <div className="mt-auto pt-4">
            <a href="/api/auth/signout" className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors" style={{ color: "rgb(185 28 28)" }}>Sign Out</a>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 bg-background-50 border-b border-neutral-200 flex-shrink-0">
            <div>
              <h1 className="font-heading font-semibold text-neutral-900 text-xl">Email Rules</h1>
              <p className="text-xs text-neutral-500 mt-0.5">Automate email handling with conditions and actions</p>
            </div>
            <button
              onClick={() => { setNewForm(emptyForm()); setShowNewModal(true); }}
              className="flex items-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-2.5 px-4 rounded-small compose-btn-glow transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Rule
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: "Total Rules", value: totalRules, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />, iconBg: "bg-primary-100", iconColor: "text-primary-600" },
                { label: "Active Rules", value: activeRules, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, iconBg: "bg-tertiary-100", iconColor: "text-tertiary-600" },
                { label: "Emails Processed", value: totalProcessed, icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />, iconBg: "bg-secondary-100", iconColor: "text-secondary-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-background-50 rounded-large shadow-custom px-5 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-small flex items-center justify-center flex-shrink-0`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${stat.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{stat.icon}</svg>
                  </div>
                  <div>
                    <p className="text-2xl font-heading font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* List header + filters */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h2 className="font-heading font-semibold text-neutral-800 text-base">All Rules</h2>
                <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small border border-neutral-200">{filtered.length} rules</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder="Search rules…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-background-50 border border-neutral-200 rounded-small text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-primary-300 w-44 transition-colors"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="text-xs text-neutral-600 bg-background-50 border border-neutral-200 rounded-small px-2.5 py-1.5 focus:outline-none focus:border-primary-300"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Priority note */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs text-neutral-400">Rules are applied in priority order (top to bottom). Drag or use arrows to reorder.</p>
            </div>

            {/* Rules list */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No rules yet</p>
                <button
                  onClick={() => { setNewForm(emptyForm()); setShowNewModal(true); }}
                  className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create your first rule →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((rule, idx) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={() => toggleRule(rule.id)}
                    onEdit={() => openEdit(rule)}
                    onDelete={() => setDeleteConfirmId(rule.id)}
                    onMoveUp={() => moveRule(rule.id, "up")}
                    onMoveDown={() => moveRule(rule.id, "down")}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < filtered.length - 1}
                    isDragOver={dragOverId === rule.id}
                    onDragStart={() => handleDragStart(rule.id)}
                    onDragOver={(e) => handleDragOver(e, rule.id)}
                    onDrop={() => handleDrop(rule.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── New Rule Modal ── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-40">
          <div className="bg-background-50 rounded-large shadow-custom-hover w-full max-w-2xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <h3 className="font-heading font-semibold text-neutral-900 text-base">Create New Rule</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <RuleForm form={newForm} onChange={setNewForm} />
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newForm.name.trim()}
                className="px-4 py-2 text-sm font-semibold ai-gradient-bg text-neutral-50 rounded-small compose-btn-glow transition-all disabled:opacity-40"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Rule Modal ── */}
      {showEditModal && editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-40">
          <div className="bg-background-50 rounded-large shadow-custom-hover w-full max-w-2xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <h3 className="font-heading font-semibold text-neutral-900 text-base">Edit Rule</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <RuleForm form={editForm} onChange={setEditForm} />
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.name.trim()}
                className="px-4 py-2 text-sm font-semibold ai-gradient-bg text-neutral-50 rounded-small compose-btn-glow transition-all disabled:opacity-40"
              >
                Save Changes
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
              <h3 className="font-heading font-semibold text-neutral-900 text-base mb-2">Delete Rule?</h3>
              <p className="text-sm text-neutral-500">This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
                Cancel
              </button>
              <button
                onClick={() => deleteRule(deleteConfirmId)}
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
