import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";

interface GraphChat {
  id: string;
  topic: string | null;
  chatType: "oneOnOne" | "group" | "meeting" | "unknownFutureValue";
  lastUpdatedDateTime: string;
  members?: { displayName: string; email?: string }[];
}

interface GraphChatList {
  value: GraphChat[];
  "@odata.nextLink"?: string;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { where: { isDefault: true } } },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const account = dbUser.msAccounts[0];
  if (!account) return NextResponse.json({ error: "No MS account connected" }, { status: 400 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId") ?? account.homeAccountId;

  try {
    const data = await graphGet<GraphChatList>(
      user.id,
      homeAccountId,
      "/me/chats?$expand=members&$orderby=lastUpdatedDateTime desc&$top=50"
    );
    return NextResponse.json({ chats: data.value ?? [] });
  } catch (err: unknown) {
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    console.error("[teams/chats]", err);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
