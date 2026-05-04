import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import { mapNormalizedEmail, mapCachedEmail, mapGraphMessage } from "@/lib/utils/email-helpers";
import { verifyAccountOwnership, getProvider, detectProviderType } from "@/lib/providers/registry";
import type { EmailMessage } from "@/lib/types/email";
import type { GraphMessage } from "@/lib/types/graph";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

// Maps well-known folder param → Graph well-known folder name
const WELL_KNOWN_FOLDER_PATHS: Record<string, string> = {
  inbox:   "inbox",
  sent:    "sentItems",
  drafts:  "drafts",
  trash:   "deletedItems",
};

/** Only these folder values are accepted from external input */
const ALLOWED_FOLDERS = new Set<string>(["inbox", "sent", "drafts", "trash", "starred"]);

const SELECT = "id,subject,bodyPreview,receivedDateTime,sentDateTime,isRead,hasAttachments,flag,from,toRecipients,body";

/**
 * Parse advanced search operators from a query string.
 * Supports: from:, to:, subject:, has:attachment, before:YYYY-MM-DD, after:YYYY-MM-DD, is:unread, is:starred
 * Everything else becomes the general search term.
 */
function parseSearchOperators(query: string) {
  const result: {
    from?: string;
    to?: string;
    subject?: string;
    hasAttachment?: boolean;
    before?: Date;
    after?: Date;
    isUnread?: boolean;
    isStarred?: boolean;
    general?: string;
  } = {};

  let remaining = query;

  // Extract from: operator
  const fromMatch = remaining.match(/from:["']?([^"'\s]+)["']?/i);
  if (fromMatch) {
    result.from = fromMatch[1];
    remaining = remaining.replace(fromMatch[0], "");
  }

  // Extract to: operator
  const toMatch = remaining.match(/to:["']?([^"'\s]+)["']?/i);
  if (toMatch) {
    result.to = toMatch[1];
    remaining = remaining.replace(toMatch[0], "");
  }

  // Extract subject: operator (supports quoted strings)
  const subjectMatch = remaining.match(/subject:"([^"]+)"/i) || remaining.match(/subject:(\S+)/i);
  if (subjectMatch) {
    result.subject = subjectMatch[1];
    remaining = remaining.replace(subjectMatch[0], "");
  }

  // Extract has:attachment
  const hasMatch = remaining.match(/has:attachment/i);
  if (hasMatch) {
    result.hasAttachment = true;
    remaining = remaining.replace(hasMatch[0], "");
  }

  // Extract before:YYYY-MM-DD
  const beforeMatch = remaining.match(/before:(\d{4}-\d{2}-\d{2})/i);
  if (beforeMatch) {
    result.before = new Date(beforeMatch[1]);
    remaining = remaining.replace(beforeMatch[0], "");
  }

  // Extract after:YYYY-MM-DD
  const afterMatch = remaining.match(/after:(\d{4}-\d{2}-\d{2})/i);
  if (afterMatch) {
    result.after = new Date(afterMatch[1]);
    remaining = remaining.replace(afterMatch[0], "");
  }

  // Extract is:unread / is:starred
  const unreadMatch = remaining.match(/is:unread/i);
  if (unreadMatch) {
    result.isUnread = true;
    remaining = remaining.replace(unreadMatch[0], "");
  }
  const starredMatch = remaining.match(/is:starred/i);
  if (starredMatch) {
    result.isStarred = true;
    remaining = remaining.replace(starredMatch[0], "");
  }

  // Whatever's left is the general search term
  const general = remaining.trim();
  if (general) result.general = general;

  return result;
}

/**
 * Build a Graph API search/filter path from parsed operators.
 * Uses $search for text queries and $filter for structured queries.
 */
