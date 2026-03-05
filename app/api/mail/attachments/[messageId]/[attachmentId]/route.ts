import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";

interface GraphAttachment {
  name: string;
  contentType: string;
  contentBytes: string; // base64
  size: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string; attachmentId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, attachmentId } = await params;
  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });

  try {
    const att = await graphGet<GraphAttachment>(
      user.id,
      homeAccountId,
      `/me/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`
    );

    const bytes = Buffer.from(att.contentBytes, "base64");

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": att.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${att.name.replace(/"/g, '\\"')}"`,
        "Content-Length": String(bytes.length),
      },
    });
  } catch (err) {
    console.error("[attachment-download]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
