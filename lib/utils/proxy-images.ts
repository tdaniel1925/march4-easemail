/**
 * Rewrite external image src URLs in email HTML to go through our image proxy.
 *
 * - Skips data: URIs (already inline)
 * - Skips /api/ URLs (already on our origin)
 * - Skips cid: URLs (inline attachments handled separately)
 * - Rewrites http(s):// URLs → /api/mail/image-proxy?url=<encoded>
 */
export function proxyExternalImages(html: string): string {
  // Match src="..." and src='...' in img tags
  return html.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*)(["'])(.*?)\2/gi,
    (_match, prefix: string, quote: string, url: string) => {
      const trimmed = url.trim();

      // Skip already-proxied, data URIs, cid refs, and relative API paths
      if (
        trimmed.startsWith("/api/") ||
        trimmed.startsWith("data:") ||
        trimmed.startsWith("cid:") ||
        trimmed.startsWith("blob:") ||
        trimmed === "" ||
        trimmed.startsWith("/")
      ) {
        return `${prefix}${quote}${url}${quote}`;
      }

      // Only proxy http/https
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const proxied = `/api/mail/image-proxy?url=${encodeURIComponent(trimmed)}`;
        return `${prefix}${quote}${proxied}${quote}`;
      }

      return `${prefix}${quote}${url}${quote}`;
    }
  );
}
