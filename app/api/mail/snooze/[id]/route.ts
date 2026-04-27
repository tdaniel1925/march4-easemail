import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** DELETE /api/mail/snooze/[id] — unsnooze (delete) a snoozed email record */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.snoozedEmail.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.snoozedEmail.delete({ where: { id, userId: user.id } });

  return NextResponse.json({ ok: true });
}
