import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graphPost } from "@/lib/microsoft/graph";
import { verifyAccountOwnership, detectProviderType, getProvider, getAllAccounts } from "@/lib/providers/registry";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";
import { z } from "zod";

const replySchema = z.object({
  messageId: z.string().min(1).max(512),
  comment: z.string().max(200000).refine((s) => s.trim().length > 0, "comment required"),
  type: z.enum(["reply", "replyAll", "forward"]).optional(),
  toRecipients: z.array(z.string().trim().email().max(320)).max(500).optional(),
  homeAccountId: z.string().min(1).max(512).optional(),
});

async function replyHandler(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = replySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const {
    messageId,
    comment,
    type = "reply",
    toRecipients,
    homeAccountId,
  } = parsed.data;

  if (type === "forward" && (!toRecipients?.length || !toRecipients[0]?.trim())) {
    return NextResponse.json({ error: "toRecipients required for forward" }, { status: 400 });
  }

  // Resolve account: prefer explicit homeAccountId, fall back to default MS account
  let accountId: string;
  let accountEmail: string | null = null;
  if (homeAccountId) {
    const account = await verifyAccountOwnership(user.id, homeAccountId);
    if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = homeAccountId;
    accountEmail = account.email;
  } else {
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((item) => item.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
    accountEmail = defaultAccount.email;
  }

  const providerType = detectProviderType(accountId);

  // ── IMAP / JMAP provider path ─────────────────────────────────────────────
  if (providerType !== "microsoft") {
    try {
      const provider = getProvider(accountId);
      // Fetch original message to build proper reply
      const original = await provider.fetchMessage(user.id, accountId, messageId);

      // Build recipients for the reply
      let replyTo: { name?: string; address: string }[];
      let replyCc: { name?: string; address: string }[] | undefined;

      if (type === "forward") {
        replyTo = toRecipients!.map((addr) => ({ address: addr.trim() }));
      } else if (type === "replyAll") {
        replyTo = [{ name: original.from.name, address: original.from.address }];
        // Include all original recipients except the sender and our own
        // account address (case-insensitive), deduped
        const senderAddress = original.from.address?.toLowerCase() ?? "";
        const selfAddress = accountEmail?.toLowerCase() ?? "";
        const seen = new Set<string>();
        const otherRecipients = [
          ...(original.toRecipients ?? []),
          ...(original.ccRecipients ?? []),
        ].filter((r) => {
          const addr = r.address?.toLowerCase() ?? "";
          if (!addr || addr === senderAddress || addr === selfAddress) return false;
          if (seen.has(addr)) return false;
          seen.add(addr);
          return true;
        });
        if (otherRecipients.length > 0) {
          replyCc = otherRecipients.map((r) => ({ name: r.name, address: r.address }));
        }
      } else {
        replyTo = [{ name: original.from.name, address: original.from.address }];
      }

      const replySubject = type === "forward"
        ? `Fw: ${original.subject}`
        : `Re: ${original.subject}`;

      await provider.sendEmail(user.id, accountId, {
        to: replyTo,
        cc: replyCc,
        subject: replySubject,
        bodyHtml: comment.trim(),
        inReplyTo: messageId,
      });

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[reply] provider error:", String(err));
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Microsoft Graph path ──────────────────────────────────────────────────

  const graphPath = type === "replyAll"
    ? `/me/messages/${encodeURIComponent(messageId)}/replyAll`
    : type === "forward"
    ? `/me/messages/${encodeURIComponent(messageId)}/forward`
    : `/me/messages/${encodeURIComponent(messageId)}/reply`;

  const body = type === "forward"
    ? {
        comment: comment.trim(),
        toRecipients: toRecipients!.map((addr) => ({
          emailAddress: { address: addr.trim() },
        })),
      }
    : { comment: comment.trim() };

  await graphPost(user.id, accountId, graphPath, body);
  return NextResponse.json({ ok: true });
}

// Export with rate limiting (30 sends per hour)
export const POST = withRateLimit(replyHandler, rateLimiters.send);
