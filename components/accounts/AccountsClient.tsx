"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccountStore } from "@/lib/stores/account-store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  msEmail: string;
  displayName: string;
  homeAccountId: string;
  isDefault: boolean;
  connectedAt: string;
}

// ─── Disconnect Confirmation Modal ────────────────────────────────────────────

function DisconnectModal({
  account,
  onClose,
  onConfirm,
  loading,
}: {
  account: Account;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-large shadow-custom-hover w-full max-w-md overflow-hidden"
        style={{ maxHeight: "calc(100vh - 48px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-large flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(253 235 235)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-base" style={{ color: "rgb(27 29 29)" }}>Disconnect Account</h3>
            <p className="text-sm mt-1" style={{ color: "rgb(115 115 115)" }}>
              Are you sure you want to disconnect <span className="font-medium" style={{ color: "rgb(58 58 58)" }}>{account.msEmail}</span>?
              This will remove access to this account&apos;s emails.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-small border transition-colors"
            style={{ color: "rgb(82 82 82)", borderColor: "rgb(229 229 229)", backgroundColor: "white" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(245 245 245)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-small text-white transition-colors shadow-custom"
            style={{ backgroundColor: loading ? "rgb(200 80 80)" : "rgb(138 9 9)" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
          >
            {loading ? "Disconnecting…" : "Disconnect"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

// ─── Account Card ─────────────────────────────────────────────────────────────

function AccountCard({
  account,
  onDisconnect,
}: {
  account: Account;
  onDisconnect: (account: Account) => void;
}) {
  const connectedDate = new Date(account.connectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="bg-white rounded-large border border-neutral-200 shadow-custom px-5 py-4 transition-shadow hover:shadow-custom-hover">
      <div className="flex items-center gap-4">
        {/* Account Icon */}
        <div className="w-11 h-11 rounded-large flex items-center justify-center flex-shrink-0 border"
          style={{ backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 216 216)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" fill="rgb(252 216 216)" />
            <path d="M2 8h20M8 4v16" stroke="rgb(138 9 9)" strokeWidth="1.5" />
            <circle cx="5" cy="12" r="2" fill="rgb(138 9 9)" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold truncate" style={{ color: "rgb(27 29 29)" }}>{account.msEmail}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-small flex-shrink-0"
              style={{ backgroundColor: "rgb(220 252 231)", color: "rgb(21 128 61)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgb(22 163 74)" }} />
              Active
            </span>
            {account.isDefault && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-small flex-shrink-0"
                style={{ backgroundColor: "rgb(253 235 235)", color: "rgb(138 9 9)" }}>
                Default
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs flex items-center gap-1" style={{ color: "rgb(115 115 115)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Connected {connectedDate}
            </span>
            <span style={{ color: "rgb(212 212 212)" }}>·</span>
            <span className="text-xs" style={{ color: "rgb(115 115 115)" }}>Microsoft 365</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onDisconnect(account)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-small border transition-colors"
            style={{ color: "rgb(138 9 9)", borderColor: "rgb(252 216 216)", backgroundColor: "rgb(253 235 235)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(252 216 216)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(253 235 235)"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Accounts Client ──────────────────────────────────────────────────────────

export default function AccountsClient({ accounts: initialAccounts }: { accounts: Account[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [disconnecting, setDisconnecting] = useState<Account | null>(null);
  const removeAccountFromStore = useAccountStore((s) => s.removeAccount);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("added") === "1") {
      setAddedSuccess(true);
      // Remove the query param from the URL without re-rendering
      window.history.replaceState({}, "", "/accounts");
    }
  }, [searchParams]);

  async function handleDisconnect() {
    if (!disconnecting) return;
    setDisconnectLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeAccountId: disconnecting.homeAccountId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to disconnect");
      }
      removeAccountFromStore(disconnecting.homeAccountId);
      setAccounts((prev) => prev.filter((a) => a.id !== disconnecting.id));
      setDisconnecting(null);
      // If no accounts left, redirect to onboarding
      if (accounts.length <= 1) router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect account");
    } finally {
      setDisconnectLoading(false);
    }
  }

  return (
    <>
      <div className="flex-1 flex flex-col" style={{ height: "100vh", overflow: "hidden", backgroundColor: "rgb(250 250 250)" }}>

        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-semibold text-xl" style={{ color: "rgb(27 29 29)" }}>Email Accounts</h1>
            <p className="text-sm mt-0.5" style={{ color: "rgb(115 115 115)" }}>Manage your connected Microsoft accounts</p>
          </div>
          <a
            href="/api/auth/microsoft?add=1"
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-small shadow-custom transition-colors"
            style={{ backgroundColor: "rgb(138 9 9)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Account
          </a>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto">

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-large border border-neutral-200 shadow-custom px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-small flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(253 235 235)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold" style={{ color: "rgb(27 29 29)" }}>{accounts.length}</p>
                    <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>Total Accounts</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-large border border-neutral-200 shadow-custom px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-small flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(220 252 231)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(21 128 61)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold" style={{ color: "rgb(27 29 29)" }}>{accounts.length}</p>
                    <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>Active</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-large border border-neutral-200 shadow-custom px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-small flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(243 244 246)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(107 114 128)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold" style={{ color: "rgb(27 29 29)" }}>+</p>
                    <p className="text-xs" style={{ color: "rgb(115 115 115)" }}>Add More</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success banner */}
            {addedSuccess && (
              <div className="mb-4 px-4 py-3 rounded-small border text-sm font-medium flex items-center justify-between"
                style={{ backgroundColor: "rgb(220 252 231)", borderColor: "rgb(187 247 208)", color: "rgb(21 128 61)" }}>
                <span>Account connected successfully.</span>
                <button onClick={() => setAddedSuccess(false)} className="ml-4 text-xs underline opacity-70 hover:opacity-100">Dismiss</button>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-small border text-sm font-medium"
                style={{ backgroundColor: "rgb(253 235 235)", borderColor: "rgb(252 216 216)", color: "rgb(138 9 9)" }}>
                {error}
              </div>
            )}

            {/* Accounts List */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base" style={{ color: "rgb(38 38 38)" }}>Connected Accounts</h2>
            </div>

            {accounts.length === 0 ? (
              <div className="bg-white rounded-large border border-neutral-200 shadow-custom px-6 py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium mb-4" style={{ color: "rgb(115 115 115)" }}>No accounts connected</p>
                <a href="/api/auth/microsoft?add=1" className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-small shadow-custom"
                  style={{ backgroundColor: "rgb(138 9 9)" }}>
                  Connect Microsoft Account
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} onDisconnect={setDisconnecting} />
                ))}
              </div>
            )}

            {/* Add Account CTA */}
            <div className="mt-6 rounded-large border px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
              style={{ background: "linear-gradient(to right, rgb(253 235 235), rgb(250 250 250))", borderColor: "rgb(252 216 216)" }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-large flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(252 216 216)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "rgb(27 29 29)" }}>Connect another email account</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgb(115 115 115)" }}>Supports Microsoft 365, Outlook, and Exchange</p>
                </div>
              </div>
              <a
                href="/api/auth/microsoft?add=1"
                className="flex items-center gap-2 text-white font-medium text-sm py-2 px-4 rounded-small transition-colors shadow-custom flex-shrink-0"
                style={{ backgroundColor: "rgb(138 9 9)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgb(110 7 7)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgb(138 9 9)"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Account
              </a>
            </div>

          </div>
        </div>
      </div>

      {disconnecting && (
        <DisconnectModal
          account={disconnecting}
          onClose={() => { setDisconnecting(null); setError(null); }}
          onConfirm={handleDisconnect}
          loading={disconnectLoading}
        />
      )}
    </>
  );
}
