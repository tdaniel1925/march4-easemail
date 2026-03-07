import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

// ─── GET /api/drafts ─────────────────────────────────────────────────────────
// Returns all local drafts for the authenticated user.

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const drafts = await prisma.draft.findMany({
    where: { userId: user.id, scheduledSent: false },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(drafts);
}

// ─── POST /api/drafts ────────────────────────────────────────────────────────
// Creates or updates a local draft, then syncs to MS Graph Drafts folder.
// If body.draftId is provided, updates that draft. Otherwise creates.

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    draftId,
    homeAccountId,
    toRecipients,
    ccRecipients,
    bccRecipients,
    subject,
    bodyHtml,
    attachments,
    importance,
    requestReadReceipt,
    draftType,
    inReplyToMessageId,
    forwardedMessageId,
    scheduledAt,
  } = await req.json() as {
    draftId?: string;
    homeAccountId?: string;
    toRecipients?: { emailAddress: { address: string } }[];
    ccRecipients?: { emailAddress: { address: string } }[];
    bccRecipients?: { emailAddress: { address: string } }[];
    subject?: string;
    bodyHtml?: string;
    attachments?: { name: string; type: string; size: number }[];
    importance?: string;
    requestReadReceipt?: boolean;
    draftType?: string;
    inReplyToMessageId?: string | null;
    forwardedMessageId?: string | null;
    scheduledAt?: string | null;
  };

  // ── Build DB payload ──────────────────────────────────────────────────────
  const dbData = {
    userId: user.id,
    homeAccountId: homeAccountId ?? null,
    toRecipients: JSON.parse(JSON.stringify(toRecipients ?? [])),
    ccRecipients: JSON.parse(JSON.stringify(ccRecipients ?? [])),
    bccRecipients: JSON.parse(JSON.stringify(bccRecipients ?? [])),
    subject: subject ?? null,
    bodyHtml: bodyHtml ?? null,
    attachments: JSON.parse(JSON.stringify(attachments ?? [])),
    importance: importance ?? "normal",
    requestReadReceipt: requestReadReceipt ?? false,
    draftType: draftType ?? "new",
    inReplyToMessageId: inReplyToMessageId ?? null,
    forwardedMessageId: forwardedMessageId ?? null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
  };

  let draft;
  if (draftId) {
    // Verify ownership before update
    draft = await prisma.draft.findFirst({ where: { id: draftId, userId: user.id } });
    if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    draft = await prisma.draft.update({
      where: { id: draftId },
      data: dbData,
    });
  } else {
    draft = await prisma.draft.create({ data: dbData });
  }

  // ── Sync to MS Graph (best-effort, never block response) ─────────────────
  if (homeAccountId) {
    const graphDraftPayload = {
      subject: subject ?? "(No subject)",
      body: { contentType: "HTML", content: bodyHtml ?? "" },
      toRecipients: toRecipients ?? [],
      ccRecipients: ccRecipients ?? [],
      bccRecipients: bccRecipients ?? [],
    };

    try {
      if (draft.graphDraftId) {
        // Update existing Graph draft
        await graphFetch(user.id, homeAccountId, `/me/messages/${draft.graphDraftId}`, {
          method: "PATCH",
          body: JSON.stringify(graphDraftPayload),
        });
      } else {
        // Create new Graph draft
        const res = await graphFetch(user.id, homeAccountId, "/me/messages", {
          method: "POST",
          body: JSON.stringify(graphDraftPayload),
        });
        if (res.ok) {
          const created = await res.json() as { id?: string };
          if (created.id) {
            await prisma.draft.update({
              where: { id: draft.id },
              data: { graphDraftId: created.id },
            });
          }
        }
      }
    } catch {
      // Graph sync failed — local draft still saved, non-fatal
    }
  }

  return NextResponse.json({ id: draft.id });
}
