import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── POST /api/rules/[id]/increment — bump emailCount after rule fires ────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { count } = await req.json() as { count: number };
  if (!count || count < 1) return NextResponse.json({ ok: true }); // no-op

  const existing = await prisma.emailRule.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.emailRule.update({
    where: { id },
    data: { emailCount: { increment: count } },
  });

  return NextResponse.json({ ok: true });
}
