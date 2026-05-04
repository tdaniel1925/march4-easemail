import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── GET /api/user/preferences ────────────────────────────────────────────────
// Returns current user preferences (notifications + appearance)

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      notificationNewEmail: true,
      notificationDailyDigest: true,
      notificationAiReplies: true,
      notificationCalendarReminders: true,
      notificationWeeklyReport: true,
      appTheme: true,
      fontSize: true,
      emailDensity: true,
      undoSendDelay: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(dbUser);
}

// ─── PUT /api/user/preferences ────────────────────────────────────────────────
// Updates user preferences (partial updates supported)

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    notificationNewEmail?: boolean;
    notificationDailyDigest?: boolean;
    notificationAiReplies?: boolean;
    notificationCalendarReminders?: boolean;
    notificationWeeklyReport?: boolean;
    appTheme?: string;
    fontSize?: string;
    emailDensity?: string;
    undoSendDelay?: number;
  };

  // Validate enum values
  if (body.appTheme && !["light", "dark"].includes(body.appTheme)) {
    return NextResponse.json({ error: "Invalid appTheme value" }, { status: 400 });
  }

  if (body.fontSize && !["default", "compact", "comfortable"].includes(body.fontSize)) {
    return NextResponse.json({ error: "Invalid fontSize value" }, { status: 400 });
  }

  if (body.emailDensity && !["comfortable", "compact"].includes(body.emailDensity)) {
    return NextResponse.json({ error: "Invalid emailDensity value" }, { status: 400 });
  }

  if (body.undoSendDelay !== undefined && ![5, 10, 20, 30].includes(body.undoSendDelay)) {
    return NextResponse.json({ error: "Invalid undoSendDelay value. Must be 5, 10, 20, or 30." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(body.notificationNewEmail !== undefined && { notificationNewEmail: body.notificationNewEmail }),
      ...(body.notificationDailyDigest !== undefined && { notificationDailyDigest: body.notificationDailyDigest }),
      ...(body.notificationAiReplies !== undefined && { notificationAiReplies: body.notificationAiReplies }),
      ...(body.notificationCalendarReminders !== undefined && { notificationCalendarReminders: body.notificationCalendarReminders }),
      ...(body.notificationWeeklyReport !== undefined && { notificationWeeklyReport: body.notificationWeeklyReport }),
      ...(body.appTheme !== undefined && { appTheme: body.appTheme }),
      ...(body.fontSize !== undefined && { fontSize: body.fontSize }),
      ...(body.emailDensity !== undefined && { emailDensity: body.emailDensity }),
      ...(body.undoSendDelay !== undefined && { undoSendDelay: body.undoSendDelay }),
    },
    select: {
      notificationNewEmail: true,
      notificationDailyDigest: true,
      notificationAiReplies: true,
      notificationCalendarReminders: true,
      notificationWeeklyReport: true,
      appTheme: true,
      fontSize: true,
      emailDensity: true,
      undoSendDelay: true,
    },
  });

  return NextResponse.json(updated);
}