function buildGraphSearchPath(operators: ReturnType<typeof parseSearchOperators>, folder: string): string {
  const wellKnown = WELL_KNOWN_FOLDER_PATHS[folder];
  const base = wellKnown
    ? `/me/mailFolders/${wellKnown}/messages`
    : folder === "starred" ? "/me/messages" : "/me/mailFolders/inbox/messages";

  const filters: string[] = [];
  let searchTerm = "";

  // Build $search for text queries
  const searchParts: string[] = [];
  if (operators.from) searchParts.push(`from:${operators.from}`);
  if (operators.to) searchParts.push(`to:${operators.to}`);
  if (operators.subject) searchParts.push(`subject:${operators.subject}`);
  if (operators.general) searchParts.push(operators.general);

  if (searchParts.length > 0) {
    searchTerm = encodeURIComponent(searchParts.join(" "));
  }

  // Build $filter for structured queries
  if (operators.hasAttachment) filters.push("hasAttachments eq true");
  if (operators.isUnread) filters.push("isRead eq false");
  if (operators.before) filters.push(`receivedDateTime lt ${operators.before.toISOString()}`);
  if (operators.after) filters.push(`receivedDateTime ge ${operators.after.toISOString()}`);

  // Construct the URL
  const params: string[] = [];
  if (searchTerm) params.push(`$search="${searchTerm}"`);
  if (filters.length > 0) params.push(`$filter=${filters.join(" and ")}`);
  params.push(`$select=${SELECT}`);
  params.push("$top=50");

  return `${base}?${params.join("&")}`;
}

