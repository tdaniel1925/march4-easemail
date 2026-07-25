import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { encryptCredential } from "@/lib/providers/crypto";
import { validateSessionUrl } from "../_lib/validate-session-url";
import { z } from "zod";

const updateAccountSchema = z.object({
  homeAccountId: z.string().min(1, "homeAccountId is required").max(512),
  displayName: z.string().max(200).optional(),
  token: z.string().min(1).max(8192).optional(),
  password: z.string().min(1).max(1024).optional(),
  sessionUrl: z.string().url("Invalid URL").max(2048).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = updateAccountSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { homeAccountId, displayName, token, password, sessionUrl } = parsed.data;

  // ── JMAP account update ────────────────────────────────────────────────────
  if (homeAccountId.startsWith("jmap:")) {
    const account = await prisma.jmapConnectedAccount.findFirst({
      where: { userId: user.id, accountId: homeAccountId },
    });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const updates: Record<string, unknown> = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (sessionUrl) {
      // SSRF guard — sessionUrl is user-supplied and fetched server-side
      const urlCheck = await validateSessionUrl(sessionUrl);
      if (!urlCheck.ok) {
        return NextResponse.json({ error: urlCheck.error }, { status: 400 });
      }
      updates.sessionUrl = sessionUrl;
    }

    // If a new token is provided, encrypt it and validate the JMAP session
    if (token) {
      try {
        const testSession = await fetch(sessionUrl ?? account.sessionUrl, {
          headers: { Authorization: `Bearer ${token}` },
          redirect: "error",
          signal: AbortSignal.timeout(10_000),
        });
        if (!testSession.ok) {
          return NextResponse.json({ error: "Invalid API token — JMAP session test failed" }, { status: 422 });
        }
        const session = await testSession.json();
        const primaryAccountId = session.primaryAccounts?.["urn:ietf:params:jmap:mail"];
        if (!primaryAccountId) {
          return NextResponse.json({ error: "No primary mail account found in JMAP session" }, { status: 422 });
        }

        const encrypted = encryptCredential(token);
        updates.encryptedToken = encrypted.encrypted;
        updates.encryptionIv = encrypted.iv;
        updates.encryptionTag = encrypted.tag;
        updates.jmapAccountId = primaryAccountId;

        // Check submission capability
        const hasSubmission =
          session.capabilities?.["urn:ietf:params:jmap:submission"] !== undefined ||
          session.accounts?.[primaryAccountId]?.accountCapabilities?.["urn:ietf:params:jmap:submission"] !== undefined;
        if (!hasSubmission) {
          return NextResponse.json({
            error: "Token connected but lacks 'Mail submission' permission. You can read emails but sending will fail. Create a new token with Mail submission scope enabled.",
          }, { status: 422 });
        }
      } catch (err) {
        return NextResponse.json({
          error: "Failed to validate token",
          details: err instanceof Error ? err.message : "Unknown error",
        }, { status: 422 });
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await prisma.jmapConnectedAccount.update({
      where: { id: account.id },
      data: updates,
    });

    return NextResponse.json({ ok: true, providerType: "jmap" });
  }

  // ── IMAP account update ────────────────────────────────────────────────────
  if (homeAccountId.startsWith("imap:")) {
    const account = await prisma.imapConnectedAccount.findFirst({
      where: { userId: user.id, accountId: homeAccountId },
    });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const updates: Record<string, unknown> = {};
    if (displayName !== undefined) updates.displayName = displayName;

    if (password) {
      const encrypted = encryptCredential(password);
      updates.encryptedPassword = encrypted.encrypted;
      updates.encryptionIv = encrypted.iv;
      updates.encryptionTag = encrypted.tag;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await prisma.imapConnectedAccount.update({
      where: { id: account.id },
      data: updates,
    });

    return NextResponse.json({ ok: true, providerType: "imap" });
  }

  // ── Microsoft accounts — display name only (tokens managed by OAuth) ───────
  const msAccount = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, homeAccountId },
  });
  if (!msAccount) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  if (displayName !== undefined) {
    await prisma.msConnectedAccount.update({
      where: { id: msAccount.id },
      data: { displayName },
    });
  }

  return NextResponse.json({ ok: true, providerType: "microsoft" });
}
