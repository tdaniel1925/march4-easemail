import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createMsalClient } from "@/lib/microsoft/msal";
import { graphFetch } from "@/lib/microsoft/graph";
import { detectProviderType } from "@/lib/providers/registry";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { homeAccountId?: unknown };
  const homeAccountId = typeof body.homeAccountId === "string" ? body.homeAccountId : "";
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });

  const providerType = detectProviderType(homeAccountId);

  // ── IMAP disconnect ─────────────────────────────────────────────────────────
  if (providerType === "imap") {
    const account = await prisma.imapConnectedAccount.findFirst({
      where: { userId: user.id, accountId: homeAccountId },
      select: { id: true, accountId: true },
    });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    // Delete cached data + account
    await prisma.$transaction([
      prisma.cachedEmail.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.cachedFolder.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.cachedContact.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.cachedCalendarEvent.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.cachedSearchResult.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.emailDeltaLink.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.syncStatus.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.draft.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.imapConnectedAccount.delete({ where: { id: account.id } }),
    ]);

    // Promote a new default IMAP account if needed
    const remainingImap = await prisma.imapConnectedAccount.findMany({
      where: { userId: user.id },
      orderBy: { connectedAt: "asc" },
    });
    if (remainingImap.length > 0 && !remainingImap.some((a) => a.isDefault)) {
      await prisma.imapConnectedAccount.update({
        where: { id: remainingImap[0].id },
        data: { isDefault: true },
      });
    }

    return NextResponse.json({ ok: true });
  }

  // ── JMAP disconnect ─────────────────────────────────────────────────────────
  if (providerType === "jmap") {
    const account = await prisma.jmapConnectedAccount.findFirst({
      where: { userId: user.id, accountId: homeAccountId },
      select: { id: true, accountId: true },
    });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    // Delete cached data + account
    await prisma.$transaction([
      prisma.cachedEmail.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.cachedFolder.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.cachedContact.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.cachedCalendarEvent.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.cachedSearchResult.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.emailDeltaLink.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.syncStatus.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.draft.deleteMany({ where: { userId: user.id, homeAccountId: account.accountId } }),
      prisma.jmapConnectedAccount.delete({ where: { id: account.id } }),
    ]);

    // Promote a new default JMAP account if needed
    const remainingJmap = await prisma.jmapConnectedAccount.findMany({
      where: { userId: user.id },
      orderBy: { connectedAt: "asc" },
    });
    if (remainingJmap.length > 0 && !remainingJmap.some((a) => a.isDefault)) {
      await prisma.jmapConnectedAccount.update({
        where: { id: remainingJmap[0].id },
        data: { isDefault: true },
      });
    }

    return NextResponse.json({ ok: true });
  }

  // ── Microsoft disconnect (existing flow) ─────────────────────────────────────
  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, homeAccountId },
    select: { id: true, homeAccountId: true },
  });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const verifiedHomeAccountId = account.homeAccountId;

  // 1. Cancel Graph webhook subscriptions (best-effort)
  const webhooks = await prisma.webhookSubscription.findMany({
    where: { userId: user.id, homeAccountId: verifiedHomeAccountId },
    select: { subscriptionId: true },
  });
  await Promise.allSettled(
    webhooks.map((w) =>
      graphFetch(user.id, verifiedHomeAccountId, `/subscriptions/${w.subscriptionId}`, { method: "DELETE" })
    )
  );

  // 2. Remove account from MSAL token cache
  try {
    const msalClient = createMsalClient(user.id);
    const cacheRow = await prisma.msalTokenCache.findUnique({
      where: { userId: user.id },
      select: { cacheJson: true },
    });
    if (cacheRow?.cacheJson) {
      msalClient.getTokenCache().deserialize(cacheRow.cacheJson);
      const accounts = await msalClient.getTokenCache().getAllAccounts();
      const msalAccount = accounts.find((a) => a.homeAccountId === verifiedHomeAccountId);
      if (msalAccount) {
        await msalClient.getTokenCache().removeAccount(msalAccount);
        const updatedJson = msalClient.getTokenCache().serialize();
        await prisma.msalTokenCache.update({
          where: { userId: user.id },
          data: { cacheJson: updatedJson, updatedAt: new Date() },
        });
      }
    }
  } catch {
    // Non-fatal — tokens will expire naturally
  }

  // 3. Delete all account-scoped DB records in one transaction
  await prisma.$transaction([
    prisma.webhookSubscription.deleteMany({ where: { userId: user.id, homeAccountId: verifiedHomeAccountId } }),
    prisma.emailDeltaLink.deleteMany({ where: { userId: user.id, homeAccountId: verifiedHomeAccountId } }),
    prisma.draft.deleteMany({ where: { userId: user.id, homeAccountId: verifiedHomeAccountId } }),
    prisma.msConnectedAccount.delete({ where: { id: account.id } }),
  ]);

  // 4. Promote a new default if needed
  const remaining = await prisma.msConnectedAccount.findMany({
    where: { userId: user.id },
    orderBy: { connectedAt: "asc" },
  });
  if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
    await prisma.msConnectedAccount.update({
      where: { id: remaining[0].id },
      data: { isDefault: true },
    });
  }

  return NextResponse.json({ ok: true });
}
