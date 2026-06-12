import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

type Params = { params: Promise<{ id: string }> };

const paramsSchema = z.object({
  id: z.string().min(1).max(512),
});

// ─── GET /api/drafts/[id] ─────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid request", details: parsedParams.error.flatten() }, { status: 400 });
  }
  const { id } = parsedParams.data;
  // Try local Draft ID first, then fall back to Graph message ID
  let draft = await prisma.draft.findFirst({
    where: { id, userId: user.id }
  });

  if (!draft) {
    // The id might be a Graph message ID (when clicking from drafts folder list)
    draft = await prisma.draft.findFirst({
      where: { graphDraftId: id, userId: user.id }
    });
  }

  if (!draft) {
    // Still not found — try fetching directly from Graph API as a draft message
    try {
      const account = await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, isDefault: true },
        select: { homeAccountId: true },
      });
      if (account) {
        const graphRes = await graphFetch(
          user.id,
          account.homeAccountId,
          `/me/messages/${id}?$select=id,subject,body,toRecipients,ccRecipients,bccRecipients,importance,isReadReceiptRequested`,
          { method: "GET" }
        );
        if (graphRes.ok) {
          const msg = await graphRes.json();
          return NextResponse.json({
            id: msg.id,
            subject: msg.subject ?? "",
            bodyHtml: msg.body?.content ?? "",
            toRecipients: msg.toRecipients ?? [],
            ccRecipients: msg.ccRecipients ?? [],
            bccRecipients: msg.bccRecipients ?? [],
            importance: msg.importance ?? "normal",
            requestReadReceipt: msg.isReadReceiptRequested ?? false,
            graphDraftId: msg.id,
          });
        }
      }
    } catch {
      // Fall through to 404
    }
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(draft);
}

// ─── DELETE /api/drafts/[id] ──────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid request", details: parsedParams.error.flatten() }, { status: 400 });
  }
  const { id } = parsedParams.data;

  // Resolve by local Draft ID first, then fall back to Graph message ID.
  // The drafts-folder list keys rows by graphDraftId, so deleting from that
  // list passes a Graph message ID — we must still find (and remove) the local
  // row, otherwise a scheduled draft stays in the DB and the cron sends it.
  let draft = await prisma.draft.findFirst({ where: { id, userId: user.id } });
  if (!draft) {
    draft = await prisma.draft.findFirst({ where: { graphDraftId: id, userId: user.id } });
  }
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

  // Delete by the resolved draft.id (the param may have been a Graph message ID).
  // Removing the row guarantees the send-scheduled cron (which queries
  // scheduledSent:false) can never pick it up again.
  await prisma.draft.delete({ where: { id: draft.id } });
  return NextResponse.json({ ok: true });
}
