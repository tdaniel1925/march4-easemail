import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider } from "@/lib/providers/registry";

/**
 * POST /api/mail/delete
 * Deletes an email (moves to Deleted Items or permanently deletes)
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, permanent, homeAccountId } = await req.json() as {
    messageId: string;
    permanent?: boolean;
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
    const provider = getProvider(accountId);

    if (permanent) {
      await provider.deleteMessage(user.id, accountId, messageId);
      return NextResponse.json({ ok: true, deleted: true });
    } else {
      // Move to Deleted Items folder
      const folders = await provider.fetchFolders(user.id, accountId);
      const deletedFolder = folders.find((f) => f.wellKnownName === "deleteditems");

      if (!deletedFolder) {
        return NextResponse.json({ error: "Deleted Items folder not found" }, { status: 404 });
      }

      await provider.moveMessage(user.id, accountId, messageId, deletedFolder.id);
      return NextResponse.json({ ok: true, folderId: deletedFolder.id });
    }
  } catch (error) {
    console.error("[delete] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