async function searchEmailHandler(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  const q = req.nextUrl.searchParams.get("q");
  // Validate folder against allowlist — prevents arbitrary Graph path injection
  const rawFolder = req.nextUrl.searchParams.get("folder") ?? "inbox";
  const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : "inbox";

  // Input validation
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  if (!q) return NextResponse.json({ error: "Search query (q) is required" }, { status: 400 });
  if (!q.trim()) return NextResponse.json({ emails: [] });
  if (q.length > 200) return NextResponse.json({ error: "Search query too long (max 200 chars)" }, { status: 400 });

  // Verify the homeAccountId belongs to this authenticated user (prevents IDOR)
  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const providerType = detectProviderType(homeAccountId);

  // ── Non-Microsoft providers: use provider abstraction directly ─────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(homeAccountId);

      // Resolve folder ID for non-Microsoft providers
      let folderId: string | undefined;
      if (folder !== "starred" && folder !== "inbox") {
        const folders = await provider.fetchFolders(user.id, homeAccountId);
        const wellKnownMap: Record<string, string> = {
          sent: "sentitems",
          drafts: "drafts",
          trash: "deleteditems",
        };
        const wkn = wellKnownMap[folder];
        if (wkn) {
          const found = folders.find((f) => f.wellKnownName === wkn);
          folderId = found?.id;
        }
      }

      const results = await provider.searchEmails(user.id, homeAccountId, q.trim(), folderId);
      const emails: EmailMessage[] = results.map(mapNormalizedEmail);
      return NextResponse.json({ emails });
    } catch (err) {
      console.error("search error (provider):", String(err));
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Microsoft path (existing logic with caching) ───────────────────────────

  // ── 1. Try DB cache first (fast, local) ─────────────────────────────────────
  // Parse advanced search operators: from:, to:, subject:, has:attachment, before:, after:
  try {
    const term = q.trim();
    const operators = parseSearchOperators(term);

    // Build Prisma where clause based on operators
    const whereConditions: Record<string, unknown>[] = [];
    const baseWhere: Record<string, unknown> = { userId: user.id, homeAccountId };

    if (operators.from) {
      whereConditions.push({ fromName: { contains: operators.from, mode: "insensitive" } });
      whereConditions.push({ fromAddress: { contains: operators.from, mode: "insensitive" } });
    }
    if (operators.to) {
      // Search toRecipients JSON field — use raw SQL for JSON contains
      whereConditions.push({ toRecipients: { string_contains: operators.to } });
    }
    if (operators.subject) {
      whereConditions.push({ subject: { contains: operators.subject, mode: "insensitive" } });
    }
    if (operators.hasAttachment) {
      Object.assign(baseWhere, { hasAttachments: true });
    }
    if (operators.before) {
      Object.assign(baseWhere, { receivedDateTime: { lt: operators.before } });
    }
    if (operators.after) {
      Object.assign(baseWhere, { receivedDateTime: { gt: operators.after } });
    }
    if (operators.isUnread) {
      Object.assign(baseWhere, { isRead: false });
    }
    if (operators.isStarred) {
      Object.assign(baseWhere, { flagStatus: "flagged" });
    }

    // If there's a general term (no operators), search across all text fields
    if (operators.general) {
      whereConditions.push(
        { subject:     { contains: operators.general, mode: "insensitive" } },
        { fromName:    { contains: operators.general, mode: "insensitive" } },
        { fromAddress: { contains: operators.general, mode: "insensitive" } },
        { bodyPreview: { contains: operators.general, mode: "insensitive" } },
      );
    }

    // If we only have operators (no OR conditions needed), use AND logic
    // If we have general text, use OR across fields
    const where = {
      ...baseWhere,
      ...(operators.from && !operators.general
        ? { OR: [
            { fromName: { contains: operators.from, mode: "insensitive" } },
            { fromAddress: { contains: operators.from, mode: "insensitive" } },
          ] }
        : operators.to && !operators.general
          ? { toRecipients: { string_contains: operators.to } }
          : operators.subject && !operators.general
            ? { subject: { contains: operators.subject, mode: "insensitive" } }
            : whereConditions.length > 0
              ? { OR: whereConditions }
              : {}),
    };

    const cached = await prisma.cachedEmail.findMany({
      where,
      orderBy: { receivedDateTime: "desc" },
      take: 100,
    });

    if (cached.length > 0) {
      const emails = cached.map(mapCachedEmail);
      return NextResponse.json({ emails });
    }
  } catch {
    // cache miss or DB error — fall through to Graph
  }

  // ── 2. Check cached search results (Graph API cache) ────────────────────────
  try {
    const cachedSearch = await prisma.cachedSearchResult.findUnique({
      where: {
        userId_homeAccountId_query: {
          userId: user.id,
          homeAccountId,
          query: q.trim(),
        },
      },
    });

    if (cachedSearch && cachedSearch.expiresAt > new Date()) {
      // Return cached Graph search results
      return NextResponse.json({ emails: cachedSearch.results });
    }
  } catch {
    // Cache miss or DB error — fall through to Graph
  }

  // ── 3. Fall back to Graph search ─────────────────────────────────────────────
  // Use operator-aware path builder for structured search
  const operators = parseSearchOperators(q.trim());
  const path = buildGraphSearchPath(operators, folder);

  try {
    const data = await graphGet<{ value: GraphMessage[] }>(user.id, homeAccountId, path);

    const emails = data.value.map(mapGraphMessage);

    // ── 4. Cache the Graph search results (1hr TTL) ─────────────────────────────
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Cast to Prisma's JsonValue-compatible type (EmailMessage[] satisfies JsonArray)
      const emailsJson = emails as unknown as Parameters<typeof prisma.cachedSearchResult.upsert>[0]["create"]["results"];

      await prisma.cachedSearchResult.upsert({
        where: {
          userId_homeAccountId_query: {
            userId: user.id,
            homeAccountId,
            query: q.trim(),
          },
        },
        create: {
          userId: user.id,
          homeAccountId,
          query: q.trim(),
          results: emailsJson,
          expiresAt,
        },
        update: {
          results: emailsJson,
          expiresAt,
        },
      });
    } catch (cacheErr) {
      // Cache save failed — not critical, continue
      console.error("[search] Failed to cache results:", cacheErr);
    }

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

// Export with rate limiting (100 searches per minute)
export const GET = withRateLimit(searchEmailHandler, rateLimiters.read);
