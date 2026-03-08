import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

/**
 * POST /api/mail/archive
 * Moves an email to the Archive folder
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await req.json() as { messageId: string };
  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  try {
    // Get Archive folder ID
    const archiveFolder = await prisma.cachedFolder.findFirst({
      where: {
        userId: user.id,
        homeAccountId: account.homeAccountId,
        wellKnownName: "archive",
      },
    });

    if (!archiveFolder) {
      return NextResponse.json({ error: "Archive folder not found" }, { status: 404 });
    }

    // Move message in Microsoft Graph
    const graphRes = await graphFetch(
      user.id,
      account.homeAccountId,
      `/me/messages/${messageId}/move`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId: archiveFolder.id }),
      }
    );

    if (!graphRes.ok) {
      const error = await graphRes.text().catch(() => "Unknown error");
      return NextResponse.json({ error: `Graph API error: ${error}` }, { status: 500 });
    }

    // FIX: Wait for cache update to complete before returning success
    await prisma.cachedEmail.updateMany({
      where: { id: messageId, userId: user.id },
      data: { folderId: archiveFolder.id },
    });

    return NextResponse.json({ ok: true, folderId: archiveFolder.id });
  } catch (error) {
    console.error("[archive] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to archive" },
      { status: 500 }
    );
  }
}
