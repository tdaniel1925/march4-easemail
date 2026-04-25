import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { decryptCredential } from "@/lib/providers/crypto";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.jmapConnectedAccount.findFirst({
    where: { userId: user.id },
  });
  if (!account) return NextResponse.json({ error: "No JMAP account found" }, { status: 404 });

  const token = decryptCredential(account.encryptedToken, account.encryptionIv, account.encryptionTag);
  const steps: Record<string, unknown> = { accountId: account.accountId, email: account.email, sessionUrl: account.sessionUrl };

  // Step 1: Get session
  let session: Record<string, unknown>;
  try {
    const res = await fetch(account.sessionUrl, { headers: { Authorization: `Bearer ${token}` } });
    steps.sessionStatus = res.status;
    if (!res.ok) {
      steps.sessionError = await res.text();
      return NextResponse.json(steps);
    }
    session = await res.json();
    steps.apiUrl = session.apiUrl;
    steps.primaryAccounts = session.primaryAccounts;
  } catch (err) {
    steps.sessionError = String(err);
    return NextResponse.json(steps);
  }

  const jmapAccountId = (session.primaryAccounts as Record<string, string>)?.["urn:ietf:params:jmap:mail"];
  steps.jmapAccountId = jmapAccountId;
  if (!jmapAccountId) return NextResponse.json(steps);

  // Step 2: Get mailboxes
  try {
    const mbRes = await fetch(session.apiUrl as string, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
        methodCalls: [
          ["Mailbox/get", { accountId: jmapAccountId, properties: ["id", "name", "role", "totalEmails", "unreadEmails"] }, "0"],
        ],
      }),
    });
    const mbData = await mbRes.json();
    const mailboxes = mbData.methodResponses?.[0]?.[1]?.list ?? [];
    steps.mailboxCount = mailboxes.length;
    steps.mailboxes = mailboxes.map((mb: { id: string; name: string; role: string | null; totalEmails: number; unreadEmails: number }) => ({
      id: mb.id, name: mb.name, role: mb.role, total: mb.totalEmails, unread: mb.unreadEmails,
    }));
    const inbox = mailboxes.find((mb: { role: string | null }) => mb.role === "inbox");
    steps.inboxFound = !!inbox;
    steps.inboxId = inbox?.id;
  } catch (err) {
    steps.mailboxError = String(err);
    return NextResponse.json(steps);
  }

  // Step 3: Query emails in inbox
  if (steps.inboxId) {
    try {
      const emailRes = await fetch(session.apiUrl as string, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
          methodCalls: [
            ["Email/query", {
              accountId: jmapAccountId,
              filter: { inMailbox: steps.inboxId },
              sort: [{ property: "receivedAt", isAscending: false }],
              limit: 5,
            }, "0"],
            ["Email/get", {
              accountId: jmapAccountId,
              "#ids": { resultOf: "0", name: "Email/query", path: "/ids/*" },
              properties: ["id", "subject", "from", "receivedAt", "preview"],
            }, "1"],
          ],
        }),
      });
      const emailData = await emailRes.json();
      steps.rawResponse = emailData.methodResponses;
      const queryResult = emailData.methodResponses?.find((r: unknown[]) => r[0] === "Email/query");
      const getResult = emailData.methodResponses?.find((r: unknown[]) => r[0] === "Email/get");
      steps.queryIds = queryResult?.[1]?.ids;
      steps.queryTotal = queryResult?.[1]?.total;
      steps.emailCount = getResult?.[1]?.list?.length ?? 0;
      steps.firstEmails = (getResult?.[1]?.list ?? []).slice(0, 3).map((e: { id: string; subject: string; from: { name: string; email: string }[]; receivedAt: string }) => ({
        id: e.id, subject: e.subject, from: e.from?.[0]?.email, date: e.receivedAt,
      }));
    } catch (err) {
      steps.emailError = String(err);
    }
  }

  // Step 4: Test via the actual provider path (same as inbox route)
  try {
    const { JmapProvider } = await import("@/lib/providers/jmap");
    const provider = new JmapProvider();
    const result = await provider.fetchEmails(user.id, account.accountId, "inbox", { top: 3 });
    steps.providerTest = {
      ok: true,
      emailCount: result.emails.length,
      firstSubjects: result.emails.slice(0, 3).map((e) => e.subject),
      nextCursor: result.nextCursor,
    };
  } catch (err) {
    steps.providerTest = {
      ok: false,
      error: String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined,
    };
  }

  return NextResponse.json(steps);
}
