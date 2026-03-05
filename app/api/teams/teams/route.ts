import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { TEAMS_SCOPES } from "@/lib/microsoft/msal";
import { isReauthError } from "@/lib/microsoft/auth-errors";

interface GraphTeam {
  id: string;
  displayName: string;
  description: string | null;
  webUrl?: string;
}

interface GraphTeamList {
  value: GraphTeam[];
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
  if (!account) return NextResponse.json({ error: "No MS account" }, { status: 400 });

  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId") ?? account.homeAccountId;

  try {
    const data = await graphGet<GraphTeamList>(
      user.id,
      homeAccountId,
      "/me/joinedTeams?$select=id,displayName,description,webUrl",
      TEAMS_SCOPES
    );
    return NextResponse.json({ teams: data.value ?? [] });
  } catch (err: unknown) {
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    console.error("[teams/teams]", err);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
