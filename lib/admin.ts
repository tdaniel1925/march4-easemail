/**
 * Admin access helpers.
 * ADMIN_EMAILS — server-only, used in page guards and API routes.
 * NEXT_PUBLIC_ADMIN_EMAILS — same list, inlined at build time for client-side sidebar visibility.
 */

function buildAdminList(): string[] {
  const raw =
    process.env.ADMIN_EMAILS ??
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ??
    "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return buildAdminList().includes(email.trim().toLowerCase());
}
