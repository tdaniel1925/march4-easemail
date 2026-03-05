import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { TEAMS_SCOPES } from "@/lib/microsoft/msal";
import { isReauthError } from "@/lib/microsoft/auth-errors";

interface GraphChannelMessage {
  id: string;
  createdDateTime: string;
  from: { user?: { displayName: string; id: string } } | null;
  body: { contentType: "text" | "html"; content: string };
  messageType: string;
  deletedDateTime: string | null;
  replyToId: string | null;
}

interface GraphMessageList {
  value: GraphChannelMessage[];
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

  const { id: channelId } = await params;
  const teamId = req.nextUrl.searchParams.get("teamId");
  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId") ?? account.homeAccountId;

  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  try {
    const data = await graphGet<GraphMessageList>(
      user.id,
      homeAccountId,
      `/teams/${teamId}/channels/${channelId}/messages?$top=50`,
      TEAMS_SCOPES
    );
    const messages = (data.value ?? [])
      .filter((m) => !m.deletedDateTime && m.messageType === "message" && !m.replyToId)
      .reverse();
    return NextResponse.json({ messages });
  } catch (err: unknown) {
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    const msg = String(err);
    if (msg.includes("403") || msg.includes("Authorization_RequestDenied")) {
      return NextResponse.json({ error: "admin_consent_required" }, { status: 403 });
    }
    console.error("[teams/channels/messages]", err);
    return NextResponse.json({ error: "Failed to fetch channel messages" }, { status: 500 });
  }
}
