import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, cc, bcc, subject, body, attachment } = await req.json() as {
    to: { emailAddress: { address: string } }[];
    cc?: { emailAddress: { address: string } }[];
    bcc?: { emailAddress: { address: string } }[];
    subject: string;
    body: { contentType: string; content: string };
    attachment?: { name: string; contentType: string; data: string };
  };

  if (!to?.length) {
    return NextResponse.json({ error: "At least one recipient required" }, { status: 400 });
  }
  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject required" }, { status: 400 });
  }

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  const payload = {
    message: {
      subject: subject.trim(),
      body,
      toRecipients: to,
      ...(cc?.length ? { ccRecipients: cc } : {}),
      ...(bcc?.length ? { bccRecipients: bcc } : {}),
      ...(attachment ? {
        attachments: [{
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: attachment.name,
          contentType: attachment.contentType,
          contentBytes: attachment.data,
        }],
      } : {}),
    },
    saveToSentItems: true,
  };

  // Use graphFetch directly — sendMail returns 202 No Content (no JSON body)
  const res = await graphFetch(user.id, account.homeAccountId, "/me/sendMail", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[send] Graph error:", err);
    return NextResponse.json({ error: `Send failed: ${err}` }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
