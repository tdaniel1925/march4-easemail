import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  const providerType = detectProviderType(homeAccountId);
  if (providerType !== "microsoft") {
    return NextResponse.json({ contacts: [] });
  }

  try {
    const data = await graphGet<GraphContactsResponse>(
      user.id,
      homeAccountId,
      `/me/contacts?$top=250&$select=id,displayName,emailAddresses,mobilePhone,jobTitle,companyName&$orderby=displayName`
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

    return NextResponse.json({ contacts });
  } catch (err) {
    console.error("[contacts/list]", err);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
