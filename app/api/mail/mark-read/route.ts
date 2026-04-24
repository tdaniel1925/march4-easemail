import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider } from "@/lib/providers/registry";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, isRead, homeAccountId } = await req.json() as {
    messageId: string;
    isRead?: boolean;
    homeAccountId?: string;
  };
  if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });

  // Resolve account: use provided homeAccountId or fall back to default
  let accountId = homeAccountId;
  if (!accountId) {
    // Backward compatibility: find default account across all provider types
    const { getAllAccounts } = await import("@/lib/providers/registry");
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  const readValue = isRead ?? true; // Default to true for backward compatibility

  try {
    const provider = getProvider(accountId);
    await provider.markRead(user.id, accountId, messageId, readValue);

    return NextResponse.json({ ok: true, isRead: readValue });
  } catch (error) {
    console.error("[mark-read] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update read status" },
      { status: 500 }
    );
  }
}
