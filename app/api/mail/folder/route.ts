import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import type { EmailMessage } from "@/lib/types/email";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const SELECT = "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body";

const FOLDER_PATHS: Record<string, string> = {
  sent:     `/me/mailFolders/sentItems/messages?$select=${SELECT}&$top=50&$orderby=receivedDateTime desc`,
  drafts:   `/me/mailFolders/drafts/messages?$select=${SELECT}&$top=50&$orderby=lastModifiedDateTime desc`,
  trash:    `/me/mailFolders/deletedItems/messages?$select=${SELECT}&$top=50&$orderby=receivedDateTime desc`,
  starred:  `/me/messages?$filter=flag/flagStatus eq 'flagged'&$select=${SELECT}&$top=50&$orderby=receivedDateTime desc`,
};

interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  lastModifiedDateTime?: string;
  isRead: boolean;
  hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  body: { content: string; contentType: string };
}

interface GraphResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

function mapMessage(m: GraphMessage): EmailMessage {
  return {
    id: m.id,
    subject: m.subject ?? "(no subject)",
    bodyPreview: m.bodyPreview ?? "",
    receivedDateTime: m.receivedDateTime ?? m.lastModifiedDateTime ?? "",
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
  };
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  const folder = req.nextUrl.searchParams.get("folder") ?? "";
  const nextLinkParam = req.nextUrl.searchParams.get("nextLink");

  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  if (!FOLDER_PATHS[folder] && !nextLinkParam) return NextResponse.json({ error: "unknown folder" }, { status: 400 });

  const path = nextLinkParam
    ? nextLinkParam.startsWith(GRAPH_BASE)
      ? nextLinkParam.slice(GRAPH_BASE.length)
      : nextLinkParam
    : FOLDER_PATHS[folder];

  const data = await graphGet<GraphResponse>(user.id, homeAccountId, path);
  const emails = data.value.map(mapMessage);

  return NextResponse.json({ emails, nextLink: data["@odata.nextLink"] ?? null });
}
