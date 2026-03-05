import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import type { MailFolder } from "@/lib/types/email";

// Well-known system folder names — excluded from custom folder list
// since they're already represented by dedicated sidebar links
const SYSTEM_WELL_KNOWN = new Set([
  "inbox", "drafts", "sentitems", "deleteditems", "junkemail",
  "archive", "outbox", "recoverableitemsdeletions", "msgfolderroot",
  "searchfolders", "syncissues", "conflicts", "localfailures",
  "serverfailures", "scheduled", "conversationhistory",
]);

interface GraphFolder {
  id: string;
  displayName: string;
  unreadItemCount: number;
  totalItemCount: number;
  wellKnownName: string | null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });

  try {
    const data = await graphGet<{ value: GraphFolder[] }>(
      user.id, homeAccountId,
      "/me/mailFolders?$select=id,displayName,unreadItemCount,totalItemCount,wellKnownName&$top=100"
    );

    const folders: MailFolder[] = data.value
      .filter((f) => !SYSTEM_WELL_KNOWN.has((f.wellKnownName ?? "").toLowerCase()))
      .map((f) => ({
        id: f.id,
        displayName: f.displayName,
        unreadItemCount: f.unreadItemCount ?? 0,
        totalItemCount: f.totalItemCount ?? 0,
      }));

    return NextResponse.json({ folders });
  } catch (err) {
    console.error("folders list error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
