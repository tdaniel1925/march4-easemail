import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPatch, graphPost, graphDelete } from "@/lib/microsoft/graph";

// ─── POST /api/rules/apply-action ────────────────────────────────────────────
// Executes a single rule action against MS Graph.
// Called by the client for each SideEffect returned by applyRules().
// Errors are logged but never surface to the user — rules failing
// silently is better than breaking the inbox.

interface ApplyActionBody {
  emailId: string;
  homeAccountId: string;
  action: "markRead" | "markImportant" | "archive" | "delete" | "forward";
  value?: string; // forward: recipient address
  ruleId?: string; // optional - if provided, tracks execution status
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as ApplyActionBody;
  const { emailId, homeAccountId, action, value, ruleId } = body;

  if (!emailId || !homeAccountId || !action) {
    return NextResponse.json({ error: "emailId, homeAccountId, action required" }, { status: 400 });
  }

  let executionError: string | null = null;

  try {
    switch (action) {
      case "markRead":
        await graphPatch(user.id, homeAccountId, `/me/messages/${emailId}`, {
          isRead: true,
        });
        break;

      case "markImportant":
        await graphPatch(user.id, homeAccountId, `/me/messages/${emailId}`, {
          flag: { flagStatus: "flagged" },
        });
        break;

      case "archive":
        // Graph move to the well-known "archive" folder
        await graphPost(user.id, homeAccountId, `/me/messages/${emailId}/move`, {
          destinationId: "archive",
        });
        break;

      case "delete":
        await graphDelete(user.id, homeAccountId, `/me/messages/${emailId}`);
        break;

      case "forward":
        if (!value?.trim()) break;
        await graphPost(user.id, homeAccountId, `/me/messages/${emailId}/forward`, {
          toRecipients: [
            { emailAddress: { address: value.trim() } },
          ],
        });
        break;

      default:
        // Unknown action — ignore
        break;
    }
  } catch (err) {
    // Log but return 200 — rules should never break the inbox
    executionError = err instanceof Error ? err.message : String(err);
    console.error(`[rules/apply-action] ${action} on ${emailId} failed:`, err);
  }

  // Track execution status if ruleId provided
  if (ruleId) {
    try {
      await prisma.emailRule.update({
        where: { id: ruleId, userId: user.id },
        data: {
          lastExecutedAt: new Date(),
          lastExecutionStatus: executionError ? "failure" : "success",
          lastExecutionError: executionError,
          ...(executionError ? { failureCount: { increment: 1 } } : {}),
        },
      });
    } catch (dbErr) {
      // Don't fail if tracking update fails
      console.error(`[rules/apply-action] Failed to update rule tracking:`, dbErr);
    }
  }

  return NextResponse.json({ ok: true });
}
