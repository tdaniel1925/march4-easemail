import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── GET /api/signatures ──────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sigs = await prisma.signature.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(sigs);
}

// ─── POST /api/signatures ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, html, title, company, phone, defaultNew, defaultReplies, account, isDefault } = await req.json() as {
    name: string;
    html?: string;
    title?: string;
    company?: string;
    phone?: string;
    defaultNew?: boolean;
    defaultReplies?: boolean;
    account?: string;
    isDefault?: boolean;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  // If setting as default, unset all others first
  if (isDefault) {
    await prisma.signature.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  // If setting as defaultNew, unset all others first
  if (defaultNew) {
    await prisma.signature.updateMany({
      where: { userId: user.id },
      data: { defaultNew: false },
    });
  }

  // If setting as defaultReplies, unset all others first
  if (defaultReplies) {
    await prisma.signature.updateMany({
      where: { userId: user.id },
      data: { defaultReplies: false },
    });
  }

  const sig = await prisma.signature.create({
    data: {
      userId: user.id,
      name: name.trim(),
      html: html?.trim() ?? "",
      title: title?.trim() ?? null,
      company: company?.trim() ?? null,
      phone: phone?.trim() ?? null,
      defaultNew: defaultNew ?? false,
      defaultReplies: defaultReplies ?? false,
      account: account ?? "all",
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json(sig);
}
