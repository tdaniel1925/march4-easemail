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
  // Extract sender first name for greeting (e.g. "John Smith <john@firm.com>" → "John")
  const senderName = from.replace(/<[^>]+>/, "").trim().split(/\s+/)[0] ?? "there";

  const system = `You are an email assistant for Darren Miller Law Firm. You help attorneys and staff draft professional, precise replies to emails. You understand legal context: court deadlines, client matters, opposing counsel, depositions, hearings, motions, and billing. Always maintain a tone appropriate for a law firm — formal with clients and courts, collegial with colleagues. Return ONLY valid JSON with no markdown or explanation.`;

  const prompt = `Analyze this email and return this exact JSON structure:
{
  "summary": "2-3 sentences explaining what this email is about and what action (if any) is needed",
  "urgency": "high | medium | low",
  "options": [
    { "title": "Brief Acknowledgment", "body": "A short 2-3 sentence reply confirming receipt and setting expectations" },
    { "title": "Request More Info", "body": "A reply asking for clarification, additional documents, or more time" },
    { "title": "Substantive Reply", "body": "A complete, detailed professional response addressing all points raised" }
  ]
}

Urgency rules:
- high: court deadlines, statute of limitations, hearing dates, urgent client crises, opposing counsel demands with deadlines
- medium: client questions needing a response within a few days, follow-ups, scheduling requests
- low: informational updates, newsletters, automated notifications, FYI emails requiring no action

Each reply option must be meaningfully different. Start each reply body with an appropriate greeting (e.g. "Dear ${senderName},"). Close with "Best regards," — do not add a name. Keep the tone professional and precise.

IMPORTANT FORMATTING: Each reply body must have:
- Greeting on its own line
- A blank line after the greeting
- Body paragraphs separated by blank lines
- A blank line before the closing
- Closing on its own line

Example format:
Dear ${senderName},

[Body paragraph 1]

[Body paragraph 2 if needed]

Best regards,

Email to analyze:
From: ${from}
Subject: ${subject}
Body:
${emailContent.slice(0, 4000)}`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system,
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
