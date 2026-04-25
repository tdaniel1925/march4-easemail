import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import dns from "node:dns/promises";
import net from "node:net";

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

const ALLOWED_CONTENT_TYPES = [
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
  "image/bmp", "image/x-icon", "image/vnd.microsoft.icon", "image/avif",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  // Auth check — no open proxy
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url parameter", { status: 400 });

  // Validate it's an http(s) URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return new NextResponse("Only http/https URLs allowed", { status: 400 });
  }

  // ── SSRF protection: resolve DNS and validate the resolved IP ────────────
  const hostname = parsed.hostname.replace(/^\[|\]$/g, ""); // strip brackets from IPv6

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

  // Resolve hostname to IP and validate
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
      return new NextResponse("Cannot resolve hostname", { status: 400 });
    }

    if (resolvedIPs.some(isPrivateIP)) {
      return new NextResponse("Blocked", { status: 403 });
    }
  } catch {
    return new NextResponse("DNS resolution failed", { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "EaseMail/1.0 ImageProxy",
        "Accept": "image/*",
      },
      redirect: "manual",
    });
    clearTimeout(timeout);

    // Block redirects to prevent redirect-based SSRF
    if (response.status >= 300 && response.status < 400) {
      return new NextResponse("Redirects not allowed", { status: 403 });
    }

    if (!response.ok) {
      return new NextResponse("Upstream error", { status: 502 });
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
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return new NextResponse("Timeout", { status: 504 });
    }
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
