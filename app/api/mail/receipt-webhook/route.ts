import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/mail/receipt-webhook
 * Receives Microsoft Graph change notifications for message read events.
 * Updates ReadReceipt records when emails are delivered or read.
 *
 * Microsoft Graph sends a validation token on subscription creation —
 * we must echo it back as plain text with 200.
 */
export async function POST(req: NextRequest) {
  // Subscription validation handshake
  const validationToken = req.nextUrl.searchParams.get("validationToken");
  if (validationToken) {
    return new NextResponse(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
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
    }>;
  }

  const notifications = (body as GraphNotification).value ?? [];

  for (const notification of notifications) {
    const messageId = notification.resourceData?.id;
    const isRead = notification.resourceData?.isRead;

    if (!messageId) continue;

    try {
      if (isRead) {
        await prisma.readReceipt.updateMany({
          where: { messageId, readAt: null },
          data: { readAt: new Date() },
        });
      } else {
        await prisma.readReceipt.updateMany({
          where: { messageId, deliveredAt: null },
          data: { deliveredAt: new Date() },
        });
      }
    } catch {
      // Non-fatal — continue processing other notifications
    }
  }

  return NextResponse.json({}, { status: 202 });
}
