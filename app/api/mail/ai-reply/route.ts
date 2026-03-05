import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AiReplyResponse {
  summary: string;
  urgency: "high" | "medium" | "low";
  options: Array<{ title: string; body: string }>;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, from, bodyPreview, body } = await req.json() as {
    subject: string;
    from: string;
    bodyPreview: string;
    body: string;
  };

  const emailContent = body?.trim() || bodyPreview?.trim() || "(no content)";

  const prompt = `You are an AI assistant for a law firm email client. Analyze this email and respond with ONLY valid JSON — no markdown, no explanation, just the JSON object.

Return this exact structure:
{
  "summary": "2-3 sentences: what the email is about and what action (if any) is required",
  "urgency": "high | medium | low",
  "options": [
    { "title": "Short title (3-5 words)", "body": "Full professional reply draft" },
    { "title": "Short title (3-5 words)", "body": "Full professional reply draft" },
    { "title": "Short title (3-5 words)", "body": "Full professional reply draft" }
  ]
}

Urgency guide:
- high: legal deadlines, court dates, urgent client matters, time-sensitive actions
- medium: requires response within a few days, client questions, follow-ups
- low: informational, newsletters, automated notifications, no action required

The 3 reply options should be meaningfully different (e.g. one brief acknowledgement, one requesting more info, one substantive response). Write as a professional at a law firm.

Email:
From: ${from}
Subject: ${subject}
Body: ${emailContent.slice(0, 3000)}`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    console.error("[ai-reply] Anthropic API error:", e);
    return NextResponse.json(
      { error: `Anthropic API error: ${(e as Error).message}` },
      { status: 500 }
    );
  }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let result: AiReplyResponse;
  try {
    result = JSON.parse(cleaned) as AiReplyResponse;
  } catch {
    console.error("[ai-reply] Failed to parse response:", cleaned);
    return NextResponse.json({ error: "AI response could not be parsed" }, { status: 500 });
  }

  return NextResponse.json(result);
}
