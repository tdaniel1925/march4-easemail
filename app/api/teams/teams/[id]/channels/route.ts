import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { TEAMS_SCOPES } from "@/lib/microsoft/msal";
import { isReauthError } from "@/lib/microsoft/auth-errors";

interface GraphChannel {
  id: string;
  displayName: string;
  description: string | null;
  membershipType: "standard" | "private" | "unknownFutureValue";
}

interface GraphChannelList {
  value: GraphChannel[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch user with their MS accounts
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { where: { isDefault: true }, select: { id: true, homeAccountId: true } } },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const defaultAccount = dbUser.msAccounts[0];
  if (!defaultAccount) return NextResponse.json({ error: "No MS account" }, { status: 400 });

  const { id: teamId } = await params;

  // Validate homeAccountId from query param against the user's own accounts (prevents IDOR)
  const rawHomeAccountId = req.nextUrl.searchParams.get("homeAccountId");
  let homeAccountId = defaultAccount.homeAccountId;
  if (rawHomeAccountId && rawHomeAccountId !== defaultAccount.homeAccountId) {
    const owned = await prisma.msConnectedAccount.findFirst({
      where: { userId: user.id, homeAccountId: rawHomeAccountId },
      select: { homeAccountId: true },
    });
    if (!owned) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    homeAccountId = owned.homeAccountId;
  }

  try {
    const data = await graphGet<GraphChannelList>(
      user.id,
      homeAccountId,
      `/teams/${teamId}/channels?$select=id,displayName,description,membershipType`,
      TEAMS_SCOPES
    );
    return NextResponse.json({ channels: data.value ?? [] });
  } catch (err: unknown) {
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    console.error("[teams/channels]", err);
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
  }
}
