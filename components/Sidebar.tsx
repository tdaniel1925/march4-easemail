"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountSwitcher from "@/components/AccountSwitcher";
import { useAccountStore } from "@/lib/stores/account-store";

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

const mailboxLinks = [
  {
    href: "/inbox",
    label: "Inbox",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    ),
    badgeKey: "unread" as const,
  },
  {
    href: "/starred",
    label: "Starred",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    ),
  },
  {
    href: "/sent",
    label: "Sent",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    ),
  },
  {
    href: "/drafts",
    label: "Drafts",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    badgeKey: "draft" as const,
  },
  {
    href: "/trash",
    label: "Trash",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    ),
  },
];

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    href: "/attachments",
    label: "Attachments",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
];

const manageLinks = [
  {
    href: "/accounts",
    label: "Email Accounts",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  },
  {
    href: "/contacts",
    label: "Contacts",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
];

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {children}
    </svg>
  );
}

export default function Sidebar({ userName = "You", userEmail = "" }: SidebarProps) {
  const pathname = usePathname();
  const unreadCount = useAccountStore((s) => s.inboxUnread);
  const draftCount = useAccountStore((s) => s.draftCount);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
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
        <button
          className="w-full flex items-center justify-center gap-2 text-white font-medium text-sm py-2.5 px-4 rounded-[10px] transition-colors shadow-card"
          style={{ backgroundColor: "rgb(138 9 9)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgb(110 7 7)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgb(138 9 9)")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Compose
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        {/* Mailboxes */}
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Mailboxes</p>
        <ul className="space-y-0.5">
          {mailboxLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            const badge =
              link.badgeKey === "unread" && unreadCount > 0
                ? unreadCount
                : link.badgeKey === "draft" && draftCount > 0
                ? draftCount
                : null;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active ? "rgb(253 235 235)" : "transparent",
                    color: active ? "rgb(83 5 5)" : "rgb(82 82 82)",
                  }}
                >
                  <NavIcon>{link.icon}</NavIcon>
                  {link.label}
                  {badge && (
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-[10px]"
                      style={{
                        backgroundColor: active ? "rgb(138 9 9)" : "rgb(220 220 220)",
                        color: active ? "white" : "rgb(82 82 82)",
                      }}>
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Navigate */}
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mt-6 mb-2">Navigate</p>
        <ul className="space-y-0.5">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors"
                  style={{
                    backgroundColor: active ? "rgb(253 235 235)" : "transparent",
                    color: active ? "rgb(83 5 5)" : "rgb(82 82 82)",
                  }}
                >
                  <NavIcon>{link.icon}</NavIcon>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Manage */}
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mt-6 mb-2">Manage</p>
        <ul className="space-y-0.5">
          {manageLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors"
                  style={{
                    backgroundColor: active ? "rgb(253 235 235)" : "transparent",
                    color: active ? "rgb(83 5 5)" : "rgb(82 82 82)",
                  }}
                >
                  <NavIcon>{link.icon}</NavIcon>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Support */}
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mt-6 mb-2">Support</p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/help"
              className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors"
              style={{ color: "rgb(82 82 82)" }}
            >
              <NavIcon>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </NavIcon>
              Help Center
            </Link>
          </li>
        </ul>
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
          <Link href="/settings" className="transition-colors" style={{ color: "rgb(155 155 155)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
