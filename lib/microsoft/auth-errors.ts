/** Returns true if the error indicates the MS account needs re-authentication. */
export function isReauthError(err: unknown): boolean {
  const msg = String(err);
  return (
    msg.includes("REAUTH_REQUIRED") ||
    msg.includes("not found in MSAL cache") ||
    msg.includes("no_tokens_found") ||
    msg.includes("InteractionRequired")
  );
}
