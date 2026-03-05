import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import type { MailFolder } from "@/lib/types/email";


interface GraphFolder {
  id: string;
  displayName: string;
  unreadItemCount: number;
  totalItemCount: number;
  wellKnownName?: string | null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });

  try {
    // Fetch all folders; filter client-side to exclude system well-known folders.
    // $filter=wellKnownName eq null fails on some account/tenant types (Graph 400/500).
    const data = await graphGet<{ value: GraphFolder[] }>(
      user.id, homeAccountId,
      "/me/mailFolders?$select=id,displayName,unreadItemCount,totalItemCount,wellKnownName&$top=100"
    );

    const folders: MailFolder[] = data.value
      .filter((f) => !f.wellKnownName)   // exclude inbox, drafts, sent, deleted, etc.
      .map((f) => ({
        id: f.id,
        displayName: f.displayName,
        unreadItemCount: f.unreadItemCount ?? 0,
        totalItemCount: f.totalItemCount ?? 0,
      }));

    return NextResponse.json({ folders });
  } catch (err) {
    const msg = String(err);
    console.error("folders list error:", msg);
    if (msg.includes("not found in MSAL cache")) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
