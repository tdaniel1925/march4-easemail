import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { graphFetch } from "@/lib/microsoft/graph";
import { verifyAccountOwnership } from "@/lib/providers/registry";

const paginateQuerySchema = z.object({
  nextLink: z.string().min(1).max(4096),
  homeAccountId: z.string().min(1).max(512),
  // Tolerant default mirrors handler: anything other than "sent" is treated as "received"
  direction: z.string().max(20).optional(),
});

interface GraphMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
  sentDateTime?: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients?: { emailAddress: { name: string; address: string } }[];
  attachments?: {
    id: string;
    name: string;
    size: number;
    contentType: string;
    isInline?: boolean;
  }[];
}

const SIGNATURE_PATTERNS = /^(image\d+|logo|signature|banner|spacer|pixel|icon|footer|header|cid)/i;
const MIN_ATTACHMENT_SIZE = 5 * 1024;

function isRealAttachment(att: { name: string; size: number; contentType: string; isInline?: boolean }): boolean {
  if (att.isInline) return false;
  if (att.contentType.startsWith("image/") && att.size < MIN_ATTACHMENT_SIZE) return false;
  const baseName = att.name.replace(/\.[^.]+$/, "");
  if (SIGNATURE_PATTERNS.test(baseName)) return false;
  return true;
}

interface GraphMessagesResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = paginateQuerySchema.safeParse({
    nextLink: req.nextUrl.searchParams.get("nextLink") ?? undefined,
    homeAccountId: req.nextUrl.searchParams.get("homeAccountId") ?? undefined,
    direction: req.nextUrl.searchParams.get("direction") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { nextLink, homeAccountId } = parsed.data;
  const direction = parsed.data.direction ?? "received";

  // nextLink must be a Graph URL or a relative Graph path — nothing else
  if (!nextLink.startsWith("https://graph.microsoft.com/") && !nextLink.startsWith("/")) {
    return NextResponse.json({ error: "Invalid nextLink" }, { status: 400 });
  }

  // Verify the homeAccountId belongs to this authenticated user (prevents IDOR)
  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    // Extract relative path from full Graph URL
    const path = nextLink.startsWith(GRAPH_BASE)
      ? nextLink.slice(GRAPH_BASE.length)
      : nextLink;

    const res = await graphFetch(user.id, homeAccountId, path);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Graph API error ${res.status}: ${err}`);
    }

    const data: GraphMessagesResponse = await res.json();

    const items = [];
    for (const message of data.value ?? []) {
      for (const att of message.attachments ?? []) {
        if (!isRealAttachment(att)) continue; // Skip inline/signature attachments
        const isSent = direction === "sent";
        const firstRecipient = message.toRecipients?.[0];
        items.push({
          id: att.id,
          name: att.name,
          size: att.size,
          contentType: att.contentType,
          messageId: message.id,
          messageSubject: message.subject ?? "(no subject)",
          senderName: isSent
            ? (firstRecipient?.emailAddress?.name ?? "Unknown")
            : (message.from?.emailAddress?.name ?? "Unknown"),
          senderAddress: isSent
            ? (firstRecipient?.emailAddress?.address ?? "")
            : (message.from?.emailAddress?.address ?? ""),
          receivedDateTime: message.receivedDateTime ?? message.sentDateTime ?? new Date().toISOString(),
          homeAccountId,
          direction,
        });
      }
    }

    return NextResponse.json({
      items,
      nextLink: data["@odata.nextLink"] || null,
    });
  } catch (err) {
    console.error("[attachments/paginate]", err);
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}
