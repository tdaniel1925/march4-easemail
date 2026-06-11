import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ImapFlow } from "imapflow";
import * as nodemailer from "nodemailer";
import { z } from "zod";

const testImapSchema = z.object({
  email: z.string().email("Invalid email address").max(320),
  password: z.string().min(1, "password is required").max(1024),
  imapHost: z.string().min(1, "imapHost is required").max(255),
  imapPort: z.number().int().min(1).max(65535).default(993),
  imapSecurity: z.enum(["tls", "starttls", "none"]).default("tls"),
  smtpHost: z.string().min(1, "smtpHost is required").max(255),
  smtpPort: z.number().int().min(1).max(65535).default(587),
  smtpSecurity: z.enum(["tls", "starttls", "none"]).default("starttls"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = testImapSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const {
    email,
    password,
    imapHost,
    imapPort,
    imapSecurity,
    smtpHost,
    smtpPort,
    smtpSecurity,
  } = parsed.data;

  const results = { imap: false, smtp: false, errors: [] as string[] };

  // Test IMAP
  try {
    const client = new ImapFlow({
      host: imapHost,
      port: imapPort,
      secure: imapSecurity === "tls",
      // With secure:false ImapFlow upgrades via STARTTLS when advertised;
      // enforce certificate validation on the upgraded connection
      tls: { rejectUnauthorized: true },
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
      // Never fall back to plaintext when STARTTLS is expected
      requireTLS: smtpSecurity === "starttls",
      tls: { rejectUnauthorized: true },
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
