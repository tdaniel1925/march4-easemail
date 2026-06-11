import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import dns from "node:dns/promises";
import net from "node:net";

const imageProxyQuerySchema = z.object({
  url: z.string().min(1).max(4096),
});

/**
 * Image proxy — fetches external images through EaseMail's server.
 *
 * Why this exists:
 * Email HTML contains images hosted on hundreds of different domains
 * (CDNs, marketing platforms, company servers). A strict CSP img-src
 * policy blocks all of them. Superhuman/Outlook solve this by proxying
 * every image through their own origin, so the browser only ever loads
 * images from 'self'.
 *
 * Security:
 * - Requires authenticated session (no open proxy)
 * - Only allows image content types
 * - Strips the user's cookies/auth from the outgoing request
 * - Caches for 1 hour to avoid repeated fetches
 */

// Note: image/svg+xml is intentionally excluded — SVG can contain scripts.
const ALLOWED_CONTENT_TYPES = [
  "image/png", "image/jpeg", "image/gif", "image/webp",
  "image/bmp", "image/x-icon", "image/vnd.microsoft.icon", "image/avif",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_REDIRECTS = 3;

/** Check if an IP address is in a private/reserved range */
function isPrivateIP(ip: string): boolean {
  // Handle IPv4-mapped IPv6 (::ffff:x.x.x.x)
  const v4Mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4Mapped) return isPrivateIP(v4Mapped[1]);

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 0) return true;                                   // 0.0.0.0/8
    if (parts[0] === 10) return true;                                  // 10.0.0.0/8
    if (parts[0] === 127) return true;                                 // 127.0.0.0/8
    if (parts[0] === 169 && parts[1] === 254) return true;            // 169.254.0.0/16
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true;            // 192.168.0.0/16
    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;                                   // IPv6 loopback
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;  // fc00::/7
    if (lower.startsWith("fe8") || lower.startsWith("fe9") ||
        lower.startsWith("fea") || lower.startsWith("feb")) return true; // fe80::/10
    return false;
  }

  return false;
}

type ValidateResult =
  | { ok: true; hostname: string }
  | { ok: false; response: NextResponse };

/**
 * SSRF validation for a fetch target. Run on the initial URL AND on every
 * redirect hop: requires http(s), resolves DNS, and rejects private/reserved
 * IP ranges. Returns the validated hostname (brackets stripped for IPv6).
 */
async function validateTarget(url: string): Promise<ValidateResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, response: new NextResponse("Invalid URL", { status: 400 }) };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, response: new NextResponse("Only http/https URLs allowed", { status: 400 }) };
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, ""); // strip brackets from IPv6

  try {
    let resolvedIPs: string[];
    if (net.isIP(hostname)) {
      resolvedIPs = [hostname];
    } else {
      const result = await dns.resolve4(hostname).catch(() => [] as string[]);
      const result6 = await dns.resolve6(hostname).catch(() => [] as string[]);
      resolvedIPs = [...result, ...result6];
    }

    if (resolvedIPs.length === 0) {
      return { ok: false, response: new NextResponse("Cannot resolve hostname", { status: 400 }) };
    }

    if (resolvedIPs.some(isPrivateIP)) {
      return { ok: false, response: new NextResponse("Blocked", { status: 403 }) };
    }
  } catch {
    return { ok: false, response: new NextResponse("DNS resolution failed", { status: 400 }) };
  }

  return { ok: true, hostname };
}

export async function GET(req: NextRequest) {
  // Auth check — no open proxy
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const parsedQuery = imageProxyQuerySchema.safeParse({
    url: req.nextUrl.searchParams.get("url") ?? undefined,
  });
  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid request", details: parsedQuery.error.flatten() }, { status: 400 });
  }
  const { url } = parsedQuery.data;

  // ── SSRF protection: validate protocol + resolved IPs of the initial URL ─
  const initialValidation = await validateTarget(url);
  if (!initialValidation.ok) return initialValidation.response;

  try {
    // Follow redirects manually (up to MAX_REDIRECTS hops). Each hop's
    // Location is resolved against the current URL and re-validated with the
    // same hostname/IP checks as the initial URL, so a redirect can never
    // reach a private/internal address.
    let currentUrl = url;
    let hostname = initialValidation.hostname; // validated host of current hop
    let response: Response | null = null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000); // 10s per hop
      try {
        response = await fetch(currentUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "EaseMail/1.0 ImageProxy",
            "Accept": "image/*",
          },
          redirect: "manual",
        });
      } finally {
        clearTimeout(timeout);
      }

      if (response.status >= 300 && response.status < 400) {
        if (hop === MAX_REDIRECTS) {
          return new NextResponse("Too many redirects", { status: 400 });
        }
        const location = response.headers.get("location");
        if (!location) {
          return new NextResponse("Invalid redirect", { status: 400 });
        }
        // Resolve relative Locations against the current URL
        let nextUrl: string;
        try {
          nextUrl = new URL(location, currentUrl).toString();
        } catch {
          return new NextResponse("Invalid redirect", { status: 400 });
        }
        const hopValidation = await validateTarget(nextUrl);
        if (!hopValidation.ok) return hopValidation.response;

        // Discard the redirect response body before following
        await response.body?.cancel().catch(() => {});
        currentUrl = nextUrl;
        hostname = hopValidation.hostname;
        continue;
      }

      break; // non-redirect response — done following
    }

    if (!response) {
      return new NextResponse("Failed to fetch image", { status: 502 });
    }

    if (!response.ok) {
      return new NextResponse("Upstream error", { status: 502 });
    }

    // DNS rebinding mitigation: the final response URL host must match the
    // host we resolved and validated for the final hop
    try {
      const finalHost = new URL(response.url).hostname.replace(/^\[|\]$/g, "");
      if (finalHost.toLowerCase() !== hostname.toLowerCase()) {
        return new NextResponse("Blocked", { status: 403 });
      }
    } catch {
      return new NextResponse("Blocked", { status: 403 });
    }

    // Verify content type is an image
    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    if (!ALLOWED_CONTENT_TYPES.some((t) => contentType.startsWith(t))) {
      return new NextResponse("Not an image", { status: 415 });
    }

    // Check content length if provided
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      return new NextResponse("Image too large", { status: 413 });
    }

    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength > MAX_IMAGE_SIZE) {
      return new NextResponse("Image too large", { status: 413 });
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return new NextResponse("Timeout", { status: 504 });
    }
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
