/**
 * Provider abstraction layer — shared types.
 * All email providers (Microsoft Graph, IMAP, JMAP) implement the EmailProvider interface.
 */

export type ProviderType = "microsoft" | "imap" | "jmap";

/** Unified account representation across all provider types */
export interface UnifiedAccount {
  id: string;
  accountId: string; // homeAccountId for MS, "imap:<cuid>" or "jmap:<cuid>" for others
  email: string;
  displayName: string | null;
  isDefault: boolean;
  providerType: ProviderType;
}

/** Normalized email structure returned by all providers */
export interface NormalizedEmail {
  id: string;
  subject: string;
  bodyPreview: string;
  bodyHtml?: string;
  bodyText?: string;
  receivedDateTime: string;
  sentDateTime?: string;
  isRead: boolean;
  hasAttachments: boolean;
  flagStatus: "flagged" | "notFlagged";
  from: { name: string; address: string };
  toRecipients: { name: string; address: string }[];
  ccRecipients?: { name: string; address: string }[];
  bccRecipients?: { name: string; address: string }[];
  categories: string[];
  importance: "normal" | "high" | "low";
  folderId: string;
  conversationId?: string;
  isDraft?: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    contentType: string;
  }>;
}

/** Normalized folder structure returned by all providers */
export interface NormalizedFolder {
  id: string;
  displayName: string;
  parentFolderId: string | null;
  unreadCount: number;
  totalCount: number;
  wellKnownName: string | null; // inbox | sentitems | drafts | deleteditems | junkemail | archive
}

/** Parameters for sending an email */
export interface SendEmailParams {
  to: { name?: string; address: string }[];
  cc?: { name?: string; address: string }[];
  bcc?: { name?: string; address: string }[];
  subject: string;
  bodyHtml: string;
  attachments?: { name: string; contentType: string; data: string }[];
  importance?: "normal" | "high" | "low";
  inReplyTo?: string;
  references?: string;
}

/** Options for fetching emails */
export interface FetchEmailsOptions {
  top?: number;
  skip?: number;
  cursor?: string;
  filter?: "unread" | "starred" | "attachments";
  label?: string;
}

/**
 * Email provider interface — all providers must implement this.
 * Each method takes userId and accountId to identify the account.
 */
export interface EmailProvider {
  readonly type: ProviderType;

  // Folder operations
  fetchFolders(userId: string, accountId: string): Promise<NormalizedFolder[]>;
  syncFolders(userId: string, accountId: string): Promise<NormalizedFolder[]>;

  // Email fetching
  fetchEmails(
    userId: string,
    accountId: string,
    folderId: string,
    options?: FetchEmailsOptions
  ): Promise<{ emails: NormalizedEmail[]; nextCursor?: string }>;
  fetchMessage(
    userId: string,
    accountId: string,
    messageId: string
  ): Promise<NormalizedEmail>;

  // Email mutations
  sendEmail(
    userId: string,
    accountId: string,
    params: SendEmailParams
  ): Promise<void>;
  markRead(
    userId: string,
    accountId: string,
    messageId: string,
    isRead: boolean
  ): Promise<void>;
  flagMessage(
    userId: string,
    accountId: string,
    messageId: string,
    flagged: boolean
  ): Promise<void>;
  moveMessage(
    userId: string,
    accountId: string,
    messageId: string,
    destFolderId: string
  ): Promise<void>;
  deleteMessage(
    userId: string,
    accountId: string,
    messageId: string
  ): Promise<void>;

  // Search
  searchEmails(
    userId: string,
    accountId: string,
    query: string,
    folderId?: string
  ): Promise<NormalizedEmail[]>;

  // Sync
  syncEmails(
    userId: string,
    accountId: string,
    folderId: string
  ): Promise<void>;
}
