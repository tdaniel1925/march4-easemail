import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType } from "@/lib/providers/registry";

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

  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const providerType = detectProviderType(homeAccountId);
  const modeParam = req.nextUrl.searchParams.get("mode");

  try {
    let bytes: Buffer;
    let contentType: string;
    let fileName: string;

    if (providerType === "jmap") {
      // JMAP: use downloadUrl from session
      const { decryptCredential } = await import("@/lib/providers/crypto");
      const { prisma } = await import("@/lib/prisma");
      const jmapAccount = await prisma.jmapConnectedAccount.findFirst({
        where: { userId: user.id, accountId: homeAccountId },
      });
      if (!jmapAccount) return NextResponse.json({ error: "JMAP account not found" }, { status: 404 });

      const token = decryptCredential(jmapAccount.encryptedToken, jmapAccount.encryptionIv, jmapAccount.encryptionTag);
      const sessionRes = await fetch(jmapAccount.sessionUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!sessionRes.ok) return NextResponse.json({ error: "JMAP session failed" }, { status: 502 });
      const session = await sessionRes.json() as { downloadUrl: string };

      // JMAP download URL template: https://api.fastmail.com/jmap/download/{accountId}/{blobId}/{name}?type={type}
      const jmapEmailId = messageId.replace(`${homeAccountId}:`, "");
      const blobId = attachmentId; // attachmentId is the blobId for JMAP
      const downloadUrl = session.downloadUrl
        .replace("{accountId}", jmapAccount.jmapAccountId)
        .replace("{blobId}", blobId)
        .replace("{name}", "download")
        .replace("{type}", "application/octet-stream");

      const dlRes = await fetch(downloadUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!dlRes.ok) return NextResponse.json({ error: `Download failed: ${dlRes.status}` }, { status: dlRes.status });

      bytes = Buffer.from(await dlRes.arrayBuffer());
      contentType = dlRes.headers.get("content-type") ?? "application/octet-stream";
      fileName = decodeURIComponent(blobId.split("/").pop() ?? "attachment");
    } else {
      // Microsoft Graph
      const att = await graphGet<GraphAttachment>(
        user.id,
        homeAccountId,
        `/me/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`
      );
      bytes = Buffer.from(att.contentBytes, "base64");
      contentType = att.contentType || "application/octet-stream";
      fileName = att.name;
    }

    // Auto-detect mode: images default to inline for preview
    const isImage = contentType.startsWith("image/");
    const mode = modeParam === "inline" || (isImage && modeParam !== "download") ? "inline" : "attachment";

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${mode}; filename="${fileName.replace(/"/g, '\\"')}"`,
        "Content-Length": String(bytes.length),
        ...(isImage ? { "Cache-Control": "private, max-age=3600" } : {}),
      },
    });
  } catch (err) {
    console.error("[attachment-download]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
