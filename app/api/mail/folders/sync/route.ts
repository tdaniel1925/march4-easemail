import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { syncFolders } from "@/lib/sync/folder-sync";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import { getProvider, verifyAccountOwnership } from "@/lib/providers/registry";

const folderSyncSchema = z.object({
  homeAccountId: z.string().min(1).max(512),
});

/**
 * POST /api/mail/folders/sync
 *
 * Triggers a full recursive folder sync for the given account and writes the
 * result to the cachedFolder table.  Called by the Sidebar on account switch
 * so that the deep folder hierarchy (child folders) is populated immediately
 * without waiting for the next cron run.
 *
 * The endpoint is intentionally fire-and-forget from the client's perspective:
 * the Sidebar issues a GET first (which returns cached top-level folders fast)
 * and then POSTs here in the background so the next GET (after 5 min TTL or
 * manual refresh) returns the full tree.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", errorCode: "reauth_required" }, { status: 401 });
  }

  const parsed = folderSyncSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { homeAccountId } = parsed.data;

  // Verify the homeAccountId belongs to this authenticated user (prevents IDOR)
  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) {
    return NextResponse.json({ error: "Account not found", errorCode: "server_error" }, { status: 404 });
  }

  try {
    let count: number;
    if (homeAccountId.startsWith("imap:") || homeAccountId.startsWith("jmap:")) {
      const provider = getProvider(homeAccountId);
      const folders = await provider.syncFolders(user.id, homeAccountId);
      count = folders.length;
    } else {
      const folderRefs = await syncFolders(user.id, homeAccountId);
      count = folderRefs.length;
    }
    return NextResponse.json({ ok: true, count });
  } catch (err) {
    const msg = String(err);
    console.error("[folders/sync] syncFolders error:", msg);
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth", errorCode: "reauth_required" }, { status: 401 });
    }
    // Map rate-limit and server errors distinctly so the client can react
    if (msg.includes("429") || msg.includes("TooManyRequests")) {
      return NextResponse.json({ error: msg, errorCode: "rate_limited" }, { status: 429 });
    }
    return NextResponse.json({ error: msg, errorCode: "server_error" }, { status: 500 });
  }
}
