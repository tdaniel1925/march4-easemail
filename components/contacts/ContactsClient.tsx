"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Contact } from "@/app/contacts/page";

// ─── Presence helpers ─────────────────────────────────────────────────────────

type PresenceAvailability =
  | "Available" | "AvailableIdle" | "Away" | "BeRightBack"
  | "Busy" | "BusyIdle" | "DoNotDisturb" | "Offline" | "PresenceUnknown";

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

// ─── Avatar colors ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: "rgb(253 235 235)", text: "rgb(138 9 9)" },
  { bg: "rgb(219 234 254)", text: "rgb(29 78 216)" },
  { bg: "rgb(220 252 231)", text: "rgb(21 128 61)" },
  { bg: "rgb(254 243 199)", text: "rgb(146 64 14)" },
  { bg: "rgb(237 233 254)", text: "rgb(109 40 217)" },
  { bg: "rgb(255 228 230)", text: "rgb(190 18 60)" },
];

function getColor(name: string): { bg: string; text: string } {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

// ─── Alphabetical grouping ────────────────────────────────────────────────────

function groupByLetter(contacts: Contact[]): [string, Contact[]][] {
  const groups: Record<string, Contact[]> = {};
  for (const c of contacts) {
    const letter = c.displayName[0]?.toUpperCase() ?? "#";
    (groups[letter] ??= []).push(c);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  contacts: Contact[];
}

// ─── Component ────────────────────────────────────────────────────────────────

type ContactFormData = { displayName: string; email: string; phone: string; company: string; title: string };

function ContactModal({
  initial,
  onClose,
  onSave,
  saving,
  errorMsg,
}: {
  initial?: Contact;
  onClose: () => void;
  onSave: (data: ContactFormData) => void;
  saving: boolean;
  errorMsg?: string | null;
}) {
  const [form, setForm] = useState<ContactFormData>({
    displayName: initial?.displayName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    company: initial?.company ?? "",
    title: initial?.jobTitle ?? "",
  });
  const set = (k: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold mb-5" style={{ color: "rgb(27 29 29)" }}>
          {initial ? "Edit Contact" : "New Contact"}
        </h2>
        {/* FIX: Show error message to user */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-[10px] bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}
        <div className="space-y-3">
          {(["displayName", "email", "phone", "company", "title"] as (keyof ContactFormData)[]).map((k) => (
            <div key={k}>
              <label className="block text-xs font-medium mb-1" style={{ color: "rgb(115 115 115)" }}>
                {k === "displayName" ? "Full Name *" : k === "title" ? "Job Title" : k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
              <input
                type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
                value={form[k]}
                onChange={set(k)}
                className="w-full px-3 py-2 rounded-[10px] text-sm border outline-none transition-colors"
                style={{ backgroundColor: "rgb(245 245 245)", borderColor: "transparent", color: "rgb(27 29 29)" }}
                onFocus={(e) => { e.target.style.borderColor = "rgb(218 100 100)"; e.target.style.backgroundColor = "white"; }}
                onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.backgroundColor = "rgb(245 245 245)"; }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-[10px]" style={{ color: "rgb(82 82 82)", backgroundColor: "rgb(245 245 245)" }}>
            Cancel
          </button>
          <button
            onClick={() => form.displayName.trim() && onSave(form)}
            disabled={saving || !form.displayName.trim()}
            className="px-4 py-2 text-sm text-white rounded-[10px] disabled:opacity-50"
            style={{ backgroundColor: "rgb(138 9 9)" }}
          >
            {saving ? "Saving…" : initial ? "Save Changes" : "Add Contact"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsClient({ contacts: initialContacts }: Props) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [query, setQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "frequent" | "vip">("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // FIX: Add error state for user feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleCreate(data: ContactFormData) {
    setSaving(true);
    setErrorMsg(null); // Clear previous errors
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: data.displayName, email: data.email, phone: data.phone, company: data.company, title: data.title }),
      });

      // FIX: Check response before updating UI
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to create contact" }));
        throw new Error(error.error || "Failed to create contact");
      }

      const { contact } = await res.json() as { contact: { id: string; displayName: string; emailAddresses?: { address: string }[]; mobilePhone?: string; jobTitle?: string; companyName?: string } };

      // Only update UI after confirming save succeeded
      const newContact: Contact = {
        id: contact.id,
        displayName: contact.displayName,
        email: contact.emailAddresses?.[0]?.address ?? data.email,
        phone: contact.mobilePhone ?? data.phone,
        jobTitle: contact.jobTitle ?? data.title,
        company: contact.companyName ?? data.company,
        initials: contact.displayName.slice(0, 2).toUpperCase(),
        isVIP: false,
        frequencyScore: 0,
      };
      setContacts((prev) => [...prev, newContact].sort((a, b) => a.displayName.localeCompare(b.displayName)));
      setShowNewModal(false);
    } catch (err) {
      // FIX: Show error to user instead of just logging
      const message = err instanceof Error ? err.message : "Failed to create contact";
      setErrorMsg(message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: ContactFormData) {
    if (!editContact) return;
    setSaving(true);
    setErrorMsg(null); // Clear previous errors
    try {
      // FIX: Wait for response and validate before updating UI
      const res = await fetch(`/api/contacts/${encodeURIComponent(editContact.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: data.displayName, email: data.email, phone: data.phone, company: data.company, title: data.title }),
      });

      // FIX: Check if save succeeded before updating UI
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update contact" }));
        throw new Error(error.error || "Failed to update contact");
      }

      // Only update UI after confirming save succeeded
      const updated: Contact = {
        ...editContact,
        displayName: data.displayName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.title,
        company: data.company,
        initials: data.displayName.slice(0, 2).toUpperCase(),
      };
      setContacts((prev) => prev.map((c) => c.id === editContact.id ? updated : c).sort((a, b) => a.displayName.localeCompare(b.displayName)));
      setSelectedContact(updated);
      setEditContact(null);
    } catch (err) {
      // FIX: Show error to user instead of just logging
      const message = err instanceof Error ? err.message : "Failed to update contact";
      setErrorMsg(message);
      console.error(err);
      // Don't close modal on error - let user try again
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setErrorMsg(null); // Clear previous errors
    try {
      // FIX: Wait for response and validate before updating UI
      const res = await fetch(`/api/contacts/${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });

      // FIX: Check if delete succeeded before updating UI
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to delete contact" }));
        throw new Error(error.error || "Failed to delete contact");
      }

      // Only update UI after confirming delete succeeded
      setContacts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      if (selectedContact?.id === deleteTarget.id) setSelectedContact(null);
      setDeleteTarget(null);
    } catch (err) {
      // FIX: Show error to user instead of just logging
      const message = err instanceof Error ? err.message : "Failed to delete contact";
      setErrorMsg(message);
      console.error(err);
      // Don't close dialog on error - let user try again
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    // Filter by tab first
    let tabFiltered = contacts;
    if (activeTab === "vip") {
      tabFiltered = contacts.filter((c) => c.isVIP);
    } else if (activeTab === "frequent") {
      tabFiltered = contacts.filter((c) => c.frequencyScore > 0);
    }

    // Then filter by search query
    const q = query.trim().toLowerCase();
    if (!q) return tabFiltered;
    return tabFiltered.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [contacts, query, activeTab]);

  const groups = useMemo(() => groupByLetter(filtered), [filtered]);

  return (
    <div className="flex flex-1" style={{ height: "100vh", overflow: "hidden" }}>
      {/* ── Left panel ───────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col w-80 bg-white border-r border-neutral-200 flex-shrink-0"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-semibold" style={{ color: "rgb(27 29 29)" }}>
              All Contacts
            </h1>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-[10px] text-white transition-colors"
              style={{ backgroundColor: "rgb(138 9 9)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(110 7 7)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(138 9 9)")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Contact
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: "rgb(163 163 163)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search contacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-[10px] border border-neutral-200 outline-none focus:border-neutral-400 transition-colors"
              style={{ color: "rgb(27 29 29)", backgroundColor: "rgb(250 250 250)" }}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mt-3">
            {(["all", "frequent", "vip"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-1.5 text-xs font-medium rounded-[10px] capitalize transition-colors"
                style={
                  activeTab === tab
                    ? { backgroundColor: "rgb(138 9 9)", color: "white" }
                    : { backgroundColor: "rgb(245 245 245)", color: "rgb(115 115 115)" }
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{ color: "rgb(212 212 212)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm font-medium" style={{ color: "rgb(163 163 163)" }}>
                No contacts found
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
              <p className="text-sm" style={{ color: "rgb(163 163 163)" }}>
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            groups.map(([letter, group]) => (
              <div key={letter}>
                <div
                  className="px-4 py-1 text-xs font-semibold"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "rgb(245 245 245)",
                    color: "rgb(115 115 115)",
                  }}
                >
                  {letter}
                </div>
                {group.map((contact) => {
                  const color = getColor(contact.displayName);
                  const isSelected = selectedContact?.id === contact.id;
                  return (
                    <ContactRow
                      key={contact.id}
                      contact={contact}
                      color={color}
                      isSelected={isSelected}
                      onSelect={() => setSelectedContact(contact)}
                    />
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewModal && (
        <ContactModal onClose={() => setShowNewModal(false)} onSave={handleCreate} saving={saving} errorMsg={errorMsg} />
      )}
      {editContact && (
        <ContactModal initial={editContact} onClose={() => setEditContact(null)} onSave={handleEdit} saving={saving} errorMsg={errorMsg} />
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-[16px] w-full max-w-sm p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold mb-2" style={{ color: "rgb(27 29 29)" }}>Delete Contact</h2>
            <p className="text-sm mb-6" style={{ color: "rgb(82 82 82)" }}>
              Remove <strong>{deleteTarget.displayName}</strong> from your contacts? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm rounded-[10px]" style={{ color: "rgb(82 82 82)", backgroundColor: "rgb(245 245 245)" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm text-white rounded-[10px] disabled:opacity-50" style={{ backgroundColor: "rgb(220 38 38)" }}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Right panel ──────────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ backgroundColor: "rgb(250 250 250)" }}
      >
        {selectedContact ? (
          <ContactDetail
            contact={selectedContact}
            onEdit={() => setEditContact(selectedContact)}
            onDelete={() => setDeleteTarget(selectedContact)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: "rgb(212 212 212)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm font-medium" style={{ color: "rgb(163 163 163)" }}>
              Select a contact to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contact row ─────────────────────────────────────────────────────────────

interface ContactRowProps {
  contact: Contact;
  color: { bg: string; text: string };
  isSelected: boolean;
  onSelect: () => void;
}

function ContactRow({ contact, color, isSelected, onSelect }: ContactRowProps) {
  const [hovered, setHovered] = useState(false);
  const [presence, setPresence] = useState<PresenceAvailability | null>(null);
  const [presenceFetched, setPresenceFetched] = useState(false);

  function handleMouseEnter() {
    setHovered(true);
    if (!presenceFetched && contact.email) {
      setPresenceFetched(true);
      fetch(`/api/teams/presence?userId=${encodeURIComponent(contact.email)}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data: { presence?: { availability: PresenceAvailability } } | null) => {
          if (data?.presence?.availability && data.presence.availability !== "PresenceUnknown") {
            setPresence(data.presence.availability);
          }
        })
        .catch(() => { /* presence is best-effort */ });
    }
  }

  return (
    <button
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
      style={{
        backgroundColor: isSelected
          ? "rgb(253 235 235)"
          : hovered
          ? "rgb(245 245 245)"
          : "transparent",
      }}
    >
      {/* Avatar with presence dot */}
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {contact.initials}
        </div>
        {presence && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ backgroundColor: presenceColor(presence) }}
            title={presenceLabel(presence)}
          />
        )}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: isSelected ? "rgb(83 5 5)" : "rgb(27 29 29)" }}
        >
          {contact.displayName}
        </p>
        <p className="text-xs truncate" style={{ color: "rgb(115 115 115)" }}>
          {contact.email || "No email"}
        </p>
      </div>

      {/* Compose button — visible on hover or selected */}
      {(hovered || isSelected) && contact.email && (
        <Link
          href={`/compose?to=${encodeURIComponent(contact.email)}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 w-7 h-7 rounded-[10px] flex items-center justify-center transition-colors"
          style={{ backgroundColor: "rgb(138 9 9)" }}
          title={`Email ${contact.displayName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </Link>
      )}
    </button>
  );
}

