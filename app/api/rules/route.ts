import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Condition, RuleAction } from "@/lib/types/rules";

// ─── GET /api/rules — list all rules for the current user ─────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.emailRule.findMany({
    where: { userId: user.id },
    orderBy: { priority: "asc" },
  });

  return NextResponse.json(
    rules.map((r) => ({
      id: r.id,
      name: r.name,
      priority: r.priority,
      active: r.active,
      conditions: r.conditions as unknown as Condition[],
      actions: r.actions as unknown as RuleAction[],
      emailCount: r.emailCount,
      stopProcessing: r.stopProcessing,
    }))
  );
}

// ─── POST /api/rules — create a new rule ──────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    name: string;
    conditions: Condition[];
    actions: RuleAction[];
    stopProcessing: boolean;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  // Append at the end — find current max priority
  const maxRow = await prisma.emailRule.findFirst({
    where: { userId: user.id },
    orderBy: { priority: "desc" },
    select: { priority: true },
  });
  const priority = (maxRow?.priority ?? 0) + 1;

  const rule = await prisma.emailRule.create({
    data: {
      userId: user.id,
      name: body.name.trim(),
      priority,
      active: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      conditions: JSON.parse(JSON.stringify(body.conditions ?? [])),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      actions: JSON.parse(JSON.stringify(body.actions ?? [])),
      stopProcessing: body.stopProcessing ?? false,
    },
  });

  return NextResponse.json({
    id: rule.id,
    name: rule.name,
    priority: rule.priority,
    active: rule.active,
    conditions: rule.conditions as unknown as Condition[],
    actions: rule.actions as unknown as RuleAction[],
    emailCount: rule.emailCount,
    stopProcessing: rule.stopProcessing,
  });
}
