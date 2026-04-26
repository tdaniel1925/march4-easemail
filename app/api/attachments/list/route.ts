import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType } from "@/lib/providers/registry";

interface GraphAttachment {
  id: string;
  name: string;
  size: number;
  contentType: string;
  isInline?: boolean;
}

interface GraphMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
  sentDateTime?: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients?: { emailAddress: { name: string; address: string } }[];
  attachments?: GraphAttachment[];
}

interface GraphMessagesResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

/**
 * Conservative filter — only exclude obvious non-attachments:
 * - Tracking pixels (images under 2KB)
 * - Signature images that match common patterns AND are small
 */
const SIGNATURE_PATTERNS = /^(image\d+|logo|signature|banner|spacer|pixel|icon|footer|header|cid)/i;

function isRealAttachment(att: GraphAttachment): boolean {
  // Skip very small images (tracking pixels, spacer gifs)
  if (att.contentType.startsWith("image/") && att.size < 2048) return false;
  // Skip small images matching signature patterns
  if (att.contentType.startsWith("image/") && att.size < 10240) {
    const baseName = att.name.replace(/\.[^.]+$/, "");
    if (SIGNATURE_PATTERNS.test(baseName)) return false;
  }
  // Keep everything else — including inline images that are real attachments
  return true;
}

function extractAttachments(
  messages: GraphMessage[],
  direction: "received" | "sent",
  homeAccountId: string,
) {
  const items = [];
  for (const message of messages) {
    for (const att of message.attachments ?? []) {
      if (!isRealAttachment(att)) continue;
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
        receivedDateTime: (isSent ? message.sentDateTime : message.receivedDateTime) ?? new Date().toISOString(),
        homeAccountId,
        direction,
      });
    }
  }
  return items;
}

// ─── GET /api/attachments/list?homeAccountId=xxx ─────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) {
    return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });
  }

  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const providerType = detectProviderType(homeAccountId);
  if (providerType !== "microsoft") {
    return NextResponse.json({ items: [], receivedNextLink: null, sentNextLink: null });
  }

  try {
    const [receivedData, sentData] = await Promise.all([
      graphGet<GraphMessagesResponse>(
        user.id,
        homeAccountId,
        `/me/messages?$filter=hasAttachments eq true&$top=50&$select=id,subject,receivedDateTime,from,toRecipients,hasAttachments&$expand=attachments($select=id,name,size,contentType,isInline)&$orderby=receivedDateTime desc`
      ),
      graphGet<GraphMessagesResponse>(
        user.id,
        homeAccountId,
        `/me/mailFolders/sentItems/messages?$filter=hasAttachments eq true&$top=50&$select=id,subject,sentDateTime,receivedDateTime,from,toRecipients,hasAttachments&$expand=attachments($select=id,name,size,contentType,isInline)&$orderby=sentDateTime desc`
      ),
    ]);

    const receivedItems = extractAttachments(receivedData.value ?? [], "received", homeAccountId);
    const sentItems = extractAttachments(sentData.value ?? [], "sent", homeAccountId);

    const allItems = [...receivedItems, ...sentItems].sort(
      (a, b) => new Date(b.receivedDateTime).getTime() - new Date(a.receivedDateTime).getTime()
    );

    return NextResponse.json({
      items: allItems,
      receivedNextLink: receivedData["@odata.nextLink"] ?? null,
      sentNextLink: sentData["@odata.nextLink"] ?? null,
    });
  } catch (err) {
    console.error("[attachments/list]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch attachments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
