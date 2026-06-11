import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider } from "@/lib/providers/registry";

const moveFolderSchema = z.object({
  messageId: z.string().min(1).max(512),
  folderId: z.string().min(1).max(512),
  homeAccountId: z.string().min(1).max(512).optional(),
});

/**
 * POST /api/mail/move-folder
 * Moves an email to a specified folder
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = moveFolderSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId, folderId, homeAccountId } = parsed.data;

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
