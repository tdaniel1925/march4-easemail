import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import type { EmailMessage } from "@/components/inbox/InboxClient";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const SELECT = "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body";
const DEFAULT_PATH =
  `/me/mailFolders/inbox/messages?$top=50&$select=${SELECT}&$orderby=receivedDateTime desc`;

const TAB_PATHS: Record<string, string> = {
  unread:      `/me/mailFolders/inbox/messages?$filter=isRead eq false&$select=${SELECT}&$top=100&$orderby=receivedDateTime desc`,
  starred:     `/me/mailFolders/inbox/messages?$filter=flag/flagStatus eq 'flagged'&$select=${SELECT}&$top=100`,
  attachments: `/me/mailFolders/inbox/messages?$filter=hasAttachments eq true&$select=${SELECT}&$top=100&$orderby=receivedDateTime desc`,
};

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

interface GraphMessagesResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

function mapMessage(m: GraphMessage): EmailMessage {
  return {
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
  };
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });

  // Priority: nextLink (pagination) > tab filter > default
  const nextLinkParam = req.nextUrl.searchParams.get("nextLink");
  const tab = req.nextUrl.searchParams.get("tab") ?? "";
  const labelParam = req.nextUrl.searchParams.get("label") ?? "";

  let tabPath: string | undefined;
  if (tab === "label" && labelParam) {
    tabPath = `/me/mailFolders/inbox/messages?$filter=categories/any(c:c eq '${labelParam}')&$select=${SELECT}&$top=100`;
  } else {
    tabPath = TAB_PATHS[tab];
  }

  const path = nextLinkParam
    ? nextLinkParam.startsWith(GRAPH_BASE)
      ? nextLinkParam.slice(GRAPH_BASE.length)
      : nextLinkParam
    : tabPath ?? DEFAULT_PATH;

  try {
    const data = await graphGet<GraphMessagesResponse>(user.id, homeAccountId, path);
    const emails = data.value.map(mapMessage);
    return NextResponse.json({ emails, nextLink: data["@odata.nextLink"] ?? null });
  } catch (err) {
    const msg = String(err);
    console.error("[inbox] Graph error:", msg);
    // MSAL cache miss = account tokens lost (server restart, first connect on another device).
    // Return 401 so client can prompt reconnection instead of a generic 500.
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
