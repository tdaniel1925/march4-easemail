"use client";

/**
 * /auth/callback
 *
 * Handles both Supabase auth flows:
 *  - PKCE flow: Supabase appends ?code= to this URL → exchangeCodeForSession
 *  - Implicit flow: Supabase appends #access_token= hash fragment → setSession
 *
 * A Route Handler can never see hash fragments (browser strips them before
 * the request is sent). This client page handles both cases.
 */
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") ?? "/inbox";
    const code = searchParams.get("code");

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleAuth() {
      // ── PKCE flow: code in query param ──────────────────────────────────────
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`/login?error=session_failed`);
          return;
        }
        router.replace(next);
        return;
      }

      // ── Implicit flow: tokens in URL hash fragment ───────────────────────────
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.slice(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) {
            router.replace(`/login?error=session_failed`);
            return;
          }
          router.replace(next);
          return;
        }
      }

      // ── No auth info found ───────────────────────────────────────────────────
      router.replace("/login?error=no_session");
    }

    void handleAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-50">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm text-neutral-500 font-medium">Signing in…</span>
      </div>
    </div>
  );
}
