import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet, graphFetch } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import { getProvider, detectProviderType } from "@/lib/providers/registry";
import type { MailFolder } from "@/lib/types/email";

interface GraphFolder {
  id: string;
  displayName: string;
  unreadItemCount: number;
  totalItemCount: number;
  wellKnownName?: string | null;
  parentFolderId?: string;
}

const FOLDER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes (Fix 5)

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", errorCode: "reauth_required" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required", errorCode: "server_error" }, { status: 400 });

  // Non-Microsoft accounts — cache-first, fall back to live provider
  if (homeAccountId.startsWith("imap:") || homeAccountId.startsWith("jmap:")) {
    const forceRefreshNonMs = req.nextUrl.searchParams.get("refresh") === "1";

    // Try cache first (same TTL as MS path)
    if (!forceRefreshNonMs) {
      const cached = await prisma.cachedFolder.findMany({
        where: { userId: user.id, homeAccountId },
        orderBy: { displayName: "asc" },
      });
      if (cached.length > 0) {
        const newest = cached.reduce((max, f) => {
          const t = f.syncedAt ? f.syncedAt.getTime() : 0;
          return t > max ? t : max;
        }, 0);
        const isStale = newest === 0 || Date.now() - newest > FOLDER_CACHE_TTL_MS;
        if (!isStale) {
          const folders: MailFolder[] = cached.map((f) => ({
            id: f.id,
            displayName: f.displayName,
            unreadItemCount: f.unreadCount,
            totalItemCount: f.totalCount,
            wellKnownName: f.wellKnownName ?? null,
            parentId: f.parentFolderId ?? null,
          }));
          return NextResponse.json({ folders });
        }
      }
    }

    // Cache miss or stale — hit the live provider
    try {
      const provider = getProvider(homeAccountId);
      const normalized = await provider.fetchFolders(user.id, homeAccountId);
      const folders: MailFolder[] = normalized.map((f) => ({
        id: f.id,
        displayName: f.displayName,
        unreadItemCount: f.unreadCount,
        totalItemCount: f.totalCount,
        wellKnownName: f.wellKnownName,
        parentId: f.parentFolderId,
      }));
      return NextResponse.json({ folders });
    } catch (err) {
      const msg = String(err);
      console.error("[folders] non-MS fetchFolders error:", msg);
      if (isReauthError(err)) {
        return NextResponse.json({ error: "account_requires_reauth", errorCode: "reauth_required" }, { status: 401 });
      }
      return NextResponse.json({ error: msg, errorCode: "server_error" }, { status: 500 });
    }
  }

  const forceRefresh = req.nextUrl.searchParams.get("refresh") === "1";

  try {
    // Try cache first — custom folders + archive (Fix 5: check TTL)
    if (!forceRefresh) {
      const cached = await prisma.cachedFolder.findMany({
        where: {
          userId: user.id, homeAccountId,
          // Include custom folders (wellKnownName null) AND archive folder (Fix 3)
          OR: [{ wellKnownName: null }, { wellKnownName: "archive" }],
        },
        orderBy: { displayName: "asc" },
      });

      if (cached.length > 0) {
        // Check TTL — use the most recently synced entry; if it's older than TTL, refresh
        const newest = cached.reduce((max, f) => {
          const t = f.syncedAt ? f.syncedAt.getTime() : 0;
          return t > max ? t : max;
        }, 0);
        const isStale = newest === 0 || Date.now() - newest > FOLDER_CACHE_TTL_MS;

        if (!isStale) {
          // Fix 9: include parentId and wellKnownName in response
          const folders: MailFolder[] = cached.map((f) => ({
            id: f.id,
            displayName: f.displayName,
            unreadItemCount: f.unreadCount,
            totalItemCount: f.totalCount,
            wellKnownName: f.wellKnownName ?? null,
            parentId: f.parentFolderId ?? null,
          }));
          return NextResponse.json({ folders });
        }
        // Cache is stale — fall through to Graph fetch
      }
    }

    // Fallback to Graph (Fix 9: include parentFolderId)
    const data = await graphGet<{ value: GraphFolder[] }>(
      user.id, homeAccountId,
      "/me/mailFolders?$select=id,displayName,unreadItemCount,totalItemCount,wellKnownName,parentFolderId&$top=100"
    );

    // Include custom folders (no wellKnownName) + archive folder (Fix 3)
    const folders: MailFolder[] = data.value
      .filter((f) => !f.wellKnownName || f.wellKnownName === "archive")
      .map((f) => ({
        id: f.id,
        displayName: f.displayName,
        unreadItemCount: f.unreadItemCount ?? 0,
        totalItemCount: f.totalItemCount ?? 0,
        wellKnownName: f.wellKnownName ?? null,
        parentId: f.parentFolderId ?? null,
      }));

    return NextResponse.json({ folders });
  } catch (err) {
    const msg = String(err);
    console.error("folders list error:", msg);
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth", errorCode: "reauth_required" }, { status: 401 });
    }
    return NextResponse.json({ error: msg, errorCode: "server_error" }, { status: 500 });
  }
}

