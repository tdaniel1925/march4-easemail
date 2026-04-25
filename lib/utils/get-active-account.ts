import { cookies } from "next/headers";

interface AccountLike {
  homeAccountId?: string;
  accountId?: string;
  email?: string;
  msEmail?: string;
  displayName?: string | null;
  isDefault?: boolean;
}

/**
 * Get the active account for the current user, respecting their last selection.
 * Reads the easemail_account cookie (set by client-side account switcher).
 * Falls back to the database default account.
 */
export async function getActiveAccountId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("easemail_account");
    return cookie?.value ? decodeURIComponent(cookie.value) : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the active account from a user's account lists.
 * Returns the cookie-saved account if found, otherwise the DB default.
 */
export async function resolveActiveAccount<T extends AccountLike>(
  allAccounts: T[],
  getAccountId: (a: T) => string
): Promise<T | undefined> {
  const savedId = await getActiveAccountId();
  if (savedId) {
    const found = allAccounts.find((a) => getAccountId(a) === savedId);
    if (found) return found;
  }
  return allAccounts.find((a) => a.isDefault) ?? allAccounts[0];
}
