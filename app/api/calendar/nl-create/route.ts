import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NlCreateSchema = z.object({
  subject: z.string().default(""),
  start: z.string().default(""),
  end: z.string().default(""),
  location: z.string().default(""),
  attendees: z.array(z.string()).default([]),
  body: z.string().default(""),
});

export type NlCreateResponse = z.infer<typeof NlCreateSchema>;

async function nlCreateHandler(req: NextRequest): Promise<NextResponse> {
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

  // Compute useful reference dates for the prompt
  const tomorrowDate = (() => { const d = new Date(todayDate + "T12:00:00"); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })();
  const todayDow = new Date(todayDate + "T12:00:00").getDay(); // 0=Sun … 6=Sat
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // Build "next Monday" through "next Sunday" reference table
  const nextDayDates = dayNames.map((name, i) => {
    let diff = i - todayDow;
    if (diff <= 0) diff += 7; // always next occurrence
    const d = new Date(todayDate + "T12:00:00");
    d.setDate(d.getDate() + diff);
    return `${name} = ${d.toISOString().split("T")[0]}`;
  }).join(", ");

  const system = `You are a calendar assistant for Darren Miller Law Firm — a legal/law firm. You create structured calendar events from natural language. You deeply understand legal event types: client consultations, depositions, court hearings, mediations, settlement conferences, filing deadlines, opposing counsel calls, case reviews, status conferences, and motion hearings. Return ONLY valid JSON with no markdown, code fences, or explanation.`;

  const prompt = `Parse this text into a calendar event JSON object.

CURRENT CONTEXT:
- Right now: ${now} (local time in ${tz})
- Today: ${todayReadable} (${todayDate}, ${dayNames[todayDow]})
- Tomorrow: ${tomorrowDate}
- Next weekdays: ${nextDayDates}

OUTPUT FORMAT (return ONLY this JSON, nothing else):
{
  "subject": "string — clear event title",
  "start": "string — ISO local datetime like ${todayDate}T14:00:00 (NO Z suffix, NO timezone offset)",
  "end": "string — ISO local datetime (empty string if truly unclear)",
  "location": "string — place, room, or link (empty string if none mentioned)",
  "attendees": ["only@valid.emails"],
  "body": "string — notes, case refs, agenda (empty string if none)"
}

ABSOLUTE RULES:
1. Datetimes MUST be LOCAL (${tz}). NEVER append Z or +00:00. Format: YYYY-MM-DDTHH:MM:00
2. "today"/"tonight"/"this evening"/"this afternoon" = ${todayDate}. NEVER push to tomorrow.
3. "tomorrow" = ${tomorrowDate}
4. Past times today still use ${todayDate} unless user says "tomorrow" or "next"
5. Only include email addresses in attendees — names without emails go into the body instead

DATE RESOLUTION:
- "next Monday" / "next Tuesday" etc. → Use the reference dates above
- "this Friday" → the coming Friday (if today IS Friday, use today)
- "next week" → Monday of next week
- "in 2 weeks" → 14 days from today
- "next month" → 1st of next month
- "end of month" → last business day of current month

TIME RESOLUTION:
- Explicit: "2pm" → 14:00, "14:00" → 14:00, "2:30pm" → 14:30
- Bare number: "at 3" → 15:00 (PM for 1-7), "at 9" → 09:00 (AM for 8-11)
- "noon" / "lunch" → 12:00
- "morning" → 10:00, "afternoon" → 14:00, "evening" → 18:00
- "tonight" (no time) → 19:00
- "EOD" / "COB" / "end of day" → 17:00
- No time given → 09:00 default start

DURATION RESOLUTION:
- "for 3 hours" / "3 hours" → add 3h to start
- "for 30 minutes" / "30 min" → add 30min to start
- "for 1.5 hours" → add 1h30m to start
- No duration specified → use these defaults:
  * General meeting / call: 1 hour
  * Deposition: 2 hours
  * Court hearing / motion hearing: 1 hour
  * Mediation / settlement conference: 3 hours
  * Filing deadline: 30 minutes (reminder-style)
  * Lunch: 1 hour
  * Phone call / quick call: 30 minutes
  * Status conference: 30 minutes
  * Client consultation / intake: 1 hour
  * Standup / check-in: 30 minutes

SUBJECT FORMATTING:
- For legal events, prefix with type: "Deposition — [parties/topic]", "Hearing — [case/motion]", "Mediation — [case]"
- For casual events, keep it natural: "Lunch with David", "Team Standup"
- If no clear subject, generate a reasonable one from context

LOCATION EXTRACTION:
- "at Conference Room A" → "Conference Room A"
- "at the courthouse" → "Courthouse"
- "via Zoom" / "on Zoom" → "Zoom"
- "via Teams" / "on Teams" → "Microsoft Teams"
- Address patterns (123 Main St) → extract as-is

EXAMPLES:
Input: "Deposition with sarah@firm.com next Tuesday 2pm for 3 hours at Conference Room A"
→ {"subject":"Deposition","start":"[next-tuesday]T14:00:00","end":"[next-tuesday]T17:00:00","location":"Conference Room A","attendees":["sarah@firm.com"],"body":""}

Input: "Client call tomorrow morning"
→ {"subject":"Client Call","start":"${tomorrowDate}T10:00:00","end":"${tomorrowDate}T11:00:00","location":"","attendees":[],"body":""}

Input: "Team standup every Monday 9am 30 minutes"
→ {"subject":"Team Standup","start":"[next-monday]T09:00:00","end":"[next-monday]T09:30:00","location":"","attendees":[],"body":"Recurring weekly standup"}

Input: "Lunch with David noon Friday"
→ {"subject":"Lunch with David","start":"[this-friday]T12:00:00","end":"[this-friday]T13:00:00","location":"","attendees":[],"body":""}

Input: "Mediation Johnson v. Smith next Thursday 1pm with opposing@counsel.com at 500 Main St"
→ {"subject":"Mediation — Johnson v. Smith","start":"[next-thursday]T13:00:00","end":"[next-thursday]T16:00:00","location":"500 Main St","attendees":["opposing@counsel.com"],"body":""}

USER INPUT: "${text.slice(0, 800)}"`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
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
    const parsed = NlCreateSchema.safeParse(JSON.parse(cleaned));
    if (!parsed.success) {
      return NextResponse.json({ error: "AI response invalid" }, { status: 500 });
    }
    result = parsed.data;
  } catch {
    return NextResponse.json({ error: "AI response could not be parsed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, prefill: result });
}

export const POST = withRateLimit(nlCreateHandler, rateLimiters.ai);
