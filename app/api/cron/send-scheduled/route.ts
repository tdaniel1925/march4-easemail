import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType, getProvider } from "@/lib/providers/registry";
import type { SendEmailParams } from "@/lib/providers/types";

// ─── GET /api/cron/send-scheduled ────────────────────────────────────────────
// Called by Vercel Cron every minute. Sends any drafts whose scheduledAt has passed.

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? ""}`) {
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

  return NextResponse.json({
    ok: true,
    sent,
    failed: failures.length,
    total: dueDrafts.length,
    timestamp: now.toISOString(),
  });
}
