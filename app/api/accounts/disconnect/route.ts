import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createMsalClient } from "@/lib/microsoft/msal";
import { graphFetch } from "@/lib/microsoft/graph";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { homeAccountId } = await req.json() as { homeAccountId: string };
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });

  // Verify the account belongs to this user
  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, homeAccountId },
  });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // ── 1. Cancel Graph webhook subscriptions (best-effort) ──────────────────────
  const webhooks = await prisma.webhookSubscription.findMany({
    where: { userId: user.id, homeAccountId },
  });
  await Promise.allSettled(
    webhooks.map((w) =>
      graphFetch(user.id, homeAccountId, `/subscriptions/${w.subscriptionId}`, { method: "DELETE" })
    )
  );

  // ── 2. Remove account from MSAL token cache ───────────────────────────────────
  try {
    const msalClient = createMsalClient(user.id);
    const cacheRow = await prisma.msalTokenCache.findUnique({
      where: { userId: user.id },
      select: { cacheJson: true },
    });
    if (cacheRow?.cacheJson) {
      msalClient.getTokenCache().deserialize(cacheRow.cacheJson);
      const accounts = await msalClient.getTokenCache().getAllAccounts();
      const msalAccount = accounts.find((a) => a.homeAccountId === homeAccountId);
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

  // ── 3. Delete all account-scoped DB records in one transaction ────────────────
  await prisma.$transaction([
    prisma.webhookSubscription.deleteMany({ where: { userId: user.id, homeAccountId } }),
    prisma.emailDeltaLink.deleteMany({ where: { userId: user.id, homeAccountId } }),
    prisma.draft.deleteMany({ where: { userId: user.id, homeAccountId } }),
    prisma.msConnectedAccount.delete({ where: { id: account.id } }),
  ]);

  // ── 4. Promote a new default if needed ───────────────────────────────────────
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
