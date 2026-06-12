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
  /**
   * Window length in milliseconds — used by the in-memory fallback limiter.
   * Must match `window`.
   */
  windowMs: number;
  /**
   * When true, this limiter FAILS CLOSED: if the backing store is unreachable,
   * requests are rejected (429) rather than allowed. Also enables the in-memory
   * fallback so protection exists even when Upstash isn't configured. Use for
   * security-sensitive endpoints (auth, send) where unlimited abuse during an
   * outage is worse than briefly rejecting legitimate traffic.
   */
  failClosed: boolean;
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
  /** 10 auth callbacks per 15 minutes — very strict, fail-closed. */
  auth: { requests: 10, window: "15 m", windowMs: 15 * 60_000, prefix: "@easemail/ratelimit/auth", failClosed: true },
  /** 30 sends per hour — fail-closed (sending is abuse-sensitive). */
  send: { requests: 30, window: "1 h", windowMs: 60 * 60_000, prefix: "@easemail/ratelimit/send", failClosed: true },
  /** 100 read/search ops per minute. */
  read: { requests: 100, window: "1 m", windowMs: 60_000, prefix: "@easemail/ratelimit/read", failClosed: false },
  /** 200 general API calls per minute. */
  general: { requests: 200, window: "1 m", windowMs: 60_000, prefix: "@easemail/ratelimit/general", failClosed: false },
  /** 30 AI/LLM calls per hour — fail-closed (spend-sensitive). */
  ai: { requests: 30, window: "1 h", windowMs: 60 * 60_000, prefix: "@easemail/ratelimit/ai", failClosed: true },
} satisfies Record<string, LimiterConfig>;

export type RateLimiterKey = keyof typeof LIMITER_CONFIGS;

// ─── In-memory fallback limiter (per-instance) ─────────────────────────────────
// Used for fail-closed limiters when Upstash is not configured, so abuse-
// sensitive endpoints still have SOME protection. Per-serverless-instance and
// best-effort (not a substitute for Upstash across instances), but far better
// than unlimited. Bounded to avoid unbounded memory growth.

const MEMORY_BUCKET_CAP = 10_000;
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: RateLimiterKey, identifier: string): {
  success: boolean;
  limit: number;
  reset: number;
  remaining: number;
} {
  const cfg = LIMITER_CONFIGS[key];
  const now = Date.now();
  const bucketKey = `${cfg.prefix}:${identifier}`;
  let bucket = memoryBuckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + cfg.windowMs };
    // Evict oldest entries if the map grows too large.
    if (memoryBuckets.size >= MEMORY_BUCKET_CAP) {
      const firstKey = memoryBuckets.keys().next().value;
      if (firstKey) memoryBuckets.delete(firstKey);
    }
    memoryBuckets.set(bucketKey, bucket);
  }
  bucket.count++;
  const success = bucket.count <= cfg.requests;
  return {
    success,
    limit: cfg.requests,
    reset: bucket.resetAt,
    remaining: Math.max(0, cfg.requests - bucket.count),
  };
}

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
          // Upstash not configured. Fail-closed limiters fall back to the
          // in-memory limiter (some protection); others pass through.
          if (LIMITER_CONFIGS[key].failClosed) {
            return memoryLimit(key, identifier);
          }
          return { success: true, limit: 0, reset: 0, remaining: 0 };
        }
        return limiters[key].limit(identifier);
      },
    };
    return acc;
  },
  {} as Record<RateLimiterKey, UpstashRatelimit>,
);

/** Maps a rateLimiters.* instance back to its key (for the legacy call form). */
function resolveLimiterKey(instance: UpstashRatelimit): RateLimiterKey | null {
  for (const k of Object.keys(rateLimiters) as RateLimiterKey[]) {
    if (rateLimiters[k] === instance) return k;
  }
  return null;
}

// ─── Middleware wrapper ───────────────────────────────────────────────────────

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Wraps a Next.js API route handler with rate limiting.
 *
 * - When Upstash is configured: enforces the supplied limiter and adds
 *   `X-RateLimit-*` headers to every response.
 * - When the store ERRORS: fail-closed limiters (auth/send/ai) try the
 *   in-memory fallback and reject if still over; others pass through.
 * - When Upstash is NOT configured: fail-closed limiters use the in-memory
 *   fallback; others pass through transparently.
 *
 * `key` selects the fail-open/closed behavior. Prefer the keyed overload:
 * @example
 * export const POST = withRateLimit(myHandler, "auth");
 */
export function withRateLimit(
  handler: RouteHandler,
  limiter: UpstashRatelimit | RateLimiterKey,
): RouteHandler {
  // Resolve a key (for fail-closed behavior) and the limiter instance.
  const key: RateLimiterKey | null =
    typeof limiter === "string" ? limiter : resolveLimiterKey(limiter);
  const limiterInstance: UpstashRatelimit =
    typeof limiter === "string" ? rateLimiters[limiter] : limiter;
  const failClosed = key ? LIMITER_CONFIGS[key].failClosed : false;

  return async (req: NextRequest): Promise<NextResponse> => {
    let success = true;
    let limit = 0;
    let reset = 0;
    let remaining = 0;
    try {
      const result = await limiterInstance.limit(getIdentifier(req));
      success = result.success;
      limit = result.limit;
      reset = result.reset;
      remaining = result.remaining;
    } catch {
      // Store errored (e.g. Redis unreachable). Fail-closed limiters fall back
      // to the per-instance in-memory limiter and reject if over; others allow.
      if (failClosed && key) {
        const fb = memoryLimit(key, getIdentifier(req));
        success = fb.success;
        limit = fb.limit;
        reset = fb.reset;
        remaining = fb.remaining;
        console.warn(`[rate-limit] store error on fail-closed '${key}' — using in-memory fallback`);
      } else {
        console.warn("[rate-limit] Rate limiter error, allowing request through");
      }
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
 *
 * The JWT is decoded but NOT verified here, so the IP is always mixed into
 * the bucket key — a forged token cannot mint unlimited fresh buckets from
 * a single address.
 */
function getIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : (req.headers.get("x-real-ip") ?? "unknown");

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      // JWT segments are base64url-encoded; atob chokes on the url-safe
      // alphabet and missing padding.
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
      ) as { sub?: string };
      if (payload.sub) return `user:${payload.sub}:${ip}`;
    } catch {
      // Fall through to IP-based limiting.
    }
  }

  return `ip:${ip}`;
}
