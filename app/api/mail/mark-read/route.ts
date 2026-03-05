import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPatch } from "@/lib/microsoft/graph";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await req.json() as { messageId: string };
  if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  await graphPatch(user.id, account.homeAccountId, `/me/messages/${messageId}`, { isRead: true });

  // Fire-and-forget cache update — must not delay or break the response
  prisma.cachedEmail.updateMany({
    where: { id: messageId, userId: user.id },
    data: { isRead: true },
  }).catch((err) => console.warn("[mark-read] cache update failed:", err));

  return NextResponse.json({ ok: true });
}
