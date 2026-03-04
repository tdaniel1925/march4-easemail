/**
 * GET /api/auth/microsoft/callback
 *
 * Flow:
 *  1. Exchange code via MSAL → get access token + account info
 *  2. Find or create Supabase user by email (service role)
 *  3. Ensure DB user row + org exist
 *  4. Save MSAL token cache + MsConnectedAccount to DB
 *  5. Generate Supabase magic link → redirect browser through it
 *     (Supabase handles setting session cookies, then redirects to /auth/callback)
 */
import { NextRequest, NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { createServiceClient } from "@/lib/supabase/server";
import { createMsalClient, GRAPH_SCOPES } from "@/lib/microsoft/msal";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state"); // "login" | "add"

  if (error || !code) {
    console.error("Microsoft OAuth error:", error, searchParams.get("error_description"));
    return NextResponse.redirect(new URL("/login?error=ms_oauth_failed", req.url));
  }

  try {
    // ── 1. Exchange code via MSAL ─────────────────────────────────────────────
    console.log("[auth/callback] Step 1: exchanging MSAL code, redirectUri=", process.env.MICROSOFT_REDIRECT_URI);
    const tempMsal = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID!,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? "common"}`,
      },
    });

    const tokenResult = await tempMsal.acquireTokenByCode({
      code,
      scopes: GRAPH_SCOPES,
      redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
    });
    console.log("[auth/callback] Step 1 done, account:", tokenResult?.account?.username);

    if (!tokenResult?.account) throw new Error("No account in token response");

    const { homeAccountId, username: msEmail, name: displayName, tenantId } = tokenResult.account;

    // ── 2. Find or create Supabase user ──────────────────────────────────────
    console.log("[auth/callback] Step 2: find/create Supabase user for", msEmail);
    const supabaseAdmin = await createServiceClient();

    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === msEmail);

    let supabaseUserId: string;
    if (existing) {
      supabaseUserId = existing.id;
      console.log("[auth/callback] Step 2: found existing user", supabaseUserId);
    } else {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: msEmail,
        email_confirm: true,
        user_metadata: { full_name: displayName ?? msEmail, provider: "microsoft" },
      });
      if (createErr || !newUser?.user) throw new Error(`Create user failed: ${createErr?.message}`);
      supabaseUserId = newUser.user.id;
      console.log("[auth/callback] Step 2: created new user", supabaseUserId);
    }

    // ── 3. Ensure DB user + org ───────────────────────────────────────────────
    console.log("[auth/callback] Step 3: checking DB for user", supabaseUserId);
    const dbUser = await prisma.user.findUnique({ where: { id: supabaseUserId } });
    if (!dbUser) {
      let org = await prisma.organization.findFirst({ where: { slug: "default" } });
      if (!org) {
        org = await prisma.organization.create({
          data: { name: "My Organization", slug: "default" },
        });
      }
      await prisma.user.create({
        data: { id: supabaseUserId, email: msEmail, name: displayName ?? null, orgId: org.id },
      });
    }

    // ── 4. Save MSAL cache + connected account ────────────────────────────────
    console.log("[auth/callback] Step 4: saving MSAL cache and connected account");
    const serializedCache = tempMsal.getTokenCache().serialize();
    await prisma.msalTokenCache.upsert({
      where: { userId: supabaseUserId },
      update: { cacheJson: serializedCache, updatedAt: new Date() },
      create: { userId: supabaseUserId, cacheJson: serializedCache, updatedAt: new Date() },
    });

    const existingCount = await prisma.msConnectedAccount.count({ where: { userId: supabaseUserId } });
    await prisma.msConnectedAccount.upsert({
      where: { userId_homeAccountId: { userId: supabaseUserId, homeAccountId } },
      update: { msEmail, displayName: displayName ?? null, tenantId: tenantId ?? null, updatedAt: new Date() },
      create: {
        userId: supabaseUserId,
        homeAccountId,
        msEmail,
        displayName: displayName ?? null,
        tenantId: tenantId ?? null,
        isDefault: existingCount === 0,
      },
    });

    // ── 5. Generate Supabase magic link → redirect through it ─────────────────
    console.log("[auth/callback] Step 5: generating magic link for", msEmail);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";
    const redirectTo = state === "add"
      ? `${appUrl}/auth/callback?next=/accounts?added=1`
      : `${appUrl}/auth/callback?next=/inbox`;

    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: msEmail,
      options: { redirectTo },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      throw new Error(`Magic link failed: ${linkErr?.message}`);
    }

    console.log("[auth/callback] Step 5 done, redirecting via magic link");
    return NextResponse.redirect(linkData.properties.action_link);
  } catch (err) {
    const e = err as Error;
    console.error("[auth/callback] FAILED:", {
      name: e?.name,
      message: e?.message,
      cause: (e as {cause?: unknown})?.cause,
      stack: e?.stack?.split("\n").slice(0, 4).join("\n"),
    });
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(String(err))}`, req.url));
  }
}
