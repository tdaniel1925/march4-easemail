import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── POST /api/mail/cancel-send ──────────────────────────────────────────────
// Cancels a pending email if the sendAt time hasn't passed yet.

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pendingId } = requestBody as { pendingId: string };

  if (!pendingId) {
    return NextResponse.json({ error: "pendingId required" }, { status: 400 });
  }

  // Find the pending email — filter by both id AND userId for security
  const pending = await prisma.pendingEmail.findFirst({
    where: { id: pendingId, userId: user.id },
  });

  if (!pending) {
    return NextResponse.json({ error: "Pending email not found" }, { status: 404 });
  }

  if (pending.cancelled) {
    return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
  }

  const now = new Date();
  if (now >= pending.sendAt) {
    return NextResponse.json({ error: "Too late to cancel — email already sent" }, { status: 409 });
  }

  // Cancel the pending email
  await prisma.pendingEmail.update({
    where: { id: pendingId },
    data: { cancelled: true },
  });

  return NextResponse.json({ ok: true, cancelled: true });
}
