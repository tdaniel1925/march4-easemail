import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { verifyAccountOwnership } from "@/lib/providers/registry";

const labelsQuerySchema = z.object({
  homeAccountId: z.string().min(1).max(512),
});

/**
 * GET /api/mail/labels?homeAccountId=...
 * Returns distinct category labels from cached emails for the given account.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = labelsQuerySchema.safeParse({
    homeAccountId: req.nextUrl.searchParams.get("homeAccountId") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { homeAccountId } = parsed.data;

  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    // Fetch all non-empty categories arrays from cached emails
    const rows = await prisma.cachedEmail.findMany({
      where: {
        userId: user.id,
        homeAccountId,
        NOT: { categories: { equals: [] } },
      },
      select: { categories: true },
      distinct: ["categories"],
    });

    // Flatten and deduplicate
    const labelSet = new Set<string>();
    for (const row of rows) {
      const cats = row.categories as string[];
      if (Array.isArray(cats)) {
        cats.forEach((c) => { if (c) labelSet.add(c); });
      }
    }

    const labels = Array.from(labelSet).sort();
    return NextResponse.json({ labels });
  } catch (err) {
    console.error("[labels] Error:", err);
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 });
  }
}
