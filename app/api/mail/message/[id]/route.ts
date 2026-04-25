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
  attachments?: {
    id: string;
    name: string;
    size: number;
    contentType: string;
    contentId?: string;
    isInline?: boolean;
  }[];
}

// ─── GET /api/mail/message/[id] ───────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let accountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!accountId) {
    const { getAllAccounts } = await import("@/lib/providers/registry");
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  const providerType = detectProviderType(accountId);

  // ── Non-Microsoft providers ──────────────────────────────────────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(accountId);
      const email = await provider.fetchMessage(user.id, accountId, id);

      let bodyContent = email.bodyHtml ?? email.bodyText ?? email.bodyPreview;

      // Rewrite cid: references for JMAP inline images
      // JMAP inline images use blobId — rewrite cid:blobId to our attachment API
      if (email.bodyHtml && email.attachments) {
        for (const att of email.attachments) {
          if (att.contentType.startsWith("image/")) {
            // Replace cid references with our API URL
            const cidPattern = new RegExp(`cid:${att.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
            bodyContent = bodyContent.replace(cidPattern,
              `/api/mail/attachments/${encodeURIComponent(id)}/${encodeURIComponent(att.id)}?homeAccountId=${encodeURIComponent(accountId)}&mode=inline`
            );
          }
        }
      }

      // Filter inline images out of attachment list
      const visibleAttachments = (email.attachments ?? []).filter((a) => {
        if (!a.contentType.startsWith("image/")) return true;
        // If the image is referenced in the body, it's inline — hide from attachment bar
        if (email.bodyHtml?.includes(a.id)) return false;
        return true;
      });

      return NextResponse.json({
        id: email.id,
        subject: email.subject,
        from: { emailAddress: { name: email.from.name, address: email.from.address } },
        toRecipients: email.toRecipients.map((r) => ({ emailAddress: { name: r.name, address: r.address } })),
        ccRecipients: (email.ccRecipients ?? []).map((r) => ({ emailAddress: { name: r.name, address: r.address } })),
        body: {
          contentType: email.bodyHtml ? "html" : "text",
          content: bodyContent,
        },
        receivedDateTime: email.receivedDateTime,
        attachments: visibleAttachments.map((a) => ({
          id: a.id, name: a.name, size: a.size, contentType: a.contentType,
        })),
      });
    } catch (err) {
      console.error("[message] Error (provider):", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to fetch message" },
        { status: 500 }
      );
    }
  }

  // ── Microsoft Graph ──────────────────────────────────────────────────────
  const msg = await graphGet<GraphMessage>(
    user.id,
    accountId,
    `/me/messages/${id}?$select=id,subject,from,toRecipients,ccRecipients,body,receivedDateTime&$expand=attachments($select=id,name,size,contentType,contentId,isInline)`
  );

  // Rewrite cid: references to our attachment API so inline images render
  let bodyContent = msg.body?.content ?? "";
  const allAttachments = msg.attachments ?? [];

  for (const att of allAttachments) {
    if (att.contentId && att.isInline) {
      const cidPattern = new RegExp(`cid:${att.contentId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
      bodyContent = bodyContent.replace(cidPattern,
        `/api/mail/attachments/${encodeURIComponent(msg.id)}/${encodeURIComponent(att.id)}?homeAccountId=${encodeURIComponent(accountId)}&mode=inline`
      );
    }
  }

  // Filter inline attachments out of visible attachment list
  const visibleAttachments = allAttachments.filter((a) => !a.isInline);

  return NextResponse.json({
    ...msg,
    body: { ...msg.body, content: bodyContent },
    attachments: visibleAttachments.map((a) => ({
      id: a.id, name: a.name, size: a.size, contentType: a.contentType,
    })),
  });
}
