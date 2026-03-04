import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPost } from "@/lib/microsoft/graph";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, comment } = await req.json() as { messageId: string; comment: string };
  if (!messageId || !comment?.trim()) {
    return NextResponse.json({ error: "messageId and comment required" }, { status: 400 });
  }

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  await graphPost(user.id, account.homeAccountId, `/me/messages/${messageId}/reply`, {
    comment: comment.trim(),
  });
  return NextResponse.json({ ok: true });
}
