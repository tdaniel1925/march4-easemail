import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timingSafeEqual } from "node:crypto";

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

    // Scope the update to the user that owns the subscription when derivable
    let ownerUserId: string | null = null;
    if (notification.subscriptionId) {
      try {
        const sub = await prisma.webhookSubscription.findUnique({
          where: { subscriptionId: notification.subscriptionId },
        });
        if (sub) ownerUserId = sub.userId;
      } catch {
        // Lookup failure — fall back to messageId-only scope (clientState already validated)
      }
    }

    const ownerScope = ownerUserId ? { userId: ownerUserId } : {};

    try {
      if (isRead) {
        await prisma.readReceipt.updateMany({
          where: { messageId, ...ownerScope, readAt: null },
          data: { readAt: new Date() },
        });
      } else {
        await prisma.readReceipt.updateMany({
          where: { messageId, ...ownerScope, deliveredAt: null },
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
