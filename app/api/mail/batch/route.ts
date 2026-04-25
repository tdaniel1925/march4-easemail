import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider, getAllAccounts } from "@/lib/providers/registry";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

type BatchAction = "delete" | "archive" | "markRead";

interface BatchRequest {
  action: BatchAction;
  messageIds: string[];
  homeAccountId?: string;
}

const VALID_ACTIONS = new Set<BatchAction>(["delete", "archive", "markRead"]);
const MAX_BATCH_SIZE = 50;

async function batchHandler(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as BatchRequest;
  const { action, messageIds, homeAccountId } = body;

  // Validate action
  if (!action || !VALID_ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid action. Must be: delete, archive, or markRead" }, { status: 400 });
  }

  // Validate messageIds
  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return NextResponse.json({ error: "messageIds must be a non-empty array" }, { status: 400 });
  }
  if (messageIds.length > MAX_BATCH_SIZE) {
    return NextResponse.json({ error: `Maximum ${MAX_BATCH_SIZE} messages per batch` }, { status: 400 });
  }

  // Resolve account
  let accountId = homeAccountId;
  if (!accountId) {
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const provider = getProvider(accountId);

  // Pre-fetch folders once for delete/archive (avoids N fetches)
  let targetFolderId: string | undefined;
  if (action === "delete" || action === "archive") {
    const folders = await provider.fetchFolders(user.id, accountId);
    const wellKnown = action === "delete" ? "deleteditems" : "archive";
    const folder = folders.find((f) => f.wellKnownName === wellKnown);
    if (!folder) {
      return NextResponse.json(
        { error: `${action === "delete" ? "Deleted Items" : "Archive"} folder not found` },
        { status: 404 }
      );
    }
    targetFolderId = folder.id;
  }

  // Execute all operations concurrently
  const results = await Promise.allSettled(
    messageIds.map(async (messageId) => {
      switch (action) {
        case "delete":
          await provider.moveMessage(user.id, accountId!, messageId, targetFolderId!);
          break;
        case "archive":
          await provider.moveMessage(user.id, accountId!, messageId, targetFolderId!);
          break;
        case "markRead":
          await provider.markRead(user.id, accountId!, messageId, true);
          break;
      }
      return messageId;
    })
  );

  const succeeded = results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value);
  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r, i) => ({
      messageId: messageIds[results.indexOf(r)],
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    }));

  return NextResponse.json({
    ok: failed.length === 0,
    succeeded,
    failed,
    total: messageIds.length,
  });
}

export const POST = withRateLimit(batchHandler, rateLimiters.general);
