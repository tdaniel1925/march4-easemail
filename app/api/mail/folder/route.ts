import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";

const folderQuerySchema = z.object({
  homeAccountId: z.string().min(1).max(512),
  folder: z.string().max(512).optional(),
  nextLink: z.string().min(1).max(4096).nullable().optional(),
});
import { isReauthError } from "@/lib/microsoft/auth-errors";
import { mapCachedEmail, mapNormalizedEmail } from "@/lib/utils/email-helpers";
import { verifyAccountOwnership, getProvider, detectProviderType } from "@/lib/providers/registry";
import type { EmailMessage } from "@/lib/types/email";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

const SELECT_RECEIVED = "id,subject,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,from,toRecipients,body";
const SELECT_SENT     = "id,subject,bodyPreview,receivedDateTime,sentDateTime,isRead,hasAttachments,flag,from,toRecipients,body";

// Fix 15: increase $top from 50 to 100
const FOLDER_PATHS: Record<string, string> = {
  sent:    `/me/mailFolders/sentItems/messages?$select=${SELECT_SENT}&$top=100&$orderby=sentDateTime desc`,
  drafts:  `/me/mailFolders/drafts/messages?$select=${SELECT_SENT}&$top=100&$orderby=lastModifiedDateTime desc`,
  trash:   `/me/mailFolders/deletedItems/messages?$select=${SELECT_RECEIVED}&$top=100&$orderby=receivedDateTime desc`,
  starred: `/me/messages?$filter=flag/flagStatus eq 'flagged'&$select=${SELECT_RECEIVED}&$top=100`,
};

/** Well-known folder aliases — validated server-side, never passed raw to Graph */
const WELL_KNOWN: Record<string, string> = {
  sent:    "sentItems",
  drafts:  "drafts",
  trash:   "deletedItems",
};

/** Named folders accepted from query params (beyond well-known). Any other value is treated as a folder ID and must exist in the user's cachedFolder table before being used in a Graph call. */
const NAMED_FOLDERS = new Set(["sent", "drafts", "trash", "starred"]);

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

