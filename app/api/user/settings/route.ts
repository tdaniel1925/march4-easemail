import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  preferredTimeZone: z.string().min(1).max(100).optional(),
});

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { preferredTimeZone } = parsed.data;

    if (preferredTimeZone) {
      // Validate against the IANA time zone list; if the Intl API is
      // unavailable in this runtime, fall back to accepting the value
      let isValidTimeZone = true;
      try {
        isValidTimeZone = Intl.supportedValuesOf("timeZone").includes(preferredTimeZone);
      } catch {
        isValidTimeZone = true;
      }
      if (!isValidTimeZone) {
        return NextResponse.json({ error: "Invalid time zone" }, { status: 400 });
      }

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
