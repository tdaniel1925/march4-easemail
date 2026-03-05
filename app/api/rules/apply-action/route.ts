import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as ApplyActionBody;
  const { emailId, homeAccountId, action, value } = body;

  if (!emailId || !homeAccountId || !action) {
    return NextResponse.json({ error: "emailId, homeAccountId, action required" }, { status: 400 });
  }

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
    console.error(`[rules/apply-action] ${action} on ${emailId} failed:`, err);
  }

  return NextResponse.json({ ok: true });
}