// ─── POST /api/mail/folders — Create new folder ──────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { homeAccountId, displayName, parentFolderId } = await req.json() as {
    homeAccountId: string;
    displayName: string;
    parentFolderId?: string;
  };

  if (!homeAccountId || !displayName?.trim()) {
    return NextResponse.json({ error: "homeAccountId and displayName required" }, { status: 400 });
  }

  try {
    // Create in Graph API
    const path = parentFolderId
      ? `/me/mailFolders/${encodeURIComponent(parentFolderId)}/childFolders`
      : "/me/mailFolders";

    const graphRes = await graphFetch(user.id, homeAccountId, path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: displayName.trim() }),
    });

    if (!graphRes.ok) {
      const error = await graphRes.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const created = await graphRes.json() as GraphFolder;

    // Update cache
    await prisma.cachedFolder.create({
      data: {
        id: created.id,
        userId: user.id,
        homeAccountId,
        displayName: created.displayName,
        unreadCount: 0,
        totalCount: 0,
        wellKnownName: null,
        parentFolderId: parentFolderId ?? null,
      },
    }).catch(() => {}); // Don't fail if cache update fails

    return NextResponse.json({
      ok: true,
      folder: {
        id: created.id,
        displayName: created.displayName,
        unreadItemCount: 0,
        totalItemCount: 0,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create folder" },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/mail/folders — Rename folder ─────────────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { homeAccountId, folderId, displayName } = await req.json() as {
    homeAccountId: string;
    folderId: string;
    displayName: string;
  };

  if (!homeAccountId || !folderId || !displayName?.trim()) {
    return NextResponse.json({ error: "homeAccountId, folderId, and displayName required" }, { status: 400 });
  }

  try {
    // Verify ownership
    const folder = await prisma.cachedFolder.findFirst({
      where: { id: folderId, userId: user.id, homeAccountId },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found or access denied" }, { status: 404 });
    }

    // Update in Graph API
    const graphRes = await graphFetch(
      user.id,
      homeAccountId,
      `/me/mailFolders/${encodeURIComponent(folderId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      }
    );

    if (!graphRes.ok) {
      const error = await graphRes.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    // Update cache
    await prisma.cachedFolder.update({
      where: { id: folderId },
      data: { displayName: displayName.trim() },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to rename folder" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/mail/folders — Delete folder ────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  const folderId = req.nextUrl.searchParams.get("folderId");

  if (!homeAccountId || !folderId) {
    return NextResponse.json({ error: "homeAccountId and folderId required" }, { status: 400 });
  }

  try {
    // Verify ownership
    const folder = await prisma.cachedFolder.findFirst({
      where: { id: folderId, userId: user.id, homeAccountId },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found or access denied" }, { status: 404 });
    }

    // Delete from Graph API
    const graphRes = await graphFetch(
      user.id,
      homeAccountId,
      `/me/mailFolders/${encodeURIComponent(folderId)}`,
      {
        method: "DELETE",
      }
    );

    if (!graphRes.ok && graphRes.status !== 404) {
      const error = await graphRes.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    // Delete from cache (also deletes emails via cascade)
    await prisma.cachedFolder.delete({
      where: { id: folderId },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete folder" },
      { status: 500 }
    );
  }
}
