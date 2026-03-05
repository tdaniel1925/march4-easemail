/**
 * Microsoft Graph API helper.
 * All calls go through graphFetch() which handles token acquisition.
 */
import { createMsalClient, acquireTokenSilent, GRAPH_SCOPES } from "./msal";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// ─── Core Fetch ──────────────────────────────────────────────────────────────

export async function graphFetch(
  userId: string,
  homeAccountId: string,
  path: string,
  options: RequestInit = {},
  scopes: string[] = GRAPH_SCOPES
): Promise<Response> {
  const msal = createMsalClient(userId);
  const token = await acquireTokenSilent(msal, homeAccountId, userId, scopes);

  return fetch(`${GRAPH_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

export async function graphGet<T>(
  userId: string,
  homeAccountId: string,
  path: string,
  scopes: string[] = GRAPH_SCOPES
): Promise<T> {
  const res = await graphFetch(userId, homeAccountId, path, {}, scopes);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph GET ${path} failed ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
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
