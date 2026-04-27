import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** POST /api/mail/snooze — snooze an email until a future time */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as {
    messageId: string;
    homeAccountId: string;
    snoozeUntil: string;
    subject: string;
    senderName?: string;
    senderEmail: string;
  } | null;

  if (!body?.messageId || !body.homeAccountId || !body.snoozeUntil || !body.senderEmail) {
    return NextResponse.json({ error: "messageId, homeAccountId, snoozeUntil, senderEmail required" }, { status: 400 });
  }

  const snoozeUntil = new Date(body.snoozeUntil);
  if (isNaN(snoozeUntil.getTime()) || snoozeUntil <= new Date()) {
    return NextResponse.json({ error: "snoozeUntil must be a valid future date" }, { status: 400 });
  }

  await prisma.snoozedEmail.create({
    data: {
      userId: user.id,
      homeAccountId: body.homeAccountId,
      messageId: body.messageId,
      snoozeUntil,
      subject: body.subject ?? "(no subject)",
      senderName: body.senderName ?? null,
      senderEmail: body.senderEmail,
    },
  });

  return NextResponse.json({ ok: true });
}

/** GET /api/mail/snooze — list active snoozed emails for current user */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snoozed = await prisma.snoozedEmail.findMany({
    where: { userId: user.id, isReturned: false },
    orderBy: { snoozeUntil: "asc" },
  });

  return NextResponse.json({ snoozed });
}
