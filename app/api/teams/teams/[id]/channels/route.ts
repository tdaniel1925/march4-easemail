import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { where: { isDefault: true } } },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const account = dbUser.msAccounts[0];
  if (!account) return NextResponse.json({ error: "No MS account" }, { status: 400 });

  const { id: teamId } = await params;
  const homeAccountId = req.nextUrl.searchParams.get("homeAccountId") ?? account.homeAccountId;

  try {
    const data = await graphGet<GraphChannelList>(
      user.id,
      homeAccountId,
      `/teams/${teamId}/channels?$select=id,displayName,description,membershipType`
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
