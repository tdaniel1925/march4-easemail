import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: "rgb(250 250 250)" }}>
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "rgb(138 9 9)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-xl" style={{ color: "rgb(27 29 29)" }}>EaseMail</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-[10px] p-8 shadow-card">
          <div className="w-14 h-14 rounded-[10px] flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgb(253 235 235)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" style={{ color: "rgb(138 9 9)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ color: "rgb(27 29 29)" }}>Connect your Microsoft account</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgb(115 115 115)" }}>
            EaseMail uses your Microsoft 365 account to access your email, calendar, and contacts. You&apos;ll only need to do this once.
          </p>

          <a
            href="/api/auth/microsoft"
            className="w-full flex items-center justify-center gap-3 border rounded-[10px] px-6 py-3.5 text-sm font-semibold transition-all mb-4"
            style={{
              backgroundColor: "rgb(138 9 9)",
              borderColor: "rgb(138 9 9)",
              color: "white",
              boxShadow: "0px 4px 4px 0px rgba(27,29,29,0.10)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="w-5 h-5 flex-shrink-0">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Connect Microsoft 365
          </a>

          <p className="text-xs leading-relaxed" style={{ color: "rgb(155 155 155)" }}>
            EaseMail will request access to your email, calendar, and contacts. You can disconnect at any time from Settings.
          </p>
        </div>

        <p className="text-xs mt-6" style={{ color: "rgb(190 190 190)" }}>
          Signed in as {user.email} ·{" "}
          <Link href="/api/auth/signout" className="underline">Sign out</Link>
        </p>
      </div>
    </div>
  );
}
