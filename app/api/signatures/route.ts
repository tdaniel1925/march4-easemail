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

  const { name, title, company, phone, isDefault } = await req.json() as {
    name: string;
    title?: string;
    company?: string;
    phone?: string;
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

  const sig = await prisma.signature.create({
    data: {
      userId: user.id,
      name: name.trim(),
      title: title?.trim() ?? null,
      company: company?.trim() ?? null,
      phone: phone?.trim() ?? null,
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json(sig);
}
