import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";

interface GraphChatMessage {
  id: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  from: { user?: { displayName: string; id: string } } | null;
  body: { contentType: "text" | "html"; content: string };
  messageType: string;
  deletedDateTime: string | null;
}

interface GraphMessageList {
  value: GraphChatMessage[];
  "@odata.nextLink"?: string;
}

export async function GET(
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
  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId") ?? account.homeAccountId;

  try {
    const data = await graphGet<GraphMessageList>(
      user.id,
      homeAccountId,
      `/me/chats/${chatId}/messages?$top=50&$orderby=createdDateTime desc`
    );
    // Return in chronological order
    const messages = (data.value ?? [])
      .filter((m) => !m.deletedDateTime && m.messageType === "message")
      .reverse();
    return NextResponse.json({ messages });
  } catch (err: unknown) {
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    console.error("[teams/chats/messages]", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
