import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider } from "@/lib/providers/registry";

/**
 * POST /api/mail/archive
 * Moves an email to the Archive folder
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, homeAccountId } = await req.json() as {
    messageId: string;
    homeAccountId?: string;
  };
  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
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
    // Find the archive folder ID via the provider's folder list
    const provider = getProvider(accountId);
    const folders = await provider.fetchFolders(user.id, accountId);
    const archiveFolder = folders.find((f) => f.wellKnownName === "archive");

    if (!archiveFolder) {
      return NextResponse.json({ error: "Archive folder not found" }, { status: 404 });
    }

    await provider.moveMessage(user.id, accountId, messageId, archiveFolder.id);

    return NextResponse.json({ ok: true, folderId: archiveFolder.id });
  } catch (error) {
    console.error("[archive] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to archive" },
      { status: 500 }
    );
  }
}
