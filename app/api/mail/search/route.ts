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
  try {
    const term = q.trim();
    const cached = await prisma.cachedEmail.findMany({
      where: {
        userId: user.id,
        homeAccountId,
        OR: [
          { subject:      { contains: term, mode: "insensitive" } },
          { fromName:     { contains: term, mode: "insensitive" } },
          { fromAddress:  { contains: term, mode: "insensitive" } },
          { bodyPreview:  { contains: term, mode: "insensitive" } },
        ],
      },
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
  // folder is validated against ALLOWED_FOLDERS above — safe to use in path construction
  const search = encodeURIComponent(q);
  const wellKnown = WELL_KNOWN_FOLDER_PATHS[folder];
  const path = (folder === "starred" || (!wellKnown && !folder))
    ? `/me/messages?$search="${search}"&$select=${SELECT}&$top=50`
    : wellKnown
      ? `/me/mailFolders/${wellKnown}/messages?$search="${search}"&$select=${SELECT}&$top=50`
      : `/me/mailFolders/inbox/messages?$search="${search}"&$select=${SELECT}&$top=50`;

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
