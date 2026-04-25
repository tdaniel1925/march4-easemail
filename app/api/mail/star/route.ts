import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { verifyAccountOwnership, getProvider, getAllAccounts } from "@/lib/providers/registry";

/**
 * POST /api/mail/star
 * Toggles the starred/flagged status of an email
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, homeAccountId, flagged } = await req.json() as {
    messageId: string;
    homeAccountId?: string;
    flagged: boolean;
  };

  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  // Resolve account: use provided homeAccountId or fall back to default
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
    // Use provider abstraction — works for Microsoft, IMAP, and JMAP
    const provider = getProvider(accountId);
    await provider.flagMessage(user.id, accountId, messageId, flagged);

    // Update cache
    await prisma.cachedEmail.updateMany({
      where: {
        id: messageId,
        userId: user.id,
        homeAccountId: accountId,
      },
      data: {
        flagStatus: flagged ? "flagged" : "notFlagged",
      },
    });

    return NextResponse.json({ ok: true, flagged });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update flag status" },
      { status: 500 }
    );
  }
}
