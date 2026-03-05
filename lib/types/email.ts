export interface MailFolder {
  id: string;
  displayName: string;
  unreadItemCount: number;
  totalItemCount: number;
}

export interface EmailMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  sentDateTime?: string;
  isRead: boolean;
  from: { name: string; address: string };
  toRecipients?: { name: string; address: string }[];
  hasAttachments: boolean;
  flag?: { flagStatus: "flagged" | "notFlagged" };
  body?: { content: string; contentType: "html" | "text" };
  attachments?: Array<{ id: string; name: string; size: number; contentType: string }>;
}
