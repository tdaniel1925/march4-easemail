/**
 * Microsoft Graph API helper.
 * All calls go through graphFetch() which handles token acquisition.
 *
 * Performance: tokens are cached per (userId, homeAccountId, scopes) within
 * a request so that N Graph calls only trigger 1 DB lookup + 1 MSAL refresh.
 */
import { createMsalClient, acquireTokenSilent, GRAPH_SCOPES } from "./msal";

// Re-export scope constants so callers can import everything from one place
export { GRAPH_SCOPES, TEAMS_SCOPES } from "./msal";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// ─── Per-request token cache ─────────────────────────────────────────────────
// Avoids hitting the DB for every single graphGet() call in the same request.
// The cache is module-scoped but tokens expire after 5 minutes to be safe.

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getToken(
  userId: string,
  homeAccountId: string,
  scopes: string[]
): Promise<string> {
  const key = `${userId}:${homeAccountId}:${scopes.join(",")}`;
  const cached = tokenCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const msal = createMsalClient(userId);
  const token = await acquireTokenSilent(msal, homeAccountId, userId, scopes);

  // Cache for 5 minutes (tokens typically last 60 min, this is conservative)
  tokenCache.set(key, { token, expiresAt: Date.now() + 5 * 60 * 1000 });

  // Prevent unbounded growth — evict entries if cache is too large
  if (tokenCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of tokenCache) {
      if (v.expiresAt < now) tokenCache.delete(k);
    }
  }

  return token;
}

// ─── Core Fetch ──────────────────────────────────────────────────────────────

export async function graphFetch(
  userId: string,
  homeAccountId: string,
  path: string,
  options: RequestInit = {},
  scopes: string[] = GRAPH_SCOPES
): Promise<Response> {
  const token = await getToken(userId, homeAccountId, scopes);

  return fetch(`${GRAPH_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

// Transient Graph errors worth retrying (Microsoft-side issues, rate limits)
const RETRYABLE_STATUSES = new Set([429, 500, 503, 504]);
const MAX_RETRIES = 2;

export async function graphGet<T>(
  userId: string,
  homeAccountId: string,
  path: string,
  scopes: string[] = GRAPH_SCOPES
): Promise<T> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 1s, 2s
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
    const res = await graphFetch(userId, homeAccountId, path, {}, scopes);
    if (res.ok) return res.json() as Promise<T>;
    const err = await res.text();
    lastErr = new Error(`Graph GET ${path} failed ${res.status}: ${err}`);
    // Only retry transient errors — auth errors should fail immediately
    if (!RETRYABLE_STATUSES.has(res.status)) throw lastErr;
  }
  throw lastErr!;
}

export async function graphPost<T>(
  userId: string,
  homeAccountId: string,
  path: string,
  body: unknown,
  scopes: string[] = GRAPH_SCOPES
): Promise<T> {
  const res = await graphFetch(userId, homeAccountId, path, {
    method: "POST",
    body: JSON.stringify(body),
  }, scopes);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph POST ${path} failed ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

export async function graphPatch<T>(
  userId: string,
  homeAccountId: string,
  path: string,
  body: unknown
): Promise<T> {
  const res = await graphFetch(userId, homeAccountId, path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph PATCH ${path} failed ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

export async function graphDelete(
  userId: string,
  homeAccountId: string,
  path: string
): Promise<void> {
  const res = await graphFetch(userId, homeAccountId, path, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Graph DELETE ${path} failed ${res.status}: ${err}`);
  }
}
