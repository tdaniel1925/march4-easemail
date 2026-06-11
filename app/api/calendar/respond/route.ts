import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";
import { verifyAccountOwnership } from "@/lib/providers/registry";
import { respondEventSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = respondEventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { eventId, homeAccountId, response } = parsed.data;

  // Verify account ownership
  const account = await verifyAccountOwnership(user.id, homeAccountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // Verify event ownership via DB lookup — prevents path injection
  const cachedEvent = await prisma.cachedCalendarEvent.findFirst({
    where: { id: eventId, userId: user.id, homeAccountId },
    select: { id: true },
  });
  if (!cachedEvent) {
    return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });
  }
  const verifiedEventId = cachedEvent.id;

  try {
    const res = await graphFetch(user.id, homeAccountId, `/me/events/${verifiedEventId}/${response}`, {
      method: "POST",
      body: JSON.stringify({ sendResponse: true }),
    });
    if (!res.ok && res.status !== 202) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }
    // Update cached event response status
    const statusMap: Record<string, string> = {
      accept: "accepted",
      decline: "declined",
      tentativelyAccept: "tentativelyAccepted",
    };
    await prisma.cachedCalendarEvent.updateMany({
      where: { id: verifiedEventId, userId: user.id, homeAccountId },
      data: { responseStatus: statusMap[response] ?? "none" },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
