import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { graphGet } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType } from "@/lib/providers/registry";

const attachmentRequestSchema = z.object({
  messageId: z.string().min(1).max(512),
  attachmentId: z.string().min(1).max(512),
  homeAccountId: z.string().min(1).max(512),
});

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

  const rawParams = await params;
  const parsed = attachmentRequestSchema.safeParse({
    messageId: rawParams.messageId,
    attachmentId: rawParams.attachmentId,
    homeAccountId: req.nextUrl.searchParams.get("homeAccountId") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId, attachmentId, homeAccountId } = parsed.data;

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
      const session = await sessionRes.json() as { apiUrl: string; downloadUrl: string };

      const jmapEmailId = messageId.replace(`${homeAccountId}:`, "");
      const blobId = attachmentId; // attachmentId is the blobId for JMAP

      // Fastmail's blob endpoint echoes back whatever `type=` it's given, so
      // look up the part's real MIME type + filename from the message
      // metadata (best-effort — fall back to the response headers).
      const { getAttachmentMetadataByBlobId } = await import("@/lib/providers/jmap");
      let meta: { name: string; type: string } | null = null;
      try {
        meta = await getAttachmentMetadataByBlobId(
          session.apiUrl, token, jmapAccount.jmapAccountId, jmapEmailId, blobId
        );
      } catch {
        meta = null;
      }

      // JMAP download URL template: https://api.fastmail.com/jmap/download/{accountId}/{blobId}/{name}?type={type}
      const downloadUrl = session.downloadUrl
        .replace("{accountId}", jmapAccount.jmapAccountId)
        .replace("{blobId}", blobId)
        .replace("{name}", "download")
        .replace("{type}", encodeURIComponent(meta?.type ?? "application/octet-stream"));

      const dlRes = await fetch(downloadUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!dlRes.ok) return NextResponse.json({ error: `Download failed: ${dlRes.status}` }, { status: dlRes.status });

      bytes = Buffer.from(await dlRes.arrayBuffer());
      contentType = meta?.type ?? dlRes.headers.get("content-type") ?? "application/octet-stream";
      fileName = meta?.name ?? decodeURIComponent(blobId.split("/").pop() ?? "attachment");
    } else if (providerType === "imap") {
      // IMAP synthetic attachment id: "<uid>-att-<index>" (see lib/providers/imap.ts)
      const attMatch = /^\d+-att-(\d+)$/.exec(attachmentId);
      if (!attMatch) {
        return NextResponse.json({ error: "Invalid IMAP attachment id" }, { status: 400 });
      }
      const { fetchAttachment } = await import("@/lib/providers/imap");
      const att = await fetchAttachment(
        user.id, homeAccountId, messageId, parseInt(attMatch[1], 10)
      );
      if (!att) {
        return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
      }
      bytes = att.bytes;
      contentType = att.contentType;
      fileName = att.fileName;
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

    // Strip CR/LF from provider-derived filenames (header-injection safety);
    // quotes are escaped in the Content-Disposition value below.
    const safeFileName = fileName.replace(/[\r\n]+/g, " ");

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${mode}; filename="${safeFileName.replace(/"/g, '\\"')}"`,
        "Content-Length": String(bytes.length),
        "X-Content-Type-Options": "nosniff",
        ...(isImage ? { "Cache-Control": "private, max-age=3600" } : {}),
      },
    });
  } catch (err) {
    console.error("[attachment-download]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
