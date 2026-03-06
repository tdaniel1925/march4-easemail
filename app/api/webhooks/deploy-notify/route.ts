import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHmac, timingSafeEqual } from "crypto";
import Anthropic from "@anthropic-ai/sdk";

const resend = new Resend(process.env.RESEND_API_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generatePlainEnglishSummary(commits: GitHubCommit[]): Promise<string> {
  const messages = commits.map((c) => c.message.split("\n")[0]).join("\n");
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: "You summarize software updates for non-technical stakeholders at a law firm. Be concise, friendly, and focus only on things that affect how users experience the app. Skip technical details, bug fixes to internal code, and developer tooling. Use plain English bullet points. If there are no user-facing feature additions, say so briefly.",
      messages: [{
        role: "user",
        content: `Summarize only the NEW FEATURES added in this push in plain English for the law firm team. Each bullet should start with what changed and why it helps them. Skip anything that is purely a bug fix, chore, or technical refactor.\n\nCommits:\n${messages}`,
      }],
    });
    return response.content[0].type === "text" ? response.content[0].text.trim() : "";
  } catch {
    return "";
  }
}

// GitHub push event shape (partial)
interface GitHubCommit {
  id: string;
  message: string;
  author: { name: string; email: string };
  url: string;
  added: string[];
  modified: string[];
  removed: string[];
}

interface GitHubPushPayload {
  ref: string;
  compare: string;
  commits: GitHubCommit[];
  head_commit: GitHubCommit | null;
  pusher: { name: string; email: string };
  repository: { full_name: string; html_url: string };
}

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function buildEmailHtml(summary: string, pusher: string, date: string): string {
  const brand = "rgb(138, 9, 9)";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${brand};padding:28px 32px;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:1px;text-transform:uppercase;">EaseMail</p>
            <h1 style="margin:6px 0 0;font-size:24px;color:#fff;font-weight:700;">What's New</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Update from ${escHtml(pusher)} &mdash; ${escHtml(date)}</p>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:32px 32px 24px;">
            <div style="font-size:15px;color:#1a1a1a;line-height:1.8;white-space:pre-line;">${escHtml(summary)}</div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
            <p style="margin:0;font-size:11px;color:#bbb;">You receive this because you are listed as an EaseMail admin.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");

  // Only handle push events
  if (event !== "push") return NextResponse.json({ ok: true, skipped: true });

  // Verify GitHub signature
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: GitHubPushPayload;
  try {
    payload = JSON.parse(rawBody) as GitHubPushPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Skip branch deletions (no commits)
  if (!payload.commits?.length) return NextResponse.json({ ok: true, skipped: true });

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((e) => e.trim()).filter(Boolean);
  if (!adminEmails.length) return NextResponse.json({ error: "No admin emails configured" }, { status: 500 });

  const fromEmail = process.env.NOTIFY_FROM_EMAIL ?? "noreply@easemail.app";
  const pusher = payload.pusher.name;
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const summary = await generatePlainEnglishSummary(payload.commits);
  if (!summary) return NextResponse.json({ ok: true, skipped: "no user-facing changes" });

  try {
    await resend.emails.send({
      from: `EaseMail Updates <${fromEmail}>`,
      to: adminEmails,
      subject: `EaseMail update — ${date}`,
      html: buildEmailHtml(summary, pusher, date),
    });
  } catch (err) {
    return NextResponse.json({ error: `Resend error: ${String(err)}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: adminEmails.length });
}
