import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import { mapCachedEmail } from "@/lib/utils/email-helpers";
import type { EmailMessage } from "@/lib/types/email";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

const SELECT_RECEIVED = "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,toRecipients,body";
const SELECT_SENT     = "id,subject,bodyPreview,receivedDateTime,sentDateTime,isRead,hasAttachments,flag,from,toRecipients,body";

const FOLDER_PATHS: Record<string, string> = {
  sent:     `/me/mailFolders/sentItems/messages?$select=${SELECT_SENT}&$top=50&$orderby=sentDateTime desc`,
  drafts:   `/me/mailFolders/drafts/messages?$select=${SELECT_SENT}&$top=50&$orderby=lastModifiedDateTime desc`,
  trash:    `/me/mailFolders/deletedItems/messages?$select=${SELECT_RECEIVED}&$top=50&$orderby=receivedDateTime desc`,
  starred:  `/me/messages?$filter=flag/flagStatus eq 'flagged'&$select=${SELECT_RECEIVED}&$top=50`,
};

// Maps folder name → well-known name for cache lookup
const WELL_KNOWN: Record<string, string> = {
  sent:    "sentItems",
  drafts:  "drafts",
  trash:   "deletedItems",
};

interface GraphRecipient {
  emailAddress: { name: string; address: string };
}

interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  sentDateTime?: string;
  lastModifiedDateTime?: string;
  isRead: boolean;
  hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  toRecipients?: GraphRecipient[];
  body: { content: string; contentType: string };
}

interface GraphResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

function mapGraphMessage(m: GraphMessage): EmailMessage {
  return {
    id: m.id,
    subject: m.subject ?? "(no subject)",
    bodyPreview: m.bodyPreview ?? "",
    receivedDateTime: m.receivedDateTime ?? m.sentDateTime ?? m.lastModifiedDateTime ?? "",
    sentDateTime: m.sentDateTime,
    isRead: m.isRead,
    hasAttachments: m.hasAttachments,
    flag: { flagStatus: m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged" },
    from: {
      name: m.from?.emailAddress?.name ?? "Unknown",
      address: m.from?.emailAddress?.address ?? "",
    },
    toRecipients: m.toRecipients?.map((r) => ({
      name: r.emailAddress?.name ?? "",
      address: r.emailAddress?.address ?? "",
    })),
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
  if (!folder && !nextLinkParam) return NextResponse.json({ error: "folder required" }, { status: 400 });

  // Legacy Graph URL pagination — pass through directly
  if (nextLinkParam && nextLinkParam.startsWith("http")) {
    const path = nextLinkParam.startsWith(GRAPH_BASE)
      ? nextLinkParam.slice(GRAPH_BASE.length)
      : nextLinkParam;
    try {
      const data = await graphGet<GraphResponse>(user.id, homeAccountId, path);
      return NextResponse.json({ emails: data.value.map(mapGraphMessage), nextLink: data["@odata.nextLink"] ?? null });
    } catch (err) {
      if (isReauthError(err)) return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Cache-first path ──────────────────────────────────────────────────────

  try {
    let cacheHit = false;

    if (folder === "starred") {
      // Starred: query by flagStatus across all cached folders
      const cached = nextLinkParam
        ? await prisma.cachedEmail.findMany({
            where: { userId: user.id, homeAccountId, flagStatus: "flagged" },
            orderBy: { receivedDateTime: "desc" },
            take: 50,
            cursor: { id: nextLinkParam },
            skip: 1,
          })
        : await prisma.cachedEmail.findMany({
            where: { userId: user.id, homeAccountId, flagStatus: "flagged" },
            orderBy: { receivedDateTime: "desc" },
            take: 50,
          });
      if (cached.length > 0) {
        cacheHit = true;
        return NextResponse.json({
          emails: cached.map(mapCachedEmail),
          nextLink: cached.length === 50 ? cached[cached.length - 1].id : null,
        });
      }
    } else if (WELL_KNOWN[folder]) {
      // Well-known folder (sent, drafts, trash)
      const cachedFolder = await prisma.cachedFolder.findFirst({
        where: { userId: user.id, homeAccountId, wellKnownName: WELL_KNOWN[folder] },
      });
      if (cachedFolder) {
        const orderBy = folder === "sent"
          ? { sentDateTime: "desc" as const }
          : { receivedDateTime: "desc" as const };
        const cached = nextLinkParam
          ? await prisma.cachedEmail.findMany({
              where: { userId: user.id, homeAccountId, folderId: cachedFolder.id },
              orderBy,
              take: 50,
              cursor: { id: nextLinkParam },
              skip: 1,
            })
          : await prisma.cachedEmail.findMany({
              where: { userId: user.id, homeAccountId, folderId: cachedFolder.id },
              orderBy,
              take: 50,
            });
        if (cached.length > 0) {
          cacheHit = true;
          return NextResponse.json({
            emails: cached.map(mapCachedEmail),
            nextLink: cached.length === 50 ? cached[cached.length - 1].id : null,
          });
        }
      }
    } else if (folder) {
      // Custom folder — folder param is the folder ID directly
      const cached = nextLinkParam
        ? await prisma.cachedEmail.findMany({
            where: { userId: user.id, homeAccountId, folderId: folder },
            orderBy: { receivedDateTime: "desc" },
            take: 50,
            cursor: { id: nextLinkParam },
            skip: 1,
          })
        : await prisma.cachedEmail.findMany({
            where: { userId: user.id, homeAccountId, folderId: folder },
            orderBy: { receivedDateTime: "desc" },
            take: 50,
          });
      if (cached.length > 0) {
        cacheHit = true;
        return NextResponse.json({
          emails: cached.map(mapCachedEmail),
          nextLink: cached.length === 50 ? cached[cached.length - 1].id : null,
        });
      }
    }

    if (cacheHit) return; // TypeScript won't reach here but keeps the flow clear

    // ── Fallback to Graph ───────────────────────────────────────────────────

    const path = FOLDER_PATHS[folder]
      ?? `/me/mailFolders/${encodeURIComponent(folder)}/messages?$select=${SELECT_RECEIVED}&$top=50&$orderby=receivedDateTime desc`;
    const data = await graphGet<GraphResponse>(user.id, homeAccountId, path);
    return NextResponse.json({ emails: data.value.map(mapGraphMessage), nextLink: data["@odata.nextLink"] ?? null });
  } catch (err) {
    const msg = String(err);
    console.error("folder route error:", msg);
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
