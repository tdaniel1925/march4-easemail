export interface EmailMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  isRead: boolean;
  from: { name: string; address: string };
  hasAttachments: boolean;
  flag?: { flagStatus: "flagged" | "notFlagged" };
  body?: { content: string; contentType: "html" | "text" };
  attachments?: Array<{ id: string; name: string; size: number; contentType: string }>;
}
