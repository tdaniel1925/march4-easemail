import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateSessionUrl } from "../_lib/validate-session-url";
import { z } from "zod";

const testJmapSchema = z.object({
  token: z.string().min(1, "token is required").max(8192),
  sessionUrl: z.string().url("Invalid URL").max(2048).default("https://api.fastmail.com/jmap/session"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = testJmapSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { token, sessionUrl } = parsed.data;

  // SSRF guard — sessionUrl is user-supplied and fetched server-side
  const urlCheck = await validateSessionUrl(sessionUrl);
  if (!urlCheck.ok) {
    return NextResponse.json({ error: urlCheck.error }, { status: 400 });
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
