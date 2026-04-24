import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider } from "@/lib/providers/registry";

/**
 * POST /api/mail/move-folder
 * Moves an email to a specified folder
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, folderId, homeAccountId } = await req.json() as {
    messageId: string;
    folderId: string;
    homeAccountId?: string;
  };

  if (!messageId || !folderId) {
    return NextResponse.json(
      { error: "messageId and folderId required" },
      { status: 400 }
    );
  }

  // Resolve account: use provided homeAccountId or fall back to default
  let accountId = homeAccountId;
  if (!accountId) {
    const { getAllAccounts } = await import("@/lib/providers/registry");
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  try {
    // Verify folder belongs to user by checking provider's folder list
    const provider = getProvider(accountId);
    const folders = await provider.fetchFolders(user.id, accountId);
    const folder = folders.find((f) => f.id === folderId);

    if (!folder) {
      return NextResponse.json({ error: "Folder not found or access denied" }, { status: 404 });
    }

    await provider.moveMessage(user.id, accountId, messageId, folderId);

    return NextResponse.json({ ok: true, folderId });
  } catch (error) {
    console.error("[move-folder] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to move" },
      { status: 500 }
    );
  }
}
