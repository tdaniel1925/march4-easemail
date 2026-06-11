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

  // Atomic conditional cancel — only succeeds if the email is owned by this
  // user, not already cancelled, and the send time hasn't passed yet.
  // Avoids the check-then-update race with the delayed-send worker.
  const result = await prisma.pendingEmail.updateMany({
    where: {
      id: pendingId,
      userId: user.id,
      cancelled: false,
      sendAt: { gt: new Date() },
    },
    data: { cancelled: true },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Too late to cancel — email already sent, cancelled, or not found" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, cancelled: true });
}
