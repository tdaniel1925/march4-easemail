/**
 * Build a writing style profile from the user's sent emails.
 * Used to make AI-generated replies sound like the user.
 */
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface VoiceProfile {
  greeting: string;
  signOff: string;
  tone: string;
  traits: string[];
  samples: string[];
}

/**
 * Get or build the user's voice profile.
 * Caches in the database for 7 days.
 */
export async function getVoiceProfile(userId: string): Promise<VoiceProfile | null> {
  // Check cache first
  const cached = await prisma.user.findUnique({
    where: { id: userId },
    select: { voiceProfile: true, voiceProfileUpdatedAt: true },
  });

  if (cached?.voiceProfile && cached.voiceProfileUpdatedAt) {
    const age = Date.now() - new Date(cached.voiceProfileUpdatedAt).getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) {
      return cached.voiceProfile as unknown as VoiceProfile;
    }
  }

  // Build from sent emails
  const sentEmails = await prisma.cachedEmail.findMany({
    where: {
      userId,
      NOT: { sentDateTime: null },
      isDraft: false,
    },
    orderBy: { sentDateTime: "desc" },
    take: 50,
    select: { bodyPreview: true },
  });

  if (sentEmails.length < 5) return null; // Not enough data

  const emailSamples = sentEmails
    .map((e) => e.bodyPreview)
    .filter((p) => p && p.length > 20)
    .slice(0, 20);

  if (emailSamples.length < 3) return null;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: "You analyze email writing styles. Return ONLY valid JSON, no markdown.",
      messages: [{
        role: "user",
        content: `Analyze these email samples and describe the writing style. Return JSON:
{
  "greeting": "How they typically start emails (e.g. 'Hey', 'Hi [name]', 'Dear', or nothing)",
  "signOff": "How they typically end (e.g. 'Thanks,', 'Best,', 'Regards,', just their name, or nothing)",
  "tone": "One sentence describing their tone (e.g. 'Casual and direct, uses short sentences')",
  "traits": ["trait1", "trait2", "trait3"]
}

Traits should be specific behaviors like:
- "Uses contractions (don't, won't, can't)"
- "Keeps emails under 3 sentences"
- "Often starts with a question"
- "Uses bullet points for lists"
- "Rarely uses exclamation marks"
- "Addresses people by first name"

Email samples:
${emailSamples.map((s, i) => `${i + 1}. "${s}"`).join("\n")}`,
      }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const parsed = JSON.parse(cleaned) as { greeting: string; signOff: string; tone: string; traits: string[] };

    const profile: VoiceProfile = {
      ...parsed,
      samples: emailSamples.slice(0, 3),
    };

    // Cache in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        voiceProfile: JSON.parse(JSON.stringify(profile)),
        voiceProfileUpdatedAt: new Date(),
      },
    }).catch(() => {}); // Non-fatal if column doesn't exist yet

    return profile;
  } catch {
    return null;
  }
}

/**
 * Build the system prompt addition for AI replies using the voice profile.
 */
export function buildVoicePrompt(profile: VoiceProfile): string {
  return `
IMPORTANT — Write the reply in the user's voice. Here is their writing style:
- Greeting style: ${profile.greeting}
- Sign-off style: ${profile.signOff}
- Tone: ${profile.tone}
- Writing traits: ${profile.traits.join("; ")}

Examples of how they write:
${profile.samples.map((s, i) => `${i + 1}. "${s}"`).join("\n")}

Match this style exactly. Do NOT sound generic or corporate. Sound like this specific person.
`.trim();
}
