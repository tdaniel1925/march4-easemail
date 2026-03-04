/**
 * GET /auth/callback
 * Supabase redirects here after magic link verification with a ?code= param.
 * Exchange it for a session → set cookies → redirect to final destination.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/inbox";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Session exchange error:", error.message);
      return NextResponse.redirect(new URL("/login?error=session_failed", req.url));
    }
  }

  return NextResponse.redirect(new URL(next, req.url));
}
