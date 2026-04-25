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
import { authLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // ── Guard: require all Microsoft env vars before attempting MSAL ──────────
    const clientId     = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const redirectUri  = process.env.MICROSOFT_REDIRECT_URI;
    const tenantId     = process.env.MICROSOFT_TENANT_ID ?? "common";

    if (!clientId || !clientSecret || !redirectUri) {
      authLogger.error(
        {
          hasClientId:     !!clientId,
          hasClientSecret: !!clientSecret,
          hasRedirectUri:  !!redirectUri,
        },
        "Microsoft auth env vars not configured"
      );
      return NextResponse.redirect(new URL("/login?error=config_error", req.url));
    }

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
        clientId,
        clientSecret,
        authority: `https://login.microsoftonline.com/${tenantId}`,
      },
    });

    const authUrl = await msal.getAuthCodeUrl({
      scopes: GRAPH_SCOPES,
      redirectUri,
      prompt: "select_account",
      state,
    });

    authLogger.info({ add, state: add ? "add" : "login" }, "Redirecting to Microsoft login");
    return NextResponse.redirect(authUrl);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    authLogger.error({ err, message }, "[auth/microsoft] Failed to build auth URL");
    // Do NOT expose the raw error message to the browser
    return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
  }
}
