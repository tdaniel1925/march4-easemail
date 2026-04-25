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

  const { text, now, timeZone } = await req.json() as { text: string; now: string; timeZone?: string };
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });

  const tz = timeZone ?? "America/Chicago";
  // Parse the local now string to extract today's date for the prompt
  const todayDate = now.split("T")[0]; // e.g. "2026-04-24"
  const todayParts = todayDate.split("-");
  const todayReadable = new Date(
    parseInt(todayParts[0]), parseInt(todayParts[1]) - 1, parseInt(todayParts[2])
  ).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const system = `You are a calendar assistant for Darren Miller Law Firm. You create structured calendar events from natural language. You understand legal event types: client consultations, depositions, court hearings, mediations, settlement conferences, filing deadlines, and opposing counsel calls. Return ONLY valid JSON with no markdown or explanation.`;

  const prompt = `Convert this natural language into a structured calendar event.

RIGHT NOW it is: ${now} (local time)
TODAY'S DATE is: ${todayReadable} (${todayDate})
User's timezone: ${tz}

Return this exact JSON:
{
  "subject": "Clear, specific event title",
  "start": "ISO datetime like ${todayDate}T14:00:00 or empty string if unclear",
  "end": "ISO datetime like ${todayDate}T15:00:00 or empty string if unclear",
  "location": "Courtroom/address/video link or empty string",
  "attendees": ["email@example.com"],
  "body": "Relevant notes, case number, or description — empty string if none"
}

CRITICAL RULES:
1. All datetimes MUST be in the user's LOCAL timezone (${tz}), NOT UTC. Do NOT append a Z suffix. Return plain local ISO strings like "${todayDate}T14:00:00".
2. "tonight", "today", "this evening", "this afternoon" = USE TODAY'S DATE (${todayDate}). NEVER push to tomorrow.
3. "tomorrow" = the day AFTER today = ${(() => { const d = new Date(todayDate + "T12:00:00"); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })()}
4. If the user mentions a time that has already passed today, STILL use today's date unless they explicitly say "tomorrow" or "next".

Examples with today = ${todayDate}:
- "meeting at 10pm tonight" → start: "${todayDate}T22:00:00", end: "${todayDate}T23:00:00"
- "call at 3pm today" → start: "${todayDate}T15:00:00", end: "${todayDate}T16:00:00"
- "meeting tomorrow at 9am" → start: "${(() => { const d = new Date(todayDate + "T12:00:00"); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })()}T09:00:00"
- "lunch meeting" → start: "${todayDate}T12:00:00", end: "${todayDate}T13:00:00"

Duration defaults:
- General meetings: 1 hour
- Depositions: 2 hours
- Court hearings: 1 hour
- Lunch: 1 hour
- Phone calls: 30 minutes
- No time given but date is clear: use 09:00 as default start

Time interpretation:
- Ambiguous time (e.g. "3") → PM if 1-7, AM if 8-11
- "morning" → 10:00 | "afternoon" → 14:00 | "lunch" → 12:00
- "EOD" / "end of day" / "COB" → 17:00
- "tonight" → 19:00 if no specific time given

Date interpretation:
- "next week" → Monday of next week
- "in N weeks" → N × 7 days from today
- "next month" → 1st of next month
- "end of month" → last business day of current month
- "this Friday" → the coming Friday (even if today is Friday, use today)

Other rules:
- If user says "all day", set isAllDay-style times: start T00:00:00, end T23:59:59
- Extract email addresses for attendees; names only → leave attendees empty
- For legal events, include event type in subject (e.g. "Deposition — Smith v. Jones")

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
