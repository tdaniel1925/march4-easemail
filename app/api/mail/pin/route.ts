import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { verifyAccountOwnership, getAllAccounts } from "@/lib/providers/registry";

/**
 * POST /api/mail/pin
 * Toggles the pinned status of a cached email.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, homeAccountId, pinned } = await req.json() as {
    messageId: string;
    homeAccountId?: string;
    pinned: boolean;
  };

  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  if (typeof pinned !== "boolean") {
    return NextResponse.json({ error: "pinned (boolean) required" }, { status: 400 });
  }

  // Resolve account
  let accountId = homeAccountId;
  if (!accountId) {
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    await prisma.cachedEmail.updateMany({
      where: {
        id: messageId,
        userId: user.id,
        homeAccountId: accountId,
      },
      data: {
        isPinned: pinned,
      },
    });

    return NextResponse.json({ ok: true, pinned });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update pin status" },
      { status: 500 }
    );
  }
}
