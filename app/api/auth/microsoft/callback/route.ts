/**
 * GET /api/auth/microsoft/callback
 *
 * Two flows depending on state param:
 *
 * state === "login"       → first-time connect
 *   1. Exchange code via MSAL (temp client, no cache)
 *   2. Find or create Supabase user by email
 *   3. Ensure DB user + org
 *   4. Save MSAL cache + MsConnectedAccount
 *   5. Generate magic link → browser gets a session → /inbox
 *
 * state === "add:{userId}" → adding a second MS account to an existing user
 *   1. Exchange code via createMsalClient(userId) — loads existing cache,
 *      adds new account token, auto-saves combined cache via DB plugin
 *   2. Upsert MsConnectedAccount linked to the existing userId
 *   3. Redirect directly to /accounts?added=1 (session unchanged)
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
  const state = searchParams.get("state") ?? "login";

  if (error || !code) {
    console.error("Microsoft OAuth error:", error, searchParams.get("error_description"));
    return NextResponse.redirect(new URL("/login?error=ms_oauth_failed", req.url));
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";

    // ── ADD ACCOUNT FLOW ─────────────────────────────────────────────────────
    if (state.startsWith("add:")) {
      const userId = state.slice(4);
      if (!userId) throw new Error("Invalid add state — missing userId");

      console.log("[auth/callback] ADD flow for userId:", userId);

      // Use the user's existing MSAL client (DB cache plugin).
      // acquireTokenByCode will load Account A's tokens, add Account B's
      // token, then auto-save the combined cache via afterCacheAccess.
      const msal = createMsalClient(userId);
      const tokenResult = await msal.acquireTokenByCode({
        code,
        scopes: GRAPH_SCOPES,
        redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
      });

      if (!tokenResult?.account) throw new Error("No account in token response");

      const { homeAccountId, username: msEmail, name: displayName, tenantId } = tokenResult.account;
      console.log("[auth/callback] ADD: linking", msEmail, "to user", userId);

      await prisma.msConnectedAccount.upsert({
        where: { userId_homeAccountId: { userId, homeAccountId } },
        update: { msEmail, displayName: displayName ?? null, tenantId: tenantId ?? null, updatedAt: new Date() },
        create: {
          userId,
          homeAccountId,
          msEmail,
          displayName: displayName ?? null,
          tenantId: tenantId ?? null,
          isDefault: false, // original account keeps default
        },
      });

      console.log("[auth/callback] ADD: done, redirecting to /accounts?added=1");
      return NextResponse.redirect(new URL("/accounts?added=1", appUrl));
    }

    // ── LOGIN FLOW ───────────────────────────────────────────────────────────

    // 1. Exchange code via temp MSAL (no cache plugin — no userId yet)
    console.log("[auth/callback] LOGIN flow, exchanging code");
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
    console.log("[auth/callback] token acquired for:", tokenResult?.account?.username);

    if (!tokenResult?.account) throw new Error("No account in token response");

    const { homeAccountId, username: msEmail, name: displayName, tenantId } = tokenResult.account;

    // 2. Find or create Supabase user
    const supabaseAdmin = createServiceClient();
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === msEmail);

    let supabaseUserId: string;
    if (existing) {
      supabaseUserId = existing.id;
    } else {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: msEmail,
        email_confirm: true,
        user_metadata: { full_name: displayName ?? msEmail, provider: "microsoft" },
      });
      if (createErr || !newUser?.user) throw new Error(`Create user failed: ${createErr?.message}`);
      supabaseUserId = newUser.user.id;
    }

    // 3. Ensure DB user + org
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

    // 4. Save MSAL cache + connected account
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

    // 5. Generate magic link → sets Supabase session → /inbox
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: msEmail,
      options: { redirectTo: `${appUrl}/auth/callback?next=/inbox` },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      throw new Error(`Magic link failed: ${linkErr?.message}`);
    }

    return NextResponse.redirect(linkData.properties.action_link);

  } catch (err) {
    const e = err as Error;
    console.error("[auth/callback] FAILED:", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack?.split("\n").slice(0, 4).join("\n"),
    });
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(String(err))}`, req.url));
  }
}
