/**
 * Shared AI client factory.
 *
 * All Anthropic SDK call sites go through `getAiClient()` so the LLM provider
 * is swappable via environment variables. Because the Anthropic SDK speaks the
 * standard Anthropic/OpenAI-compatible Messages API, pointing `AI_BASE_URL` at
 * any compatible endpoint (a self-hosted vLLM or Ollama gateway, an internal
 * proxy, a private model host, etc.) routes every AI feature through that
 * provider with no code changes.
 *
 * With NONE of the AI_* env vars set, this defaults to Anthropic's public API
 * using `ANTHROPIC_API_KEY` and the same model strings as before — behavior is
 * identical to direct `new Anthropic()` usage.
 *
 * Env vars:
 *   AI_API_KEY        — API key for the configured provider (falls back to ANTHROPIC_API_KEY)
 *   AI_BASE_URL       — base URL of the provider; omit to use Anthropic's default API
 *   AI_MODEL          — default model id (defaults to claude-haiku-4-5-20251001)
 *   AI_SUMMARY_MODEL  — model id for the more capable ai-summary path (defaults to AI_MODEL, then claude-fable-5)
 */
import Anthropic from "@anthropic-ai/sdk";

export function getAiClient(): Anthropic {
  const apiKey = process.env.AI_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  const baseURL = process.env.AI_BASE_URL;
  return new Anthropic({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

export const AI_MODEL = process.env.AI_MODEL ?? "claude-haiku-4-5-20251001";

export const AI_SUMMARY_MODEL =
  process.env.AI_SUMMARY_MODEL ?? process.env.AI_MODEL ?? "claude-fable-5";
