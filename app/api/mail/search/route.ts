import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import type { EmailMessage } from "@/lib/types/email";

// Maps well-known folder param → Graph well-known folder name
const WELL_KNOWN_FOLDER_PATHS: Record<string, string> = {
  inbox:   "inbox",
  sent:    "sentItems",
  drafts:  "drafts",
  trash:   "deletedItems",
};

interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  sentDateTime?: string;
  isRead: boolean;
  hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  toRecipients?: { emailAddress: { name: string; address: string } }[];
  body: { content: string; contentType: string };
}

const SELECT = "id,subject,bodyPreview,receivedDateTime,sentDateTime,isRead,hasAttachments,flag,from,toRecipients,body";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  const q = req.nextUrl.searchParams.get("q");
  const folder = req.nextUrl.searchParams.get("folder") ?? "inbox";

  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  if (!q?.trim()) return NextResponse.json({ emails: [] });

  // starred or unknown → search across all mail using /me/messages
  // well-known folders → scope to named folder path
  // custom folder ID → scope to /me/mailFolders/{id}/messages
  const search = encodeURIComponent(q);
  const wellKnown = WELL_KNOWN_FOLDER_PATHS[folder];
  const path = (folder === "starred" || (!wellKnown && !folder))
    ? `/me/messages?$search="${search}"&$select=${SELECT}&$top=250`
    : wellKnown
      ? `/me/mailFolders/${wellKnown}/messages?$search="${search}"&$select=${SELECT}&$top=250`
      : `/me/mailFolders/${encodeURIComponent(folder)}/messages?$search="${search}"&$select=${SELECT}&$top=250`;

  try {
    const data = await graphGet<{ value: GraphMessage[] }>(user.id, homeAccountId, path);

    const emails: EmailMessage[] = data.value.map((m) => ({
      id: m.id,
      subject: m.subject ?? "(no subject)",
      bodyPreview: m.bodyPreview ?? "",
      receivedDateTime: m.sentDateTime ?? m.receivedDateTime ?? "",
      sentDateTime: m.sentDateTime,
      isRead: m.isRead,
      hasAttachments: m.hasAttachments,
      flag: { flagStatus: m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged" },
      from: { name: m.from?.emailAddress?.name ?? "Unknown", address: m.from?.emailAddress?.address ?? "" },
      toRecipients: m.toRecipients?.map((r) => ({
        name: r.emailAddress?.name ?? "", address: r.emailAddress?.address ?? "",
      })),
      body: { content: m.body?.content ?? m.bodyPreview ?? "", contentType: (m.body?.contentType as "html" | "text") ?? "text" },
    }));

    return NextResponse.json({ emails });
  } catch (err) {
    const msg = String(err);
    console.error("search error:", msg);
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