// ─── Contact detail ───────────────────────────────────────────────────────────

function ContactDetail({ contact, onEdit, onDelete }: { contact: Contact; onEdit: () => void; onDelete: () => void }) {
  const color = getColor(contact.displayName);

  return (
    <div className="flex flex-col items-center px-8 pt-16 pb-8">
      {/* Large avatar */}
      <div
        className="w-24 h-24 rounded-[20px] flex items-center justify-center text-3xl font-bold mb-5"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {contact.initials}
      </div>

      {/* Name */}
      <h2 className="text-xl font-semibold mb-1" style={{ color: "rgb(27 29 29)" }}>
        {contact.displayName}
      </h2>

      {/* Job title + company */}
      {(contact.jobTitle || contact.company) && (
        <p className="text-sm mb-1 text-center" style={{ color: "rgb(115 115 115)" }}>
          {[contact.jobTitle, contact.company].filter(Boolean).join(" · ")}
        </p>
      )}

      {/* Email */}
      {contact.email && (
        <p className="text-sm mb-6" style={{ color: "rgb(82 82 82)" }}>
          {contact.email}
        </p>
      )}

      {/* Edit + Delete actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs rounded-[8px] font-medium"
          style={{ backgroundColor: "rgb(245 245 245)", color: "rgb(58 58 58)" }}
          onMouseEnter={(e) => { (e.currentTarget).style.backgroundColor = "rgb(229 229 229)"; }}
          onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = "rgb(245 245 245)"; }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs rounded-[8px] font-medium"
          style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)" }}
          onMouseEnter={(e) => { (e.currentTarget).style.backgroundColor = "rgb(220 38 38)"; (e.currentTarget).style.color = "white"; }}
          onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = "rgb(253 235 235)"; (e.currentTarget).style.color = "rgb(138 9 9)"; }}
        >
          Delete
        </button>
      </div>

      {/* Compose button */}
      {contact.email && (
        <Link
          href={`/compose?to=${encodeURIComponent(contact.email)}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium text-white transition-colors shadow-sm"
          style={{ backgroundColor: "rgb(138 9 9)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgb(110 7 7)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgb(138 9 9)")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Send Email
        </Link>
      )}

      {/* Detail cards */}
      <div className="w-full max-w-md mt-10 space-y-3">
        {contact.email && (
          <DetailRow label="Email" value={contact.email} />
        )}
        {contact.phone && (
          <DetailRow label="Phone" value={contact.phone} />
        )}
        {contact.jobTitle && (
          <DetailRow label="Job Title" value={contact.jobTitle} />
        )}
        {contact.company && (
          <DetailRow label="Company" value={contact.company} />
        )}
      </div>
    </div>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-start gap-4 px-4 py-3 rounded-[10px] bg-white border border-neutral-100"
    >
      <span className="text-xs font-semibold w-20 flex-shrink-0 pt-0.5" style={{ color: "rgb(163 163 163)" }}>
        {label}
      </span>
      <span className="text-sm flex-1 min-w-0 break-words" style={{ color: "rgb(27 29 29)" }}>
        {value}
      </span>
    </div>
  );
}
