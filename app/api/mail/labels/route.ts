import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { verifyAccountOwnership } from "@/lib/providers/registry";

/**
 * GET /api/mail/labels?homeAccountId=...
 * Returns distinct category labels from cached emails for the given account.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) {
    return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  }

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
