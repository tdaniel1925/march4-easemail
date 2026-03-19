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
import { createMsalClient, GRAPH_SCOPES, TEAMS_SCOPES } from "@/lib/microsoft/msal";
import { prisma } from "@/lib/prisma";
import { authLogger } from "@/lib/logger";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

// ── Domain/admin allowlist ────────────────────────────────────────────────────
function isEmailAllowed(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const domain = lower.split("@")[1] ?? "";
  const allowedDomains = (process.env.ALLOWED_DOMAINS ?? "dmillerlaw.com")
    .split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return allowedDomains.includes(domain) || adminEmails.includes(lower);
}

async function callbackHandler(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state") ?? "login";

  if (error || !code) {
    authLogger.error({ error, errorDescription: searchParams.get("error_description") }, "Microsoft OAuth error");
    return NextResponse.redirect(new URL("/login?error=ms_oauth_failed", req.url));
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";

    // ── TEAMS CONSENT FLOW ───────────────────────────────────────────────────
    // Incremental consent: re-exchanges code for a token with Teams scopes,
    // updates the MSAL cache, then redirects to /teams. No account changes.
    if (state.startsWith("teams_consent:")) {
      const userId = state.slice("teams_consent:".length);
      if (!userId) throw new Error("Invalid teams_consent state — missing userId");

      authLogger.info({ userId, flow: "teams_consent" }, "TEAMS_CONSENT flow started");

      const msal = createMsalClient(userId);
      await msal.acquireTokenByCode({
        code,
        scopes: TEAMS_SCOPES,
        redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
      });

      authLogger.info({ userId, flow: "teams_consent" }, "TEAMS_CONSENT: cache updated, redirecting to /teams");
      return NextResponse.redirect(new URL("/teams", appUrl));
    }

    // ── ADD ACCOUNT FLOW ─────────────────────────────────────────────────────
    if (state.startsWith("add:")) {
      const userId = state.slice(4);
      if (!userId) throw new Error("Invalid add state — missing userId");

      authLogger.info({ userId, flow: "add" }, "ADD flow started");

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

      if (!isEmailAllowed(msEmail)) {
        authLogger.warn({ msEmail, userId, flow: "add" }, "ADD: blocked unauthorized email");
        return NextResponse.redirect(new URL("/login?error=unauthorized_domain", appUrl));
      }

      authLogger.info({ msEmail, userId, flow: "add" }, "ADD: linking MS account to user");

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

      authLogger.info({ userId, msEmail, flow: "add" }, "ADD: done, redirecting to /accounts");
      return NextResponse.redirect(new URL("/accounts?added=1", appUrl));
    }

    // ── LOGIN FLOW ───────────────────────────────────────────────────────────

    // 1. Exchange code via temp MSAL (no cache plugin — no userId yet)
    authLogger.info({ flow: "login" }, "LOGIN flow started, exchanging code");
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
    authLogger.info({ username: tokenResult?.account?.username, flow: "login" }, "Token acquired");

    if (!tokenResult?.account) throw new Error("No account in token response");

    const { homeAccountId, username: msEmail, name: displayName, tenantId } = tokenResult.account;

    // 1b. Domain/admin gate — reject unauthorized accounts before creating anything
    if (!isEmailAllowed(msEmail)) {
      authLogger.warn({ msEmail, flow: "login" }, "LOGIN: blocked unauthorized email");
      return NextResponse.redirect(new URL("/login?error=unauthorized_domain", appUrl));
    }

    // 2. Find or create Supabase user
    const supabaseAdmin = createServiceClient();

    // Look up by email in our DB (O(1) indexed lookup — avoids listUsers O(n) scan)
    const existingDbUser = await prisma.user.findUnique({ where: { email: msEmail } });

    let supabaseUserId: string;
    if (existingDbUser) {
      supabaseUserId = existingDbUser.id;
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
    authLogger.error({
      err,
      name: e?.name,
      message: e?.message,
      state,
    }, "auth/callback FAILED");
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(String(err))}`, req.url));
  }
}

// Export with strict rate limiting (10 auth callbacks per 15 minutes)
export const GET = withRateLimit(callbackHandler, rateLimiters.auth);
