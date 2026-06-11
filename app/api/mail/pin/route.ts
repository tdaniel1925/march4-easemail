import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { verifyAccountOwnership, getAllAccounts } from "@/lib/providers/registry";

const pinSchema = z.object({
  messageId: z.string().min(1).max(512),
  homeAccountId: z.string().min(1).max(512).optional(),
  pinned: z.boolean(),
});

/**
 * POST /api/mail/pin
 * Toggles the pinned status of a cached email.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = pinSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId, homeAccountId, pinned } = parsed.data;

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
