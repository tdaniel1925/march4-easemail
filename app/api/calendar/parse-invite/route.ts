import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ParseInviteResponse {
  subject: string;
  start: string;        // ISO datetime or empty string
  end: string;          // ISO datetime or empty string
  location: string;
  attendees: string[];  // email addresses
  body: string;         // cleaned description
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, fromAddress, body, bodyPreview, receivedDateTime } = await req.json() as {
    subject: string;
    fromAddress: string;
    body: string;
    bodyPreview: string;
    receivedDateTime: string;
  };

  const emailContent = body?.trim() || bodyPreview?.trim() || "(no content)";
  const now = new Date(receivedDateTime || Date.now()).toISOString();

  const prompt = `You are an AI assistant that extracts calendar event details from emails. Analyze the email below and respond with ONLY valid JSON — no markdown, no explanation.

The email was received at: ${now}
Today's reference date/time for resolving relative dates: ${now}

Return this exact JSON structure:
{
  "subject": "Event title (use email subject if good, otherwise derive from context)",
  "start": "ISO datetime string like 2026-03-10T14:00:00 or empty string if not found",
  "end": "ISO datetime string like 2026-03-10T15:00:00 or empty string if not found",
  "location": "Physical address or meeting URL or empty string",
  "attendees": ["email@example.com", "other@example.com"],
  "body": "Clean 1-3 sentence description of the meeting purpose"
}

Rules:
- If start time not mentioned, return empty string (don't guess)
- If duration not mentioned but start is found, set end = start + 1 hour
- Extract attendees from CC/To mentions in the body if visible; include the sender: ${fromAddress}
- For location: prefer meeting URL (Zoom, Teams, Google Meet) over physical address if both present
- Strip HTML tags from body content before processing

Email subject: ${subject}
Email body:
${emailContent.slice(0, 4000)}`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    return NextResponse.json({ error: `AI error: ${(e as Error).message}` }, { status: 500 });
  }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let result: ParseInviteResponse;
  try {
    result = JSON.parse(cleaned) as ParseInviteResponse;
  } catch {
    return NextResponse.json({ error: "AI response could not be parsed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, prefill: result });
}
