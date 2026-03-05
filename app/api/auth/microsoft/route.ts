/**
 * GET /api/auth/microsoft
 * Initiates Microsoft OAuth via MSAL.
 * ?add=1 → adding a second MS account (user must already be logged in).
 *           Embeds the current userId in state so the callback can link
 *           the new account to the right user without creating a new one.
 */
import { NextRequest, NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { GRAPH_SCOPES } from "@/lib/microsoft/msal";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const add = req.nextUrl.searchParams.get("add") === "1";

  let state = "login";

  if (add) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL("/login", req.url));
    // Embed userId so the callback knows which account to attach to
    state = `add:${user.id}`;
  }

  const msal = new ConfidentialClientApplication({
    auth: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? "common"}`,
    },
  });

  const authUrl = await msal.getAuthCodeUrl({
    scopes: GRAPH_SCOPES,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
    prompt: "select_account",
    state,
  });

  return NextResponse.redirect(authUrl);
}
