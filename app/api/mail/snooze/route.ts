import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const snoozeSchema = z.object({
  messageId: z.string().min(1).max(512),
  homeAccountId: z.string().min(1).max(512),
  snoozeUntil: z.string().max(64).refine((s) => !isNaN(new Date(s).getTime()), "Invalid date"),
  subject: z.string().max(998).optional(),
  senderName: z.string().max(320).optional(),
  senderEmail: z.string().email().max(320),
});

/** POST /api/mail/snooze — snooze an email until a future time */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = snoozeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;

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
