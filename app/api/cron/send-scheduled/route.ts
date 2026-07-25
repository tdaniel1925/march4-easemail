import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType, getProvider } from "@/lib/providers/registry";
import type { SendEmailParams } from "@/lib/providers/types";
import { assertAttachmentTotalWithinLimit } from "@/lib/email/attachment-limits";

const CLAIM_LEASE_MS = 5 * 60 * 1000;

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
  const claimExpiredBefore = new Date(now.getTime() - CLAIM_LEASE_MS);

  const dueDrafts = await prisma.draft.findMany({
    where: {
      scheduledAt: { lte: now },
      scheduledSent: false,
      OR: [
        { lastScheduleAttemptAt: null },
        { lastScheduleAttemptAt: { lt: claimExpiredBefore } },
      ],
    },
    include: { user: true },
  });

  /**
   * Read the draft's serialized attachments (JSON array of {name,type,size,data})
   * after enforcing the same aggregate size limit as immediate sends.
   */
  function collectDraftAttachments(
    raw: unknown,
    draftId: string,
  ): { name: string; contentType: string; data: string }[] {
    const list = Array.isArray(raw)
      ? (raw as { name?: string; type?: string; data?: string }[])
      : [];
    try {
      assertAttachmentTotalWithinLimit(list);
    } catch {
      throw new Error(`Draft ${draftId} exceeds the 25MB attachment limit`);
    }
    return list.flatMap((att) =>
      att?.data
        ? [{
        name: att.name ?? "attachment",
        contentType: att.type || "application/octet-stream",
        data: att.data,
          }]
        : [],
    );
  }

  const results = await Promise.allSettled(
    dueDrafts.map(async (draft) => {
      // Atomically claim this draft. Only one overlapping cron invocation can
      // update a row that is unclaimed or whose previous lease has expired.
      const claim = await prisma.draft.updateMany({
        where: {
          id: draft.id,
          scheduledSent: false,
          scheduledAt: { lte: now },
          OR: [
            { lastScheduleAttemptAt: null },
            { lastScheduleAttemptAt: { lt: claimExpiredBefore } },
          ],
        },
        data: {
          lastScheduleAttemptAt: now,
          scheduleAttemptCount: { increment: 1 },
          scheduleLastError: null,
        },
      });
      if (claim.count === 0) return false;

      try {
      const accountId = draft.homeAccountId;
      const draftAttachments = collectDraftAttachments(draft.attachments, draft.id);

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
          ...(draftAttachments.length ? { attachments: draftAttachments } : {}),
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

        const graphAttachments = draftAttachments.map((att) => ({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: att.name,
          contentType: att.contentType,
          contentBytes: att.data,
        }));

        const payload = {
          message: {
            subject: draft.subject ?? "(No subject)",
            body: { contentType: "HTML", content: draft.bodyHtml ?? "" },
            toRecipients: to,
            ...(cc?.length ? { ccRecipients: cc } : {}),
            ...(bcc?.length ? { bccRecipients: bcc } : {}),
            ...(graphAttachments.length ? { attachments: graphAttachments } : {}),
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
        data: { scheduledSent: true, scheduleLastError: null },
      });
      return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await prisma.draft.updateMany({
          where: { id: draft.id, scheduledSent: false },
          data: { scheduleLastError: message.slice(0, 10_000) },
        }).catch(() => {});
        throw error;
      }
    })
  );

  const sent = results.filter(
    (r): r is PromiseFulfilledResult<boolean> =>
      r.status === "fulfilled" && r.value
  ).length;
  const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  failures.forEach((f, i) => console.error(`[cron] draft send failure #${i + 1}:`, f.reason));

  // ── Also process PendingEmail records (Undo Send feature) ───────────────────
  const duePending = await prisma.pendingEmail.findMany({
    where: {
      sendAt: { lte: now },
      cancelled: false,
      OR: [
        { deliveryStatus: "pending" },
        {
          deliveryStatus: { in: ["processing", "failed"] },
          claimedAt: { lt: claimExpiredBefore },
        },
      ],
    },
  });

  const pendingResults = await Promise.allSettled(
    duePending.map(async (pending) => {
      const claim = await prisma.pendingEmail.updateMany({
        where: {
          id: pending.id,
          cancelled: false,
          sendAt: { lte: now },
          OR: [
            { deliveryStatus: "pending" },
            {
              deliveryStatus: { in: ["processing", "failed"] },
              claimedAt: { lt: claimExpiredBefore },
            },
          ],
        },
        data: {
          deliveryStatus: "processing",
          claimedAt: now,
          attemptCount: { increment: 1 },
          lastError: null,
        },
      });
      if (claim.count === 0) return false;

      try {
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
      const accountId: string | null = payload.fromHomeAccountId ?? null;
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

      // Retain the delivery record as an idempotency/audit marker.
      await prisma.pendingEmail.update({
        where: { id: pending.id },
        data: {
          deliveryStatus: "sent",
          deliveredAt: new Date(),
          lastError: null,
        },
      });
      return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await prisma.pendingEmail.updateMany({
          where: { id: pending.id, deliveryStatus: "processing" },
          data: {
            deliveryStatus: "failed",
            lastError: message.slice(0, 10_000),
          },
        }).catch(() => {});
        throw error;
      }
    })
  );

  const pendingSent = pendingResults.filter(
    (r): r is PromiseFulfilledResult<boolean> =>
      r.status === "fulfilled" && r.value
  ).length;
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
