import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";

interface GraphPerson {
  displayName?: string;
  scoredEmailAddresses?: { address?: string }[];
  emailAddresses?: { address?: string }[];
}

interface GraphResponse {
  value?: GraphPerson[];
}

// ─── GET /api/contacts?q=searchTerm ──────────────────────────────────────────
// Returns up to 8 contacts matching the query via MS Graph /me/people.

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 200 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json([]);

  try {
    const data = await graphGet<GraphResponse>(
      user.id,
      account.homeAccountId,
      `/me/people?$search="${encodeURIComponent(q)}"&$top=8&$select=displayName,scoredEmailAddresses,emailAddresses`
    );

    const results = (data.value ?? [])
      .map((p) => {
        const emailAddr =
          p.scoredEmailAddresses?.[0]?.address ??
          p.emailAddresses?.[0]?.address ??
          "";
        return { name: p.displayName ?? "", email: emailAddr };
      })
      .filter((p) => p.email);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
