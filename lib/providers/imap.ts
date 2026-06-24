/**
 * IMAP/SMTP email provider.
 * Uses imapflow for IMAP connections and nodemailer for SMTP sending.
 * Credentials are stored encrypted in the database and decrypted per-operation.
 */
import { ImapFlow } from "imapflow";
import * as nodemailer from "nodemailer";
import { simpleParser, type ParsedMail, type AddressObject } from "mailparser";
import { prisma } from "@/lib/prisma";
import { decryptCredential } from "./crypto";
import { formatAddress } from "./mime-helpers";
import type {
  EmailProvider,
  NormalizedEmail,
  NormalizedFolder,
  SendEmailParams,
  FetchEmailsOptions,
} from "./types";

// IMAP special-use flag → wellKnownName mapping
const SPECIAL_USE_MAP: Record<string, string> = {
  "\\Inbox": "inbox",
  "\\Sent": "sentitems",
  "\\Drafts": "drafts",
  "\\Trash": "deleteditems",
  "\\Junk": "junkemail",
  "\\Archive": "archive",
};

/** Resolve wellKnownName from IMAP special-use flags or folder name */
function resolveWellKnownName(
  specialUse: string | undefined,
  path: string
): string | null {
  if (specialUse && SPECIAL_USE_MAP[specialUse]) {
    return SPECIAL_USE_MAP[specialUse];
  }
  const lower = path.toLowerCase();
  if (lower === "inbox") return "inbox";
  if (lower.includes("sent")) return "sentitems";
  if (lower.includes("draft")) return "drafts";
  if (lower.includes("trash") || lower.includes("deleted")) return "deleteditems";
  if (lower.includes("junk") || lower.includes("spam")) return "junkemail";
  if (lower.includes("archive")) return "archive";
  return null;
}

/** Get IMAP account credentials from DB */
async function getImapAccount(userId: string, accountId: string) {
  const account = await prisma.imapConnectedAccount.findFirst({
    where: { userId, accountId },
  });
  if (!account) throw new Error(`IMAP account not found: ${accountId}`);
  return account;
}

/** Create an ImapFlow client for the given account */
async function createImapClient(
  userId: string,
  accountId: string
): Promise<{ client: ImapFlow; account: Awaited<ReturnType<typeof getImapAccount>> }> {
  const account = await getImapAccount(userId, accountId);
  const password = decryptCredential(
    account.encryptedPassword,
    account.encryptionIv,
    account.encryptionTag
  );

  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapSecurity === "tls",
    // For STARTTLS, enforce certificate validation so a plaintext/MITM
    // downgrade is impossible.
    ...(account.imapSecurity === "starttls"
      ? { tls: { rejectUnauthorized: true } }
      : {}),
    auth: {
      user: account.email,
      pass: password,
    },
    logger: false,
  });

  await client.connect();
  return { client, account };
}

/** Create a nodemailer transport for SMTP sending */
async function createSmtpTransport(userId: string, accountId: string) {
  const account = await getImapAccount(userId, accountId);
  const password = decryptCredential(
    account.encryptedPassword,
    account.encryptionIv,
    account.encryptionTag
  );

  return nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSecurity === "tls",
    // For STARTTLS, require the TLS upgrade and validate certificates so a
    // plaintext downgrade is impossible.
    ...(account.smtpSecurity === "starttls"
      ? { requireTLS: true, tls: { rejectUnauthorized: true } }
      : {}),
    auth: {
      user: account.email,
      pass: password,
    },
  });
}

/** Generate a unique CachedEmail ID for IMAP messages */
function imapEmailId(accountId: string, folderPath: string, uid: number): string {
  return `${accountId}:${folderPath}:${uid}`;
}

/** Generate a unique CachedFolder ID for IMAP folders */
function imapFolderId(accountId: string, folderPath: string): string {
  return `${accountId}:${folderPath}`;
}

/**
 * formatAddress (SMTP header recipient formatting) lives in ./mime-helpers —
 * pure and unit-tested for header-injection safety.
 */

