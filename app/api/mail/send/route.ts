import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

interface Attachment {
  name: string;
  contentType: string;
  data: string; // base64
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    to,
    cc,
    bcc,
    subject,
    body,
    attachments,
    fromHomeAccountId,
    draftId,
  } = await req.json() as {
    to: { emailAddress: { address: string } }[];
    cc?: { emailAddress: { address: string } }[];
    bcc?: { emailAddress: { address: string } }[];
    subject: string;
    body: { contentType: string; content: string };
    attachments?: Attachment[];
    fromHomeAccountId?: string;
    draftId?: string;
  };

  if (!to?.length) {
    return NextResponse.json({ error: "At least one recipient required" }, { status: 400 });
  }
  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject required" }, { status: 400 });
  }

  // Prefer the explicitly selected account; fall back to default
  const account = fromHomeAccountId
    ? await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, homeAccountId: fromHomeAccountId },
      })
    : await prisma.msConnectedAccount.findFirst({
        where: { userId: user.id, isDefault: true },
      });

  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  const graphAttachments = (attachments ?? []).map((att) => ({
    "@odata.type": "#microsoft.graph.fileAttachment",
    name: att.name,
    contentType: att.contentType,
    contentBytes: att.data,
  }));

  const payload = {
    message: {
      subject: subject.trim(),
      body,
      toRecipients: to,
      ...(cc?.length ? { ccRecipients: cc } : {}),
      ...(bcc?.length ? { bccRecipients: bcc } : {}),
      ...(graphAttachments.length ? { attachments: graphAttachments } : {}),
    },
    saveToSentItems: true,
  };

  const res = await graphFetch(user.id, account.homeAccountId, "/me/sendMail", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[send] Graph error:", err);
    return NextResponse.json({ error: `Send failed: ${err}` }, { status: res.status });
  }

  // Delete local draft after successful send
  if (draftId) {
    const draft = await prisma.draft.findFirst({ where: { id: draftId, userId: user.id } });
    if (draft) {
      // Delete Graph draft if it exists
      if (draft.graphDraftId && draft.homeAccountId) {
        try {
          await graphFetch(user.id, draft.homeAccountId, `/me/messages/${draft.graphDraftId}`, {
            method: "DELETE",
          });
        } catch {}
      }
      await prisma.draft.delete({ where: { id: draftId } });
    }
  }

  return NextResponse.json({ ok: true });
}
