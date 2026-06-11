import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider, detectProviderType } from "@/lib/providers/registry";
import { graphGet } from "@/lib/microsoft/graph";
import { proxyExternalImages } from "@/lib/utils/proxy-images";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

import { z } from "zod";

const messageRequestSchema = z.object({
  id: z.string().min(1).max(512),
  homeAccountId: z.string().min(1).max(512).nullable().optional(),
});

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

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// NOTE: Server-side HTML sanitization intentionally omitted.
// DOMPurify on the client (parser-based) handles sanitization securely.
// Regex-based server sanitization is fundamentally bypassable and creates
// a false sense of security. The server only rewrites image URLs via
// proxyExternalImages().

// ─── GET /api/mail/message/[id] ───────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = messageRequestSchema.safeParse({
    id: (await params).id,
    homeAccountId: req.nextUrl.searchParams.get("homeAccountId"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { id } = parsed.data;

  let accountId = parsed.data.homeAccountId ?? null;
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

      // Rewrite cid: references for inline images.
      // - JMAP: parts expose the RFC 8621 `cid` property; HTML references
      //   cid:<Content-ID>. The attachment download route serves by blobId
      //   (att.id), so cid refs are rewritten to that URL. We also keep the
      //   legacy cid:<blobId> rewrite for safety.
      // - IMAP: the download route cannot fetch IMAP parts by our synthetic
      //   ids, so inline image bytes are returned by the provider
      //   (contentBase64) and embedded as data: URIs (CSP allows img data:).
      if (email.bodyHtml && email.attachments) {
        for (const att of email.attachments) {
          if (!att.contentType.startsWith("image/")) continue;

          const replacementUrl = att.contentBase64
            ? `data:${att.contentType};base64,${att.contentBase64}`
            : `/api/mail/attachments/${encodeURIComponent(id)}/${encodeURIComponent(att.id)}?homeAccountId=${encodeURIComponent(accountId)}&mode=inline`;

          // Rewrite by Content-ID (what email HTML actually references)
          if (att.cid) {
            const cidPattern = new RegExp(`cid:${escapeRegex(att.cid)}`, "gi");
            bodyContent = bodyContent.replace(cidPattern, replacementUrl);
          }
          // Legacy rewrite by attachment/blob id
          const idPattern = new RegExp(`cid:${escapeRegex(att.id)}`, "gi");
          bodyContent = bodyContent.replace(idPattern, replacementUrl);
        }
      }

      // Filter inline images out of attachment list
      const visibleAttachments = (email.attachments ?? []).filter((a) => {
        if (!a.contentType.startsWith("image/")) return true;
        // Explicitly inline parts (disposition inline / related) — hide
        if (a.isInline) return false;
        // If the image is referenced in the body via its Content-ID or id,
        // it's inline — hide from attachment bar
        if (a.cid && email.bodyHtml?.includes(`cid:${a.cid}`)) return false;
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
          content: proxyExternalImages(bodyContent),
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
  // Try generic /me/messages/{id} first (works for inbox and most folders).
  // If it 404s (can happen for sent/other folder-scoped IDs), fall back to
  // searching well-known folders explicitly.
  // Note: the message fetch expands attachments with an inner $select of base
  // attachment fields only. With an inner $select, Graph returns ONLY those
  // fields — so contentId/isInline are fetched in a second, dedicated request
  // below (only when the message actually has attachments / cid refs).
  const msgPath = `?$select=id,subject,from,toRecipients,ccRecipients,body,receivedDateTime&$expand=attachments($select=id,name,size,contentType)`;
  let msg: GraphMessage | null = null;
  // Folder-scoped base path that successfully returned the message — reused
  // for the attachment metadata fetch so sent/fallback-folder messages work.
  let msgBasePath = `/me/messages/${id}`;
  try {
    msg = await graphGet<GraphMessage>(user.id, accountId, `${msgBasePath}${msgPath}`);
  } catch (primaryErr) {
    // Fall back: search sent items and drafts folders for the message
    const FALLBACK_FOLDERS = ["sentItems", "drafts", "deleteditems", "archive"];
    for (const folder of FALLBACK_FOLDERS) {
      try {
        const candidatePath = `/me/mailFolders/${folder}/messages/${id}`;
        msg = await graphGet<GraphMessage>(user.id, accountId, `${candidatePath}${msgPath}`);
        msgBasePath = candidatePath;
        break;
      } catch {
        // try next folder
      }
    }
    if (!msg) {
      // Auto-clean stale cached entry so it doesn't keep appearing in trash/folder lists
      await prisma.cachedEmail.deleteMany({ where: { id, userId: user.id } }).catch(() => {});
      const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      return NextResponse.json({ error: `Could not find message: ${errMsg}` }, { status: 404 });
    }
  }
  if (!msg) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Rewrite cid: references to our attachment API so inline images render
  let bodyContent = msg.body?.content ?? "";
  let allAttachments = msg.attachments ?? [];

  // The expanded attachments above lack contentId/isInline (inner $select
  // strips them). Fetch full attachment metadata in a second request — but
  // only when the message actually has attachments (or the body references
  // cid: parts), so plain emails pay no extra latency.
  if (allAttachments.length > 0 || /\bcid:/i.test(bodyContent)) {
    type GraphAttachmentMeta = {
      id: string;
      name: string;
      size: number;
      contentType: string;
      contentId?: string;
      isInline?: boolean;
      contentBytes?: string;
    };
    try {
      let attList: { value?: GraphAttachmentMeta[] };
      try {
        attList = await graphGet<{ value?: GraphAttachmentMeta[] }>(
          user.id,
          accountId,
          `${msgBasePath}/attachments?$select=id,name,size,contentType,isInline,contentId`
        );
      } catch {
        // contentId is a fileAttachment-subtype property; some tenants reject
        // it in $select with a 400. Retry without any $select — that returns
        // all properties (including contentBytes, which we strip immediately).
        attList = await graphGet<{ value?: GraphAttachmentMeta[] }>(
          user.id,
          accountId,
          `${msgBasePath}/attachments`
        );
      }
      // Keep only the metadata we need — never hold contentBytes in memory
      allAttachments = (attList.value ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        size: a.size,
        contentType: a.contentType,
        contentId: a.contentId,
        isInline: a.isInline,
      }));
    } catch (metaErr) {
      // Metadata fetch failed entirely — fall back to the expanded list
      // (attachment bar still works; inline images may not render)
      console.error("[message] Attachment metadata fetch failed:", metaErr);
    }
  }

  for (const att of allAttachments) {
    if (att.contentId && att.isInline) {
      // Strip angle brackets from contentId (Graph returns "<id>" but HTML uses "cid:id")
      const cleanCid = att.contentId.replace(/^<|>$/g, "");
      const cidPattern = new RegExp(`cid:${escapeRegex(cleanCid)}`, 'gi');
      const replacementUrl = `/api/mail/attachments/${encodeURIComponent(msg.id)}/${encodeURIComponent(att.id)}?homeAccountId=${encodeURIComponent(accountId)}&mode=inline`;
      bodyContent = bodyContent.replace(cidPattern, replacementUrl);
      // Also try with the raw contentId in case it doesn't have brackets
      if (cleanCid !== att.contentId) {
        const rawPattern = new RegExp(`cid:${escapeRegex(att.contentId)}`, 'gi');
        bodyContent = bodyContent.replace(rawPattern, replacementUrl);
      }
    }
  }

  // Filter inline attachments out of visible attachment list
  const visibleAttachments = allAttachments.filter((a) => !a.isInline);

  return NextResponse.json({
    ...msg,
    body: { ...msg.body, content: proxyExternalImages(bodyContent) },
    attachments: visibleAttachments.map((a) => ({
      id: a.id, name: a.name, size: a.size, contentType: a.contentType,
    })),
  });
}
