import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import type { EmailMessage } from "@/components/inbox/InboxClient";

interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  body: { content: string; contentType: string };
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  const q = req.nextUrl.searchParams.get("q");
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  if (!q?.trim()) return NextResponse.json({ emails: [] });

  // Graph $search cannot be combined with $orderby
  const path = `/me/mailFolders/inbox/messages?$search="${encodeURIComponent(q)}"&$select=id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body&$top=50`;

  const data = await graphGet<{ value: GraphMessage[] }>(user.id, homeAccountId, path);

  const emails: EmailMessage[] = data.value.map((m) => ({
    id: m.id,
    subject: m.subject ?? "(no subject)",
    bodyPreview: m.bodyPreview ?? "",
    receivedDateTime: m.receivedDateTime,
    isRead: m.isRead,
    hasAttachments: m.hasAttachments,
    flag: { flagStatus: m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged" },
    from: {
      name: m.from?.emailAddress?.name ?? "Unknown",
      address: m.from?.emailAddress?.address ?? "",
    },
    body: {
      content: m.body?.content ?? m.bodyPreview ?? "",
      contentType: (m.body?.contentType as "html" | "text") ?? "text",
    },
  }));

  return NextResponse.json({ emails });
}
