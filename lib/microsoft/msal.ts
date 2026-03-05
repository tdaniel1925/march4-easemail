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

export const GRAPH_SCOPES = [
  "https://graph.microsoft.com/Mail.ReadWrite",
  "https://graph.microsoft.com/Mail.Send",
  "https://graph.microsoft.com/Calendars.ReadWrite",
  "https://graph.microsoft.com/Contacts.ReadWrite",
  "https://graph.microsoft.com/User.Read",
  // Teams — user-consent scopes only
  // ChannelMessage.Read.All and Presence.Read.All require tenant admin consent
  // and are handled gracefully at the API level (403 → informative message)
  "https://graph.microsoft.com/Chat.ReadWrite",
  "https://graph.microsoft.com/ChannelMessage.Send",
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

export async function acquireTokenSilent(
  msalClient: ConfidentialClientApplication,
  homeAccountId: string,
  userId: string
) {
  // getAllAccounts() is synchronous — it reads the in-memory cache only and does NOT
  // trigger beforeCacheAccess. We must manually deserialize from DB first so that
  // tokens persisted in previous requests/server restarts are available.
  const row = await prisma.msalTokenCache.findUnique({
    where: { userId },
    select: { cacheJson: true },
  });
  if (row?.cacheJson) {
    msalClient.getTokenCache().deserialize(row.cacheJson);
  }

  const accounts = await msalClient.getTokenCache().getAllAccounts();
  const account = accounts.find((a) => a.homeAccountId === homeAccountId);

  if (!account) {
    throw new Error(`REAUTH_REQUIRED: Account ${homeAccountId} not found in MSAL cache`);
  }

  try {
    const result = await msalClient.acquireTokenSilent({
      scopes: GRAPH_SCOPES,
      account,
    });

    if (!result?.accessToken) {
      throw new Error("REAUTH_REQUIRED: No access token returned");
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
