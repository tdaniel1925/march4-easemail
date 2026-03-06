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

  const system = `You are a dictation formatter for attorneys at Darren Miller Law Firm. You convert spoken transcripts into polished, professional email bodies. You understand legal vocabulary: motions, depositions, hearings, discovery, opposing counsel, pleadings, exhibits, Latin phrases (inter alia, pro se, etc.), and case references. Preserve all legal terms, names, dates, and case details exactly as spoken — never paraphrase legal specifics. Return ONLY the formatted email body with no explanation or commentary.`;

  const prompt = `Convert this dictated transcript into a professional email body.

<transcript>
${transcript.slice(0, 8000)}
</transcript>

Rules:
- Fix grammar, punctuation, and sentence structure
- Remove filler words (um, uh, like, you know, so, basically, literally, right, I mean)
- Preserve legal terminology, case names, party names, dates, and dollar amounts exactly as spoken
- If a greeting was spoken (hi, hello, dear, hey), keep it as the opening line
- Structure content into clear paragraphs — one idea per paragraph
- If a closing was spoken (best regards, thank you, sincerely), keep it as the closing line
- Do NOT add any information not present in the transcript
- Do NOT invent names, details, or subject lines`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    console.error("[dictate] Anthropic error:", e);
    return NextResponse.json({ error: `AI error: ${(e as Error).message}` }, { status: 500 });
  }

  const formatted = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  return NextResponse.json({ formatted });
}
