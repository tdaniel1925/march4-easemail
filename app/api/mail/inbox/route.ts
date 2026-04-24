import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import { mapCachedEmail } from "@/lib/utils/email-helpers";
import { verifyAccountOwnership, detectProviderType, getProvider } from "@/lib/providers/registry";
import type { NormalizedEmail, FetchEmailsOptions } from "@/lib/providers/types";
import type { EmailMessage } from "@/lib/types/email";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const SELECT = "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,body";
const DEFAULT_PATH =
  `/me/mailFolders/inbox/messages?$top=50&$select=${SELECT}&$orderby=receivedDateTime desc`;

const TAB_PATHS: Record<string, string> = {
  unread:      `/me/mailFolders/inbox/messages?$filter=isRead eq false&$select=${SELECT}&$top=100&$orderby=receivedDateTime desc`,
  starred:     `/me/mailFolders/inbox/messages?$filter=flag/flagStatus eq 'flagged'&$select=${SELECT}&$top=100`,
  attachments: `/me/mailFolders/inbox/messages?$filter=hasAttachments eq true&$select=${SELECT}&$top=100&$orderby=receivedDateTime desc`,
};

/** Allowed tab values — prevents arbitrary string injection into query paths */
const ALLOWED_TABS = new Set(["", "unread", "starred", "attachments", "label"]);

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

function mapGraphMessage(m: GraphMessage): EmailMessage {
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

/** Map a NormalizedEmail (from provider) to the frontend EmailMessage format */
function mapNormalizedToEmailMessage(e: NormalizedEmail): EmailMessage {
  return {
    id: e.id,
    subject: e.subject || "(no subject)",
    bodyPreview: e.bodyPreview ?? "",
    receivedDateTime: e.receivedDateTime,
    sentDateTime: e.sentDateTime,
    isRead: e.isRead,
    hasAttachments: e.hasAttachments,
    flag: { flagStatus: e.flagStatus },
    from: {
      name: e.from?.name ?? "Unknown",
      address: e.from?.address ?? "",
    },
    toRecipients: e.toRecipients,
    body: e.bodyHtml
      ? { content: e.bodyHtml, contentType: "html" }
      : { content: e.bodyText ?? e.bodyPreview ?? "", contentType: "text" },
    attachments: e.attachments,
  };
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });

  // Verify the homeAccountId belongs to this authenticated user (prevents IDOR / parameter tampering)
  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const providerType = detectProviderType(homeAccountId);
  const nextLinkParam = req.nextUrl.searchParams.get("nextLink");
  const rawTab = req.nextUrl.searchParams.get("tab") ?? "";
  // Validate tab against allowed values — reject unknown tabs
  const tab = ALLOWED_TABS.has(rawTab) ? rawTab : "";
  // Sanitize label: only allow alphanumeric, spaces, hyphens, underscores — prevents OData injection
  const rawLabel = req.nextUrl.searchParams.get("label") ?? "";
  const labelParam = rawLabel.replace(/[^a-zA-Z0-9 \-_]/g, "").slice(0, 64);

  // ── IMAP / JMAP provider path ─────────────────────────────────────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(homeAccountId);
      const filter = tab === "unread" ? "unread"
        : tab === "starred" ? "starred"
        : tab === "attachments" ? "attachments"
        : undefined;

      const options: FetchEmailsOptions = {
        top: 50,
        ...(filter ? { filter } : {}),
        ...(tab === "label" && labelParam ? { label: labelParam } : {}),
        ...(nextLinkParam ? { cursor: nextLinkParam } : {}),
      };

      const result = await provider.fetchEmails(user.id, homeAccountId, "inbox", options);
      const emails = result.emails.map(mapNormalizedToEmailMessage);
      return NextResponse.json({ emails, nextLink: result.nextCursor ?? null });
    } catch (err) {
      const msg = String(err);
      console.error("[inbox] provider error:", msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // ── Microsoft Graph path (cache-first + Graph fallback) ───────────────────

  // If nextLink is a Graph URL, pass through to Graph directly (legacy pagination)
  if (nextLinkParam && nextLinkParam.startsWith("http")) {
    const path = nextLinkParam.startsWith(GRAPH_BASE)
      ? nextLinkParam.slice(GRAPH_BASE.length)
      : nextLinkParam;
    try {
      const data = await graphGet<GraphMessagesResponse>(user.id, homeAccountId, path);
      return NextResponse.json({ emails: data.value.map(mapGraphMessage), nextLink: data["@odata.nextLink"] ?? null });
    } catch (err) {
      if (isReauthError(err)) return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Cache-first path ──────────────────────────────────────────────────────

  try {
    // Look up inbox folder
    const inboxFolder = await prisma.cachedFolder.findFirst({
      where: { userId: user.id, homeAccountId, wellKnownName: "inbox" },
    });

    if (inboxFolder) {
      type WhereClause = {
        userId: string;
        homeAccountId: string;
        folderId?: string;
        isRead?: boolean;
        flagStatus?: string;
        hasAttachments?: boolean;
        categories?: { array_contains: string };
      };

      const where: WhereClause = { userId: user.id, homeAccountId };

      if (tab === "unread") {
        where.folderId = inboxFolder.id;
        where.isRead = false;
      } else if (tab === "starred") {
        // Starred can be anywhere — no folderId filter
        where.flagStatus = "flagged";
      } else if (tab === "attachments") {
        where.folderId = inboxFolder.id;
        where.hasAttachments = true;
      } else if (tab === "label" && labelParam) {
        where.folderId = inboxFolder.id;
        // labelParam is already sanitized above — safe for Prisma parameterized query
        where.categories = { array_contains: labelParam };
      } else {
        where.folderId = inboxFolder.id;
      }

      const cached = nextLinkParam
        ? await prisma.cachedEmail.findMany({
            where,
            orderBy: { receivedDateTime: "desc" },
            take: 50,
            cursor: { id: nextLinkParam },
            skip: 1,
          })
        : await prisma.cachedEmail.findMany({
            where,
            orderBy: { receivedDateTime: "desc" },
            take: 50,
          });

      if (cached.length > 0) {
        const emails = cached.map(mapCachedEmail);
        const nextLink = cached.length === 50 ? cached[cached.length - 1].id : null;
        return NextResponse.json({ emails, nextLink });
      }
    }

    // ── Fallback to Graph ───────────────────────────────────────────────────

    let tabPath: string | undefined;
    if (tab === "label" && labelParam) {
      // labelParam is sanitized: alphanumeric/spaces/hyphens/underscores only — safe to embed in OData filter
      tabPath = `/me/mailFolders/inbox/messages?$filter=categories/any(c:c eq '${labelParam}')&$select=${SELECT}&$top=100`;
    } else {
      tabPath = TAB_PATHS[tab];
    }

    const path = tabPath ?? DEFAULT_PATH;
    const data = await graphGet<GraphMessagesResponse>(user.id, homeAccountId, path);
    return NextResponse.json({ emails: data.value.map(mapGraphMessage), nextLink: data["@odata.nextLink"] ?? null });
  } catch (err) {
    const msg = String(err);
    console.error("[inbox] error:", msg);
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
