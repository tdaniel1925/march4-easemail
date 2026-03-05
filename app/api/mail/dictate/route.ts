import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── POST /api/mail/dictate ───────────────────────────────────────────────────
// Takes a raw speech transcript and returns a properly formatted email body.

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transcript } = await req.json() as { transcript: string };
  if (!transcript?.trim()) {
    return NextResponse.json({ error: "Transcript required" }, { status: 400 });
  }

  const prompt = `You are formatting a dictated email. The user spoke the following text aloud and it was transcribed by speech recognition software.

<transcript>
${transcript.slice(0, 8000)}
</transcript>

Convert this spoken dictation into a properly written email body. Rules:
- Fix grammar, punctuation, and sentence structure throughout
- Remove filler words and speech patterns (um, uh, like, you know, so, basically, literally, right, I mean)
- If the user mentioned a greeting (hi, hello, dear, hey) keep it as the opening line
- Structure the content into clear, logical paragraphs — one idea per paragraph
- If the user mentioned a closing phrase (best regards, thank you, thanks, cheers, sincerely) keep it as the closing line
- Do NOT add information that was not in the transcript
- Do NOT invent a subject line, names, or details not mentioned
- Return ONLY the email body text — no explanation, no meta-commentary, no subject line`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    console.error("[dictate] Anthropic error:", e);
    return NextResponse.json({ error: `AI error: ${(e as Error).message}` }, { status: 500 });
  }

  const formatted = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  return NextResponse.json({ formatted });
}
