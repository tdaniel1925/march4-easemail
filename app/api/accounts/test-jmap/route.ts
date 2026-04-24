import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    token,
    sessionUrl = "https://api.fastmail.com/jmap/session",
  } = body;

  if (!token) {
    return NextResponse.json(
      { error: "token is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(sessionUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `JMAP session returned ${res.status}`,
        },
        { status: 422 }
      );
    }

    const session = await res.json();
    const primaryAccountId =
      session.primaryAccounts?.["urn:ietf:params:jmap:mail"];

    if (!primaryAccountId) {
      return NextResponse.json(
        {
          ok: false,
          error: "No primary mail account found in JMAP session",
        },
        { status: 422 }
      );
    }

    const accountName =
      session.accounts?.[primaryAccountId]?.name ?? "Unknown";

    return NextResponse.json({
      ok: true,
      accountName,
      accountId: primaryAccountId,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Connection failed",
      },
      { status: 422 }
    );
  }
}
