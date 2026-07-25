import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { encryptCredential } from "@/lib/providers/crypto";
import { ImapFlow } from "imapflow";
import * as nodemailer from "nodemailer";
import { createId } from "@paralleldrive/cuid2";
import { validateNetworkHost } from "../_lib/validate-session-url";
import { z } from "zod";

const connectImapSchema = z.object({
  email: z.string().email("Invalid email address").max(320),
  displayName: z.string().max(200).optional(),
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

  const parsed = connectImapSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const {
    email,
    displayName,
    password,
    imapHost,
    imapPort,
    imapSecurity,
    smtpHost,
    smtpPort,
    smtpSecurity,
  } = parsed.data;

  const [imapHostCheck, smtpHostCheck] = await Promise.all([
    validateNetworkHost(imapHost),
    validateNetworkHost(smtpHost),
  ]);
  const hostError = !imapHostCheck.ok
    ? imapHostCheck.error
    : !smtpHostCheck.ok
      ? smtpHostCheck.error
      : null;
  if (hostError) {
    return NextResponse.json(
      { error: hostError },
      { status: 400 }
    );
  }

  // Check for duplicate email
  const existing = await prisma.imapConnectedAccount.findFirst({
    where: { userId: user.id, email },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This email is already connected" },
      { status: 409 }
    );
  }

  // Test IMAP connection
  let imapClient: ImapFlow | null = null;
  try {
    imapClient = new ImapFlow({
      host: imapHost,
      port: imapPort,
      secure: imapSecurity === "tls",
      // With secure:false ImapFlow upgrades via STARTTLS when advertised;
      // enforce certificate validation on the upgraded connection
      tls: { rejectUnauthorized: true },
      auth: { user: email, pass: password },
      logger: false,
    });
    await imapClient.connect();
    await imapClient.logout();
  } catch (err) {
    return NextResponse.json(
      {
        error: "IMAP connection failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 422 }
    );
  }

  // Test SMTP connection
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
  } catch (err) {
    return NextResponse.json(
      {
        error: "SMTP connection failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 422 }
    );
  }

  // Encrypt credentials
  const encrypted = encryptCredential(password);

  // Generate synthetic accountId
  const accountId = `imap:${createId()}`;

  // Check if user has any default accounts
  const hasDefault = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  const hasImapDefault = await prisma.imapConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  const hasJmapDefault = await prisma.jmapConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  const isDefault = !hasDefault && !hasImapDefault && !hasJmapDefault;

  // Create account
  const account = await prisma.imapConnectedAccount.create({
    data: {
      userId: user.id,
      accountId,
      email,
      displayName: displayName || email,
      isDefault,
      imapHost,
      imapPort,
      imapSecurity,
      smtpHost,
      smtpPort,
      smtpSecurity,
      encryptedPassword: encrypted.encrypted,
      encryptionIv: encrypted.iv,
      encryptionTag: encrypted.tag,
    },
  });

  return NextResponse.json({
    id: account.id,
    accountId: account.accountId,
    email: account.email,
    displayName: account.displayName,
    isDefault: account.isDefault,
    providerType: "imap",
  });
}
