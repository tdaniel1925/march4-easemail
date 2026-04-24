import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider, detectProviderType } from "@/lib/providers/registry";
import { graphGet } from "@/lib/microsoft/graph";

type Params = { params: Promise<{ id: string }> };

interface GraphMessage {
  id: string;
  subject?: string;
  from?: { emailAddress?: { name?: string; address?: string } };
  toRecipients?: { emailAddress?: { name?: string; address?: string } }[];
  ccRecipients?: { emailAddress?: { name?: string; address?: string } }[];
  body?: { contentType?: string; content?: string };
  receivedDateTime?: string;
}

// ─── GET /api/mail/message/[id] ───────────────────────────────────────────────
// Fetches a single message for reply/forward pre-fill.

export async function GET(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Accept homeAccountId from query params; fall back to default account
  let accountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!accountId) {
    const { getAllAccounts } = await import("@/lib/providers/registry");
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  const providerType = detectProviderType(accountId);

  // ── Non-Microsoft providers: use provider abstraction ──────────────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(accountId);
      const email = await provider.fetchMessage(user.id, accountId, id);

      // Return in the same shape the frontend expects (Graph-style for backward compat)
      return NextResponse.json({
        id: email.id,
        subject: email.subject,
        from: {
          emailAddress: {
            name: email.from.name,
            address: email.from.address,
          },
        },
        toRecipients: email.toRecipients.map((r) => ({
          emailAddress: { name: r.name, address: r.address },
        })),
        ccRecipients: (email.ccRecipients ?? []).map((r) => ({
          emailAddress: { name: r.name, address: r.address },
        })),
        body: {
          contentType: email.bodyHtml ? "html" : "text",
          content: email.bodyHtml ?? email.bodyText ?? email.bodyPreview,
        },
        receivedDateTime: email.receivedDateTime,
      });
    } catch (err) {
      console.error("[message] Error (provider):", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to fetch message" },
        { status: 500 }
      );
    }
  }

  // ── Microsoft path: direct Graph call (existing behavior) ──────────────────
  const msg = await graphGet<GraphMessage>(
    user.id,
    accountId,
    `/me/messages/${id}?$select=id,subject,from,toRecipients,ccRecipients,body,receivedDateTime`
  );

  return NextResponse.json(msg);
}
