/**
 * SSRF guard for user-supplied JMAP session URLs.
 *
 * Rejects anything that isn't https, anything pointing at localhost /
 * .local / .internal hostnames, IP literals in private/reserved ranges,
 * and hostnames whose DNS resolution includes ANY private/reserved address.
 */
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type SessionUrlValidation =
  | { ok: true }
  | { ok: false; error: string };

function isPrivateIPv4(ip: string): boolean {
  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) {
    return true; // malformed — treat as unsafe
  }
  const [a, b] = octets;
  return (
    a === 0 ||                      // 0.0.0.0/8 ("this network", incl. 0.0.0.0)
    a === 10 ||                     // 10.0.0.0/8
    a === 127 ||                    // 127.0.0.0/8 loopback
    (a === 169 && b === 254) ||     // 169.254.0.0/16 link-local
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168)        // 192.168.0.0/16
  );
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / unspecified
  // IPv4-mapped IPv6 (e.g. ::ffff:10.0.0.1)
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 ULA
  if (/^fe[89ab]/.test(lower)) return true; // fe80::/10 link-local
  return false;
}

function isPrivateAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // not an IP — treat as unsafe
}

export async function validateSessionUrl(sessionUrl: unknown): Promise<SessionUrlValidation> {
  if (typeof sessionUrl !== "string" || !sessionUrl.trim()) {
    return { ok: false, error: "sessionUrl must be a non-empty string" };
  }

  let url: URL;
  try {
    url = new URL(sessionUrl);
  } catch {
    return { ok: false, error: "sessionUrl is not a valid URL" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "sessionUrl must use https" };
  }

  // URL.hostname keeps brackets around IPv6 literals — strip them
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return { ok: false, error: "sessionUrl must not point to a local or internal host" };
  }

  // IP literal — check directly
  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      return { ok: false, error: "sessionUrl must not point to a private or reserved IP address" };
    }
    return { ok: true };
  }

  // Hostname — resolve DNS and reject if ANY resolved address is private/reserved
  try {
    const addresses = await lookup(hostname, { all: true });
    if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
      return { ok: false, error: "sessionUrl resolves to a private or reserved IP address" };
    }
  } catch {
    return { ok: false, error: "sessionUrl hostname could not be resolved" };
  }

  return { ok: true };
}
