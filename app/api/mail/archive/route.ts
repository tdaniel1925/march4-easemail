import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider } from "@/lib/providers/registry";
import { graphGet } from "@/lib/microsoft/graph";

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
    return NextResponse.json({ error: "messageId required", errorCode: "server_error" }, { status: 400 });
  }

  // Resolve account: use provided homeAccountId or fall back to default
  let accountId = homeAccountId;
  if (!accountId) {
    const { getAllAccounts } = await import("@/lib/providers/registry");
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account", errorCode: "not_found" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "No connected account", errorCode: "not_found" }, { status: 404 });

  try {
    // Find the archive folder ID via the provider's folder list
    const provider = getProvider(accountId);
    const folders = await provider.fetchFolders(user.id, accountId);
    let archiveFolder = folders.find((f) => f.wellKnownName === "archive");

    // Fix 7: 404 fallback — query Graph directly for wellKnownName=archive
    let archiveFolderId: string | null = archiveFolder?.id ?? null;
    if (!archiveFolderId) {
      try {
        interface GraphArchiveFolder { id: string; displayName: string; wellKnownName?: string }
        const graphData = await graphGet<{ value: GraphArchiveFolder[] }>(
          user.id,
          accountId,
          "/me/mailFolders?$filter=wellKnownName eq 'archive'&$select=id,displayName,wellKnownName"
        );
        const found = graphData.value?.[0];
        if (found) {
          archiveFolderId = found.id;
        }
      } catch {
        // Graph query failed — fall through to error below
      }
    }

    if (!archiveFolderId) {
      return NextResponse.json({
        error: "Archive folder not found. Your account may not have an Archive folder configured.",
        errorCode: "not_found",
      }, { status: 404 });
    }

    await provider.moveMessage(user.id, accountId, messageId, archiveFolderId);

    return NextResponse.json({ ok: true, folderId: archiveFolderId });
  } catch (error) {
    console.error("[archive] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to archive", errorCode: "server_error" },
      { status: 500 }
    );
  }
}
