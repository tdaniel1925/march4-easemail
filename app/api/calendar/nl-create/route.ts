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

  const system = `You are a calendar assistant for Darren Miller Law Firm. You create structured calendar events from natural language. You understand legal event types: client consultations, depositions, court hearings, mediations, settlement conferences, filing deadlines, and opposing counsel calls. Return ONLY valid JSON with no markdown or explanation.`;

  const prompt = `Convert this natural language into a structured calendar event.

Current date/time: ${now}

Return this exact JSON:
{
  "subject": "Clear, specific event title",
  "start": "ISO datetime like 2026-03-10T14:00:00 or empty string if unclear",
  "end": "ISO datetime like 2026-03-10T15:00:00 or empty string if unclear",
  "location": "Courtroom/address/video link or empty string",
  "attendees": ["email@example.com"],
  "body": "Relevant notes, case number, or description — empty string if none"
}

Rules:
- Resolve relative dates from the current date/time (tomorrow, next Monday, in 3 days)
- Default duration: 1 hour unless the type implies otherwise (depositions → 2 hours, hearings → 1 hour)
- No time given but date is clear → use 09:00 as default
- Ambiguous time (e.g. "3") → PM if < 8, AM if 8+, unless context says otherwise
- Extract email addresses for attendees; names only → leave attendees empty
- For legal events, include the event type in the subject (e.g. "Deposition — Smith v. Jones")

Input: "${text.slice(0, 600)}"`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system,
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
