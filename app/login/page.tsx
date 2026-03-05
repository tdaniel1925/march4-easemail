"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex flex-col lg:flex-row" style={{ height: "100vh", overflow: "hidden" }}>

      {/* ── LEFT PANEL — Branding ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col w-1/2 xl:w-5/12 px-10 py-8 relative overflow-y-auto flex-shrink-0"
        style={{
          height: "100vh",
          backgroundColor: "rgb(138 9 9)",
          backgroundImage: [
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.04) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 10%, rgba(245,158,11,0.15) 0%, transparent 40%)",
          ].join(", "),
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white opacity-5 pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-white opacity-5 pointer-events-none" />
        <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ backgroundColor: "rgb(130 30 30)" }} />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center border" style={{ background: "rgba(255,255,255,0.20)", borderColor: "rgba(255,255,255,0.30)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-white text-xl tracking-tight">EaseMail</span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          {/* Floating Email Card */}
          <div className="mb-6 flex justify-center" style={{ animation: "floatEnvelope 6s ease-in-out infinite" }}>
            <div className="relative">
              <div className="w-72 rounded-[10px] p-5 shadow-lg" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(130,30,30,0.80)" }}>
                    <span className="text-sm font-bold text-white">WL</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">William L.</p>
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.60)" }}>Deposition</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>Now</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgb(52 211 153)", animation: "pulseDot 2s ease-in-out infinite" }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 rounded-full w-full" style={{ background: "rgba(255,255,255,0.20)" }} />
                  <div className="h-2 rounded-full w-4/5" style={{ background: "rgba(255,255,255,0.15)" }} />
                  <div className="h-2 rounded-full w-3/5" style={{ background: "rgba(255,255,255,0.10)" }} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.20)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" style={{ color: "rgb(180 80 80)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>AI Remix</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.20)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" style={{ color: "rgb(110 231 183)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>AI Dictate</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 left-4 right-4 h-full rounded-[10px] -z-10" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }} />
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-5">
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Email that works<br />as smart as you do
            </h1>
          </div>

          {/* Feature Cards */}
          <div className="space-y-3">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
                iconColor: "rgb(180 80 80)",
                title: "AI Remix",
                desc: "Rewrite emails in any tone instantly",
                badge: "New",
                badgeStyle: { background: "rgba(84,3,3,0.30)", color: "rgb(220 140 140)", border: "1px solid rgba(130,30,30,0.30)" },
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />,
                iconColor: "rgb(110 231 183)",
                title: "AI Dictate",
                desc: "Speak your email, AI transcribes it",
                badge: "Beta",
                badgeStyle: { background: "rgba(16,185,129,0.30)", color: "rgb(167 243 208)", border: "1px solid rgba(52,211,153,0.30)" },
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
                iconColor: "rgba(255,255,255,0.80)",
                title: "Smart Contacts",
                desc: "Always organized, always accessible",
                badge: null,
                badgeStyle: {},
              },
            ].map((f, i) => (
              <div key={i} className="rounded-[10px] px-4 py-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}>
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: f.iconColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{f.icon}</svg>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>{f.desc}</p>
                </div>
                {f.badge && (
                  <div className="ml-auto">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={f.badgeStyle}>{f.badge}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-6">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
            Powered by{" "}
            <a href="https://botmakers.ai" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "rgba(255,255,255,0.60)" }}>
              BotMakers
            </a>
            {" "}(botmakers.ai)
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 bg-white px-6 sm:px-10 lg:px-16 xl:px-20 py-10 justify-center overflow-hidden">

        {/* Mobile Logo */}
        <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "rgb(138 9 9)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-lg" style={{ color: "rgb(27 29 29)" }}>EaseMail</span>
        </div>

        <div className="w-full max-w-md mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-2xl xl:text-3xl font-bold mb-2" style={{ color: "rgb(27 29 29)" }}>Darren Miller Law Firm</h2>
            <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>Sign in to your account to continue</p>
          </div>

          {/* Error message */}
          <Suspense>
            <ErrorMessage />
          </Suspense>

          {/* Microsoft Sign-In Button */}
          <a
            href="/api/auth/microsoft"
            className="w-full flex items-center justify-center gap-3 border rounded-[10px] px-6 py-3.5 text-sm font-semibold transition-all hover:bg-neutral-50"
            style={{
              backgroundColor: "rgb(255 255 255)",
              borderColor: "rgb(220 220 220)",
              color: "rgb(58 58 58)",
              boxShadow: "0px 4px 4px 0px rgba(27,29,29,0.10)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="w-5 h-5 flex-shrink-0">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Sign in with Microsoft
          </a>

          <p className="text-center text-xs mt-5 leading-relaxed" style={{ color: "rgb(155 155 155)" }}>
            To join this Organization you only need to login with your dmillerlaw.com email address. Once authenticated, EaseMail will sync your emails, contacts and calendar. Please contact David Romero with any questions or issues.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link href="#" className="text-xs transition-colors" style={{ color: "rgb(155 155 155)" }}>Privacy Policy</Link>
            <span className="text-xs" style={{ color: "rgb(190 190 190)" }}>·</span>
            <Link href="#" className="text-xs transition-colors" style={{ color: "rgb(155 155 155)" }}>Terms of Service</Link>
            <span className="text-xs" style={{ color: "rgb(190 190 190)" }}>·</span>
            <Link href="/help" className="text-xs transition-colors" style={{ color: "rgb(155 155 155)" }}>Help Center</Link>
          </div>
          <p className="text-center text-xs mt-3" style={{ color: "rgb(190 190 190)" }}>© 2025 EaseMail Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes floatEnvelope {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

const ERROR_LABELS: Record<string, string> = {
  ms_oauth_failed: "Microsoft sign-in was cancelled or failed. Please try again.",
  session_failed: "Failed to create your session. Please try again.",
};

function ErrorMessage() {
  const params = useSearchParams();
  const raw = params.get("error");
  if (!raw) return null;
  const message = ERROR_LABELS[raw] ?? `Sign-in error: ${raw}`;
  return (
    <div
      className="mb-5 rounded-[10px] px-4 py-3 text-sm text-left"
      style={{ backgroundColor: "rgb(254 242 242)", border: "1px solid rgb(252 165 165)", color: "rgb(153 27 27)" }}
    >
      {message}
    </div>
  );
}
