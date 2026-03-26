import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { TEAMS_SCOPES } from "@/lib/microsoft/msal";
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
    console.log("[teams/chats] Attempting to fetch chats with TEAMS_SCOPES for user:", user.id);
    const data = await graphGet<GraphChatList>(
      user.id,
      homeAccountId,
      "/me/chats?$expand=members&$top=50",
      TEAMS_SCOPES
    );
    console.log("[teams/chats] Successfully fetched", data.value?.length ?? 0, "chats");
    return NextResponse.json({ chats: data.value ?? [] });
  } catch (err: unknown) {
    console.error("[teams/chats] Error details:", err);
    if (isReauthError(err)) {
      console.log("[teams/chats] Detected reauth error - returning account_requires_reauth");
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    const msg = String(err);
    if (msg.includes("403") || msg.includes("Authorization_RequestDenied") || msg.includes("Forbidden")) {
      console.log("[teams/chats] Detected 403/Forbidden - returning teams_scope_required");
      return NextResponse.json({ error: "teams_scope_required", details: msg }, { status: 403 });
    }
    console.error("[teams/chats] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to fetch chats", details: msg }, { status: 500 });
  }
}
