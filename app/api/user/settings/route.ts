import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { preferredTimeZone } = body;

    if (preferredTimeZone && typeof preferredTimeZone === "string") {
      await prisma.user.update({
        where: { id: user.id },
        data: { preferredTimeZone },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/user/settings] Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
