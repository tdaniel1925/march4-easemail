import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPost } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType, getProvider } from "@/lib/providers/registry";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    messageId,
    comment,
    type = "reply",
    toRecipients,
    homeAccountId,
  } = await req.json() as {
    messageId: string;
    comment: string;
    type?: "reply" | "replyAll" | "forward";
    toRecipients?: string[];
    homeAccountId?: string;
  };

  if (!messageId || !comment?.trim()) {
    return NextResponse.json({ error: "messageId and comment required" }, { status: 400 });
  }
  if (type === "forward" && (!toRecipients?.length || !toRecipients[0]?.trim())) {
    return NextResponse.json({ error: "toRecipients required for forward" }, { status: 400 });
  }

  // Resolve account: prefer explicit homeAccountId, fall back to default MS account
  let accountId: string;
  if (homeAccountId) {
    const account = await verifyAccountOwnership(user.id, homeAccountId);
    if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = homeAccountId;
  } else {
    const msDefault = await prisma.msConnectedAccount.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    if (!msDefault) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = msDefault.homeAccountId;
  }

  const providerType = detectProviderType(accountId);

  // ── IMAP / JMAP provider path ─────────────────────────────────────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(accountId);
      // Fetch original message to build proper reply
      const original = await provider.fetchMessage(user.id, accountId, messageId);

      // Build recipients for the reply
      let replyTo: { name?: string; address: string }[];
      let replyCc: { name?: string; address: string }[] | undefined;

      if (type === "forward") {
        replyTo = toRecipients!.map((addr) => ({ address: addr.trim() }));
      } else if (type === "replyAll") {
        replyTo = [{ name: original.from.name, address: original.from.address }];
        // Include all original recipients except the sender
        const otherRecipients = [
          ...(original.toRecipients ?? []),
          ...(original.ccRecipients ?? []),
        ].filter((r) => r.address !== original.from.address);
        if (otherRecipients.length > 0) {
          replyCc = otherRecipients.map((r) => ({ name: r.name, address: r.address }));
        }
      } else {
        replyTo = [{ name: original.from.name, address: original.from.address }];
      }

      const replySubject = type === "forward"
        ? `Fw: ${original.subject}`
        : `Re: ${original.subject}`;

      await provider.sendEmail(user.id, accountId, {
        to: replyTo,
        cc: replyCc,
        subject: replySubject,
        bodyHtml: comment.trim(),
        inReplyTo: messageId,
      });

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[reply] provider error:", String(err));
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Microsoft Graph path ──────────────────────────────────────────────────

  const graphPath = type === "replyAll"
    ? `/me/messages/${messageId}/replyAll`
    : type === "forward"
    ? `/me/messages/${messageId}/forward`
    : `/me/messages/${messageId}/reply`;

  const body = type === "forward"
    ? {
        comment: comment.trim(),
        toRecipients: toRecipients!.map((addr) => ({
          emailAddress: { address: addr.trim() },
        })),
      }
    : { comment: comment.trim() };

  await graphPost(user.id, accountId, graphPath, body);
  return NextResponse.json({ ok: true });
}
