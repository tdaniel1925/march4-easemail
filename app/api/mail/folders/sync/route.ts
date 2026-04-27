import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncFolders } from "@/lib/sync/folder-sync";
import { isReauthError } from "@/lib/microsoft/auth-errors";

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

  const { homeAccountId } = await req.json() as { homeAccountId?: string };
  if (!homeAccountId) {
    return NextResponse.json({ error: "homeAccountId required", errorCode: "server_error" }, { status: 400 });
  }

  try {
    const folderRefs = await syncFolders(user.id, homeAccountId);
    return NextResponse.json({ ok: true, count: folderRefs.length });
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
