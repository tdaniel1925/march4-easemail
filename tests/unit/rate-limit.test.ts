import { describe, it, expect, beforeEach, vi } from "vitest";

// Ensure Upstash is treated as unconfigured so the in-memory fallback path runs.
beforeEach(() => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
});

describe("rate-limit fail-closed in-memory fallback", () => {
  it("fail-closed limiter (auth) enforces the cap when Upstash is absent", async () => {
    const { rateLimiters } = await import("@/lib/rate-limit");
    const id = "ip:test-auth-1";
    // auth = 10 per window. 11th must fail.
    const results = [];
    for (let i = 0; i < 11; i++) {
      results.push(await rateLimiters.auth.limit(id));
    }
    expect(results.slice(0, 10).every((r) => r.success)).toBe(true);
    expect(results[10].success).toBe(false);
    expect(results[10].limit).toBe(10);
  });

  it("fail-open limiter (read) passes through when Upstash is absent", async () => {
    const { rateLimiters } = await import("@/lib/rate-limit");
    const id = "ip:test-read-1";
    // read is NOT fail-closed → always-allow no-op when unconfigured.
    for (let i = 0; i < 250; i++) {
      const r = await rateLimiters.read.limit(id);
      expect(r.success).toBe(true);
    }
  });

  it("separate identifiers get separate buckets", async () => {
    const { rateLimiters } = await import("@/lib/rate-limit");
    for (let i = 0; i < 10; i++) await rateLimiters.auth.limit("ip:bucket-A");
    const a = await rateLimiters.auth.limit("ip:bucket-A"); // 11th → over
    const b = await rateLimiters.auth.limit("ip:bucket-B"); // fresh → ok
    expect(a.success).toBe(false);
    expect(b.success).toBe(true);
  });
});
