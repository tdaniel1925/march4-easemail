import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface GraphMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
  from: { emailAddress: { name: string; address: string } };
  attachments?: {
    id: string;
    name: string;
    size: number;
    contentType: string;
  }[];
}

interface GraphMessagesResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const nextLink = req.nextUrl.searchParams.get("nextLink");
  if (!nextLink) return NextResponse.json({ error: "nextLink required" }, { status: 400 });

  try {
    const res = await fetch(nextLink, {
      headers: {
        "Authorization": `Bearer ${process.env.GRAPH_ACCESS_TOKEN}`,
      },
    });

    if (!res.ok) throw new Error(`Graph API error: ${res.status}`);

    const data: GraphMessagesResponse = await res.json();

    const items = [];
    for (const message of data.value ?? []) {
      for (const att of message.attachments ?? []) {
        items.push({
          id: att.id,
          name: att.name,
          size: att.size,
          contentType: att.contentType,
          messageId: message.id,
          messageSubject: message.subject ?? "(no subject)",
          senderName: message.from?.emailAddress?.name ?? "Unknown",
          senderAddress: message.from?.emailAddress?.address ?? "",
          receivedDateTime: message.receivedDateTime,
          homeAccountId: "", // Will be filled by client
        });
      }
    }

    return NextResponse.json({
      items,
      nextLink: data["@odata.nextLink"] || null,
    });
  } catch (err) {
    console.error("Failed to paginate attachments:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
