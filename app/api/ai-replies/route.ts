import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const createAiReplySchema = z.object({
  messageId: z.string().min(1).max(512),
  generatedBody: z.string().min(1).max(200000),
});

const getAiReplyQuerySchema = z.object({
  messageId: z.string().min(1).max(512),
});

/**
 * POST /api/ai-replies
 * Stores AI-generated reply in database (replaces sessionStorage)
 * TTL: 24 hours (auto-cleanup via cron)
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createAiReplySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId, generatedBody } = parsed.data;

  try {
    // Delete any existing AI reply for this message (replace old one)
    await prisma.aiGeneratedReply.deleteMany({
      where: { userId: user.id, messageId },
    });

    // Create new AI reply with 24hr TTL
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const reply = await prisma.aiGeneratedReply.create({
      data: {
        userId: user.id,
        messageId,
        generatedBody,
        expiresAt,
      },
    });

    return NextResponse.json({ ok: true, id: reply.id });
  } catch (error) {
    console.error("[ai-replies] Error:", error);
    return NextResponse.json(
      { error: "Failed to save AI reply" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-replies?messageId=xxx
 * Retrieves AI-generated reply from database
 * Returns null if expired or not found
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = getAiReplyQuerySchema.safeParse({
    messageId: req.nextUrl.searchParams.get("messageId") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId } = parsed.data;

  try {
    const reply = await prisma.aiGeneratedReply.findFirst({
      where: {
        userId: user.id,
        messageId,
        expiresAt: { gt: new Date() }, // Only return if not expired
      },
      orderBy: { createdAt: "desc" }, // Get most recent if multiple
    });

    if (!reply) {
      return NextResponse.json({ reply: null });
    }

    // Delete after retrieval (one-time use)
    await prisma.aiGeneratedReply.delete({
      where: { id: reply.id },
    }).catch(() => {
      // Already deleted - not fatal
    });

    return NextResponse.json({ reply: reply.generatedBody });
  } catch (error) {
    console.error("[ai-replies] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve AI reply" },
      { status: 500 }
    );
  }
}
