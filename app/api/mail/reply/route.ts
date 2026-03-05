import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPost } from "@/lib/microsoft/graph";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    messageId,
    comment,
    type = "reply",
    toRecipients,
  } = await req.json() as {
    messageId: string;
    comment: string;
    type?: "reply" | "replyAll" | "forward";
    toRecipients?: string[];
  };

  if (!messageId || !comment?.trim()) {
    return NextResponse.json({ error: "messageId and comment required" }, { status: 400 });
  }
  if (type === "forward" && (!toRecipients?.length || !toRecipients[0]?.trim())) {
    return NextResponse.json({ error: "toRecipients required for forward" }, { status: 400 });
  }

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

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

  await graphPost(user.id, account.homeAccountId, graphPath, body);
  return NextResponse.json({ ok: true });
}
