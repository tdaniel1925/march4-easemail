import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphPost } from "@/lib/microsoft/graph";
import { isReauthError } from "@/lib/microsoft/auth-errors";

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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { where: { isDefault: true } } },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const account = dbUser.msAccounts[0];
  if (!account) return NextResponse.json({ error: "No MS account" }, { status: 400 });

  const { subject, startDateTime, endDateTime, homeAccountId } = await req.json() as {
    subject: string;
    startDateTime: string;
    endDateTime: string;
    homeAccountId?: string;
  };

  if (!subject?.trim()) return NextResponse.json({ error: "subject required" }, { status: 400 });
  if (!startDateTime || !endDateTime) return NextResponse.json({ error: "startDateTime and endDateTime required" }, { status: 400 });

  const accountId = homeAccountId ?? account.homeAccountId;

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
      }
    );
    return NextResponse.json({
      id: meeting.id,
      joinWebUrl: meeting.joinWebUrl,
      subject: meeting.subject,
      startDateTime: meeting.startDateTime,
      endDateTime: meeting.endDateTime,
    });
  } catch (err: unknown) {
    if (isReauthError(err)) {
      return NextResponse.json({ error: "account_requires_reauth" }, { status: 401 });
    }
    console.error("[calendar/teams-meeting]", err);
    return NextResponse.json({ error: "Failed to create Teams meeting" }, { status: 500 });
  }
}