/** Map well-known folder name to the provider folderId for non-Microsoft providers */
function resolveWellKnownFolder(
  folder: string,
  providerFolders: { id: string; wellKnownName: string | null }[]
): string | null {
  const wellKnownMap: Record<string, string> = {
    sent: "sentitems",
    drafts: "drafts",
    trash: "deleteditems",
    starred: "starred", // handled specially
  };
  const wkn = wellKnownMap[folder];
  if (!wkn) return null;
  const found = providerFolders.find((f) => f.wellKnownName === wkn);
  return found?.id ?? null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", errorCode: "reauth_required" }, { status: 401 });

  const parsedQuery = folderQuerySchema.safeParse({
    homeAccountId: req.nextUrl.searchParams.get("homeAccountId") ?? undefined,
    folder: req.nextUrl.searchParams.get("folder") ?? undefined,
    nextLink: req.nextUrl.searchParams.get("nextLink"),
  });
  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid request", details: parsedQuery.error.flatten() }, { status: 400 });
  }
  const { homeAccountId } = parsedQuery.data;
  const folder = parsedQuery.data.folder ?? "";
  const nextLinkParam = parsedQuery.data.nextLink ?? null;

  if (!folder && !nextLinkParam) return NextResponse.json({ error: "folder required", errorCode: "server_error" }, { status: 400 });

  // Verify the homeAccountId belongs to this authenticated user (prevents IDOR)
  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found", errorCode: "not_found" }, { status: 404 });

  const providerType = detectProviderType(homeAccountId);

  // ── Non-Microsoft providers: use provider abstraction ──────────────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(homeAccountId);

      if (folder === "starred") {
        // Fetch all emails and filter flagged ones
        const folders = await provider.fetchFolders(user.id, homeAccountId);
        const inboxFolder = folders.find((f) => f.wellKnownName === "inbox");
        if (!inboxFolder) return NextResponse.json({ emails: [], nextLink: null });
        const result = await provider.fetchEmails(user.id, homeAccountId, inboxFolder.id, {
          filter: "starred",
          top: 50,
          cursor: nextLinkParam ?? undefined,
        });
        return NextResponse.json({
          emails: result.emails.map(mapNormalizedEmail),
          nextLink: result.nextCursor ?? null,
        });
      }

      // Resolve folder: named folder or custom folder ID
      let folderId: string | null = null;
      if (NAMED_FOLDERS.has(folder)) {
        const providerFolders = await provider.fetchFolders(user.id, homeAccountId);
        folderId = resolveWellKnownFolder(folder, providerFolders);
      } else {
        folderId = folder; // treat as folder ID directly
      }

      if (!folderId) {
        return NextResponse.json({ error: "Folder not found", errorCode: "not_found" }, { status: 404 });
      }

      const result = await provider.fetchEmails(user.id, homeAccountId, folderId, {
        top: 100, // Fix 15
        cursor: nextLinkParam ?? undefined,
      });
      return NextResponse.json({
        emails: result.emails.map(mapNormalizedEmail),
        nextLink: result.nextCursor ?? null,
      });
    } catch (err) {
      console.error("folder route error (provider):", String(err));
      return NextResponse.json({ error: String(err), errorCode: "server_error" }, { status: 500 });
    }
  }

  // ── Microsoft path (existing logic with caching) ───────────────────────────

  // Fix 10: Pass full nextLink URL directly to Graph (no reconstruction)
  if (nextLinkParam && nextLinkParam.startsWith("http")) {
    const path = nextLinkParam.startsWith(GRAPH_BASE)
      ? nextLinkParam.slice(GRAPH_BASE.length)
      : nextLinkParam;
    try {
      const data = await graphGet<GraphResponse>(user.id, homeAccountId, path);
      // Fix 15: return full nextLink URL as cursor so client can pass it back directly
      return NextResponse.json({ emails: data.value.map(mapGraphMessage), nextLink: data["@odata.nextLink"] ?? null });
    } catch (err) {
      if (isReauthError(err)) return NextResponse.json({ error: "account_requires_reauth", errorCode: "reauth_required" }, { status: 401 });
      return NextResponse.json({ error: String(err), errorCode: "server_error" }, { status: 500 });
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
            take: 100, // Fix 15
            cursor: { id: nextLinkParam },
            skip: 1,
          })
        : await prisma.cachedEmail.findMany({
            where: { userId: user.id, homeAccountId, flagStatus: "flagged" },
            orderBy: { receivedDateTime: "desc" },
            take: 100, // Fix 15
          });
      if (cached.length > 0) {
        cacheHit = true;
        return NextResponse.json({
          emails: cached.map(mapCachedEmail),
          nextLink: cached.length === 100 ? cached[cached.length - 1].id : null,
        });
      }
    } else if (WELL_KNOWN[folder]) {
      // Well-known folder (sent, drafts, trash) — folder param is validated against WELL_KNOWN dict
      // Trash always fetches live from Graph to avoid showing phantom/stale entries
      if (folder !== "trash") {
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
                take: 100, // Fix 15
                cursor: { id: nextLinkParam },
                skip: 1,
              })
            : await prisma.cachedEmail.findMany({
                where: { userId: user.id, homeAccountId, folderId: cachedFolder.id },
                orderBy,
                take: 100, // Fix 15
              });
          if (cached.length > 0) {
            cacheHit = true;
            return NextResponse.json({
              emails: cached.map(mapCachedEmail),
              nextLink: cached.length === 100 ? cached[cached.length - 1].id : null,
            });
          }
        }
      }
    } else if (folder && !NAMED_FOLDERS.has(folder)) {
      // Custom folder — folder param is treated as a folder ID.
      // Validate it belongs to this user's cached folders before using in a Graph call.
      const owned = await prisma.cachedFolder.findFirst({
        where: { id: folder, userId: user.id, homeAccountId },
        select: { id: true },
      });
      if (!owned) {
        return NextResponse.json({ error: "Folder not found", errorCode: "not_found" }, { status: 404 });
      }

      const cached = nextLinkParam
        ? await prisma.cachedEmail.findMany({
            where: { userId: user.id, homeAccountId, folderId: folder },
            orderBy: { receivedDateTime: "desc" },
            take: 100, // Fix 15
            cursor: { id: nextLinkParam },
            skip: 1,
          })
        : await prisma.cachedEmail.findMany({
            where: { userId: user.id, homeAccountId, folderId: folder },
            orderBy: { receivedDateTime: "desc" },
            take: 100, // Fix 15
          });
      if (cached.length > 0) {
        cacheHit = true;
        return NextResponse.json({
          emails: cached.map(mapCachedEmail),
          nextLink: cached.length === 100 ? cached[cached.length - 1].id : null,
        });
      }
    }

    // Defensive: all cache-hit branches above already returned their payload
    if (cacheHit) return NextResponse.json({ emails: [], nextLink: null });

    // ── Fallback to Graph ───────────────────────────────────────────────────
    // For custom folder IDs: we already verified ownership above via cachedFolder check.
    // For named/well-known folders: they come from FOLDER_PATHS constant, not user input.
    // Fix 15: use $top=100; Fix 10: return full @odata.nextLink as cursor
    const path = FOLDER_PATHS[folder]
      ?? `/me/mailFolders/${encodeURIComponent(folder)}/messages?$select=${SELECT_RECEIVED}&$top=100&$orderby=receivedDateTime desc`;
    const data = await graphGet<GraphResponse>(user.id, homeAccountId, path);

    // ── Cache reconciliation (ghost prevention) ─────────────────────────────
    // A fresh first-page fetch from Graph is the source of truth for its date
    // window: delete cachedEmail rows for this user+folder whose
    // receivedDateTime falls inside the fetched page's range but whose id the
    // live listing no longer returns (deleted/moved upstream). Conservative:
    // only the overlap window — older items beyond page 1 are never touched.
    // Skipped for "starred" (spans folders) and for paginated requests.
    if (!nextLinkParam && folder !== "starred" && data.value.length > 0) {
      try {
        // Resolve the cachedEmail.folderId this listing corresponds to
        let cacheFolderId: string | null = null;
        if (WELL_KNOWN[folder]) {
          const cf = await prisma.cachedFolder.findFirst({
            where: { userId: user.id, homeAccountId, wellKnownName: WELL_KNOWN[folder] },
            select: { id: true },
          });
          cacheFolderId = cf?.id ?? null;
        } else if (!NAMED_FOLDERS.has(folder)) {
          cacheFolderId = folder; // custom folder id — ownership verified above
        }
        if (cacheFolderId) {
          const liveIds = data.value.map((m) => m.id);
          const dates = data.value
            .map((m) => new Date(m.receivedDateTime ?? m.sentDateTime ?? m.lastModifiedDateTime ?? ""))
            .filter((d) => !Number.isNaN(d.getTime()));
          if (dates.length > 0) {
            const min = new Date(Math.min(...dates.map((d) => d.getTime())));
            const max = new Date(Math.max(...dates.map((d) => d.getTime())));
            await prisma.cachedEmail.deleteMany({
              where: {
                userId: user.id,
                homeAccountId,
                folderId: cacheFolderId,
                id: { notIn: liveIds },
                receivedDateTime: { gte: min, lte: max },
              },
            });
          }
        }
      } catch {
        // Reconciliation is best-effort — never block the listing response
      }
    }

    return NextResponse.json({ emails: data.value.map(mapGraphMessage), nextLink: data["@odata.nextLink"] ?? null });
  } catch (err) {
    const msg = String(err);
    console.error("folder route error:", msg);
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth", errorCode: "reauth_required" }, { status: 401 });
    }
    return NextResponse.json({ error: msg, errorCode: "server_error" }, { status: 500 });
  }
}
