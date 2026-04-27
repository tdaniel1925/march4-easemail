/** Returns true if the error indicates the MS account needs re-authentication. */
export function isReauthError(err: unknown): boolean {
  const msg = String(err);
  return (
    msg.includes("REAUTH_REQUIRED") ||
    msg.includes("not found in MSAL cache") ||
    msg.includes("no_tokens_found") ||
    msg.includes("InteractionRequired") ||
    msg.includes("consent_required") ||
    msg.includes("interaction_required") ||
    // Graph API returns 401 when the access token is invalid/expired and
    // silent refresh failed. Catch both "failed 401" (from graphGet) and
    // the raw Graph error code. Use "failed 401" (not bare "401") to avoid
    // false-positives on error bodies that contain "401" as part of other text.
    msg.includes("failed 401") ||
    msg.includes("InvalidAuthenticationToken")
  );
}

/** Returns true if the error indicates missing Teams/scope consent. */
export function isConsentError(err: unknown): boolean {
  const msg = String(err);
  return (
    msg.includes("403") ||
    msg.includes("Forbidden") ||
    msg.includes("Authorization_RequestDenied") ||
    msg.includes("insufficient") ||
    msg.includes("consent")
  );
}
