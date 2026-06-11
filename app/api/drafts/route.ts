import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

const draftsQuerySchema = z.object({
  homeAccountId: z.string().min(1).max(512).nullable().optional(),
});

// Draft recipients may be in-progress (not yet valid emails) — do not enforce .email()
const draftRecipientSchema = z.object({
  emailAddress: z.object({
    address: z.string().max(320),
    name: z.string().max(320).optional(),
  }),
});

const createDraftSchema = z.object({
  draftId: z.string().min(1).max(512).optional(),
  homeAccountId: z.string().min(1).max(512).optional(),
  toRecipients: z.array(draftRecipientSchema).max(500).optional(),
  ccRecipients: z.array(draftRecipientSchema).max(500).optional(),
  bccRecipients: z.array(draftRecipientSchema).max(500).optional(),
  subject: z.string().max(998).optional(),
  bodyHtml: z.string().max(200000).optional(),
  attachments: z.array(z.object({
    name: z.string().max(255).optional(),
    type: z.string().max(255).optional(),
    size: z.number().int().min(0).optional(),
    data: z.string().max(35_000_000).optional(), // base64, ~25MB binary
  }).passthrough()).max(25).optional(),
  importance: z.string().max(20).optional(),
  requestReadReceipt: z.boolean().optional(),
  draftType: z.string().max(50).optional(),
  inReplyToMessageId: z.string().max(512).nullable().optional(),
  forwardedMessageId: z.string().max(512).nullable().optional(),
  originalMessageBody: z.string().max(200000).nullable().optional(),
  scheduledAt: z.string().max(64).nullable().optional(),
});

// ─── GET /api/drafts ─────────────────────────────────────────────────────────
// Returns local drafts for the authenticated user.
// ?scheduled=1 → only pending scheduled drafts (scheduledAt set, not yet sent)
// Default → non-scheduled drafts (scheduledAt is null)

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const scheduledOnly = searchParams.get("scheduled") === "1";
  const parsedQuery = draftsQuerySchema.safeParse({
    homeAccountId: searchParams.get("homeAccountId"),
  });
  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid request", details: parsedQuery.error.flatten() }, { status: 400 });
  }
  const homeAccountId = parsedQuery.data.homeAccountId ?? null;

  if (scheduledOnly) {
    const drafts = await prisma.draft.findMany({
      where: {
        userId: user.id,
        ...(homeAccountId ? { homeAccountId } : {}),
        scheduledAt: { not: null },
        scheduledSent: false,
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        subject: true,
        toRecipients: true,
        scheduledAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ drafts });
  }

  const drafts = await prisma.draft.findMany({
    where: { userId: user.id, scheduledSent: false, scheduledAt: null, ...(homeAccountId ? { homeAccountId } : {}) },
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

  const parsed = createDraftSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
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
    originalMessageBody,
    scheduledAt,
  } = parsed.data;

  // Validate scheduledAt if provided
  if (scheduledAt) {
    const d = new Date(scheduledAt);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledAt date" }, { status: 400 });
    }
  }

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
    originalMessageBody: originalMessageBody ?? null,
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
