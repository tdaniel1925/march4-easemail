import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType } from "@/lib/providers/registry";

interface GraphContact {
  id: string;
  displayName: string;
  emailAddresses?: { address: string; name?: string }[];
  mobilePhone?: string;
  jobTitle?: string;
  companyName?: string;
}

interface GraphContactsResponse {
  value: GraphContact[];
  "@odata.nextLink"?: string;
}

// ─── GET /api/contacts/list?homeAccountId=xxx ───────────────────────────────
// Returns all contacts for the given account

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) {
    return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  }

  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // ── Fetch org directory contacts (first page only) ──────────────────────────
  const cursor = req.nextUrl.searchParams.get("cursor");
  let orgContacts: { id: string; displayName: string; email: string; phone: string; jobTitle: string; company: string; initials: string; isVIP: boolean; frequencyScore: number; isOrgContact?: boolean }[] = [];
  if (!cursor) {
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { orgId: true } });
      if (dbUser?.orgId) {
        const orgList = await prisma.orgContact.findMany({
          where: { orgId: dbUser.orgId },
          orderBy: { firstName: "asc" },
        });
        orgContacts = orgList.map((c) => {
          const name = `${c.firstName} ${c.lastName}`.trim();
          return {
            id: `org:${c.id}`,
            displayName: name || c.email,
            email: c.email,
            phone: "",
            jobTitle: "",
            company: "D. Miller Law Firm",
            initials: (name || c.email).slice(0, 2).toUpperCase(),
            isVIP: false,
            frequencyScore: 0,
            isOrgContact: true,
          };
        });
      }
    } catch {
      // Org lookup failed — continue without org contacts
    }
  }

  const providerType = detectProviderType(homeAccountId);
  if (providerType !== "microsoft") {
    return NextResponse.json({ contacts: orgContacts, nextLink: null });
  }

  try {
    let graphPath: string;
    if (cursor) {
      // The cursor is the path portion after https://graph.microsoft.com/v1.0
      // Extract it from the full URL if needed
      const full = cursor.startsWith("http") ? new URL(cursor).pathname + "?" + new URL(cursor).searchParams.toString() : cursor;
      graphPath = full.replace("/v1.0", "");
    } else {
      graphPath = `/me/contacts?$top=100&$select=id,displayName,emailAddresses,mobilePhone,jobTitle,companyName&$orderby=displayName`;
    }

    const data = await graphGet<GraphContactsResponse>(
      user.id,
      homeAccountId,
      graphPath
    );

    const contacts = (data.value ?? []).map((c) => {
      const name = c.displayName ?? "Unknown";
      return {
        id: c.id,
        displayName: name,
        email: c.emailAddresses?.[0]?.address ?? "",
        phone: c.mobilePhone ?? "",
        jobTitle: c.jobTitle ?? "",
        company: c.companyName ?? "",
        initials: name.slice(0, 2).toUpperCase(),
        isVIP: false,
        frequencyScore: 0,
      };
    });

    // Merge: org contacts first (on first page), then personal, deduplicated by email
    const seen = new Set<string>();
    const merged = [];
    for (const c of [...orgContacts, ...contacts]) {
      const key = c.email.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(c);
    }

    return NextResponse.json({
      contacts: merged,
      nextLink: data["@odata.nextLink"] ?? null,
    });
  } catch (err) {
    console.error("[contacts/list]", err);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
