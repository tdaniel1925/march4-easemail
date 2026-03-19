import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Initialize Redis client
const redis = Redis.fromEnv();

// Create rate limiters for different routes
export const rateLimiters = {
  // Strict rate limit for auth routes (10 requests per 15 minutes)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    analytics: true,
    prefix: "@easemail/ratelimit/auth",
  }),

  // Medium rate limit for email sending (30 per hour)
  send: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 h"),
    analytics: true,
    prefix: "@easemail/ratelimit/send",
  }),

  // Moderate rate limit for search/read operations (100 per minute)
  read: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "@easemail/ratelimit/read",
  }),

  // Relaxed rate limit for general API calls (200 per minute)
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1 m"),
    analytics: true,
    prefix: "@easemail/ratelimit/general",
  }),
};

/**
 * Rate limiting middleware wrapper for API routes
 * @param handler - The API route handler function
 * @param limiter - The rate limiter to use (from rateLimiters)
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiter: Ratelimit
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Get identifier from request (IP or user ID from auth header)
    const identifier = getIdentifier(req);

    // Check rate limit
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Add rate limit headers to response
    const headers = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(reset).toISOString(),
    };

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Call the actual handler
    const response = await handler(req);

    // Add rate limit headers to successful response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Get unique identifier for rate limiting
 * Prefers user ID from auth, falls back to IP address
 */
function getIdentifier(req: NextRequest): string {
  // Try to get user ID from Supabase auth header
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    // Extract user ID from JWT if present
    try {
      const token = authHeader.replace("Bearer ", "");
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.sub) {
        return `user:${payload.sub}`;
      }
    } catch {
      // Fall through to IP-based limiting
    }
  }

  // Fall back to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

/**
 * Helper function to check if Upstash is configured
 * Returns true if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set
 */
export function isRateLimitingEnabled(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
