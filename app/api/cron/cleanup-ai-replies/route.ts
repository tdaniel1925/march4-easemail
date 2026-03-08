import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/cleanup-ai-replies
 * Deletes expired AI-generated replies and search results (runs daily)
 * Called by Vercel Cron
 */
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? ""}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Delete all expired AI replies
    const aiRepliesResult = await prisma.aiGeneratedReply.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    // Delete all expired search results
    const searchResultsResult = await prisma.cachedSearchResult.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    return NextResponse.json({
      ok: true,
      deleted: {
        aiReplies: aiRepliesResult.count,
        searchResults: searchResultsResult.count,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[cleanup] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 }
    );
  }
}
