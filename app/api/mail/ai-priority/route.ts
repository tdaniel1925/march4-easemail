import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAiClient, AI_MODEL } from "@/lib/ai/client";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

import { z } from "zod";

const client = getAiClient();

const aiPrioritySchema = z.object({
  // Handler caps at 20 via slice; allow more in but bound the array
  emails: z.array(z.object({
    id: z.string().min(1).max(512),
    subject: z.string().max(998),
    from: z.string().max(500),
    bodyPreview: z.string().max(5000),
  })).min(1).max(500),
});

interface PriorityScore {
  id: string;
  priority: "urgent" | "normal" | "low";
  reason: string;
}

/** POST /api/mail/ai-priority — score emails by urgency using Claude Haiku */
async function aiPriorityHandler(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = aiPrioritySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const emails = parsed.data.emails.slice(0, 20); // cap at 20

  const systemPrompt = `You are an email priority classifier for a business professional.
Score each email. Return ONLY a JSON array, no other text:
[{"id":"...","priority":"urgent"|"normal"|"low","reason":"one sentence"}]

Urgent: requires action today, from known VIP, contains deadline, meeting request
Normal: regular business correspondence, replies needed but not urgent
Low: newsletters, automated notifications, CC-only, marketing, no action needed`;

  const userContent = emails.map((e) =>
    `ID: ${e.id}\nFrom: ${e.from}\nSubject: ${e.subject}\nPreview: ${e.bodyPreview.slice(0, 200)}`
  ).join("\n\n---\n\n");

  try {
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ scores: [] });
    }

    const scores = JSON.parse(jsonMatch[0]) as PriorityScore[];

    // Validate and sanitize
    const valid = scores.filter(
      (s): s is PriorityScore =>
        typeof s.id === "string" &&
        ["urgent", "normal", "low"].includes(s.priority) &&
        typeof s.reason === "string",
    );

    return NextResponse.json({ scores: valid });
  } catch (err) {
    console.error("[ai-priority] error:", err);
    return NextResponse.json({ error: "AI scoring failed", scores: [] }, { status: 500 });
  }
}

// Export with rate limiting (30 AI calls per hour)
export const POST = withRateLimit(aiPriorityHandler, rateLimiters.ai);
