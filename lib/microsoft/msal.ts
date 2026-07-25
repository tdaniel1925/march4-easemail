/**
 * MSAL Node — Confidential Client Application
 *
 * One singleton per server process. The in-memory token cache holds
 * tokens for ALL connected Microsoft accounts across all users.
 * We persist the cache to Supabase (msal_token_cache table) per user
 * so it survives server restarts.
 */
import {
  ConfidentialClientApplication,
  Configuration,
  ICachePlugin,
  TokenCacheContext,
} from "@azure/msal-node";
import { prisma } from "@/lib/prisma";

export function mergeMsalCaches(
  existingJson: string | null | undefined,
  incomingJson: string
): string {
  if (!existingJson) return incomingJson;
  try {
    const existing = JSON.parse(existingJson) as Record<string, unknown>;
    const incoming = JSON.parse(incomingJson) as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...existing, ...incoming };
    for (const key of new Set([...Object.keys(existing), ...Object.keys(incoming)])) {
      const oldValue = existing[key];
      const newValue = incoming[key];
      if (
        oldValue && newValue &&
        typeof oldValue === "object" && !Array.isArray(oldValue) &&
        typeof newValue === "object" && !Array.isArray(newValue)
      ) {
        merged[key] = {
          ...(oldValue as Record<string, unknown>),
          ...(newValue as Record<string, unknown>),
        };
      }
    }
    return JSON.stringify(merged);
  } catch {
    // A fresh valid MSAL cache is safer than retaining malformed persisted data.
    return incomingJson;
  }
}

// ─── Cache Plugin (persists MSAL cache to DB per user) ───────────────────────

export function createCachePlugin(userId: string): ICachePlugin {
  return {
    async beforeCacheAccess(cacheContext: TokenCacheContext) {
      const row = await prisma.msalTokenCache.findUnique({
        where: { userId },
        select: { cacheJson: true },
      });
      if (row?.cacheJson) {
        cacheContext.tokenCache.deserialize(row.cacheJson);
      }
    },
    async afterCacheAccess(cacheContext: TokenCacheContext) {
      if (cacheContext.cacheHasChanged) {
        const serialized = cacheContext.tokenCache.serialize();
        await prisma.msalTokenCache.upsert({
          where: { userId },
          update: { cacheJson: serialized, updatedAt: new Date() },
          create: { userId, cacheJson: serialized, updatedAt: new Date() },
        });
      }
    },
  };
}

// ─── MSAL Client Factory ──────────────────────────────────────────────────────

