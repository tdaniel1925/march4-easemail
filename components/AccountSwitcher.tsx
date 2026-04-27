"use client";

import { useState, useRef, useEffect } from "react";
import { useAccountStore } from "@/lib/stores/account-store";
import { useDataCacheStore } from "@/lib/stores/data-cache";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AccountSwitcher() {
  const [open, setOpen] = useState(false);
  const { accounts, activeAccount, setActiveAccount } = useAccountStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!activeAccount) return null;

  const initials = getInitials(activeAccount.displayName ?? activeAccount.email ?? activeAccount.msEmail);

  return (
    <div ref={ref} className="relative px-4 pt-3 pb-1 flex-shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-colors text-left"
        style={{
          border: "1px solid rgb(220 220 220)",
          backgroundColor: open ? "rgb(253 235 235)" : "white",
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
          style={{ backgroundColor: "rgb(138 9 9)" }}
        >
          {initials}
        </div>
        <span className="flex-1 text-xs truncate font-medium" style={{ color: "rgb(58 58 58)" }}>
          {activeAccount.email ?? activeAccount.msEmail}
        </span>
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "rgb(155 155 155)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-4 right-4 top-full mt-1 bg-white rounded-[10px] border border-neutral-200 overflow-hidden z-50"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
        >
          {accounts.map((acc) => {
            const isActive = acc.homeAccountId === activeAccount.homeAccountId;
            const accInitials = getInitials(acc.displayName ?? acc.email ?? acc.msEmail);
            return (
              <button
                key={acc.homeAccountId}
                onClick={() => { setActiveAccount(acc); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                style={{ backgroundColor: isActive ? "rgb(253 235 235)" : "white" }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "white"; }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ backgroundColor: "rgb(138 9 9)" }}
                >
                  {accInitials}
                </div>
                <span
                  className="flex-1 text-xs truncate"
                  style={{ color: isActive ? "rgb(83 5 5)" : "rgb(58 58 58)", fontWeight: isActive ? 600 : 400 }}
                >
                  {acc.email ?? acc.msEmail}
                </span>
                {isActive && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
          <div className="border-t border-neutral-100">
            <button
              onClick={() => {
                setOpen(false);
                useDataCacheStore.getState().setActiveView("accounts");
                window.history.pushState(null, "", "/accounts");
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left"
              style={{ color: "rgb(115 115 115)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(138 9 9)"; e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(115 115 115)"; e.currentTarget.style.backgroundColor = "white"; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add account
            </button>
            <button
              onClick={() => {
                setOpen(false);
                useDataCacheStore.getState().setActiveView("accounts");
                window.history.pushState(null, "", "/accounts");
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left"
              style={{ color: "rgb(115 115 115)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgb(138 9 9)"; e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgb(115 115 115)"; e.currentTarget.style.backgroundColor = "white"; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage accounts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
