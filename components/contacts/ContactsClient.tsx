"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Contact } from "@/app/contacts/page";

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

export default function ContactsClient({ contacts }: Props) {
  const [query, setQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "frequent" | "vip">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [contacts, query]);

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
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-[10px] text-white transition-colors"
              style={{ backgroundColor: "rgb(138 9 9)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(110 7 7)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgb(138 9 9)")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
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

      {/* ── Right panel ──────────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ backgroundColor: "rgb(250 250 250)" }}
      >
        {selectedContact ? (
          <ContactDetail contact={selectedContact} />
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

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
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
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {contact.initials}
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

function ContactDetail({ contact }: { contact: Contact }) {
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
