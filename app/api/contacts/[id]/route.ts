import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPatch, graphDelete } from "@/lib/microsoft/graph";
import { detectProviderType } from "@/lib/providers/registry";
import { updateContactSchema } from "@/lib/validation/schemas";
import { z } from "zod";

// Notes are persisted locally in CachedContact (not synced to Graph), so they
// are validated separately from the Graph-backed contact fields.
const notesSchema = z.string().max(10_000, "Note too long");

// ─── GET /api/contacts/[id] — Load locally-stored data for a contact ──────────
// Returns the saved private note (if any) for this contact + user.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) {
    return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  }
  const cached = await prisma.cachedContact.findFirst({
    where: { id, userId: user.id, homeAccountId },
    select: { id: true, notes: true },
  });
  return NextResponse.json({ notes: cached?.notes ?? "" });
}

// ─── PATCH /api/contacts/[id] — Update a contact ──────────────────────────────
// Microsoft contact fields are pushed to Graph. The private `notes` field is
// persisted locally in CachedContact for all account types.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = updateContactSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  // ── Notes-only update (persisted locally, never sent to Graph) ──────────────
  // The contacts UI auto-saves notes via PATCH with just { notes }. Handle that
  // here so the note is actually stored and survives a reload.
  const rawNotes = (raw as Record<string, unknown> | null)?.notes;
  if (rawNotes !== undefined) {
    const notesParsed = notesSchema.safeParse(rawNotes);
    if (!notesParsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: notesParsed.error.flatten() },
        { status: 400 }
      );
    }
    const homeAccountId = body.homeAccountId ?? "";
    if (!homeAccountId) {
      return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
    }
    await prisma.cachedContact.upsert({
      where: {
        userId_homeAccountId_id: { userId: user.id, homeAccountId, id },
      },
      create: { id, userId: user.id, homeAccountId, notes: notesParsed.data },
      update: { notes: notesParsed.data },
    });
    // If this PATCH was notes-only, we're done — no Graph fields to push.
    const hasGraphFields =
      body.displayName !== undefined ||
      body.email !== undefined ||
      body.phone !== undefined ||
      body.company !== undefined ||
      body.title !== undefined;
    if (!hasGraphFields) {
      return NextResponse.json({ ok: true, notes: notesParsed.data });
    }
  }

  // If a non-Microsoft account is specified, contacts are not supported
  if (body.homeAccountId && detectProviderType(body.homeAccountId) !== "microsoft") {
    return NextResponse.json({ error: "Not supported for this account type" }, { status: 400 });
  }

  const account = body.homeAccountId
    ? await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, homeAccountId: body.homeAccountId },
      })
    : await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, isDefault: true },
      });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 400 });

  const payload: Record<string, unknown> = {};
  if (body.displayName !== undefined) payload.displayName = body.displayName;
  if (body.email !== undefined) payload.emailAddresses = [{ address: body.email, name: body.displayName ?? body.email }];
  if (body.phone !== undefined) payload.mobilePhone = body.phone;
  if (body.company !== undefined) payload.companyName = body.company;
  if (body.title !== undefined) payload.jobTitle = body.title;

  try {
    const contact = await graphPatch<Record<string, unknown>>(
      user.id,
      account.homeAccountId,
      `/me/contacts/${encodeURIComponent(id)}`,
      payload
    );
    return NextResponse.json({ contact });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── DELETE /api/contacts/[id] — Delete a contact ────────────────────────────
// Only supported for Microsoft accounts. IMAP/JMAP accounts return 400.

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");

  // If a non-Microsoft account is specified, contacts are not supported
  if (homeAccountId && detectProviderType(homeAccountId) !== "microsoft") {
    return NextResponse.json({ error: "Not supported for this account type" }, { status: 400 });
  }

  const account = homeAccountId
    ? await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, homeAccountId },
      })
    : await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, isDefault: true },
      });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 400 });

  const { id } = await params;

  try {
    await graphDelete(user.id, account.homeAccountId, `/me/contacts/${encodeURIComponent(id)}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
