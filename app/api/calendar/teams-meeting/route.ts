import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphPost } from "@/lib/microsoft/graph";
import { TEAMS_SCOPES } from "@/lib/microsoft/msal";
import { isReauthError } from "@/lib/microsoft/auth-errors";
import { verifyAccountOwnership, getAllAccounts } from "@/lib/providers/registry";

interface GraphOnlineMeeting {
  id: string;
  joinWebUrl: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
  joinMeetingIdSettings?: { isPasscodeRequired: boolean; joinMeetingId: string };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, startDateTime, endDateTime, homeAccountId } = await req.json() as {
    subject: string;
    startDateTime: string;
    endDateTime: string;
    homeAccountId?: string;
  };

  if (!subject?.trim()) return NextResponse.json({ error: "subject required" }, { status: 400 });
  if (!startDateTime || !endDateTime) return NextResponse.json({ error: "startDateTime and endDateTime required" }, { status: 400 });

  // Resolve account: use provided homeAccountId or fall back to default
  let accountId = homeAccountId;
  if (!accountId) {
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    const meeting = await graphPost<GraphOnlineMeeting>(
      user.id,
      accountId,
      "/me/onlineMeetings",
      {
        subject: subject.trim(),
        startDateTime,
        endDateTime,
        lobbyBypassSettings: { scope: "organization", isDialInBypassEnabled: false },
      },
      TEAMS_SCOPES
    );
    return NextResponse.json({
      id: meeting.id,
      joinWebUrl: meeting.joinWebUrl,
      subject: meeting.subject,
      startDateTime: meeting.startDateTime,
      endDateTime: meeting.endDateTime,
    });
  } catch (err: unknown) {
    const errMsg = String(err);
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    // Detect missing Teams consent (Graph returns 403 or mentions consent/scope)
    if (
      errMsg.includes("403") ||
      errMsg.includes("Forbidden") ||
      errMsg.includes("consent") ||
      errMsg.includes("insufficient") ||
      errMsg.includes("Authorization_RequestDenied")
    ) {
      return NextResponse.json(
        { error: "teams_consent_required", message: "Teams permissions not granted. Please grant Teams access first." },
        { status: 403 }
      );
    }
    console.error("[calendar/teams-meeting]", err);
    return NextResponse.json({ error: "Failed to create Teams meeting" }, { status: 500 });
  }
}
