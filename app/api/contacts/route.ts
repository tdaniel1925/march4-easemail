import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet, graphPost } from "@/lib/microsoft/graph";

interface GraphPerson {
  displayName?: string;
  scoredEmailAddresses?: { address?: string }[];
  emailAddresses?: { address?: string }[];
}

interface GraphResponse {
  value?: GraphPerson[];
}

interface GraphContact {
  id?: string;
  displayName: string;
  emailAddresses?: { address: string; name?: string }[];
  mobilePhone?: string;
  jobTitle?: string;
  companyName?: string;
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

// ─── POST /api/contacts — Create a new contact ────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 400 });

  const body = await req.json() as {
    displayName: string;
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
  };

  const payload: GraphContact = {
    displayName: body.displayName,
    ...(body.email ? { emailAddresses: [{ address: body.email, name: body.displayName }] } : {}),
    ...(body.phone ? { mobilePhone: body.phone } : {}),
    ...(body.company ? { companyName: body.company } : {}),
    ...(body.title ? { jobTitle: body.title } : {}),
  };

  try {
    const contact = await graphPost<GraphContact>(user.id, account.homeAccountId, "/me/contacts", payload);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
