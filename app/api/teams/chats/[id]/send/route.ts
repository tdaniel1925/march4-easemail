import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPost } from "@/lib/microsoft/graph";
import { TEAMS_SCOPES } from "@/lib/microsoft/msal";
import { isReauthError } from "@/lib/microsoft/auth-errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { where: { isDefault: true } } },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const account = dbUser.msAccounts[0];
  if (!account) return NextResponse.json({ error: "No MS account" }, { status: 400 });

  const { id: chatId } = await params;
  const { content, homeAccountId } = await req.json() as { content: string; homeAccountId?: string };

  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  const accountId = homeAccountId ?? account.homeAccountId;

  try {
    const message = await graphPost(user.id, accountId, `/me/chats/${chatId}/messages`, {
      body: { contentType: "text", content: content.trim() },
    }, TEAMS_SCOPES);
    return NextResponse.json({ message });
  } catch (err: unknown) {
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    console.error("[teams/chats/send]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
