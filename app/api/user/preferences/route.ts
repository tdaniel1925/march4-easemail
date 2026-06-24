import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const preferencesSchema = z.object({
  notificationNewEmail: z.boolean().optional(),
  notificationDailyDigest: z.boolean().optional(),
  notificationAiReplies: z.boolean().optional(),
  notificationCalendarReminders: z.boolean().optional(),
  notificationWeeklyReport: z.boolean().optional(),
  appTheme: z.enum(["light", "dark"]).optional(),
  fontSize: z.enum(["default", "compact", "comfortable"]).optional(),
  emailDensity: z.enum(["comfortable", "compact"]).optional(),
  // Client sends the value as a string ("5" | "10" | "20" | "30"); coerce to a
  // number and constrain to the allowed set so the PUT no longer 400s.
  undoSendDelay: z.coerce
    .number()
    .int()
    .refine((n) => [5, 10, 20, 30].includes(n), "Invalid undo send delay")
    .optional(),
  // Default sensitivity label for new emails (null/"none" = no default).
  defaultSensitivityLabel: z
    .enum(["none", "attorney-client", "confidential", "work-product"])
    .optional(),
});

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
      defaultSensitivityLabel: true,
      preferredTimeZone: true,
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

  // Enum/literal guards previously enforced manually are absorbed by the schema
  const parsed = preferencesSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

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
      ...(body.defaultSensitivityLabel !== undefined && { defaultSensitivityLabel: body.defaultSensitivityLabel }),
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
      defaultSensitivityLabel: true,
      preferredTimeZone: true,
    },
  });

  return NextResponse.json(updated);
}
