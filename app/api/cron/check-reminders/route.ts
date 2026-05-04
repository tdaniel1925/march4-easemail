import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";

// ─── GET /api/cron/check-reminders ──────────────────────────────────────────
// Called by Vercel Cron every 5 minutes. Checks pending reminders whose
// remindAt has passed and determines if the conversation got a reply.

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

  // Find all pending reminders that are due
  const dueReminders = await prisma.followUpReminder.findMany({
    where: {
      status: "pending",
      remindAt: { lte: now },
    },
    include: { user: true },
  });

  if (dueReminders.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, triggered: 0, replied: 0 });
  }

  let triggered = 0;
  let replied = 0;

  const results = await Promise.allSettled(
    dueReminders.map(async (reminder) => {
      // Try to check if a reply was received by querying the conversation
      let hasReply = false;

      if (reminder.conversationId && reminder.homeAccountId) {
        try {
          // Query messages in the same conversation that arrived after the reminder was created
          const response = await graphGet<{
            value: Array<{ id: string; receivedDateTime: string; from?: { emailAddress?: { address?: string } } }>;
          }>(
            reminder.userId,
            reminder.homeAccountId,
            `/me/messages?$filter=conversationId eq '${encodeURIComponent(reminder.conversationId)}' and receivedDateTime gt ${reminder.createdAt.toISOString()}&$select=id,receivedDateTime,from&$top=5`
          );

          // Check if any reply came from the expected recipient
          if (response.value && response.value.length > 0) {
            const recipientLower = reminder.recipient.toLowerCase();
            hasReply = response.value.some(
              (msg) => msg.from?.emailAddress?.address?.toLowerCase() === recipientLower
            );
          }
        } catch (error) {
          // If Graph API fails, still trigger the reminder so user is notified
          console.error(`[cron/check-reminders] Graph check failed for reminder ${reminder.id}:`, error);
        }
      }

      if (hasReply) {
        await prisma.followUpReminder.updateMany({
          where: { id: reminder.id, userId: reminder.userId },
          data: { status: "replied" },
        });
        replied++;
      } else {
        await prisma.followUpReminder.updateMany({
          where: { id: reminder.id, userId: reminder.userId },
          data: { status: "triggered" },
        });
        triggered++;
      }
    })
  );

  const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  failures.forEach((f, i) => console.error(`[cron/check-reminders] failure #${i + 1}:`, f.reason));

  return NextResponse.json({
    ok: true,
    checked: dueReminders.length,
    triggered,
    replied,
    failed: failures.length,
    timestamp: now.toISOString(),
  });
}
