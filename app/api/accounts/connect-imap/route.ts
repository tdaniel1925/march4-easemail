import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { encryptCredential } from "@/lib/providers/crypto";
import { ImapFlow } from "imapflow";
import * as nodemailer from "nodemailer";
import { createId } from "@paralleldrive/cuid2";

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
    displayName,
    password,
    imapHost,
    imapPort = 993,
    imapSecurity = "tls",
    smtpHost,
    smtpPort = 587,
    smtpSecurity = "starttls",
  } = body;

  // Validate required fields
  if (!email || !password || !imapHost || !smtpHost) {
    return NextResponse.json(
      { error: "email, password, imapHost, and smtpHost are required" },
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
