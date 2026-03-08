import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

/**
 * POST /api/mail/move-folder
 * Moves an email to a specified folder
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, folderId } = await req.json() as {
    messageId: string;
    folderId: string;
  };

  if (!messageId || !folderId) {
    return NextResponse.json(
      { error: "messageId and folderId required" },
      { status: 400 }
    );
  }

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  try {
    // Verify folder belongs to user
    const folder = await prisma.cachedFolder.findFirst({
      where: {
        id: folderId,
        userId: user.id,
        homeAccountId: account.homeAccountId,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found or access denied" }, { status: 404 });
    }

    // Move message in Microsoft Graph
    const graphRes = await graphFetch(
      user.id,
      account.homeAccountId,
      `/me/messages/${messageId}/move`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId: folderId }),
      }
    );

    if (!graphRes.ok) {
      const error = await graphRes.text().catch(() => "Unknown error");
      return NextResponse.json({ error: `Graph API error: ${error}` }, { status: 500 });
    }

    // FIX: Wait for cache update to complete before returning success
    await prisma.cachedEmail.updateMany({
      where: { id: messageId, userId: user.id },
      data: { folderId },
    });

    return NextResponse.json({ ok: true, folderId });
  } catch (error) {
    console.error("[move-folder] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to move" },
      { status: 500 }
    );
  }
}
