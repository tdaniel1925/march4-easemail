import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphFetch } from "@/lib/microsoft/graph";

/**
 * POST /api/mail/star
 * Toggles the starred/flagged status of an email
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, homeAccountId, flagged } = await req.json() as {
    messageId: string;
    homeAccountId: string;
    flagged: boolean;
  };

  if (!messageId || !homeAccountId) {
    return NextResponse.json({ error: "messageId and homeAccountId required" }, { status: 400 });
  }

  try {
    // Update in Graph API
    const graphRes = await graphFetch(
      user.id,
      homeAccountId,
      `/me/messages/${encodeURIComponent(messageId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flag: { flagStatus: flagged ? "flagged" : "notFlagged" },
        }),
      }
    );

    if (!graphRes.ok) {
      const error = await graphRes.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    // Update cache
    await prisma.cachedEmail.updateMany({
      where: {
        id: messageId,
        userId: user.id,
        homeAccountId,
      },
      data: {
        flagStatus: flagged ? "flagged" : "notFlagged",
      },
    });

    return NextResponse.json({ ok: true, flagged });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update flag status" },
      { status: 500 }
    );
  }
}
