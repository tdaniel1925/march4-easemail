import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { reorderRulesSchema } from "@/lib/validation/schemas";

// ─── POST /api/rules/reorder — bulk-update priorities ────────────────────────
// Body: { ids: string[] } — ordered array of rule IDs (first = priority 1)

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = reorderRulesSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { ids } = parsed.data;

  // Verify all rules belong to this user before updating
  const rules = await prisma.emailRule.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  });
  if (rules.length !== ids.length) {
    return NextResponse.json({ error: "Some rules not found" }, { status: 404 });
  }

  // Scope each write by userId as well, so it is tenant-safe by construction
  // (not only because of the ownership check above).
  await prisma.$transaction(
    ids.map((id, idx) =>
      prisma.emailRule.updateMany({
        where: { id, userId: user.id },
        data: { priority: idx + 1 },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
