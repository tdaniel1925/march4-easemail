import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!isAdminEmail(user.email ?? "")) return null;
  return user;
}

// ─── GET /api/admin/signatures — all users' signatures ───────────────────────

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sigs = await prisma.signature.findMany({
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: [{ userId: "asc" }, { isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(sigs);
}

// ─── POST /api/admin/signatures — create signature for any user ───────────────

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, name, title, company, phone, isDefault } = await req.json() as {
    userId: string;
    name: string;
    title?: string;
    company?: string;
    phone?: string;
    isDefault?: boolean;
  };

  if (!userId?.trim()) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  // Verify target user exists
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (isDefault) {
    await prisma.signature.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const sig = await prisma.signature.create({
    data: {
      userId,
      name: name.trim(),
      title: title?.trim() ?? null,
      company: company?.trim() ?? null,
      phone: phone?.trim() ?? null,
      isDefault: isDefault ?? false,
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  return NextResponse.json(sig, { status: 201 });
}
