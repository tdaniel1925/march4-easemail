import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── POST /api/rules/reorder — bulk-update priorities ────────────────────────
// Body: { ids: string[] } — ordered array of rule IDs (first = priority 1)

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json() as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  // Verify all rules belong to this user before updating
  const rules = await prisma.emailRule.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  });
  if (rules.length !== ids.length) {
    return NextResponse.json({ error: "Some rules not found" }, { status: 404 });
  }

  await Promise.all(
    ids.map((id, idx) =>
      prisma.emailRule.update({ where: { id }, data: { priority: idx + 1 } })
    )
  );

  return NextResponse.json({ ok: true });
}
