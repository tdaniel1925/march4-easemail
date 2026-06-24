import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAiClient, AI_SUMMARY_MODEL } from "@/lib/ai/client";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";
import { z } from "zod";

const client = getAiClient();

// Claude Fable 5 — most capable; used on-demand for the email the user opened.
const SUMMARY_MODEL = AI_SUMMARY_MODEL;

const requestSchema = z.object({
  messageId: z.string().min(1).max(512),
  homeAccountId: z.string().max(512).optional(),
  subject: z.string().max(998).optional(),
  from: z.string().max(500).optional(),
  // Plain-text or stripped body the reading pane already has.
  body: z.string().max(200000),
  // Newest message time in the thread — cache key for invalidation.
  latestReceivedAt: z.string().refine((s) => !isNaN(new Date(s).getTime()), "invalid date"),
  // Force regeneration (e.g. user clicked "refresh summary").
  refresh: z.boolean().optional(),
});

// Zod shape we validate the model's JSON against after generation.
const ACTION_TYPES = ["date", "amount", "request", "decision", "contact", "attachment"] as const;
const SUGGESTED = ["reply", "reply_all", "forward", "schedule", "archive", "snooze", "none"] as const;

const insightSchema = z.object({
  tldr: z.string().max(2000),
  bullets: z.array(z.string().max(1000)).max(8),
  actionItems: z
    .array(z.object({ type: z.enum(ACTION_TYPES), label: z.string().max(500) }))
    .max(20),
  suggestedAction: z.enum(SUGGESTED),
});
type Insight = z.infer<typeof insightSchema>;

async function aiSummaryHandler(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { messageId, homeAccountId, subject, from, body, latestReceivedAt, refresh } = parsed.data;
  const latest = new Date(latestReceivedAt);

  // Cache hit: return unless the thread advanced or the user forced a refresh.
  if (!refresh) {
    const cached = await prisma.aiEmailInsight.findUnique({
      where: { userId_messageId: { userId: user.id, messageId } },
    });
    if (cached && cached.latestReceivedAt.getTime() >= latest.getTime()) {
      return NextResponse.json({
        tldr: cached.tldr,
        bullets: cached.bullets,
        actionItems: cached.actionItems,
        suggestedAction: cached.suggestedAction,
        cached: true,
      });
    }
  }

  const content = body.trim();
  if (!content) {
    return NextResponse.json({ error: "Email has no content to summarize" }, { status: 400 });
  }

  const system =
    "You are an email assistant for a law firm. Read the email (or thread) and produce a concise, accurate summary plus extracted action items. " +
    "Be precise about dates, amounts, names, and what is being asked. For a thread, summarize the whole conversation, not just the latest message. " +
    "Do not invent facts. Pick the single most likely next action the user would take. " +
    "Return ONLY valid JSON — no markdown, no code fences, no commentary.";

  const prompt =
    `Return this exact JSON structure:\n` +
    `{\n` +
    `  "tldr": "one sentence: what this email is and what it needs",\n` +
    `  "bullets": ["3-5 short bullets summarizing the key points or, for a thread, the conversation"],\n` +
    `  "actionItems": [{ "type": "date|amount|request|decision|contact|attachment", "label": "human-readable, e.g. 'Respond by Fri Jun 13' or '$4,200'" }],\n` +
    `  "suggestedAction": "reply|reply_all|forward|schedule|archive|snooze|none"\n` +
    `}\n\n` +
    `From: ${from ?? "(unknown)"}\n` +
    `Subject: ${subject ?? "(no subject)"}\n\n` +
    `Email content:\n${content.slice(0, 24000)}`;

  let insight: Insight;
  try {
    // Claude Fable 5: thinking is always on (omit the param); no temperature/top_p.
    const message = await client.messages.create({
      model: SUMMARY_MODEL,
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: prompt }],
    });

    if (message.stop_reason === "refusal") {
      return NextResponse.json({ error: "Summary unavailable for this email" }, { status: 422 });
    }
    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const parsedInsight = insightSchema.safeParse(JSON.parse(cleaned));
    if (!parsedInsight.success) throw new Error("response did not match schema");
    insight = parsedInsight.data;
  } catch (e) {
    console.error("[ai-summary] generation failed:", (e as Error).message);
    return NextResponse.json({ error: "Could not generate summary" }, { status: 502 });
  }

  // Upsert the cache (tenant-scoped by userId in the unique key).
  await prisma.aiEmailInsight.upsert({
    where: { userId_messageId: { userId: user.id, messageId } },
    update: {
      latestReceivedAt: latest,
      tldr: insight.tldr,
      bullets: insight.bullets as object,
      actionItems: insight.actionItems as object,
      suggestedAction: insight.suggestedAction,
      model: SUMMARY_MODEL,
      homeAccountId: homeAccountId ?? null,
    },
    create: {
      userId: user.id,
      messageId,
      homeAccountId: homeAccountId ?? null,
      latestReceivedAt: latest,
      tldr: insight.tldr,
      bullets: insight.bullets as object,
      actionItems: insight.actionItems as object,
      suggestedAction: insight.suggestedAction,
      model: SUMMARY_MODEL,
    },
  });

  return NextResponse.json({ ...insight, cached: false });
}

export const POST = withRateLimit(aiSummaryHandler, rateLimiters.ai);
