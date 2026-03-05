"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountSwitcher from "@/components/AccountSwitcher";
import { useAccountStore } from "@/lib/stores/account-store";
import type { MailFolder } from "@/lib/types/email";

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean; // optional override; if omitted, computed from NEXT_PUBLIC_ADMIN_EMAILS
}

const mailboxLinks = [
  {
    href: "/inbox", label: "Inbox", badgeKey: "unread" as const,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />,
  },
  {
    href: "/starred", label: "Starred",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  },
  {
    href: "/sent", label: "Sent",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
  },
  {
    href: "/drafts", label: "Drafts", badgeKey: "draft" as const,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  },
  {
    href: "/trash", label: "Trash",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  },
];

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { href: "/attachments", label: "Attachments", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /> },
  { href: "/calendar", label: "Calendar", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
];

const manageLinks = [
  { href: "/accounts", label: "Email Accounts", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { href: "/contacts", label: "Contacts", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
];

const aiToolLinks = [
  { href: "/compose", label: "AI Composer", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> },
  { href: "/compose?panel=remix", label: "AI Remix", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
  { href: "/compose?panel=dictate", label: "AI Dictate", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /> },
];

const labelItems = [
  { label: "Work", color: "rgb(138 9 9)" },
  { label: "Personal", color: "rgb(16 185 129)" },
  { label: "Newsletters", color: "rgb(82 82 82)" },
];

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {children}
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

interface SectionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

function SidebarSection({ title, open, onToggle, children, className = "" }: SectionProps) {
  return (
    <div className={className}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-[8px] hover:bg-neutral-50 transition-colors group"
      >
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider group-hover:text-neutral-500 transition-colors">
          {title}
        </span>
        <span className="text-neutral-300 group-hover:text-neutral-400 transition-colors">
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

function NavLink({ href, label, icon, badge, active }: {
  href: string; label: string; icon: React.ReactNode; badge?: number | null; active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? "rgb(253 235 235)" : "transparent",
        color: active ? "rgb(83 5 5)" : "rgb(82 82 82)",
      }}
    >
      <NavIcon>{icon}</NavIcon>
      <span className="truncate flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-[10px] flex-shrink-0"
          style={{ backgroundColor: active ? "rgb(138 9 9)" : "rgb(220 220 220)", color: active ? "white" : "rgb(82 82 82)" }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ userName = "You", userEmail = "", isAdmin: isAdminProp }: SidebarProps) {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = isAdminProp ?? adminEmails.includes(userEmail.trim().toLowerCase());
  const pathname = usePathname();
  const unreadCount = useAccountStore((s) => s.inboxUnread);
  const draftCount = useAccountStore((s) => s.draftCount);
  const mailFolders = useAccountStore((s) => s.mailFolders);
  const setMailFolders = useAccountStore((s) => s.setMailFolders);
  const activeAccount = useAccountStore((s) => s.activeAccount);
  const activeLabel = useAccountStore((s) => s.activeLabel);
  const setActiveLabel = useAccountStore((s) => s.setActiveLabel);

  // Accordion open state — Mailboxes + Navigate open by default
  const [open, setOpen] = useState({
    mailboxes: true,
    folders: true,
    navigate: true,
    manage: true,
    aiTools: false,
    labels: false,
    support: false,
  });

  function toggle(key: keyof typeof open) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Fetch custom folders whenever the active account changes
  useEffect(() => {
    if (!activeAccount) return;
    fetch(`/api/mail/folders?homeAccountId=${encodeURIComponent(activeAccount.homeAccountId)}`)
      .then((r) => r.ok ? r.json() : r.json().then((e: { error?: string }) => { throw new Error(e.error ?? `folders ${r.status}`); }))
      .then((data: { folders?: MailFolder[] }) => { if (data.folders) setMailFolders(data.folders); })
      .catch((err: unknown) => console.warn("[Sidebar] folders fetch failed:", err));
  }, [activeAccount?.homeAccountId, setMailFolders]);

  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 flex-shrink-0" style={{ height: "100vh" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-200 flex-shrink-0">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "rgb(138 9 9)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold text-lg" style={{ color: "rgb(27 29 29)" }}>EaseMail</span>
        </div>

        {/* Account Switcher */}
        <AccountSwitcher />

        {/* Compose Button */}
        <div className="px-4 py-4 flex-shrink-0">
          <Link
            href="/compose"
            className="w-full flex items-center justify-center gap-2 text-white font-medium text-sm py-2.5 px-4 rounded-[10px] transition-colors shadow-card"
            style={{ backgroundColor: "rgb(138 9 9)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgb(110 7 7)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgb(138 9 9)")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Compose
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-1">

          {/* Mailboxes */}
          <SidebarSection title="Mailboxes" open={open.mailboxes} onToggle={() => toggle("mailboxes")}>
            <ul className="space-y-0.5">
              {mailboxLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + "/");
                const badge = link.badgeKey === "unread" ? unreadCount : link.badgeKey === "draft" ? draftCount : null;
                return (
                  <li key={link.href}>
                    <NavLink href={link.href} label={link.label} icon={link.icon} badge={badge} active={active} />
                  </li>
                );
              })}
            </ul>
          </SidebarSection>

          {/* Custom Folders */}
          {mailFolders.length > 0 && (
            <SidebarSection title="Folders" open={open.folders} onToggle={() => toggle("folders")} className="mt-2">
              <ul className="space-y-0.5">
                {mailFolders.map((folder) => {
                  const href = `/folder/${folder.id}`;
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <li key={folder.id}>
                      <NavLink
                        href={href}
                        label={folder.displayName}
                        badge={folder.unreadItemCount}
                        active={active}
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L10.707 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />}
                      />
                    </li>
                  );
                })}
              </ul>
            </SidebarSection>
          )}

          {/* Navigate */}
          <SidebarSection title="Navigate" open={open.navigate} onToggle={() => toggle("navigate")} className="mt-2">
            <ul className="space-y-0.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} label={link.label} icon={link.icon} active={pathname === link.href} />
                </li>
              ))}
            </ul>
          </SidebarSection>

          {/* Manage */}
          <SidebarSection title="Manage" open={open.manage} onToggle={() => toggle("manage")} className="mt-2">
            <ul className="space-y-0.5">
              {manageLinks.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} label={link.label} icon={link.icon} active={pathname === link.href} />
                </li>
              ))}
            </ul>
          </SidebarSection>

          {/* AI Tools */}
          <SidebarSection title="AI Tools" open={open.aiTools} onToggle={() => toggle("aiTools")} className="mt-2">
            <ul className="space-y-0.5">
              {aiToolLinks.map((item) => (
                <li key={item.label}>
                  <NavLink href={item.href} label={item.label} icon={item.icon} active={pathname === item.href} />
                </li>
              ))}
            </ul>
          </SidebarSection>

          {/* Labels */}
          <SidebarSection title="Labels" open={open.labels} onToggle={() => toggle("labels")} className="mt-2">
            <ul className="space-y-0.5">
              {labelItems.map((item) => {
                const isLabelActive = activeLabel === item.label;
                return (
                  <li key={item.label}>
                    <Link
                      href="/inbox"
                      onClick={() => setActiveLabel(isLabelActive ? null : item.label)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors"
                      style={{
                        backgroundColor: isLabelActive ? "rgb(253 235 235)" : "transparent",
                        color: isLabelActive ? "rgb(83 5 5)" : "rgb(82 82 82)",
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SidebarSection>

          {/* Support */}
          <SidebarSection title="Support" open={open.support} onToggle={() => toggle("support")} className="mt-2">
            <ul className="space-y-0.5">
              <li>
                <NavLink
                  href="/help"
                  label="Help Center"
                  active={pathname === "/help"}
                  icon={<path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
              </li>
            </ul>
          </SidebarSection>

        </nav>

        {/* User Footer */}
        <div className="px-4 py-4 border-t border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white" style={{ backgroundColor: "rgb(138 9 9)" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "rgb(27 29 29)" }}>{userName}</p>
              <p className="text-xs truncate" style={{ color: "rgb(115 115 115)" }}>{userEmail}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <Link href="/admin" title="Admin Panel" className="transition-colors" style={{ color: "rgb(138 9 9)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </Link>
              )}
              <Link href="/teams" title="MS Teams" className="transition-colors" style={{ color: "rgb(76 29 149)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
              <Link href="/settings" title="Settings" className="transition-colors" style={{ color: "rgb(155 155 155)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgb(138 9 9)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: "rgb(27 29 29)" }}>EaseMail</span>
          </div>
        </div>
        <Link href="/compose" className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Compose">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="relative flex flex-col w-72 bg-white h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: "rgb(138 9 9)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-semibold" style={{ color: "rgb(27 29 29)" }}>EaseMail</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Drawer uses same nav content as desktop aside */}
            <AccountSwitcher />
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <SidebarSection title="Mailboxes" open={open.mailboxes} onToggle={() => toggle("mailboxes")}>
                <ul className="space-y-0.5">
                  {mailboxLinks.map((l) => (
                    <li key={l.href}>
                      <NavLink
                        href={l.href} label={l.label} active={pathname === l.href}
                        badge={"badgeKey" in l ? (l.badgeKey === "unread" ? unreadCount : draftCount) : undefined}
                        icon={l.icon}
                      />
                    </li>
                  ))}
                </ul>
              </SidebarSection>
              <SidebarSection title="Navigate" open={open.navigate} onToggle={() => toggle("navigate")}>
                <ul className="space-y-0.5">
                  {navLinks.map((l) => (
                    <li key={l.href}>
                      <NavLink href={l.href} label={l.label} active={pathname === l.href} icon={l.icon} />
                    </li>
                  ))}
                </ul>
              </SidebarSection>
              <SidebarSection title="Manage" open={open.manage} onToggle={() => toggle("manage")}>
                <ul className="space-y-0.5">
                  {manageLinks.map((l) => (
                    <li key={l.href}>
                      <NavLink href={l.href} label={l.label} active={pathname === l.href} icon={l.icon} />
                    </li>
                  ))}
                </ul>
              </SidebarSection>
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile floating compose FAB */}
      <Link
        href="/compose"
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 ai-gradient-bg text-white rounded-[14px] flex items-center justify-center shadow-custom-hover transition-transform hover:scale-105"
        aria-label="Compose new email"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </>
  );
}
