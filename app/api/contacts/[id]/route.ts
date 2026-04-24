import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPatch, graphDelete } from "@/lib/microsoft/graph";
import { detectProviderType } from "@/lib/providers/registry";

// ─── PATCH /api/contacts/[id] — Update a contact ──────────────────────────────
// Only supported for Microsoft accounts. IMAP/JMAP accounts return 400.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    displayName?: string;
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
    homeAccountId?: string;
  };

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
