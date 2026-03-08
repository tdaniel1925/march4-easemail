import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

/**
 * DELETE /api/mail/delete
 * Deletes an email (moves to Deleted Items or permanently deletes)
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, permanent } = await req.json() as {
    messageId: string;
    permanent?: boolean;
  };

  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  try {
    if (permanent) {
      // Permanently delete from Microsoft Graph
      const graphRes = await graphFetch(
        user.id,
        account.homeAccountId,
        `/me/messages/${messageId}`,
        { method: "DELETE" }
      );

      if (!graphRes.ok) {
        const error = await graphRes.text().catch(() => "Unknown error");
        return NextResponse.json({ error: `Graph API error: ${error}` }, { status: 500 });
      }

      // FIX: Wait for cache deletion to complete before returning success
      await prisma.cachedEmail.deleteMany({
        where: { id: messageId, userId: user.id },
      });

      return NextResponse.json({ ok: true, deleted: true });
    } else {
      // Move to Deleted Items folder
      const deletedFolder = await prisma.cachedFolder.findFirst({
        where: {
          userId: user.id,
          homeAccountId: account.homeAccountId,
          wellKnownName: "deleteditems",
        },
      });

      if (!deletedFolder) {
        return NextResponse.json({ error: "Deleted Items folder not found" }, { status: 404 });
      }

      // Move message in Microsoft Graph
      const graphRes = await graphFetch(
        user.id,
        account.homeAccountId,
        `/me/messages/${messageId}/move`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationId: deletedFolder.id }),
        }
      );

      if (!graphRes.ok) {
        const error = await graphRes.text().catch(() => "Unknown error");
        return NextResponse.json({ error: `Graph API error: ${error}` }, { status: 500 });
      }

      // FIX: Wait for cache update to complete before returning success
      await prisma.cachedEmail.updateMany({
        where: { id: messageId, userId: user.id },
        data: { folderId: deletedFolder.id },
      });

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
