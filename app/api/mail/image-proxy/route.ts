import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Block localhost/private IPs (SSRF protection)
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  ) {
    return new NextResponse("Blocked", { status: 403 });
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
      redirect: "follow",
    });
    clearTimeout(timeout);

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
