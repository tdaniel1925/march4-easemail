import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ImapFlow } from "imapflow";
import * as nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    email,
    password,
    imapHost,
    imapPort = 993,
    imapSecurity = "tls",
    smtpHost,
    smtpPort = 587,
    smtpSecurity = "starttls",
  } = body;

  if (!email || !password || !imapHost || !smtpHost) {
    return NextResponse.json(
      { error: "email, password, imapHost, and smtpHost are required" },
      { status: 400 }
    );
  }

  const results = { imap: false, smtp: false, errors: [] as string[] };

  // Test IMAP
  try {
    const client = new ImapFlow({
      host: imapHost,
      port: imapPort,
      secure: imapSecurity === "tls",
      auth: { user: email, pass: password },
      logger: false,
    });
    await client.connect();
    await client.logout();
    results.imap = true;
  } catch (err) {
    results.errors.push(
      `IMAP: ${err instanceof Error ? err.message : "Connection failed"}`
    );
  }

  // Test SMTP
  try {
    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecurity === "tls",
      auth: { user: email, pass: password },
    });
    await transport.verify();
    transport.close();
    results.smtp = true;
  } catch (err) {
    results.errors.push(
      `SMTP: ${err instanceof Error ? err.message : "Connection failed"}`
    );
  }

  const ok = results.imap && results.smtp;
  return NextResponse.json(results, { status: ok ? 200 : 422 });
}
