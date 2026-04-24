import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet, graphPost } from "@/lib/microsoft/graph";
import { detectProviderType } from "@/lib/providers/registry";

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
// Returns up to 8 contacts matching the query. Cache-first, falls back to Graph.
// IMAP/JMAP accounts don't support contacts — returns empty array.

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 200 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");

  // If a non-Microsoft account is specified, return empty contacts
  if (homeAccountId && detectProviderType(homeAccountId) !== "microsoft") {
    return NextResponse.json({ contacts: [] });
  }

  if (q.length < 2) return NextResponse.json([]);
  // Limit search term length to prevent abuse
  if (q.length > 200) return NextResponse.json([]);

  try {
    // Try DB cache first — uses Prisma parameterized queries (safe by default)
    const cached = await prisma.cachedContact.findMany({
      where: {
        userId: user.id,
        OR: [
          { displayName: { contains: q, mode: "insensitive" } },
          { emailAddress: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
    });

    if (cached.length > 0) {
      return NextResponse.json(
        cached.map((c) => ({ name: c.displayName, email: c.emailAddress })).filter((c) => c.email)
      );
    }
  } catch {
    // Cache query failed — fall through to Graph
  }

  // Find a Microsoft account to query Graph — use explicit or default
  const account = homeAccountId
    ? await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, homeAccountId },
      })
    : await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, isDefault: true },
      });
  if (!account) return NextResponse.json([]);

  try {
    // q is encoded via encodeURIComponent — special characters are percent-encoded, not interpolated raw
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
// Only supported for Microsoft accounts. IMAP/JMAP accounts return 400.

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    displayName: string;
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
    homeAccountId?: string;
  };

  // If a non-Microsoft account is specified, contacts are not supported
  if (body.homeAccountId && detectProviderType(body.homeAccountId) !== "microsoft") {
    return NextResponse.json({ error: "Not supported for this account type" }, { status: 400 });
  }

  const account = body.homeAccountId
    ? await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, homeAccountId: body.homeAccountId },
      })
    : await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, isDefault: true },
      });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 400 });

  // Validate required field
  if (!body.displayName?.trim()) {
    return NextResponse.json({ error: "displayName is required" }, { status: 400 });
  }

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
