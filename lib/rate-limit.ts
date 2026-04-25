/**
 * lib/rate-limit.ts
 *
 * Lazy Upstash rate-limiting helpers.
 *
 * Redis / Ratelimit instances are created on the FIRST request rather than at
 * module evaluation time.  This prevents the module from crashing during
 * import when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are absent
 * (local dev, CI, or any environment that hasn't wired up Upstash yet).
 *
 * When the env vars are missing, withRateLimit is a transparent pass-through
 * and every rateLimiters.* call simply succeeds.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of a single rate-limiter config entry. */
interface LimiterConfig {
  requests: number;
  window: string; // e.g. "15 m", "1 h", "1 m"
  prefix: string;
}

/** Minimal subset of @upstash/ratelimit's Ratelimit that we actually use. */
interface UpstashRatelimit {
  limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    reset: number;
    remaining: number;
  }>;
}

// ─── Limiter configs ──────────────────────────────────────────────────────────

const LIMITER_CONFIGS = {
  /** 10 auth callbacks per 15 minutes — very strict. */
  auth: { requests: 10, window: "15 m", prefix: "@easemail/ratelimit/auth" },
  /** 30 sends per hour. */
  send: { requests: 30, window: "1 h", prefix: "@easemail/ratelimit/send" },
  /** 100 read/search ops per minute. */
  read: { requests: 100, window: "1 m", prefix: "@easemail/ratelimit/read" },
  /** 200 general API calls per minute. */
  general: { requests: 200, window: "1 m", prefix: "@easemail/ratelimit/general" },
  /** 30 AI/LLM calls per hour. */
  ai: { requests: 30, window: "1 h", prefix: "@easemail/ratelimit/ai" },
} satisfies Record<string, LimiterConfig>;

export type RateLimiterKey = keyof typeof LIMITER_CONFIGS;

// ─── Lazy singleton state ─────────────────────────────────────────────────────

let _limiters: Record<RateLimiterKey, UpstashRatelimit> | null = null;

/**
 * Returns true when Upstash credentials are present in the environment.
 */
export function isRateLimitingEnabled(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Lazily builds (and caches) all Ratelimit instances.
 * Returns null when Upstash is not configured.
 */
function getLimiters(): Record<RateLimiterKey, UpstashRatelimit> | null {
  if (!isRateLimitingEnabled()) return null;
  if (_limiters) return _limiters;

  // Dynamic require so the module can be imported without crashing when the
  // packages are missing or the env vars are absent.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Ratelimit } = require("@upstash/ratelimit") as typeof import("@upstash/ratelimit");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis");

  const redis = Redis.fromEnv();

  _limiters = (Object.keys(LIMITER_CONFIGS) as RateLimiterKey[]).reduce(
    (acc, key) => {
      const cfg = LIMITER_CONFIGS[key];
      acc[key] = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(cfg.requests, cfg.window as Parameters<typeof Ratelimit.slidingWindow>[1]),
        analytics: true,
        prefix: cfg.prefix,
      });
      return acc;
    },
    {} as Record<RateLimiterKey, UpstashRatelimit>,
  );

  return _limiters;
}

// ─── Public rateLimiters object ───────────────────────────────────────────────

/**
 * Pre-defined rate limiters.  Pass one of these to `withRateLimit`.
 *
 * Each value is a thin proxy that resolves the real Ratelimit lazily on first
 * call so the module is always safe to import.
 */
export const rateLimiters: Record<RateLimiterKey, UpstashRatelimit> = (
  Object.keys(LIMITER_CONFIGS) as RateLimiterKey[]
).reduce(
  (acc, key) => {
    acc[key] = {
      async limit(identifier: string) {
        const limiters = getLimiters();
        if (!limiters) {
          // Upstash not configured — always allow.
          return { success: true, limit: 0, reset: 0, remaining: 0 };
        }
        return limiters[key].limit(identifier);
      },
    };
    return acc;
  },
  {} as Record<RateLimiterKey, UpstashRatelimit>,
);

// ─── Middleware wrapper ───────────────────────────────────────────────────────

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Wraps a Next.js API route handler with rate limiting.
 *
 * - When Upstash is configured: enforces the supplied limiter and adds
 *   `X-RateLimit-*` headers to every response.
 * - When Upstash is NOT configured: passes through transparently (no-op).
 *
 * @example
 * export const GET = withRateLimit(myHandler, rateLimiters.auth);
 */
export function withRateLimit(
  handler: RouteHandler,
  limiter: UpstashRatelimit,
): RouteHandler {
  return async (req: NextRequest): Promise<NextResponse> => {
    let success = true;
    let limit = 0;
    let reset = 0;
    let remaining = 0;
    try {
      const result = await limiter.limit(getIdentifier(req));
      success = result.success;
      limit = result.limit;
      reset = result.reset;
      remaining = result.remaining;
    } catch {
      // Rate limiting infra failed (e.g. bad Upstash URL) — allow the request through
      console.warn("[rate-limit] Rate limiter error, allowing request through");
    }

    const headers: Record<string, string> = limit > 0
      ? {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
        }
      : {};

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: new Date(reset).toISOString(),
        },
        { status: 429, headers },
      );
    }

    const response = await handler(req);

    // Stamp rate-limit headers onto the real response too.
    for (const [k, v] of Object.entries(headers)) {
      response.headers.set(k, v);
    }

    return response;
  };
}

// ─── Identifier helper ────────────────────────────────────────────────────────

/**
 * Derives a stable per-request identifier for rate limiting.
 * Prefers the Supabase `sub` claim from a Bearer JWT; falls back to IP.
 */
function getIdentifier(req: NextRequest): string {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const payload = JSON.parse(atob(token.split(".")[1])) as { sub?: string };
      if (payload.sub) return `user:${payload.sub}`;
    } catch {
      // Fall through to IP-based limiting.
    }
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : (req.headers.get("x-real-ip") ?? "unknown");
  return `ip:${ip}`;
}
