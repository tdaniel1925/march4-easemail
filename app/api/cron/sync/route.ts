import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncFolders } from "@/lib/sync/folder-sync";
import { syncEmails } from "@/lib/sync/email-sync";
import { syncCalendar } from "@/lib/sync/calendar-sync";
import { syncContacts } from "@/lib/sync/contact-sync";
import { isReauthError } from "@/lib/microsoft/auth-errors";

// ─── GET /api/cron/sync ───────────────────────────────────────────────────────
// Called by Vercel Cron every minute. Delta-syncs emails, calendar, contacts
// for all connected accounts into the local DB cache.

const CONTACT_SYNC_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? ""}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.msConnectedAccount.findMany({
    select: { userId: true, homeAccountId: true },
  });

  // Group by userId
  const byUser = new Map<string, string[]>();
  for (const acc of accounts) {
    const list = byUser.get(acc.userId) ?? [];
    list.push(acc.homeAccountId);
    byUser.set(acc.userId, list);
  }

  let synced = 0;
  let reauth = 0;
  let errors = 0;

  const userResults = await Promise.allSettled(
    Array.from(byUser.entries()).map(async ([userId, homeAccountIds]) => {
      await Promise.allSettled(
        homeAccountIds.map(async (homeAccountId) => {
          try {
            // 1. Sync folders → get folder list for email sync
            const folderRefs = await syncFolders(userId, homeAccountId);

            // 2. Sync emails in each folder (failures are isolated)
            await Promise.allSettled(
              folderRefs.map((f) => syncEmails(userId, homeAccountId, f.folderId))
            );

            // 3. Sync calendar
            await syncCalendar(userId, homeAccountId);

            // 4. Sync contacts — gated to once per hour
            const lastContact = await prisma.cachedContact.findFirst({
              where: { userId, homeAccountId },
              orderBy: { syncedAt: "desc" },
              select: { syncedAt: true },
            });
            const needsContactSync =
              !lastContact ||
              Date.now() - lastContact.syncedAt.getTime() > CONTACT_SYNC_INTERVAL_MS;

            if (needsContactSync) {
              await syncContacts(userId, homeAccountId).catch((err) => {
                // Swallow 403 — Contacts scope may not be consented
                const msg = String(err);
                if (!msg.includes("403")) throw err;
              });
            }

            synced++;
          } catch (err) {
            if (isReauthError(err)) {
              reauth++;
              console.warn(
                `[sync] reauth required for ${userId}/${homeAccountId}:`,
                String(err)
              );
            } else {
              errors++;
              console.error(
                `[sync] error for ${userId}/${homeAccountId}:`,
                err
              );
            }
          }
        })
      );
    })
  );

  const failedUsers = userResults.filter((r) => r.status === "rejected").length;
  if (failedUsers > 0) errors += failedUsers;

  return NextResponse.json({
    ok: true,
    synced,
    reauth,
    errors,
    total: accounts.length,
    timestamp: new Date().toISOString(),
  });
}