export function createMsalClient(userId: string): ConfidentialClientApplication {
  const config: Configuration = {
    auth: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? "common"}`,
    },
    cache: {
      cachePlugin: createCachePlugin(userId),
    },
  };

  return new ConfidentialClientApplication(config);
}

// ─── Scopes ───────────────────────────────────────────────────────────────────

// Core scopes — requested at login, always present in the mail/calendar token
export const GRAPH_SCOPES = [
  "https://graph.microsoft.com/Mail.ReadWrite",
  "https://graph.microsoft.com/Mail.Send",
  "https://graph.microsoft.com/Calendars.ReadWrite",
  "https://graph.microsoft.com/Contacts.ReadWrite",
  "https://graph.microsoft.com/User.Read",
];

// Teams scopes — requested via incremental consent (/api/auth/microsoft/teams-consent)
// Kept separate so acquireTokenSilent requests only Teams scopes and gets a fresh
// Teams-specific token, avoiding conflicts with the cached mail/calendar token.
export const TEAMS_SCOPES = [
  "https://graph.microsoft.com/Chat.ReadWrite",
  "https://graph.microsoft.com/ChannelMessage.Send",
  "https://graph.microsoft.com/ChannelMessage.Read.All",
  "https://graph.microsoft.com/Team.ReadBasic.All",
  "https://graph.microsoft.com/Channel.ReadBasic.All",
  "https://graph.microsoft.com/OnlineMeetings.ReadWrite",
];

// ─── Auth URL Builder ─────────────────────────────────────────────────────────

export async function getAuthUrl(
  msalClient: ConfidentialClientApplication,
  state?: string
): Promise<string> {
  const result = await msalClient.getAuthCodeUrl({
    scopes: GRAPH_SCOPES,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
    prompt: "select_account",
    state: state ?? "",
  });
  return result;
}

// ─── Token Acquisition ────────────────────────────────────────────────────────

export async function acquireTokenByCode(
  msalClient: ConfidentialClientApplication,
  code: string,
  codeVerifier?: string
) {
  return msalClient.acquireTokenByCode({
    code,
    scopes: GRAPH_SCOPES,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
    codeVerifier,
  });
}

// In-process per-user mutex for the deserialize → acquire → persist flow.
// Without it, concurrent requests on the same instance race last-write-wins
// on the cache row and can clobber a newer rotated refresh token, causing
// REAUTH_REQUIRED loops. Entries are deleted once their chain settles, so the
// map stays bounded. Note: cross-instance races remain possible by design —
// this only covers the common case of concurrent requests hitting the same
// warm serverless instance, and the changed-check below narrows the
// cross-instance clobber window.
const tokenCacheLocks = new Map<string, Promise<void>>();

async function withTokenCacheLock<T>(
  userId: string,
  fn: () => Promise<T>
): Promise<T> {
  const prev = tokenCacheLocks.get(userId) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  // Tail promise never rejects; delete the map entry once the chain settles
  // (unless another caller has already chained a newer tail).
  const tail = run.then(
    () => undefined,
    () => undefined
  );
  tokenCacheLocks.set(userId, tail);
  void tail.then(() => {
    if (tokenCacheLocks.get(userId) === tail) {
      tokenCacheLocks.delete(userId);
    }
  });
  return run;
}

export async function acquireTokenSilent(
  msalClient: ConfidentialClientApplication,
  homeAccountId: string,
  userId: string,
  scopes: string[] = GRAPH_SCOPES
) {
  return withTokenCacheLock(userId, () =>
    acquireTokenSilentLocked(msalClient, homeAccountId, userId, scopes)
  );
}

async function acquireTokenSilentLocked(
  msalClient: ConfidentialClientApplication,
  homeAccountId: string,
  userId: string,
  scopes: string[]
) {
  // getAllAccounts() is synchronous — it reads the in-memory cache only and does NOT
  // trigger beforeCacheAccess. We must manually deserialize from DB first so that
  // tokens persisted in previous requests/server restarts are available.
  const row = await prisma.msalTokenCache.findUnique({
    where: { userId },
    select: { cacheJson: true },
  });
  const loadedCacheJson = row?.cacheJson ?? null;
  if (loadedCacheJson) {
    msalClient.getTokenCache().deserialize(loadedCacheJson);
  }

  const accounts = await msalClient.getTokenCache().getAllAccounts();
  const account = accounts.find((a) => a.homeAccountId === homeAccountId);

  if (!account) {
    throw new Error(`REAUTH_REQUIRED: Account ${homeAccountId} not found in MSAL cache`);
  }

  try {
    const result = await msalClient.acquireTokenSilent({
      scopes,
      account,
    });

    if (!result?.accessToken) {
      throw new Error("REAUTH_REQUIRED: No access token returned");
    }

    // Persist the updated token cache back to DB after successful refresh.
    // Manual deserialize above bypasses the cache plugin's afterCacheAccess hook,
    // so we must explicitly serialize and save the refreshed tokens. Only write
    // when the serialized cache actually differs from what we loaded — a
    // no-change write would needlessly widen the window for clobbering a newer
    // cache written by another instance.
    try {
      const serialized = msalClient.getTokenCache().serialize();
      if (serialized !== loadedCacheJson) {
        await prisma.msalTokenCache.upsert({
          where: { userId },
          update: { cacheJson: serialized, updatedAt: new Date() },
          create: { userId, cacheJson: serialized, updatedAt: new Date() },
        });
      }
    } catch (cacheErr) {
      console.warn("[msal] Failed to persist token cache:", cacheErr);
    }

    return result.accessToken;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // MSAL throws InteractionRequiredAuthError for expired/missing tokens
    if (
      msg.includes("REAUTH_REQUIRED") ||
      msg.includes("no_tokens_found") ||
      msg.includes("InteractionRequired") ||
      msg.includes("interaction_required") ||
      msg.includes("invalid_grant") ||
      msg.includes("consent_required")
    ) {
      throw new Error(`REAUTH_REQUIRED: ${msg}`);
    }
    throw err;
  }
}
