import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface NlCreateResponse {
  subject: string;
  start: string;        // ISO datetime or empty
  end: string;          // ISO datetime or empty
  location: string;
  attendees: string[];
  body: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, now } = await req.json() as { text: string; now: string };
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });

  const prompt = `You are a calendar assistant. Convert the following natural language into a structured calendar event. Respond with ONLY valid JSON — no markdown, no explanation.

Current date/time: ${now}

Return this exact JSON structure:
{
  "subject": "Event title",
  "start": "ISO datetime like 2026-03-10T14:00:00 or empty string if unclear",
  "end": "ISO datetime like 2026-03-10T15:00:00 or empty string if unclear",
  "location": "Location or meeting URL or empty string",
  "attendees": ["email@example.com"],
  "body": "Optional description or empty string"
}

Rules:
- Resolve relative dates using the current date/time above (e.g. "tomorrow", "next Monday", "in 3 days")
- Default duration: 1 hour if end not specified and start is found
- If no time specified but date is clear, use 09:00 as default start time
- Extract email addresses from text for attendees; if names only (no emails), leave attendees empty
- If time is ambiguous (e.g. "3" with no AM/PM), assume PM for times < 8, AM for 8+

Natural language input: "${text.slice(0, 500)}"`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    return NextResponse.json({ error: `AI error: ${(e as Error).message}` }, { status: 500 });
  }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let result: NlCreateResponse;
  try {
    result = JSON.parse(cleaned) as NlCreateResponse;
  } catch {
    return NextResponse.json({ error: "AI response could not be parsed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, prefill: result });
}
