import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { homeAccountId } = await req.json() as { homeAccountId: string };
  if (!homeAccountId) return NextResponse.json({ error: "homeAccountId required" }, { status: 400 });

  // Verify the account belongs to this user before deleting
  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, homeAccountId },
  });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // Delete account + cascade clears token cache via DB constraints
  await prisma.msConnectedAccount.delete({
    where: { id: account.id, userId: user.id },
  });

  // If this was the default and others remain, promote the first remaining
  const remaining = await prisma.msConnectedAccount.findMany({
    where: { userId: user.id },
    orderBy: { connectedAt: "asc" },
  });
  if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
    await prisma.msConnectedAccount.update({
      where: { id: remaining[0].id },
      data: { isDefault: true },
    });
  }

  return NextResponse.json({ ok: true });
}
