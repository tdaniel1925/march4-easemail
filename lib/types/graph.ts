/**
 * Canonical Microsoft Graph API response types.
 * Used by SSR pages and API routes that interact with Graph directly.
 */

export interface GraphAttachment {
  id: string;
  name: string;
  size: number;
  contentType: string;
}

export interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  sentDateTime?: string;
  isRead: boolean;
  hasAttachments: boolean;
  flag: { flagStatus: string };
  from: { emailAddress: { name: string; address: string } };
  toRecipients?: { emailAddress: { name: string; address: string } }[];
  ccRecipients?: { emailAddress: { name: string; address: string } }[];
  body: { content: string; contentType: string };
  conversationId?: string;
  categories?: string[];
  attachments?: GraphAttachment[];
}

export interface GraphMessagesResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}
