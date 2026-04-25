import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType } from "@/lib/providers/registry";

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

interface GraphMessagesResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
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
        receivedDateTime: message.receivedDateTime ?? message.sentDateTime ?? new Date().toISOString(),
        homeAccountId,
        direction,
      });
    }
  }
  return items;
}

// ─── GET /api/attachments/list?homeAccountId=xxx ─────────────────────────────
// Fetches emails with attachments from both received and sent folders

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
    // Non-Microsoft providers don't support this endpoint yet
    return NextResponse.json({ items: [], receivedNextLink: null, sentNextLink: null });
  }

  try {
    const [receivedData, sentData] = await Promise.all([
      graphGet<GraphMessagesResponse>(
        user.id,
        homeAccountId,
        `/me/messages?$filter=hasAttachments eq true&$top=50&$expand=attachments&$select=id,subject,receivedDateTime,from,toRecipients&$orderby=receivedDateTime desc`
      ),
      graphGet<GraphMessagesResponse>(
        user.id,
        homeAccountId,
        `/me/mailFolders/sentItems/messages?$filter=hasAttachments eq true&$top=50&$expand=attachments&$select=id,subject,receivedDateTime,sentDateTime,from,toRecipients&$orderby=sentDateTime desc`
      ),
    ]);

    const receivedItems = extractAttachments(receivedData.value ?? [], "received", homeAccountId);
    const sentItems = extractAttachments(sentData.value ?? [], "sent", homeAccountId);

    return NextResponse.json({
      items: [...receivedItems, ...sentItems],
      receivedNextLink: receivedData["@odata.nextLink"] ?? null,
      sentNextLink: sentData["@odata.nextLink"] ?? null,
    });
  } catch (err) {
    console.error("[attachments/list]", err);
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}
