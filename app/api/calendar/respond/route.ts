import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphFetch } from "@/lib/microsoft/graph";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId, homeAccountId, response } = await req.json() as {
    eventId: string;
    homeAccountId: string;
    response: "accept" | "decline" | "tentativelyAccept";
  };

  if (!eventId || !homeAccountId || !response) {
    return NextResponse.json({ error: "eventId, homeAccountId, response required" }, { status: 400 });
  }

  try {
    const res = await graphFetch(user.id, homeAccountId, `/me/events/${eventId}/${response}`, {
      method: "POST",
      body: JSON.stringify({ sendResponse: true }),
    });
    if (!res.ok && res.status !== 202) {
      const err = await res.text();
      return NextResponse.json({ error: `Graph error: ${err}` }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
