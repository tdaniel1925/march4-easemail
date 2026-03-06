import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHmac, timingSafeEqual } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

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

function buildEmailHtml(payload: GitHubPushPayload): string {
  const brand = "rgb(138, 9, 9)";
  const branch = payload.ref.replace("refs/heads/", "");
  const commits = payload.commits.slice(0, 10);
  const totalFiles = payload.commits.reduce(
    (sum, c) => sum + c.added.length + c.modified.length + c.removed.length,
    0
  );

  const commitRows = commits
    .map((c) => {
      const short = c.id.slice(0, 7);
      const lines = c.message.split("\n");
      const title = lines[0];
      const body = lines.slice(1).filter(Boolean).join(" ").trim();
      const fileCount = c.added.length + c.modified.length + c.removed.length;
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top;">
            <a href="${c.url}" style="font-family:monospace;font-size:12px;color:${brand};text-decoration:none;">${short}</a>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top;">
            <span style="font-size:13px;color:#1a1a1a;font-weight:600;">${escHtml(title)}</span>
            ${body ? `<br><span style="font-size:12px;color:#666;">${escHtml(body)}</span>` : ""}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top;white-space:nowrap;">
            <span style="font-size:12px;color:#888;">${c.author.name}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top;white-space:nowrap;">
            <span style="font-size:12px;color:#888;">${fileCount} file${fileCount !== 1 ? "s" : ""}</span>
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${brand};padding:24px 32px;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase;">EaseMail System</p>
            <h1 style="margin:4px 0 0;font-size:22px;color:#fff;font-weight:700;">Deploy Notification</h1>
          </td>
        </tr>

        <!-- Summary bar -->
        <tr>
          <td style="background:#fafafa;border-bottom:1px solid #eee;padding:16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:12px;color:#888;">Repository</span><br>
                  <a href="${payload.repository.html_url}" style="font-size:14px;font-weight:600;color:${brand};text-decoration:none;">${payload.repository.full_name}</a>
                </td>
                <td>
                  <span style="font-size:12px;color:#888;">Branch</span><br>
                  <span style="font-size:14px;font-weight:600;color:#1a1a1a;">${escHtml(branch)}</span>
                </td>
                <td>
                  <span style="font-size:12px;color:#888;">Pushed by</span><br>
                  <span style="font-size:14px;font-weight:600;color:#1a1a1a;">${escHtml(payload.pusher.name)}</span>
                </td>
                <td>
                  <span style="font-size:12px;color:#888;">Changes</span><br>
                  <span style="font-size:14px;font-weight:600;color:#1a1a1a;">${commits.length} commit${commits.length !== 1 ? "s" : ""}, ${totalFiles} file${totalFiles !== 1 ? "s" : ""}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Commits table -->
        <tr>
          <td style="padding:24px 32px 0;">
            <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Commits</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#f9f9f9;">
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;width:64px;">SHA</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;">Message</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;">Author</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;">Files</th>
                </tr>
              </thead>
              <tbody>${commitRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px;">
            <a href="${payload.compare}" style="display:inline-block;padding:10px 20px;background:${brand};color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">View Full Diff on GitHub</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
            <p style="margin:0;font-size:11px;color:#aaa;">This notification was sent automatically on every push to the repository. You are receiving this because you are listed as an admin.</p>
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

  const fromEmail = process.env.NOTIFY_FROM_EMAIL ?? "noreply@dmillerlaw.com";
  const branch = payload.ref.replace("refs/heads/", "");
  const headMsg = payload.head_commit?.message.split("\n")[0] ?? "Updates pushed";

  try {
    await resend.emails.send({
      from: `EaseMail Updates <${fromEmail}>`,
      to: adminEmails,
      subject: `[EaseMail] ${branch}: ${headMsg}`,
      html: buildEmailHtml(payload),
    });
  } catch (err) {
    return NextResponse.json({ error: `Resend error: ${String(err)}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: adminEmails.length });
}
