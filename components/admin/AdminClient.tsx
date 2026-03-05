"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  msAccounts: { homeAccountId: string; msEmail: string; isDefault: boolean; connectedAt: string }[];
}

interface SyncStat {
  userId: string;
  email: string;
  cachedEmails: number;
  cachedCalEvents: number;
  cachedContacts: number;
}

interface AdminEmailRule {
  id: string;
  name: string;
  active: boolean;
  priority: number;
  emailCount: number;
  userId: string;
  userEmail: string;
  userName: string;
}

interface AdminSignature {
  id: string;
  userId: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  isDefault: boolean;
  userEmail: string;
  userName: string;
}

interface Props {
  users: AdminUser[];
  syncStats: SyncStat[];
  emailRules: AdminEmailRule[];
  signatures: AdminSignature[];
}

type Tab = "users" | "sync" | "rules" | "signatures";

// ─── Signature form state ─────────────────────────────────────────────────────

const emptyForm = { userId: "", name: "", title: "", company: "", phone: "", isDefault: false };

export default function AdminClient({ users, syncStats, emailRules, signatures: initialSigs }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [sigs, setSigs] = useState<AdminSignature[]>(initialSigs);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterUser, setFilterUser] = useState("");

  // ── Signature CRUD ──────────────────────────────────────────────────────────

  function openCreate(userId = "") {
    setEditingId(null);
    setForm({ ...emptyForm, userId });
    setError("");
    setShowForm(true);
  }

  function openEdit(sig: AdminSignature) {
    setEditingId(sig.id);
    setForm({ userId: sig.userId, name: sig.name, title: sig.title, company: sig.company, phone: sig.phone, isDefault: sig.isDefault });
    setError("");
    setShowForm(true);
  }

  async function saveSig() {
    if (!form.userId) { setError("Select a user first"); return; }
    if (!form.name.trim()) { setError("Signature name is required"); return; }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/signatures/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, title: form.title, company: form.company, phone: form.phone, isDefault: form.isDefault }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
        const updated: AdminSignature & { user: { id: string; email: string; name: string | null } } = await res.json();
        setSigs((prev) => prev.map((s) => s.id === editingId ? { ...updated, userEmail: updated.user.email, userName: updated.user.name ?? updated.user.email } : s));
      } else {
        const res = await fetch("/api/admin/signatures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Create failed");
        const created: AdminSignature & { user: { id: string; email: string; name: string | null } } = await res.json();
        setSigs((prev) => [...prev, { ...created, userEmail: created.user.email, userName: created.user.name ?? created.user.email }]);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteSig(id: string) {
    if (!confirm("Delete this signature?")) return;
    const res = await fetch(`/api/admin/signatures/${id}`, { method: "DELETE" });
    if (res.ok) setSigs((prev) => prev.filter((s) => s.id !== id));
  }

  // ── Filtered sigs ───────────────────────────────────────────────────────────

  const visibleSigs = filterUser ? sigs.filter((s) => s.userId === filterUser) : sigs;

  // ── Tabs config ─────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "users", label: "Users", count: users.length },
    { id: "sync", label: "Sync Status", count: syncStats.filter((s) => s.cachedEmails > 0).length },
    { id: "rules", label: "Email Rules", count: emailRules.length },
    { id: "signatures", label: "Signatures", count: sigs.length },
  ];

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-[8px] focus:outline-none focus:border-red-300 bg-white";
  const labelClass = "block text-xs font-semibold text-neutral-500 mb-1";

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-neutral-50">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-neutral-900 text-lg">Admin Panel</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: "rgb(83 5 5)", backgroundColor: "rgb(253 235 235)", borderColor: "rgb(220 180 180)" }}>
              Internal
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">System management for authorized admins only</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-3 bg-white border-b border-neutral-200 flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === t.id ? "rgb(253 235 235)" : "transparent",
              color: activeTab === t.id ? "rgb(83 5 5)" : "rgb(115 115 115)",
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: activeTab === t.id ? "rgb(138 9 9)" : "rgb(220 220 220)", color: activeTab === t.id ? "white" : "rgb(82 82 82)" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* ── Users Tab ───────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-[12px] border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Connected Accounts</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{u.name ?? "—"}</p>
                      <p className="text-xs text-neutral-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {u.msAccounts.length === 0 ? (
                        <span className="text-xs text-neutral-400">No accounts</span>
                      ) : (
                        <div className="space-y-1">
                          {u.msAccounts.map((a) => (
                            <div key={a.homeAccountId} className="flex items-center gap-1.5">
                              <span className="text-xs text-neutral-700">{a.msEmail}</span>
                              {a.isDefault && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(83 5 5)" }}>Default</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {new Date(u.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Sync Status Tab ──────────────────────────────────────────────── */}
        {activeTab === "sync" && (
          <div className="bg-white rounded-[12px] border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">User</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Emails Cached</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Calendar Events</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Contacts</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {syncStats.map((s) => {
                  const synced = s.cachedEmails > 0 || s.cachedCalEvents > 0;
                  return (
                    <tr key={s.userId} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-neutral-700">{s.email}</td>
                      <td className="px-4 py-3 text-right font-mono text-neutral-800">{s.cachedEmails.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-neutral-800">{s.cachedCalEvents.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-neutral-800">{s.cachedContacts.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                          backgroundColor: synced ? "rgb(209 250 229)" : "rgb(254 243 199)",
                          color: synced ? "rgb(6 95 70)" : "rgb(146 64 14)",
                        }}>
                          {synced ? "Active" : "Pending first sync"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Email Rules Tab ──────────────────────────────────────────────── */}
        {activeTab === "rules" && (
          <div className="bg-white rounded-[12px] border border-neutral-200 overflow-hidden">
            {emailRules.length === 0 ? (
              <p className="text-sm text-neutral-500 px-4 py-8 text-center">No email rules created yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Rule</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Owner</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Priority</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Triggered</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {emailRules.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-neutral-900">{r.name}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{r.userEmail}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{r.priority}</td>
                      <td className="px-4 py-3 text-right font-mono text-neutral-800">{r.emailCount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                          backgroundColor: r.active ? "rgb(209 250 229)" : "rgb(240 240 240)",
                          color: r.active ? "rgb(6 95 70)" : "rgb(82 82 82)",
                        }}>
                          {r.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Signatures Tab ───────────────────────────────────────────────── */}
        {activeTab === "signatures" && (
          <div className="space-y-4">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-neutral-500">Filter by user:</label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="text-sm border border-neutral-200 rounded-[8px] px-2 py-1.5 bg-white focus:outline-none focus:border-red-300"
                >
                  <option value="">All users</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => openCreate(filterUser)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-[8px] transition-colors"
                style={{ backgroundColor: "rgb(138 9 9)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(110 7 7)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(138 9 9)")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Signature
              </button>
            </div>

            {/* Signature form */}
            {showForm && (
              <div className="bg-white rounded-[12px] border border-neutral-200 p-5 space-y-4">
                <h3 className="font-semibold text-neutral-900 text-sm">
                  {editingId ? "Edit Signature" : "New Signature"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>For user *</label>
                    <select
                      value={form.userId}
                      onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                      disabled={!!editingId}
                      className={inputClass}
                    >
                      <option value="">Select a user…</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name ?? u.email} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Full name (displayed in signature) *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. David Miller" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Job title</label>
                    <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Attorney at Law" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="e.g. D. Miller Law Firm" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. (555) 123-4567" className={inputClass} />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={form.isDefault}
                      onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isDefault" className="text-sm text-neutral-700">Set as default signature</label>
                  </div>
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={saveSig}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-[8px] transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "rgb(138 9 9)" }}
                  >
                    {saving ? "Saving…" : editingId ? "Save Changes" : "Create Signature"}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); setError(""); }}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-[8px] hover:bg-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Signatures list */}
            {visibleSigs.length === 0 ? (
              <div className="bg-white rounded-[12px] border border-neutral-200 px-4 py-8 text-center">
                <p className="text-sm text-neutral-500">No signatures yet for this user.</p>
                <button onClick={() => openCreate(filterUser)} className="mt-2 text-sm font-semibold" style={{ color: "rgb(138 9 9)" }}>
                  Create one →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[12px] border border-neutral-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Signature</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Details</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Default</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {visibleSigs.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-neutral-900">{s.name}</td>
                        <td className="px-4 py-3 text-xs text-neutral-500">{s.userEmail}</td>
                        <td className="px-4 py-3 text-xs text-neutral-500 space-y-0.5">
                          {s.title && <div>{s.title}</div>}
                          {s.company && <div>{s.company}</div>}
                          {s.phone && <div>{s.phone}</div>}
                        </td>
                        <td className="px-4 py-3">
                          {s.isDefault && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(83 5 5)" }}>
                              Default
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEdit(s)}
                              className="text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSig(s.id)}
                              className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
