import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyAccountOwnership, getProvider } from "@/lib/providers/registry";

const markReadSchema = z.object({
  messageId: z.string().min(1).max(512),
  isRead: z.boolean().optional(),
  homeAccountId: z.string().min(1).max(512).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = markReadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId, isRead, homeAccountId } = parsed.data;

  // Resolve account: use provided homeAccountId or fall back to default
  let accountId = homeAccountId;
  if (!accountId) {
    // Backward compatibility: find default account across all provider types
    const { getAllAccounts } = await import("@/lib/providers/registry");
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  const readValue = isRead ?? true; // Default to true for backward compatibility

  try {
    const provider = getProvider(accountId);
    await provider.markRead(user.id, accountId, messageId, readValue);

    return NextResponse.json({ ok: true, isRead: readValue });
  } catch (error) {
    console.error("[mark-read] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update read status" },
      { status: 500 }
    );
  }
}
