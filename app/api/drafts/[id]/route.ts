import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

type Params = { params: Promise<{ id: string }> };

// ─── DELETE /api/drafts/[id] ──────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const draft = await prisma.draft.findFirst({ where: { id, userId: user.id } });
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from Graph if synced
  if (draft.graphDraftId && draft.homeAccountId) {
    try {
      await graphFetch(user.id, draft.homeAccountId, `/me/messages/${draft.graphDraftId}`, {
        method: "DELETE",
      });
    } catch {
      // Non-fatal
    }
  }

  await prisma.draft.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
