import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { z } from "zod";

const adminCreateSignatureSchema = z.object({
  userId: z.string().min(1, "userId required").max(128),
  name: z.string().min(1, "name required").max(100),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
});

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

  const parsed = adminCreateSignatureSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { userId, name, title, company, phone, isDefault } = parsed.data;

  if (!userId.trim()) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (!name.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

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
