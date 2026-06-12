import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { timingSafeEqual } from "node:crypto";

// Loose validation only — Graph notification payloads evolve over time.
const graphNotificationSchema = z.object({
  value: z.array(z.object({}).passthrough()).max(100).optional(),
}).passthrough();

/**
 * POST /api/mail/receipt-webhook
 * Receives Microsoft Graph change notifications for message read events.
 * Updates ReadReceipt records when emails are delivered or read.
 *
 * Microsoft Graph sends a validation token on subscription creation —
 * we must echo it back as plain text with 200.
 *
 * Security: every notification must carry the clientState secret that was
 * set when the subscription was created (GRAPH_WEBHOOK_SECRET). Requests
 * without a valid clientState are rejected — fail closed if the secret is
 * not configured.
 */

/** Constant-time string comparison to avoid leaking the secret via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  // Subscription validation handshake
  const validationToken = req.nextUrl.searchParams.get("validationToken");
  if (validationToken) {
    return new NextResponse(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Fail closed — without a configured secret we cannot authenticate
  // notifications, so no writes are allowed.
  const webhookSecret = process.env.GRAPH_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[receipt-webhook] GRAPH_WEBHOOK_SECRET not set — rejecting notification");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsedBody = graphNotificationSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request", details: parsedBody.error.flatten() }, { status: 400 });
  }

  interface GraphNotification {
    value?: Array<{
      resourceData?: {
        id?: string;
        isRead?: boolean;
      };
      clientState?: string;
      changeType?: string;
      subscriptionId?: string;
    }>;
  }

  const notifications = (body as GraphNotification).value ?? [];

  let anyValid = false;

  for (const notification of notifications) {
    // Require a valid clientState before any write
    if (!notification.clientState || !safeEqual(notification.clientState, webhookSecret)) {
      continue;
    }
    anyValid = true;

    const messageId = notification.resourceData?.id;
    const isRead = notification.resourceData?.isRead;

    if (!messageId) continue;

    // Resolve the user that owns the subscription. Tenant isolation: we MUST
    // scope the write by userId. If the owner can't be resolved, SKIP the write
    // rather than fall back to an all-tenant messageId-only update — a missed
    // read receipt is harmless; a cross-tenant write is not.
    let ownerUserId: string | null = null;
    if (notification.subscriptionId) {
      try {
        const sub = await prisma.webhookSubscription.findUnique({
          where: { subscriptionId: notification.subscriptionId },
        });
        if (sub) ownerUserId = sub.userId;
      } catch {
        // fall through — ownerUserId stays null and we skip below
      }
    }

    if (!ownerUserId) {
      // Cannot prove tenant ownership → do not write.
      continue;
    }

    try {
      if (isRead) {
        await prisma.readReceipt.updateMany({
          where: { messageId, userId: ownerUserId, readAt: null },
          data: { readAt: new Date() },
        });
      } else {
        await prisma.readReceipt.updateMany({
          where: { messageId, userId: ownerUserId, deliveredAt: null },
          data: { deliveredAt: new Date() },
        });
      }
    } catch {
      // Non-fatal — continue processing other notifications
    }
  }

  // If notifications were sent but none carried a valid clientState, reject
  if (notifications.length > 0 && !anyValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({}, { status: 202 });
}
