/**
 * Pure MIME / header / datetime helpers shared by providers and sync.
 *
 * Extracted into a dependency-free module so they can be unit-tested without
 * pulling in imapflow / nodemailer / the Graph client. These functions encode
 * correctness rules that have regressed before (header-injection escaping,
 * timezone-naive datetime parsing), so they are locked by tests.
 */

/**
 * Formats an RFC 5322 address. The display name is quoted and any `"` or `\`
 * inside it is escaped, so a hostile/odd display name cannot break out of the
 * quoted string and inject extra header content.
 */
export function formatAddress(r: { name?: string | null; address: string }): string {
  if (!r.name) return r.address;
  const escaped = r.name.replace(/(["\\])/g, "\\$1");
  return `"${escaped}" <${r.address}>`;
}

/**
 * Parses a Microsoft Graph datetime. Graph often returns offset-less strings
 * that are actually UTC (e.g. "2026-06-12T10:00:00.0000000"); parsing those
 * with `new Date()` would interpret them in the SERVER's local zone and shift
 * the time. We append "Z" when there is no offset so they parse as UTC.
 */
export function parseGraphDateTime(dateTime: string): Date {
  const hasOffset = /Z$|[+-]\d{2}:\d{2}$/i.test(dateTime);
  return new Date(hasOffset ? dateTime : `${dateTime}Z`);
}
