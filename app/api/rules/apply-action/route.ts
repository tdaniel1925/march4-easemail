import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getProvider, verifyAccountOwnership } from "@/lib/providers/registry";
import { applyRuleActionSchema } from "@/lib/validation/schemas";

// ─── POST /api/rules/apply-action ────────────────────────────────────────────
// Executes a single rule action THROUGH THE PROVIDER (Microsoft / IMAP / JMAP),
// so it works on every account type and updates the local cache. Called by the
// client for each SideEffect. Errors are logged and reported in the response,
// but never thrown — a failing rule must not break the inbox.

async function resolveFolderId(
  userId: string,
  accountId: string,
  value: string | undefined,
  fallbackWellKnown: string | null
): Promise<string | null> {
  if (value?.trim()) {
    const byId = await prisma.cachedFolder.findFirst({
      where: { userId, homeAccountId: accountId, id: value.trim() },
      select: { id: true },
    });
    if (byId) return byId.id;
    const byName = await prisma.cachedFolder.findFirst({
      where: { userId, homeAccountId: accountId, displayName: { equals: value.trim(), mode: "insensitive" } },
      select: { id: true },
    });
    if (byName) return byName.id;
    try {
      const provider = getProvider(accountId);
      const created = await provider.createFolder(userId, accountId, value.trim(), null);
      await prisma.cachedFolder.upsert({
        where: {
          userId_homeAccountId_id: { userId, homeAccountId: accountId, id: created.id },
        },
        update: { userId, homeAccountId: accountId, displayName: created.displayName, parentFolderId: created.parentFolderId },
        create: {
          id: created.id, userId, homeAccountId: accountId,
          displayName: created.displayName, parentFolderId: created.parentFolderId,
          unreadCount: 0, totalCount: 0, wellKnownName: null,
        },
      });
      return created.id;
    } catch {
      return null;
    }
  }
  if (fallbackWellKnown) {
    const wk = await prisma.cachedFolder.findFirst({
      where: { userId, homeAccountId: accountId, wellKnownName: fallbackWellKnown },
      select: { id: true },
    });
    return wk?.id ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = applyRuleActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { emailId, homeAccountId, action, value, ruleId } = parsed.data;

  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const provider = getProvider(homeAccountId);
  let executionError: string | null = null;

  try {
    switch (action) {
      case "markRead":
        await provider.markRead(user.id, homeAccountId, emailId, true);
        break;
      case "markImportant":
        await provider.flagMessage(user.id, homeAccountId, emailId, true);
        break;
      case "delete":
        await provider.deleteMessage(user.id, homeAccountId, emailId);
        break;
      case "forward":
        if (value?.trim()) await provider.forwardMessage(user.id, homeAccountId, emailId, value.trim());
        break;
      case "label":
        if (value?.trim()) await provider.addCategories(user.id, homeAccountId, emailId, [value.trim()]);
        break;
      case "archive": {
        const dest = await resolveFolderId(user.id, homeAccountId, undefined, "archive");
        if (dest) await provider.moveMessage(user.id, homeAccountId, emailId, dest);
        break;
      }
      case "skipInbox":
      case "moveToFolder": {
        const fallback = action === "skipInbox" ? "archive" : null;
        const dest = await resolveFolderId(user.id, homeAccountId, value, fallback);
        if (dest) await provider.moveMessage(user.id, homeAccountId, emailId, dest);
        else executionError = "Target folder not found";
        break;
      }
      default:
        break;
    }
  } catch (err) {
    executionError = err instanceof Error ? err.message : String(err);
    console.error(`[rules/apply-action] ${action} on ${emailId} failed:`, err);
  }

  if (ruleId) {
    try {
      await prisma.emailRule.updateMany({
        where: { id: ruleId, userId: user.id },
        data: {
          lastExecutedAt: new Date(),
          lastExecutionStatus: executionError ? "failure" : "success",
          lastExecutionError: executionError,
          ...(executionError ? { failureCount: { increment: 1 } } : {}),
        },
      });
    } catch (dbErr) {
      console.error(`[rules/apply-action] Failed to update rule tracking:`, dbErr);
    }
  }

  return NextResponse.json({ ok: true, error: executionError });
}
