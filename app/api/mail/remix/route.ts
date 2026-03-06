import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body, tone, length, formality, extras, customInstruction } = await req.json() as {
    body: string;
    tone: string;
    length: string;
    formality: string;
    extras: string[];
    customInstruction?: string;
  };

  if (!body?.trim()) {
    return NextResponse.json({ error: "Email body required" }, { status: 400 });
  }

  const toneMap: Record<string, string> = {
    professional: "formal, polished, and businesslike",
    casual: "friendly, relaxed, and conversational",
    concise: "short, direct, and to-the-point",
    persuasive: "compelling, motivating, and action-oriented",
  };

  const lengthMap: Record<string, string> = {
    shorter: "shorter than the original",
    same: "approximately the same length as the original",
    longer: "more detailed and longer than the original",
  };

  const extrasInstructions = (extras ?? [])
    .map((e: string) => {
      if (e === "bullets") return "preserve any bullet points";
      if (e === "emoji") return "add relevant emojis";
      if (e === "context") return "add more context and background information";
      if (e === "deadline") return "emphasize any deadlines mentioned";
      return e;
    })
    .join(", ");

  const system = `You are an email writing assistant for Darren Miller Law Firm. You rewrite emails for attorneys and staff. Always preserve legal terminology, case references, client names, dates, and any specific legal language exactly as written — never paraphrase or omit legal details. Return ONLY the rewritten email body with no explanation, no subject line, and no meta-commentary.`;

  const prompt = `Rewrite the following email with these requirements:
- Tone: ${toneMap[tone] ?? tone}
- Length: ${lengthMap[length] ?? length}
- Formality: ${formality}${extrasInstructions ? `\n- Additional: ${extrasInstructions}` : ""}${customInstruction?.trim() ? `\n- Custom instruction: ${customInstruction.trim()}` : ""}

Important: Preserve all legal terms, case names, court references, dates, dollar amounts, and party names exactly. Start directly with the greeting or first line.

Original email:
${body.slice(0, 4000)}`;

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    console.error("[remix] Anthropic error:", e);
    return NextResponse.json({ error: `AI error: ${(e as Error).message}` }, { status: 500 });
  }

  const remixed = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  return NextResponse.json({ remixed });
}
