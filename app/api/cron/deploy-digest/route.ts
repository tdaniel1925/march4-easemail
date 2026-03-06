import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RECIPIENTS = ["david@dmillerlaw.com", "tdaniel@botmakers.ai"];
const FROM = process.env.NOTIFY_FROM_EMAIL ?? "noreply@easemail.app";

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildEmailHtml(summary: string, date: string): string {
  const brand = "rgb(138, 9, 9)";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${brand};padding:28px 32px;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:1px;text-transform:uppercase;">EaseMail</p>
            <h1 style="margin:6px 0 0;font-size:24px;color:#fff;font-weight:700;">What's New</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">${escHtml(date)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 24px;">
            <div style="font-size:15px;color:#1a1a1a;line-height:1.8;white-space:pre-line;">${escHtml(summary)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
            <p style="margin:0;font-size:11px;color:#bbb;">You receive this because you are listed as an EaseMail admin.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Grab all unsent logs from today
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const logs = await prisma.deployLog.findMany({
    where: { digestSentAt: null, createdAt: { gte: startOfDay } },
    orderBy: { createdAt: "asc" },
  });

  if (!logs.length) return NextResponse.json({ ok: true, skipped: "no pushes today" });

  // Flatten all commit messages from the day
  const allCommits = logs.flatMap((l) => l.commits as string[]);

  // Generate plain English summary
  let summary: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: "You summarize software updates for non-technical stakeholders at a law firm. Be concise and friendly. Focus only on things that affect how users experience the app. Use plain English bullet points. Skip technical details, internal bug fixes, and developer tooling. If there are no user-facing changes at all, respond with exactly: NO_USER_CHANGES",
      messages: [{
        role: "user",
        content: `Summarize the NEW FEATURES and USER-FACING IMPROVEMENTS shipped today in plain English for the law firm team. Each bullet should explain what changed and why it helps them. Skip anything that is purely a bug fix, chore, or technical refactor.\n\nAll commits from today:\n${allCommits.join("\n")}`,
      }],
    });
    summary = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  } catch (err) {
    return NextResponse.json({ error: `AI error: ${String(err)}` }, { status: 500 });
  }

  if (!summary || summary === "NO_USER_CHANGES") {
    // Mark as sent so we don't retry tomorrow
    await prisma.deployLog.updateMany({
      where: { id: { in: logs.map((l) => l.id) } },
      data: { digestSentAt: new Date() },
    });
    return NextResponse.json({ ok: true, skipped: "no user-facing changes today" });
  }

  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  try {
    await resend.emails.send({
      from: `EaseMail Updates <${FROM}>`,
      to: RECIPIENTS,
      subject: `EaseMail update — ${date}`,
      html: buildEmailHtml(summary, date),
    });
  } catch (err) {
    return NextResponse.json({ error: `Resend error: ${String(err)}` }, { status: 500 });
  }

  // Mark all today's logs as sent
  await prisma.deployLog.updateMany({
    where: { id: { in: logs.map((l) => l.id) } },
    data: { digestSentAt: new Date() },
  });

  return NextResponse.json({ ok: true, sent: RECIPIENTS.length, commits: allCommits.length });
}
