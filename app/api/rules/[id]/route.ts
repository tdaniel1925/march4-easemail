import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Condition, RuleAction } from "@/lib/types/rules";

// ─── PUT /api/rules/[id] — update a rule ─────────────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Partial<{
    name: string;
    active: boolean;
    conditions: Condition[];
    actions: RuleAction[];
    stopProcessing: boolean;
  }>;

  const existing = await prisma.emailRule.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.emailRule.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.active !== undefined && { active: body.active }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(body.conditions !== undefined && { conditions: JSON.parse(JSON.stringify(body.conditions)) }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(body.actions !== undefined && { actions: JSON.parse(JSON.stringify(body.actions)) }),
      ...(body.stopProcessing !== undefined && { stopProcessing: body.stopProcessing }),
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    priority: updated.priority,
    active: updated.active,
    conditions: updated.conditions as unknown as Condition[],
    actions: updated.actions as unknown as RuleAction[],
    emailCount: updated.emailCount,
    stopProcessing: updated.stopProcessing,
  });
}

// ─── DELETE /api/rules/[id] ───────────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.emailRule.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.emailRule.delete({ where: { id } });

  // Re-number remaining rules to keep priorities contiguous
  const remaining = await prisma.emailRule.findMany({
    where: { userId: user.id },
    orderBy: { priority: "asc" },
  });
  await Promise.all(
    remaining.map((r, idx) =>
      prisma.emailRule.update({ where: { id: r.id }, data: { priority: idx + 1 } })
    )
  );

  return NextResponse.json({ ok: true });
}
