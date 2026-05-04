import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";
import { verifyAccountOwnership, detectProviderType, getProvider } from "@/lib/providers/registry";
import type { SendEmailParams } from "@/lib/providers/types";

interface Attachment {
  name: string;
  contentType: string;
  data: string; // base64
}

async function sendEmailHandler(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    to,
    cc,
    bcc,
    subject,
    body,
    attachments,
    fromHomeAccountId,
    draftId,
    importance,
    isReadReceiptRequested,
  } = requestBody as {
    to: { emailAddress: { address: string } }[];
    cc?: { emailAddress: { address: string } }[];
    bcc?: { emailAddress: { address: string } }[];
    subject: string;
    body: { contentType: string; content: string };
    attachments?: Attachment[];
    fromHomeAccountId?: string;
    draftId?: string;
    importance?: "normal" | "high";
    isReadReceiptRequested?: boolean;
  };

  // Input validation
  if (!to?.length) {
    return NextResponse.json({ error: "At least one recipient required" }, { status: 400 });
  }
  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject required" }, { status: 400 });
  }
  if (!body?.content) {
    return NextResponse.json({ error: "Email body required" }, { status: 400 });
  }

  // Validate attachments size
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      const sizeBytes = Math.ceil(att.data.length * 0.75); // base64 to bytes approximation
      if (sizeBytes > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: `Attachment "${att.name}" exceeds 25MB limit` },
          { status: 400 }
        );
      }
    }
  }

  // Verify account ownership — supports MS, IMAP, and JMAP accounts
  let accountId: string | null = fromHomeAccountId ?? null;

  if (accountId) {
    const account = await verifyAccountOwnership(user.id, accountId);
    if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });
  } else {
    // Fall back to default MS account (legacy behavior)
    const msDefault = await prisma.msConnectedAccount.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    if (!msDefault) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = msDefault.homeAccountId;
  }

  const providerType = detectProviderType(accountId);

  // ── IMAP / JMAP provider path ─────────────────────────────────────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(accountId);
      const params: SendEmailParams = {
        to: to.map((r) => ({ address: r.emailAddress.address })),
        cc: cc?.map((r) => ({ address: r.emailAddress.address })),
        bcc: bcc?.map((r) => ({ address: r.emailAddress.address })),
        subject: subject.trim(),
        bodyHtml: body.content,
        attachments: attachments?.map((att) => ({
          name: att.name,
          contentType: att.contentType || "application/octet-stream",
          data: att.data,
        })),
        importance: importance ?? "normal",
      };
      await provider.sendEmail(user.id, accountId, params);

      // Delete local draft after successful send
      if (draftId) {
        const draft = await prisma.draft.findFirst({ where: { id: draftId, userId: user.id } });
        if (draft) {
          await prisma.draft.delete({ where: { id: draftId } });
        }
      }

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[send] provider error:", String(err));
      return NextResponse.json({ error: `Send failed: ${String(err)}` }, { status: 500 });
    }
  }

  // ── Microsoft Graph path ──────────────────────────────────────────────────

  const graphAttachments = (attachments ?? []).map((att) => ({
    "@odata.type": "#microsoft.graph.fileAttachment",
    name: att.name,
    contentType: att.contentType || "application/octet-stream",
    contentBytes: att.data,
  }));

  const payload = {
    message: {
      subject: subject.trim(),
      body,
      toRecipients: to,
      ...(cc?.length ? { ccRecipients: cc } : {}),
      ...(bcc?.length ? { bccRecipients: bcc } : {}),
      ...(graphAttachments.length ? { attachments: graphAttachments } : {}),
      ...(importance === "high" ? { importance: "high" } : {}),
      ...(isReadReceiptRequested ? { isReadReceiptRequested: true } : {}),
    },
    saveToSentItems: true,
  };

  const res = await graphFetch(user.id, accountId, "/me/sendMail", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[send] Graph error:", err);
    return NextResponse.json({ error: `Send failed: ${err}` }, { status: res.status });
  }

  // Delete local draft after successful send
  if (draftId) {
    const draft = await prisma.draft.findFirst({ where: { id: draftId, userId: user.id } });
    if (draft) {
      // Delete Graph draft if it exists
      if (draft.graphDraftId && draft.homeAccountId) {
        try {
          await graphFetch(user.id, draft.homeAccountId, `/me/messages/${draft.graphDraftId}`, {
            method: "DELETE",
          });
        } catch {}
      }
      await prisma.draft.delete({ where: { id: draftId } });
    }
  }

  // ── Cache sent email locally for immediate Sent folder visibility ─────────
  try {
    // Find the Sent folder in cache
    const sentFolder = await prisma.cachedFolder.findFirst({
      where: { userId: user.id, homeAccountId: accountId!, wellKnownName: "sentitems" },
    });

    if (sentFolder) {
      // Fetch the most recent message from Graph's Sent folder to get the real ID
      const sentRes = await graphFetch(
        user.id,
        accountId!,
        "/me/mailFolders/sentitems/messages?$top=1&$orderby=sentDateTime desc&$select=id,subject,bodyPreview,from,toRecipients,sentDateTime,receivedDateTime,isRead,hasAttachments,importance,conversationId,flag,categories",
        { method: "GET" }
      );

      if (sentRes.ok) {
        const sentData = await sentRes.json();
        const msg = sentData?.value?.[0];
        if (msg) {
          // Check if already cached (by Graph message ID used as our primary key)
          const existing = await prisma.cachedEmail.findUnique({ where: { id: msg.id } });
          if (!existing) {
            await prisma.cachedEmail.create({
              data: {
                id: msg.id,
                userId: user.id,
                homeAccountId: accountId!,
                folderId: sentFolder.id,
                subject: msg.subject ?? "",
                bodyPreview: msg.bodyPreview ?? "",
                fromName: msg.from?.emailAddress?.name ?? "",
                fromAddress: msg.from?.emailAddress?.address ?? "",
                toRecipients: JSON.parse(JSON.stringify(
                  (msg.toRecipients ?? []).map((r: { emailAddress: { name?: string; address: string } }) => ({
                    name: r.emailAddress?.name ?? "",
                    address: r.emailAddress?.address ?? "",
                  }))
                )),
                receivedDateTime: msg.receivedDateTime ? new Date(msg.receivedDateTime) : new Date(),
                sentDateTime: msg.sentDateTime ? new Date(msg.sentDateTime) : new Date(),
                isRead: true,
                hasAttachments: msg.hasAttachments ?? false,
                importance: msg.importance ?? "normal",
                conversationId: msg.conversationId ?? null,
                flagStatus: msg.flag?.flagStatus ?? "notFlagged",
                categories: JSON.parse(JSON.stringify(msg.categories ?? [])),
              },
            });
          }
        }
      }
    }
  } catch (cacheErr) {
    // Non-blocking — email was sent successfully, cache is best-effort
    console.warn("[send] Failed to cache sent email:", String(cacheErr));
  }

  return NextResponse.json({ ok: true });
}

// Export with rate limiting (30 emails per hour)
export const POST = withRateLimit(sendEmailHandler, rateLimiters.send);
