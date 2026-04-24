import type { EmailMessage } from "@/lib/types/email";
import type { NormalizedEmail } from "@/lib/providers/types";

export function mapCachedEmail(row: {
  id: string;
  subject: string;
  bodyPreview: string;
  fromName: string;
  fromAddress: string;
  toRecipients: unknown;
  receivedDateTime: Date;
  sentDateTime: Date | null;
  isRead: boolean;
  hasAttachments: boolean;
  flagStatus: string;
}): EmailMessage {
  return {
    id: row.id,
    subject: row.subject || "(no subject)",
    bodyPreview: row.bodyPreview,
    receivedDateTime: row.receivedDateTime.toISOString(),
    sentDateTime: row.sentDateTime?.toISOString(),
    isRead: row.isRead,
    hasAttachments: row.hasAttachments,
    flag: { flagStatus: row.flagStatus === "flagged" ? "flagged" : "notFlagged" },
    from: { name: row.fromName, address: row.fromAddress },
    toRecipients: (row.toRecipients as { name: string; address: string }[]) ?? [],
  };
}

/** Map a NormalizedEmail (from provider abstraction) to the frontend EmailMessage shape */
export function mapNormalizedEmail(e: NormalizedEmail): EmailMessage {
  return {
    id: e.id,
    subject: e.subject || "(no subject)",
    bodyPreview: e.bodyPreview,
    receivedDateTime: e.receivedDateTime,
    sentDateTime: e.sentDateTime,
    isRead: e.isRead,
    hasAttachments: e.hasAttachments,
    flag: { flagStatus: e.flagStatus },
    from: { name: e.from.name, address: e.from.address },
    toRecipients: e.toRecipients.map((r) => ({ name: r.name, address: r.address })),
    body: e.bodyHtml
      ? { content: e.bodyHtml, contentType: "html" }
      : e.bodyText
        ? { content: e.bodyText, contentType: "text" }
        : { content: e.bodyPreview, contentType: "text" },
    attachments: e.attachments,
  };
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en", { weekday: "short" });
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function getInitials(name: string): string {
  if (!name) return "";
  return name.split(" ").filter(n => n).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export const avatarColors = [
  { bg: "rgb(253 235 235)", text: "rgb(83 5 5)" },
  { bg: "rgb(209 250 229)", text: "rgb(4 120 87)" },
  { bg: "rgb(253 237 237)", text: "rgb(56 2 2)" },
  { bg: "rgb(240 240 240)", text: "rgb(58 58 58)" },
];

export function getAvatarColor(name: string) {
  const charCode = name.charCodeAt(0);
  if (isNaN(charCode)) return avatarColors[0];
  return avatarColors[charCode % avatarColors.length];
}
