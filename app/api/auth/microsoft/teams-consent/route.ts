/**
 * GET /api/auth/microsoft/teams-consent
 *
 * Incremental consent for Teams scopes.
 * The user is already logged in and has an MS account connected, but the
 * existing token was issued before Teams scopes were added. This redirects
 * to Microsoft with prompt=consent so the user grants the new permissions
 * without disconnecting their account.
 *
 * After consent, the callback handles state="teams_consent:{userId}" and
 * just updates the MSAL cache + redirects to /teams.
 */
import { NextRequest, NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { GRAPH_SCOPES } from "@/lib/microsoft/msal";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { where: { isDefault: true } } },
  });

  const loginHint = dbUser?.msAccounts[0]?.msEmail ?? undefined;

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
    prompt: "consent",
    loginHint,
    state: `teams_consent:${user.id}`,
  });

  return NextResponse.redirect(authUrl);
}
