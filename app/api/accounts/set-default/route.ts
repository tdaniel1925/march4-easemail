import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const setDefaultSchema = z.object({
  accountType: z.enum(["microsoft", "imap", "jmap"]),
  // MS accounts are identified by homeAccountId; IMAP/JMAP by their accountId
  // ("imap:<cuid>" / "jmap:<cuid>") — same scheme as the disconnect route.
  accountId: z.string().min(1, "accountId required").max(512),
});

interface AccountSummary {
  id: string;
  accountId: string;
  email: string;
  displayName: string | null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = setDefaultSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { accountType, accountId } = parsed.data;

  // Verify ownership + clear all defaults + set the new one atomically.
  const target = await prisma.$transaction(async (tx): Promise<AccountSummary | null> => {
    // 1. Verify the target account exists and belongs to this user
    let found: AccountSummary | null = null;
    if (accountType === "microsoft") {
      const a = await tx.msConnectedAccount.findFirst({
        where: { userId: user.id, homeAccountId: accountId },
        select: { id: true, homeAccountId: true, msEmail: true, displayName: true },
      });
      if (a) found = { id: a.id, accountId: a.homeAccountId, email: a.msEmail, displayName: a.displayName };
    } else if (accountType === "imap") {
      const a = await tx.imapConnectedAccount.findFirst({
        where: { userId: user.id, accountId },
        select: { id: true, accountId: true, email: true, displayName: true },
      });
      if (a) found = { id: a.id, accountId: a.accountId, email: a.email, displayName: a.displayName };
    } else {
      const a = await tx.jmapConnectedAccount.findFirst({
        where: { userId: user.id, accountId },
        select: { id: true, accountId: true, email: true, displayName: true },
      });
      if (a) found = { id: a.id, accountId: a.accountId, email: a.email, displayName: a.displayName };
    }
    if (!found) return null;

    // 2. Clear isDefault on ALL of this user's accounts across all providers
    await tx.msConnectedAccount.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
    await tx.imapConnectedAccount.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
    await tx.jmapConnectedAccount.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // 3. Set the target as default (filtered by BOTH id AND userId)
    if (accountType === "microsoft") {
      await tx.msConnectedAccount.updateMany({
        where: { id: found.id, userId: user.id },
        data: { isDefault: true },
      });
    } else if (accountType === "imap") {
      await tx.imapConnectedAccount.updateMany({
        where: { id: found.id, userId: user.id },
        data: { isDefault: true },
      });
    } else {
      await tx.jmapConnectedAccount.updateMany({
        where: { id: found.id, userId: user.id },
        data: { isDefault: true },
      });
    }

    return found;
  });

  if (!target) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    account: {
      id: target.id,
      accountId: target.accountId,
      email: target.email,
      displayName: target.displayName,
      isDefault: true,
      providerType: accountType,
    },
  });
}
