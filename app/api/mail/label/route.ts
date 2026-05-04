import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { verifyAccountOwnership, getProvider, getAllAccounts } from "@/lib/providers/registry";

/**
 * POST /api/mail/label
 * Sets or removes a sensitivity/privilege label on a cached email.
 * Also syncs the label to the provider via categories.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, homeAccountId, label } = await req.json() as {
    messageId: string;
    homeAccountId?: string;
    label: "attorney-client-privilege" | "confidential" | "work-product" | null;
  };

  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  // Validate label value
  const validLabels = ["attorney-client-privilege", "confidential", "work-product", null];
  if (!validLabels.includes(label)) {
    return NextResponse.json({ error: "Invalid label value" }, { status: 400 });
  }

  // Resolve account
  let accountId = homeAccountId;
  if (!accountId) {
    const accounts = await getAllAccounts(user.id);
    const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!defaultAccount) return NextResponse.json({ error: "No connected account" }, { status: 404 });
    accountId = defaultAccount.accountId;
  }

  // Verify ownership
  const account = await verifyAccountOwnership(user.id, accountId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  try {
    // Update the cached email's sensitivityLabel
    await prisma.cachedEmail.updateMany({
      where: {
        id: messageId,
        userId: user.id,
        homeAccountId: accountId,
      },
      data: {
        sensitivityLabel: label,
      },
    });

    // Sync label to provider categories (best effort)
    try {
      const provider = getProvider(accountId);
      // Build category text for the label
      const labelCategoryMap: Record<string, string> = {
        "attorney-client-privilege": "Attorney-Client Privilege",
        "confidential": "Confidential",
        "work-product": "Work Product",
      };

      // Get current categories from the cached email
      const cached = await prisma.cachedEmail.findFirst({
        where: { id: messageId, userId: user.id },
        select: { categories: true },
      });

      const currentCategories = (cached?.categories as string[]) ?? [];
      // Remove any existing sensitivity labels from categories
      const sensitivityValues = Object.values(labelCategoryMap);
      const filteredCategories = currentCategories.filter(
        (c) => !sensitivityValues.includes(c)
      );

      // Add the new label if not null
      const newCategories = label
        ? [...filteredCategories, labelCategoryMap[label]]
        : filteredCategories;

      // Update categories on the provider
      if (typeof (provider as any).updateCategories === "function") {
        await (provider as any).updateCategories(user.id, accountId, messageId, newCategories);
      }

      // Update cached categories too
      await prisma.cachedEmail.updateMany({
        where: { id: messageId, userId: user.id, homeAccountId: accountId },
        data: { categories: newCategories },
      });
    } catch (syncErr) {
      // Non-fatal: label saved locally even if sync fails
      console.warn("[label] Provider sync failed:", syncErr);
    }

    return NextResponse.json({ ok: true, label });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update label" },
      { status: 500 }
    );
  }
}
