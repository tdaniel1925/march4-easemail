import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { encryptCredential } from "@/lib/providers/crypto";
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
    token,
    sessionUrl = "https://api.fastmail.com/jmap/session",
  } = body;

  // Validate required fields
  if (!email || !token) {
    return NextResponse.json(
      { error: "email and token are required" },
      { status: 400 }
    );
  }

  // Check for duplicate email
  const existing = await prisma.jmapConnectedAccount.findFirst({
    where: { userId: user.id, email },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This email is already connected" },
      { status: 409 }
    );
  }

  // Test JMAP session
  let jmapAccountId: string;
  try {
    const res = await fetch(sessionUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Session fetch failed: ${res.status}`);
    }
    const session = await res.json();
    // Get the primary mail account
    const primaryAccountId =
      session.primaryAccounts?.["urn:ietf:params:jmap:mail"];
    if (!primaryAccountId) {
      throw new Error("No primary mail account found in JMAP session");
    }
    jmapAccountId = primaryAccountId;
  } catch (err) {
    return NextResponse.json(
      {
        error: "JMAP connection failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 422 }
    );
  }

  // Encrypt token
  const encrypted = encryptCredential(token);

  // Generate synthetic accountId
  const accountId = `jmap:${createId()}`;

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
  const account = await prisma.jmapConnectedAccount.create({
    data: {
      userId: user.id,
      accountId,
      email,
      displayName: displayName || email,
      isDefault,
      sessionUrl,
      jmapAccountId,
      encryptedToken: encrypted.encrypted,
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
    providerType: "jmap",
  });
}