/** Extract recipients from an AddressObject */
function extractRecipients(
  addr: AddressObject | AddressObject[] | undefined
): { name: string; address: string }[] {
  if (!addr) return [];
  const addrs = Array.isArray(addr) ? addr : [addr];
  return addrs.flatMap((a) =>
    a.value.map((v) => ({
      name: v.name ?? "",
      address: v.address ?? "",
    }))
  );
}

/** Max size of an inline image we embed as base64 in a message response */
const MAX_INLINE_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** Convert parsed mail to NormalizedEmail */
function parsedToNormalized(
  parsed: ParsedMail,
  flags: Set<string>,
  uid: number,
  accountId: string,
  folderPath: string,
  folderId: string,
  // When true (single-message fetch only), inline image parts carry their
  // base64 content so the API layer can embed them as data: URIs. The
  // attachment download route cannot fetch IMAP parts by id, so this is the
  // only way cid: images can render. Never enabled for list fetches.
  includeInlineContent = false
): NormalizedEmail {
  return {
    id: imapEmailId(accountId, folderPath, uid),
    subject: parsed.subject ?? "",
    bodyPreview: (parsed.text ?? "").slice(0, 255),
    bodyHtml: typeof parsed.html === "string" ? parsed.html : undefined,
    bodyText: parsed.text ?? undefined,
    receivedDateTime: (parsed.date ?? new Date()).toISOString(),
    sentDateTime: parsed.date?.toISOString(),
    isRead: flags.has("\\Seen"),
    hasAttachments: (parsed.attachments?.length ?? 0) > 0,
    flagStatus: flags.has("\\Flagged") ? "flagged" : "notFlagged",
    from: {
      name: parsed.from?.value?.[0]?.name ?? "",
      address: parsed.from?.value?.[0]?.address ?? "",
    },
    toRecipients: extractRecipients(parsed.to),
    ccRecipients: extractRecipients(parsed.cc),
    categories: [],
    importance: "normal",
    folderId,
    attachments: parsed.attachments?.map((att, i) => {
      // mailparser: `cid` is the Content-ID without angle brackets,
      // `related: true` marks inline (multipart/related) parts
      const cid = att.cid ?? att.contentId?.replace(/^<|>$/g, "");
      const isInline = att.related === true || att.contentDisposition === "inline";
      const isImage = (att.contentType ?? "").startsWith("image/");
      const embedContent =
        includeInlineContent &&
        isImage &&
        (isInline || !!cid) &&
        att.content != null &&
        att.content.length <= MAX_INLINE_IMAGE_BYTES;
      return {
        id: `${uid}-att-${i}`,
        name: att.filename ?? "attachment",
        size: att.size ?? 0,
        contentType: att.contentType ?? "application/octet-stream",
        cid,
        isInline,
        ...(embedContent ? { contentBase64: att.content.toString("base64") } : {}),
      };
    }),
  };
}

/**
 * Fetch a single attachment's bytes for the attachment download route.
 *
 * messageId format: "imap:xxx:FOLDER_PATH:UID" (same as fetchMessage).
 * attachmentIndex is the N in the synthetic attachment id "<uid>-att-<N>"
 * generated by parsedToNormalized above — mailparser's attachment order is
 * deterministic for a given raw source, so the index is stable.
 *
 * Mirrors fetchMessage's connection handling: fetches the raw RFC 822 source
 * and extracts the part via mailparser.
 */
