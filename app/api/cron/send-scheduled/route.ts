import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType, getProvider } from "@/lib/providers/registry";
import type { SendEmailParams } from "@/lib/providers/types";

// ─── GET /api/cron/send-scheduled ────────────────────────────────────────────
// Called by Vercel Cron every minute. Sends any drafts whose scheduledAt has passed.

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const dueDrafts = await prisma.draft.findMany({
    where: {
      scheduledAt: { lte: now },
      scheduledSent: false,
    },
    include: { user: true },
  });

  const results = await Promise.allSettled(
    dueDrafts.map(async (draft) => {
      const accountId = draft.homeAccountId;

      // Determine provider type and resolve account
      const providerType = accountId ? detectProviderType(accountId) : "microsoft";

      if (providerType !== "microsoft" && accountId) {
        // ── IMAP / JMAP provider path ───────────────────────────────────────
        const account = await verifyAccountOwnership(draft.userId, accountId);
        if (!account) throw new Error(`No account for draft ${draft.id}`);

        const to = draft.toRecipients as unknown as { emailAddress: { address: string } }[];
        const cc = draft.ccRecipients as unknown as { emailAddress: { address: string } }[];
        const bcc = draft.bccRecipients as unknown as { emailAddress: { address: string } }[];

        const provider = getProvider(accountId);
        const params: SendEmailParams = {
          to: (to ?? []).map((r) => ({ address: r.emailAddress.address })),
          cc: cc?.length ? cc.map((r) => ({ address: r.emailAddress.address })) : undefined,
          bcc: bcc?.length ? bcc.map((r) => ({ address: r.emailAddress.address })) : undefined,
          subject: draft.subject ?? "(No subject)",
          bodyHtml: draft.bodyHtml ?? "",
          importance: (draft.importance as "normal" | "high" | "low") ?? "normal",
        };

        await provider.sendEmail(draft.userId, accountId, params);
      } else {
        // ── Microsoft Graph path ────────────────────────────────────────────
        const msAccount = accountId
          ? await prisma.msConnectedAccount.findFirst({
              where: { userId: draft.userId, homeAccountId: accountId },
            })
          : await prisma.msConnectedAccount.findFirst({
              where: { userId: draft.userId, isDefault: true },
            });

        if (!msAccount) throw new Error(`No account for draft ${draft.id}`);

        const to = draft.toRecipients as unknown as { emailAddress: { address: string } }[];
        const cc = draft.ccRecipients as unknown as { emailAddress: { address: string } }[];
        const bcc = draft.bccRecipients as unknown as { emailAddress: { address: string } }[];

        const payload = {
          message: {
            subject: draft.subject ?? "(No subject)",
            body: { contentType: "HTML", content: draft.bodyHtml ?? "" },
            toRecipients: to,
            ...(cc?.length ? { ccRecipients: cc } : {}),
            ...(bcc?.length ? { bccRecipients: bcc } : {}),
            ...(draft.importance === "high" ? { importance: "high" } : {}),
            ...(draft.requestReadReceipt ? { isReadReceiptRequested: true } : {}),
          },
          saveToSentItems: true,
        };

        const res = await graphFetch(draft.userId, msAccount.homeAccountId, "/me/sendMail", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Graph send failed for draft ${draft.id}: ${err}`);
        }

        // Clean up Graph draft if exists
        if (draft.graphDraftId) {
          try {
            await graphFetch(draft.userId, msAccount.homeAccountId, `/me/messages/${draft.graphDraftId}`, {
              method: "DELETE",
            });
          } catch {}
        }
      }

      // Mark as sent
      await prisma.draft.update({
        where: { id: draft.id },
        data: { scheduledSent: true },
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  failures.forEach((f, i) => console.error(`[cron] draft send failure #${i + 1}:`, f.reason));

  // ── Also process PendingEmail records (Undo Send feature) ───────────────────
  const duePending = await prisma.pendingEmail.findMany({
    where: {
      sendAt: { lte: now },
      cancelled: false,
    },
  });

  const pendingResults = await Promise.allSettled(
    duePending.map(async (pending) => {
      const payload = pending.payload as {
        to: { emailAddress: { address: string } }[];
        cc?: { emailAddress: { address: string } }[];
        bcc?: { emailAddress: { address: string } }[];
        subject: string;
        body: { contentType: string; content: string };
        attachments?: { name: string; contentType: string; data: string }[];
        fromHomeAccountId?: string;
        draftId?: string;
        importance?: "normal" | "high";
        isReadReceiptRequested?: boolean;
      };

      // Determine account
      let accountId: string | null = payload.fromHomeAccountId ?? null;
      const providerType = accountId ? detectProviderType(accountId) : "microsoft";

      if (providerType !== "microsoft" && accountId) {
        // ── IMAP / JMAP provider path ───────────────────────────────────────
        const account = await verifyAccountOwnership(pending.userId, accountId);
        if (!account) throw new Error(`No account for pending ${pending.id}`);

        const provider = getProvider(accountId);
        const params: SendEmailParams = {
          to: (payload.to ?? []).map((r) => ({ address: r.emailAddress.address })),
          cc: payload.cc?.length ? payload.cc.map((r) => ({ address: r.emailAddress.address })) : undefined,
          bcc: payload.bcc?.length ? payload.bcc.map((r) => ({ address: r.emailAddress.address })) : undefined,
          subject: payload.subject ?? "(No subject)",
          bodyHtml: payload.body?.content ?? "",
          attachments: payload.attachments?.map((att) => ({
            name: att.name,
            contentType: att.contentType || "application/octet-stream",
            data: att.data,
          })),
          importance: payload.importance ?? "normal",
        };

        await provider.sendEmail(pending.userId, accountId, params);
      } else {
        // ── Microsoft Graph path ────────────────────────────────────────────
        const msAccount = accountId
          ? await prisma.msConnectedAccount.findFirst({
              where: { userId: pending.userId, homeAccountId: accountId },
            })
          : await prisma.msConnectedAccount.findFirst({
              where: { userId: pending.userId, isDefault: true },
            });

        if (!msAccount) throw new Error(`No account for pending ${pending.id}`);

        const graphAttachments = (payload.attachments ?? []).map((att) => ({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: att.name,
          contentType: att.contentType || "application/octet-stream",
          contentBytes: att.data,
        }));

        const graphPayload = {
          message: {
            subject: payload.subject ?? "(No subject)",
            body: payload.body ?? { contentType: "HTML", content: "" },
            toRecipients: payload.to,
            ...(payload.cc?.length ? { ccRecipients: payload.cc } : {}),
            ...(payload.bcc?.length ? { bccRecipients: payload.bcc } : {}),
            ...(graphAttachments.length ? { attachments: graphAttachments } : {}),
            ...(payload.importance === "high" ? { importance: "high" } : {}),
            ...(payload.isReadReceiptRequested ? { isReadReceiptRequested: true } : {}),
          },
          saveToSentItems: true,
        };

        const res = await graphFetch(pending.userId, msAccount.homeAccountId, "/me/sendMail", {
          method: "POST",
          body: JSON.stringify(graphPayload),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Graph send failed for pending ${pending.id}: ${err}`);
        }
      }

      // Delete local draft if referenced
      if (payload.draftId) {
        const draft = await prisma.draft.findFirst({ where: { id: payload.draftId, userId: pending.userId } });
        if (draft) {
          await prisma.draft.delete({ where: { id: payload.draftId } });
        }
      }

      // Delete the pending record after successful send
      await prisma.pendingEmail.delete({ where: { id: pending.id } });
    })
  );

  const pendingSent = pendingResults.filter((r) => r.status === "fulfilled").length;
  const pendingFailures = pendingResults.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  pendingFailures.forEach((f, i) => console.error(`[cron] pending send failure #${i + 1}:`, f.reason));

  return NextResponse.json({
    ok: true,
    sent,
    failed: failures.length,
    total: dueDrafts.length,
    pendingSent,
    pendingFailed: pendingFailures.length,
    pendingTotal: duePending.length,
    timestamp: now.toISOString(),
  });
}
