/**
 * GET /api/auth/microsoft
 * Initiates Microsoft OAuth via MSAL.
 * Uses a temporary "anon" key in state so the callback can identify the flow.
 * ?add=1 → adding a second MS account (user must already be logged in)
 */
import { NextRequest, NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { GRAPH_SCOPES } from "@/lib/microsoft/msal";

export async function GET(req: NextRequest) {
  const add = req.nextUrl.searchParams.get("add") === "1";

  // For initial login we don't have a userId yet — use a temp MSAL client
  // with no cache plugin. The callback will save cache after user is identified.
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
    state: add ? "add" : "login",
  });

  return NextResponse.redirect(authUrl);
}