export async function fetchAttachment(
  userId: string,
  accountId: string,
  messageId: string,
  attachmentIndex: number
): Promise<{ bytes: Buffer; contentType: string; fileName: string } | null> {
  const parts = messageId.split(":");
  // accountId is "imap:xxx", so parts[0]:parts[1] = accountId
  const folderPath = parts.slice(2, -1).join(":");
  const uid = parseInt(parts[parts.length - 1], 10);
  if (!folderPath || !Number.isFinite(uid) || attachmentIndex < 0) return null;

  const { client } = await createImapClient(userId, accountId);
  try {
    const lock = await client.getMailboxLock(folderPath);
    try {
      const fetchResult = client.fetch(String(uid), {
        uid: true,
        source: true,
      }, { uid: true });

      for await (const msg of fetchResult) {
        if (!msg.source) continue;
        const parsed = await simpleParser(msg.source as Buffer);
        const att = parsed.attachments?.[attachmentIndex];
        if (!att || att.content == null) return null;
        return {
          bytes: att.content,
          contentType: att.contentType ?? "application/octet-stream",
          fileName: att.filename ?? "attachment",
        };
      }

      return null;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export class ImapProvider implements EmailProvider {
  readonly type = "imap" as const;

  async fetchFolders(
    userId: string,
    accountId: string
  ): Promise<NormalizedFolder[]> {
    const { client } = await createImapClient(userId, accountId);
    try {
      const mailboxes = await client.list();
      return mailboxes.map((mb) => ({
        id: imapFolderId(accountId, mb.path),
        displayName: mb.name,
        parentFolderId: mb.parentPath
          ? imapFolderId(accountId, mb.parentPath)
          : null,
        unreadCount: 0,
        totalCount: 0,
        wellKnownName: resolveWellKnownName(mb.specialUse, mb.path),
      }));
    } finally {
      await client.logout();
    }
  }

  async syncFolders(
    userId: string,
    accountId: string
  ): Promise<NormalizedFolder[]> {
    const { client } = await createImapClient(userId, accountId);
    try {
      const mailboxes = await client.list();
      const folders: NormalizedFolder[] = [];

      for (const mb of mailboxes) {
        const fId = imapFolderId(accountId, mb.path);
        let unreadCount = 0;
        let totalCount = 0;
        try {
          const status = await client.status(mb.path, {
            messages: true,
            unseen: true,
          });
          unreadCount = status.unseen ?? 0;
          totalCount = status.messages ?? 0;
        } catch {
          // Some folders may not support STATUS
        }

        const wellKnownName = resolveWellKnownName(mb.specialUse, mb.path);

        await prisma.cachedFolder.upsert({
          where: { id: fId },
          update: {
            displayName: mb.name,
            parentFolderId: mb.parentPath
              ? imapFolderId(accountId, mb.parentPath)
              : null,
            unreadCount,
            totalCount,
            wellKnownName,
            syncedAt: new Date(),
          },
          create: {
            id: fId,
            userId,
            homeAccountId: accountId,
            displayName: mb.name,
            parentFolderId: mb.parentPath
              ? imapFolderId(accountId, mb.parentPath)
              : null,
            unreadCount,
            totalCount,
            wellKnownName,
          },
        });

        folders.push({
          id: fId,
          displayName: mb.name,
          parentFolderId: mb.parentPath
            ? imapFolderId(accountId, mb.parentPath)
            : null,
          unreadCount,
          totalCount,
          wellKnownName,
        });
      }

      return folders;
    } finally {
      await client.logout();
    }
  }

  async fetchEmails(
    userId: string,
    accountId: string,
    folderId: string,
    options?: FetchEmailsOptions
  ): Promise<{ emails: NormalizedEmail[]; nextCursor?: string }> {
    const folderPath = folderId.replace(`${accountId}:`, "");
    const top = options?.top ?? 50;

    const { client } = await createImapClient(userId, accountId);
    try {
      const lock = await client.getMailboxLock(folderPath);
      try {
        // Build search query based on filter
        let searchQuery: Record<string, unknown> = { all: true };
        if (options?.filter === "unread") searchQuery = { unseen: true };
        if (options?.filter === "starred") searchQuery = { flagged: true };

        const searchResult = await client.search(searchQuery, { uid: true });
        const uids = Array.isArray(searchResult) ? searchResult : [];

        // Sort UIDs descending (newest first) and paginate.
        // The cursor is the last-returned UID, encoded as "uid:<n>". UIDs are
        // stable and monotonically assigned, so paging by "strictly less than
        // the cursor UID" stays correct even when new mail arrives between
        // pages (an index offset would duplicate or skip items). Legacy
        // numeric-offset cursors (or anything unparseable) are treated as
        // page 1 rather than crashing.
        const sortedUids = [...uids].sort((a, b) => b - a);
        let cursorUid: number | null = null;
        if (options?.cursor?.startsWith("uid:")) {
          const parsed = parseInt(options.cursor.slice(4), 10);
          if (Number.isFinite(parsed)) cursorUid = parsed;
        }
        const remainingUids =
          cursorUid !== null
            ? sortedUids.filter((uid) => uid < (cursorUid as number))
            : sortedUids;
        const pageUids = remainingUids.slice(0, top);

        if (pageUids.length === 0) {
          return { emails: [] };
        }

        const emails: NormalizedEmail[] = [];

        for (const uid of pageUids) {
          const fetchResult = client.fetch(String(uid), {
            uid: true,
            envelope: true,
            flags: true,
            bodyStructure: true,
            source: true,
          }, { uid: true });

          for await (const msg of fetchResult) {
            if (!msg.source) continue;
            const parsed = await simpleParser(msg.source as Buffer);
            const flags = msg.flags ?? new Set<string>();

            const email = parsedToNormalized(
              parsed, flags, msg.uid, accountId, folderPath, folderId
            );

            if (options?.filter === "attachments" && !email.hasAttachments) {
              continue;
            }

            emails.push(email);
          }
        }

        const nextCursor =
          remainingUids.length > pageUids.length
            ? `uid:${pageUids[pageUids.length - 1]}`
            : undefined;

        return { emails, nextCursor };
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async fetchMessage(
    userId: string,
    accountId: string,
    messageId: string
  ): Promise<NormalizedEmail> {
    // messageId format: "imap:xxx:FOLDER_PATH:UID"
    const parts = messageId.split(":");
    // accountId is "imap:xxx", so parts[0]:parts[1] = accountId
    const folderPath = parts.slice(2, -1).join(":");
    const uid = parseInt(parts[parts.length - 1], 10);
    const folderId = imapFolderId(accountId, folderPath);

    const { client } = await createImapClient(userId, accountId);
    try {
      const lock = await client.getMailboxLock(folderPath);
      try {
        const fetchResult = client.fetch(String(uid), {
          uid: true,
          envelope: true,
          flags: true,
          source: true,
        }, { uid: true });

        for await (const msg of fetchResult) {
          if (!msg.source) continue;
          const parsed = await simpleParser(msg.source as Buffer);
          const flags = msg.flags ?? new Set<string>();
          return parsedToNormalized(
            parsed, flags, msg.uid, accountId, folderPath, folderId,
            true // single-message fetch: embed inline image content
          );
        }

        throw new Error(`Message not found: uid=${uid} in ${folderPath}`);
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async sendEmail(
    userId: string,
    accountId: string,
    params: SendEmailParams
  ): Promise<void> {
    const account = await getImapAccount(userId, accountId);
    const transport = await createSmtpTransport(userId, accountId);

    const mailOptions: nodemailer.SendMailOptions = {
      from: formatAddress({ name: account.displayName, address: account.email }),
      to: params.to.map(formatAddress),
      subject: params.subject,
      html: params.bodyHtml,
      // One Message-ID shared by the SMTP send and the appended Sent copy so
      // other clients thread the conversation correctly.
      messageId: `<${Date.now()}.${Math.random().toString(36).slice(2)}@${account.email.split("@")[1] ?? "localhost"}>`,
    };

    if (params.cc?.length) {
      mailOptions.cc = params.cc.map(formatAddress);
    }
    if (params.bcc?.length) {
      mailOptions.bcc = params.bcc.map(formatAddress);
    }
    if (params.importance === "high") {
      mailOptions.priority = "high";
    }
    if (params.inReplyTo) {
      mailOptions.inReplyTo = params.inReplyTo;
    }
    if (params.references) {
      mailOptions.references = params.references;
    }
    if (params.attachments?.length) {
      mailOptions.attachments = params.attachments.map((a) => ({
        filename: a.name,
        content: Buffer.from(a.data, "base64"),
        contentType: a.contentType,
      }));
    }

    // Build raw RFC 2822 message using streamTransport so we can IMAP-append to Sent
    let rawMessage: Buffer | undefined;
    try {
      const streamTransport = nodemailer.createTransport({ streamTransport: true, newline: "unix" });
      const buildInfo = await streamTransport.sendMail(mailOptions);
      // nodemailer streamTransport sets info.message to a Readable stream
      const stream = buildInfo.message as unknown as NodeJS.ReadableStream;
      if (stream && typeof stream.pipe === "function") {
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
          stream.on("data", (chunk: Buffer) => chunks.push(chunk));
          stream.on("end", () => { rawMessage = Buffer.concat(chunks); resolve(); });
          stream.on("error", reject);
        });
      }
    } catch {
      // Non-fatal: rawMessage stays undefined, Sent append will be skipped
    }

    try {
      await transport.sendMail(mailOptions);
    } finally {
      transport.close();
    }

    // Append to Sent folder via IMAP so the sent message appears in Sent
    if (rawMessage) {
      try {
        const { client } = await createImapClient(userId, accountId);
        try {
          const mailboxList = await client.list();
          const sentFolder =
            mailboxList.find((mb) => mb.specialUse === "\\Sent") ??
            mailboxList.find((mb) => {
              const p = mb.path.toLowerCase();
              return p === "sent" || p.includes("sent mail") || p.includes("sent items") || p.includes("[gmail]/sent");
            });

          if (sentFolder) {
            await client.append(sentFolder.path, rawMessage, ["\\Seen"]);
          }
        } finally {
          await client.logout();
        }
      } catch {
        // Non-fatal: SMTP send succeeded, IMAP append to Sent is best-effort
      }
    }
  }

  async markRead(
    userId: string,
    accountId: string,
    messageId: string,
    isRead: boolean
  ): Promise<void> {
    const parts = messageId.split(":");
    const folderPath = parts.slice(2, -1).join(":");
    const uid = parseInt(parts[parts.length - 1], 10);

    const { client } = await createImapClient(userId, accountId);
    try {
      const lock = await client.getMailboxLock(folderPath);
      try {
        if (isRead) {
          await client.messageFlagsAdd({ uid }, ["\\Seen"], { uid: true });
        } else {
          await client.messageFlagsRemove({ uid }, ["\\Seen"], { uid: true });
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }

    await prisma.cachedEmail.updateMany({
      where: { id: messageId, userId },
      data: { isRead },
    });
  }

  async flagMessage(
    userId: string,
    accountId: string,
    messageId: string,
    flagged: boolean
  ): Promise<void> {
    const parts = messageId.split(":");
    const folderPath = parts.slice(2, -1).join(":");
    const uid = parseInt(parts[parts.length - 1], 10);

    const { client } = await createImapClient(userId, accountId);
    try {
      const lock = await client.getMailboxLock(folderPath);
      try {
        if (flagged) {
          await client.messageFlagsAdd({ uid }, ["\\Flagged"], { uid: true });
        } else {
          await client.messageFlagsRemove({ uid }, ["\\Flagged"], { uid: true });
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }

    await prisma.cachedEmail.updateMany({
      where: { id: messageId, userId },
      data: { flagStatus: flagged ? "flagged" : "notFlagged" },
    });
  }

  async moveMessage(
    userId: string,
    accountId: string,
    messageId: string,
    destFolderId: string
  ): Promise<void> {
    const parts = messageId.split(":");
    const srcFolderPath = parts.slice(2, -1).join(":");
    const uid = parseInt(parts[parts.length - 1], 10);
    const destFolderPath = destFolderId.replace(`${accountId}:`, "");

    const { client } = await createImapClient(userId, accountId);
    try {
      const lock = await client.getMailboxLock(srcFolderPath);
      try {
        await client.messageMove({ uid }, destFolderPath, { uid: true });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }

    await prisma.cachedEmail.deleteMany({
      where: { id: messageId, userId },
    });
  }

  async createFolder(
    userId: string,
    accountId: string,
    displayName: string,
    parentFolderId?: string | null
  ): Promise<{ id: string; displayName: string; parentFolderId: string | null }> {
    // Folder ids in this provider are `${accountId}:${mailboxPath}`.
    const parentPath = parentFolderId ? parentFolderId.replace(`${accountId}:`, "") : null;
    const { client } = await createImapClient(userId, accountId);
    let path = displayName;
    try {
      // Nest under the parent using the server's hierarchy delimiter.
      if (parentPath) {
        const list = await client.list();
        const delim = list.find((mb) => mb.path === parentPath)?.delimiter ?? "/";
        path = `${parentPath}${delim}${displayName}`;
      }
      await client.mailboxCreate(path);
    } finally {
      await client.logout();
    }
    return { id: `${accountId}:${path}`, displayName, parentFolderId: parentFolderId ?? null };
  }

  async forwardMessage(
    userId: string,
    accountId: string,
    messageId: string,
    toAddress: string
  ): Promise<void> {
    const original = await this.fetchMessage(userId, accountId, messageId);
    const account = await getImapAccount(userId, accountId);
    const transport = await createSmtpTransport(userId, accountId);
    const fromLine = `${original.from?.name ?? ""} <${original.from?.address ?? ""}>`.trim();
    const attribution =
      `<br><br>---------- Forwarded message ----------<br>` +
      `From: ${fromLine}<br>Subject: ${original.subject ?? ""}<br><br>`;
    await transport.sendMail({
      from: formatAddress({ name: account.displayName, address: account.email }),
      to: toAddress,
      subject: `Fwd: ${original.subject ?? ""}`,
      html: `${attribution}${original.bodyHtml ?? original.bodyText ?? ""}`,
    });
  }

  async addCategories(
    userId: string,
    accountId: string,
    messageId: string,
    categories: string[]
  ): Promise<void> {
    // IMAP has no categories; map labels onto IMAP keywords (custom flags).
    const parts = messageId.split(":");
    const folderPath = parts.slice(2, -1).join(":");
    const uid = parseInt(parts[parts.length - 1], 10);
    const { client } = await createImapClient(userId, accountId);
    try {
      const lock = await client.getMailboxLock(folderPath);
      try {
        await client.messageFlagsAdd({ uid }, categories, { uid: true });
      } catch {
        // Server may reject arbitrary keywords; non-fatal.
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
    const row = await prisma.cachedEmail.findFirst({ where: { id: messageId, userId }, select: { categories: true } });
    const existing = Array.isArray(row?.categories) ? (row!.categories as string[]) : [];
    const merged = Array.from(new Set([...existing, ...categories]));
    await prisma.cachedEmail.updateMany({ where: { id: messageId, userId }, data: { categories: merged } });
  }

  async deleteMessage(
    userId: string,
    accountId: string,
    messageId: string
  ): Promise<void> {
    const parts = messageId.split(":");
    const folderPath = parts.slice(2, -1).join(":");
    const uid = parseInt(parts[parts.length - 1], 10);

    const { client } = await createImapClient(userId, accountId);
    try {
      // Find Trash folder — move to trash rather than hard-delete
      const mailboxList = await client.list();
      const trashFolder =
        mailboxList.find((mb) => mb.specialUse === "\\Trash") ??
        mailboxList.find((mb) => {
          const p = mb.path.toLowerCase();
          return p.includes("trash") || p.includes("deleted");
        });

      const lock = await client.getMailboxLock(folderPath);
      try {
        if (trashFolder && trashFolder.path !== folderPath) {
          // Move to trash
          await client.messageMove({ uid }, trashFolder.path, { uid: true });
        } else {
          // Already in trash or no trash folder — hard delete
          await client.messageFlagsAdd({ uid }, ["\\Deleted"], { uid: true });
          await client.messageDelete({ uid }, { uid: true });
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }

    await prisma.cachedEmail.deleteMany({
      where: { id: messageId, userId },
    });
  }

  async searchEmails(
    userId: string,
    accountId: string,
    query: string,
    folderId?: string
  ): Promise<NormalizedEmail[]> {
    const folderPath = folderId
      ? folderId.replace(`${accountId}:`, "")
      : "INBOX";
    const targetFolderId = folderId ?? imapFolderId(accountId, folderPath);

    const { client } = await createImapClient(userId, accountId);
    try {
      const lock = await client.getMailboxLock(folderPath);
      try {
        // Search subject and from separately, merge results (IMAP OR can be unreliable)
        const subjectUids = await client.search({ subject: query }, { uid: true }).catch(() => [] as number[]);
        const fromUids = await client.search({ from: query }, { uid: true }).catch(() => [] as number[]);
        const subjectArr = Array.isArray(subjectUids) ? subjectUids : [];
        const fromArr = Array.isArray(fromUids) ? fromUids : [];
        const mergedSet = new Set([...subjectArr, ...fromArr]);
        const searchResult = Array.from(mergedSet);
        const uids = Array.isArray(searchResult) ? searchResult : [];
        const sortedUids = [...uids].sort((a, b) => b - a).slice(0, 25);
        const emails: NormalizedEmail[] = [];

        for (const uid of sortedUids) {
          const fetchResult = client.fetch(String(uid), {
            uid: true,
            envelope: true,
            flags: true,
            source: true,
          }, { uid: true });

          for await (const msg of fetchResult) {
            if (!msg.source) continue;
            const parsed = await simpleParser(msg.source as Buffer);
            const flags = msg.flags ?? new Set<string>();
            emails.push(
              parsedToNormalized(
                parsed, flags, msg.uid, accountId, folderPath, targetFolderId
              )
            );
          }
        }

        return emails;
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async syncEmails(
    userId: string,
    accountId: string,
    folderId: string
  ): Promise<void> {
    const folderPath = folderId.replace(`${accountId}:`, "");
    const account = await getImapAccount(userId, accountId);

    const { client } = await createImapClient(userId, accountId);
    try {
      const lock = await client.getMailboxLock(folderPath);
      try {
        const mailbox = client.mailbox;
        if (!mailbox) throw new Error(`Failed to open mailbox: ${folderPath}`);

        const currentUidValidity = Number(mailbox.uidValidity);
        const storedValidity = (account.uidValidity as Record<string, number>)[folderPath];

        // Check UIDVALIDITY — if changed, full re-sync needed
        if (storedValidity && storedValidity !== currentUidValidity) {
          await prisma.cachedEmail.deleteMany({
            where: { userId, homeAccountId: accountId, folderId },
          });
        }

        // Get all current UIDs
        const searchResult = await client.search({ all: true }, { uid: true });
        const allUids = Array.isArray(searchResult) ? searchResult : [];

        // Get cached UIDs
        const cachedEmails = await prisma.cachedEmail.findMany({
          where: { userId, homeAccountId: accountId, folderId },
          select: { id: true, isRead: true, flagStatus: true },
        });
        const cachedUids = new Set(
          cachedEmails.map((e) => {
            const idParts = e.id.split(":");
            return parseInt(idParts[idParts.length - 1], 10);
          })
        );

        // Find new UIDs (not in cache)
        const newUids = allUids.filter((uid) => !cachedUids.has(uid));
        // Find deleted UIDs (in cache but not on server)
        const serverUidSet = new Set(allUids);
        const deletedIds = cachedEmails
          .filter((e) => {
            const idParts = e.id.split(":");
            const uid = parseInt(idParts[idParts.length - 1], 10);
            return !serverUidSet.has(uid);
          })
          .map((e) => e.id);

        // Delete removed messages from cache
        if (deletedIds.length > 0) {
          await prisma.cachedEmail.deleteMany({
            where: { id: { in: deletedIds }, userId },
          });
        }

        // Refresh flags on already-cached messages so read/star changes made
        // in other clients propagate (FLAGS-only fetch is cheap)
        const existingUids = allUids.filter((uid) => cachedUids.has(uid));
        if (existingUids.length > 0) {
          const cachedById = new Map(cachedEmails.map((e) => [e.id, e]));
          try {
            const flagsFetch = client.fetch(
              existingUids.join(","),
              { uid: true, flags: true },
              { uid: true }
            );
            for await (const msg of flagsFetch) {
              const flags = msg.flags ?? new Set<string>();
              const emailId = imapEmailId(accountId, folderPath, msg.uid);
              const cached = cachedById.get(emailId);
              if (!cached) continue;

              const isRead = flags.has("\\Seen");
              const flagStatus = flags.has("\\Flagged") ? "flagged" : "notFlagged";
              if (cached.isRead !== isRead || cached.flagStatus !== flagStatus) {
                await prisma.cachedEmail.updateMany({
                  where: { id: emailId, userId },
                  data: { isRead, flagStatus, syncedAt: new Date() },
                });
              }
            }
          } catch {
            // Non-fatal: flag refresh is best-effort
          }
        }

        // Whether this folder is the Sent folder — only sent messages carry a
        // sentDateTime (voice-profile detection relies on it)
        const folderRecord = await prisma.cachedFolder.findFirst({
          where: { id: folderId, userId },
          select: { wellKnownName: true },
        });
        const isSentFolder =
          (folderRecord?.wellKnownName ??
            resolveWellKnownName(undefined, folderPath)) === "sentitems";

        // Fetch new messages (newest first, limit batch size)
        const sortedNewUids = newUids.sort((a, b) => b - a).slice(0, 200);

        for (const uid of sortedNewUids) {
          try {
            const fetchResult = client.fetch(String(uid), {
              uid: true,
              envelope: true,
              flags: true,
              source: true,
            }, { uid: true });

            for await (const msg of fetchResult) {
              if (!msg.source) continue;
              const parsed = await simpleParser(msg.source as Buffer);
              const flags = msg.flags ?? new Set<string>();
              const emailId = imapEmailId(accountId, folderPath, msg.uid);

              await prisma.cachedEmail.upsert({
                where: { id: emailId },
                update: {
                  isRead: flags.has("\\Seen"),
                  flagStatus: flags.has("\\Flagged") ? "flagged" : "notFlagged",
                  syncedAt: new Date(),
                },
                create: {
                  id: emailId,
                  userId,
                  homeAccountId: accountId,
                  folderId,
                  subject: parsed.subject ?? "",
                  bodyPreview: (parsed.text ?? "").slice(0, 255),
                  fromName: parsed.from?.value?.[0]?.name ?? "",
                  fromAddress: parsed.from?.value?.[0]?.address ?? "",
                  toRecipients: JSON.parse(
                    JSON.stringify(extractRecipients(parsed.to))
                  ),
                  receivedDateTime: parsed.date ?? new Date(),
                  sentDateTime: isSentFolder ? parsed.date ?? null : null,
                  isRead: flags.has("\\Seen"),
                  hasAttachments: (parsed.attachments?.length ?? 0) > 0,
                  flagStatus: flags.has("\\Flagged") ? "flagged" : "notFlagged",
                  categories: [],
                },
              });
            }
          } catch {
            // Skip individual message failures
          }
        }

        // Update UIDVALIDITY
        const updatedValidity = {
          ...(account.uidValidity as Record<string, number>),
          [folderPath]: currentUidValidity,
        };
        await prisma.imapConnectedAccount.updateMany({
          where: { userId, accountId },
          data: {
            uidValidity: updatedValidity as unknown as Record<string, number>,
          },
        });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }
}
