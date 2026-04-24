/**
 * JMAP email provider.
 * Implements the JMAP protocol (RFC 8620/8621) using native fetch().
 * Primary target: Fastmail. Also supports generic JMAP servers.
 */
import { prisma } from "@/lib/prisma";
import { decryptCredential } from "./crypto";
import type {
  EmailProvider,
  NormalizedEmail,
  NormalizedFolder,
  SendEmailParams,
  FetchEmailsOptions,
} from "./types";

// JMAP role → wellKnownName mapping
const JMAP_ROLE_MAP: Record<string, string> = {
  inbox: "inbox",
  sent: "sentitems",
  drafts: "drafts",
  trash: "deleteditems",
  junk: "junkemail",
  archive: "archive",
};

// ─── JMAP Types ──────────────────────────────────────────────────────────────

interface JmapSession {
  apiUrl: string;
  downloadUrl: string;
  uploadUrl: string;
  accounts: Record<string, { name: string; isPersonal: boolean }>;
  primaryAccounts: Record<string, string>;
}

interface JmapResponse {
  methodResponses: [string, Record<string, unknown>, string][];
  sessionState?: string;
}

interface JmapMailbox {
  id: string;
  name: string;
  parentId: string | null;
  role: string | null;
  totalEmails: number;
  unreadEmails: number;
  sortOrder: number;
}

interface JmapEmail {
  id: string;
  blobId: string;
  threadId: string;
  mailboxIds: Record<string, boolean>;
  keywords: Record<string, boolean>;
  subject: string;
  preview: string;
  from: { name: string; email: string }[] | null;
  to: { name: string; email: string }[] | null;
  cc: { name: string; email: string }[] | null;
  bcc: { name: string; email: string }[] | null;
  receivedAt: string;
  sentAt: string | null;
  hasAttachment: boolean;
  htmlBody?: { blobId: string; type: string }[];
  textBody?: { blobId: string; type: string }[];
  bodyValues?: Record<string, { value: string; isEncodingProblem: boolean }>;
  attachments?: { blobId: string; name: string; size: number; type: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getJmapAccount(userId: string, accountId: string) {
  const account = await prisma.jmapConnectedAccount.findFirst({
    where: { userId, accountId },
  });
  if (!account) throw new Error(`JMAP account not found: ${accountId}`);
  return account;
}

async function getJmapSession(
  sessionUrl: string,
  token: string
): Promise<JmapSession> {
  const res = await fetch(sessionUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`JMAP session fetch failed: ${res.status}`);
  }
  return res.json() as Promise<JmapSession>;
}

async function jmapCall(
  apiUrl: string,
  token: string,
  jmapAccountId: string,
  methodCalls: [string, Record<string, unknown>, string][]
): Promise<JmapResponse> {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`JMAP API call failed ${res.status}: ${err}`);
  }
  return res.json() as Promise<JmapResponse>;
}

async function getSessionAndToken(userId: string, accountId: string) {
  const account = await getJmapAccount(userId, accountId);
  const token = decryptCredential(
    account.encryptedToken,
    account.encryptionIv,
    account.encryptionTag
  );
  const session = await getJmapSession(account.sessionUrl, token);
  return { account, token, session, jmapAccountId: account.jmapAccountId };
}

function normalizeJmapEmail(
  email: JmapEmail,
  accountId: string
): NormalizedEmail {
  const keywords = email.keywords ?? {};
  const mailboxId = Object.keys(email.mailboxIds ?? {})[0] ?? "";

  return {
    id: `${accountId}:${email.id}`,
    subject: email.subject ?? "",
    bodyPreview: email.preview ?? "",
    bodyHtml: email.bodyValues
      ? Object.values(email.bodyValues)[0]?.value
      : undefined,
    receivedDateTime: email.receivedAt ?? new Date().toISOString(),
    sentDateTime: email.sentAt ?? undefined,
    isRead: !!keywords["$seen"],
    hasAttachments: email.hasAttachment ?? false,
    flagStatus: keywords["$flagged"] ? "flagged" : "notFlagged",
    from: {
      name: email.from?.[0]?.name ?? "",
      address: email.from?.[0]?.email ?? "",
    },
    toRecipients: (email.to ?? []).map((r) => ({
      name: r.name ?? "",
      address: r.email ?? "",
    })),
    ccRecipients: (email.cc ?? []).map((r) => ({
      name: r.name ?? "",
      address: r.email ?? "",
    })),
    bccRecipients: (email.bcc ?? []).map((r) => ({
      name: r.name ?? "",
      address: r.email ?? "",
    })),
    categories: [],
    importance: "normal",
    folderId: `${accountId}:${mailboxId}`,
    isDraft: !!keywords["$draft"],
    attachments: email.attachments?.map((a) => ({
      id: a.blobId,
      name: a.name ?? "attachment",
      size: a.size ?? 0,
      contentType: a.type ?? "application/octet-stream",
    })),
  };
}

// ─── Provider Implementation ─────────────────────────────────────────────────

export class JmapProvider implements EmailProvider {
  readonly type = "jmap" as const;

  async fetchFolders(
    userId: string,
    accountId: string
  ): Promise<NormalizedFolder[]> {
    const { token, session, jmapAccountId } = await getSessionAndToken(
      userId,
      accountId
    );

    const response = await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Mailbox/get",
        {
          accountId: jmapAccountId,
          properties: [
            "id",
            "name",
            "parentId",
            "role",
            "totalEmails",
            "unreadEmails",
            "sortOrder",
          ],
        },
        "0",
      ],
    ]);

    const [, result] = response.methodResponses[0];
    const mailboxes = (result.list as JmapMailbox[]) ?? [];

    return mailboxes.map((mb) => ({
      id: `${accountId}:${mb.id}`,
      displayName: mb.name,
      parentFolderId: mb.parentId ? `${accountId}:${mb.parentId}` : null,
      unreadCount: mb.unreadEmails ?? 0,
      totalCount: mb.totalEmails ?? 0,
      wellKnownName: mb.role ? (JMAP_ROLE_MAP[mb.role] ?? null) : null,
    }));
  }

  async syncFolders(
    userId: string,
    accountId: string
  ): Promise<NormalizedFolder[]> {
    const { token, session, jmapAccountId, account } =
      await getSessionAndToken(userId, accountId);

    const methodCalls: [string, Record<string, unknown>, string][] = [];

    // Use Mailbox/changes if we have a state, otherwise full get
    if (account.mailboxState) {
      methodCalls.push([
        "Mailbox/changes",
        { accountId: jmapAccountId, sinceState: account.mailboxState },
        "0",
      ]);
      methodCalls.push([
        "Mailbox/get",
        {
          accountId: jmapAccountId,
          "#ids": { resultOf: "0", name: "Mailbox/changes", path: "/created" },
          properties: [
            "id",
            "name",
            "parentId",
            "role",
            "totalEmails",
            "unreadEmails",
            "sortOrder",
          ],
        },
        "1",
      ]);
    } else {
      methodCalls.push([
        "Mailbox/get",
        {
          accountId: jmapAccountId,
          properties: [
            "id",
            "name",
            "parentId",
            "role",
            "totalEmails",
            "unreadEmails",
            "sortOrder",
          ],
        },
        "0",
      ]);
    }

    let response: JmapResponse;
    try {
      response = await jmapCall(session.apiUrl, token, jmapAccountId, methodCalls);
    } catch {
      // State invalid — fall back to full sync
      response = await jmapCall(session.apiUrl, token, jmapAccountId, [
        [
          "Mailbox/get",
          {
            accountId: jmapAccountId,
            properties: [
              "id",
              "name",
              "parentId",
              "role",
              "totalEmails",
              "unreadEmails",
              "sortOrder",
            ],
          },
          "0",
        ],
      ]);
    }

    // Find the Mailbox/get response
    const getResponse = response.methodResponses.find(
      ([method]) => method === "Mailbox/get"
    );
    if (!getResponse) throw new Error("No Mailbox/get response from JMAP");

    const [, result] = getResponse;
    const mailboxes = (result.list as JmapMailbox[]) ?? [];
    const newState = result.state as string;

    const folders: NormalizedFolder[] = [];

    for (const mb of mailboxes) {
      const fId = `${accountId}:${mb.id}`;
      const wellKnownName = mb.role ? (JMAP_ROLE_MAP[mb.role] ?? null) : null;

      await prisma.cachedFolder.upsert({
        where: { id: fId },
        update: {
          displayName: mb.name,
          parentFolderId: mb.parentId ? `${accountId}:${mb.parentId}` : null,
          unreadCount: mb.unreadEmails ?? 0,
          totalCount: mb.totalEmails ?? 0,
          wellKnownName,
          syncedAt: new Date(),
        },
        create: {
          id: fId,
          userId,
          homeAccountId: accountId,
          displayName: mb.name,
          parentFolderId: mb.parentId ? `${accountId}:${mb.parentId}` : null,
          unreadCount: mb.unreadEmails ?? 0,
          totalCount: mb.totalEmails ?? 0,
          wellKnownName,
        },
      });

      folders.push({
        id: fId,
        displayName: mb.name,
        parentFolderId: mb.parentId ? `${accountId}:${mb.parentId}` : null,
        unreadCount: mb.unreadEmails ?? 0,
        totalCount: mb.totalEmails ?? 0,
        wellKnownName,
      });
    }

    // Save state for future delta sync
    if (newState) {
      await prisma.jmapConnectedAccount.updateMany({
        where: { userId, accountId },
        data: { mailboxState: newState },
      });
    }

    return folders;
  }

  async fetchEmails(
    userId: string,
    accountId: string,
    folderId: string,
    options?: FetchEmailsOptions
  ): Promise<{ emails: NormalizedEmail[]; nextCursor?: string }> {
    const jmapMailboxId = folderId.replace(`${accountId}:`, "");
    const top = options?.top ?? 50;
    const position = options?.cursor ? parseInt(options.cursor, 10) : 0;

    const { token, session, jmapAccountId } = await getSessionAndToken(
      userId,
      accountId
    );

    // Build filter
    const filter: Record<string, unknown> = { inMailbox: jmapMailboxId };
    if (options?.filter === "unread") {
      filter.notKeyword = "$seen";
    }
    if (options?.filter === "starred") {
      filter.hasKeyword = "$flagged";
    }
    if (options?.filter === "attachments") {
      filter.hasAttachment = true;
    }

    const response = await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/query",
        {
          accountId: jmapAccountId,
          filter,
          sort: [{ property: "receivedAt", isAscending: false }],
          position,
          limit: top,
        },
        "0",
      ],
      [
        "Email/get",
        {
          accountId: jmapAccountId,
          "#ids": { resultOf: "0", name: "Email/query", path: "/ids" },
          properties: [
            "id",
            "threadId",
            "mailboxIds",
            "keywords",
            "subject",
            "preview",
            "from",
            "to",
            "cc",
            "receivedAt",
            "sentAt",
            "hasAttachment",
            "attachments",
          ],
        },
        "1",
      ],
    ]);

    const queryResult = response.methodResponses.find(
      ([method]) => method === "Email/query"
    );
    const getResult = response.methodResponses.find(
      ([method]) => method === "Email/get"
    );

    if (!getResult) throw new Error("No Email/get response from JMAP");

    const queryData = queryResult ? queryResult[1] : {} as Record<string, unknown>;
    const [, emailData] = getResult;
    const jmapEmails = (emailData.list as JmapEmail[]) ?? [];
    const total = ((queryData as Record<string, unknown>).total as number) ?? 0;

    const emails = jmapEmails.map((e) => normalizeJmapEmail(e, accountId));
    const nextPosition = position + top;
    const nextCursor = nextPosition < total ? String(nextPosition) : undefined;

    return { emails, nextCursor };
  }

  async fetchMessage(
    userId: string,
    accountId: string,
    messageId: string
  ): Promise<NormalizedEmail> {
    const jmapEmailId = messageId.replace(`${accountId}:`, "");

    const { token, session, jmapAccountId } = await getSessionAndToken(
      userId,
      accountId
    );

    const response = await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/get",
        {
          accountId: jmapAccountId,
          ids: [jmapEmailId],
          properties: [
            "id",
            "threadId",
            "mailboxIds",
            "keywords",
            "subject",
            "preview",
            "from",
            "to",
            "cc",
            "bcc",
            "receivedAt",
            "sentAt",
            "hasAttachment",
            "attachments",
            "htmlBody",
            "textBody",
            "bodyValues",
          ],
          fetchHTMLBodyValues: true,
          fetchTextBodyValues: true,
        },
        "0",
      ],
    ]);

    const [, result] = response.methodResponses[0];
    const emails = (result.list as JmapEmail[]) ?? [];
    if (emails.length === 0) throw new Error(`JMAP message not found: ${jmapEmailId}`);

    return normalizeJmapEmail(emails[0], accountId);
  }

  async sendEmail(
    userId: string,
    accountId: string,
    params: SendEmailParams
  ): Promise<void> {
    const { token, session, jmapAccountId, account } =
      await getSessionAndToken(userId, accountId);

    // Find the drafts mailbox
    const foldersResponse = await jmapCall(
      session.apiUrl,
      token,
      jmapAccountId,
      [
        [
          "Mailbox/get",
          {
            accountId: jmapAccountId,
            properties: ["id", "role"],
          },
          "0",
        ],
      ]
    );
    const [, folderResult] = foldersResponse.methodResponses[0];
    const mailboxes = (folderResult.list as JmapMailbox[]) ?? [];
    const draftsBox = mailboxes.find((mb) => mb.role === "drafts");
    if (!draftsBox) throw new Error("No drafts mailbox found for JMAP account");

    // Create draft email then submit
    const emailCreate: Record<string, unknown> = {
      mailboxIds: { [draftsBox.id]: true },
      keywords: { $draft: true },
      from: [{ name: account.displayName ?? account.email, email: account.email }],
      to: params.to.map((r) => ({ name: r.name ?? "", email: r.address })),
      subject: params.subject,
      htmlBody: [{ partId: "html", type: "text/html" }],
      bodyValues: { html: { value: params.bodyHtml } },
    };

    if (params.cc?.length) {
      emailCreate.cc = params.cc.map((r) => ({
        name: r.name ?? "",
        email: r.address,
      }));
    }
    if (params.bcc?.length) {
      emailCreate.bcc = params.bcc.map((r) => ({
        name: r.name ?? "",
        email: r.address,
      }));
    }
    if (params.inReplyTo) {
      emailCreate.inReplyTo = [params.inReplyTo];
    }

    // Resolve identity ID (Fastmail uses separate identity IDs from account IDs)
    const identityResponse = await jmapCall(
      session.apiUrl,
      token,
      jmapAccountId,
      [["Identity/get", { accountId: jmapAccountId }, "id"]]
    );
    const [, identityResult] = identityResponse.methodResponses[0];
    const identities = (identityResult.list as { id: string; email: string }[]) ?? [];
    const primaryIdentity = identities.find((i) => i.email === account.email) ?? identities[0];
    if (!primaryIdentity) throw new Error("No JMAP identity found for sending");

    const response = await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/set",
        {
          accountId: jmapAccountId,
          create: { draft: emailCreate },
        },
        "0",
      ],
      [
        "EmailSubmission/set",
        {
          accountId: jmapAccountId,
          create: {
            submission: {
              emailId: "#draft",
              identityId: primaryIdentity.id,
            },
          },
          onSuccessDestroyEmail: ["#submission"],
        },
        "1",
      ],
    ]);

    // Check for errors
    const setResult = response.methodResponses.find(
      ([method]) => method === "Email/set"
    );
    if (setResult) {
      const [, data] = setResult;
      if (data.notCreated) {
        const errors = Object.values(data.notCreated as Record<string, { type: string; description?: string }>);
        if (errors.length > 0) {
          throw new Error(`JMAP send failed: ${errors[0].description ?? errors[0].type}`);
        }
      }
    }
  }

  async markRead(
    userId: string,
    accountId: string,
    messageId: string,
    isRead: boolean
  ): Promise<void> {
    const jmapEmailId = messageId.replace(`${accountId}:`, "");
    const { token, session, jmapAccountId } = await getSessionAndToken(
      userId,
      accountId
    );

    const update: Record<string, unknown> = isRead
      ? { "keywords/$seen": true }
      : { "keywords/$seen": null };

    await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/set",
        {
          accountId: jmapAccountId,
          update: { [jmapEmailId]: update },
        },
        "0",
      ],
    ]);

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
    const jmapEmailId = messageId.replace(`${accountId}:`, "");
    const { token, session, jmapAccountId } = await getSessionAndToken(
      userId,
      accountId
    );

    const update: Record<string, unknown> = flagged
      ? { "keywords/$flagged": true }
      : { "keywords/$flagged": null };

    await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/set",
        {
          accountId: jmapAccountId,
          update: { [jmapEmailId]: update },
        },
        "0",
      ],
    ]);

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
    const jmapEmailId = messageId.replace(`${accountId}:`, "");
    const jmapDestMailboxId = destFolderId.replace(`${accountId}:`, "");
    const { token, session, jmapAccountId } = await getSessionAndToken(
      userId,
      accountId
    );

    // Get current mailbox, then set new one
    const getResponse = await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/get",
        {
          accountId: jmapAccountId,
          ids: [jmapEmailId],
          properties: ["mailboxIds"],
        },
        "0",
      ],
    ]);
    const [, getResult] = getResponse.methodResponses[0];
    const emails = (getResult.list as JmapEmail[]) ?? [];
    if (emails.length === 0) throw new Error("Email not found");

    // Build new mailboxIds — remove old, add new
    const newMailboxIds: Record<string, boolean> = { [jmapDestMailboxId]: true };

    await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/set",
        {
          accountId: jmapAccountId,
          update: { [jmapEmailId]: { mailboxIds: newMailboxIds } },
        },
        "0",
      ],
    ]);

    // Update cache
    await prisma.cachedEmail.updateMany({
      where: { id: messageId, userId },
      data: { folderId: destFolderId },
    });
  }

  async deleteMessage(
    userId: string,
    accountId: string,
    messageId: string
  ): Promise<void> {
    const jmapEmailId = messageId.replace(`${accountId}:`, "");
    const { token, session, jmapAccountId } = await getSessionAndToken(
      userId,
      accountId
    );

    await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/set",
        {
          accountId: jmapAccountId,
          destroy: [jmapEmailId],
        },
        "0",
      ],
    ]);

    await prisma.cachedEmail.deleteMany({
      where: { id: messageId, userId },
    });
  }

  async searchEmails(
    userId: string,
    accountId: string,
    query: string
  ): Promise<NormalizedEmail[]> {
    const { token, session, jmapAccountId } = await getSessionAndToken(
      userId,
      accountId
    );

    const response = await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/query",
        {
          accountId: jmapAccountId,
          filter: { text: query },
          sort: [{ property: "receivedAt", isAscending: false }],
          limit: 25,
        },
        "0",
      ],
      [
        "Email/get",
        {
          accountId: jmapAccountId,
          "#ids": { resultOf: "0", name: "Email/query", path: "/ids" },
          properties: [
            "id",
            "threadId",
            "mailboxIds",
            "keywords",
            "subject",
            "preview",
            "from",
            "to",
            "cc",
            "receivedAt",
            "sentAt",
            "hasAttachment",
          ],
        },
        "1",
      ],
    ]);

    const getResult = response.methodResponses.find(
      ([method]) => method === "Email/get"
    );
    if (!getResult) return [];

    const [, emailData] = getResult;
    const jmapEmails = (emailData.list as JmapEmail[]) ?? [];
    return jmapEmails.map((e) => normalizeJmapEmail(e, accountId));
  }

  async syncEmails(
    userId: string,
    accountId: string,
    folderId: string
  ): Promise<void> {
    const jmapMailboxId = folderId.replace(`${accountId}:`, "");
    const { token, session, jmapAccountId, account } =
      await getSessionAndToken(userId, accountId);

    if (account.emailState) {
      // Delta sync via Email/changes
      try {
        const changesResponse = await jmapCall(
          session.apiUrl,
          token,
          jmapAccountId,
          [
            [
              "Email/changes",
              {
                accountId: jmapAccountId,
                sinceState: account.emailState,
              },
              "0",
            ],
          ]
        );

        const [method, changesResult] = changesResponse.methodResponses[0];
        if (method === "error") {
          // State invalid — fall through to full sync
        } else {
          const created = (changesResult.created as string[]) ?? [];
          const updated = (changesResult.updated as string[]) ?? [];
          const destroyed = (changesResult.destroyed as string[]) ?? [];
          const newState = changesResult.newState as string;

          // Delete destroyed
          if (destroyed.length > 0) {
            const destroyedIds = destroyed.map((id) => `${accountId}:${id}`);
            await prisma.cachedEmail.deleteMany({
              where: { id: { in: destroyedIds }, userId },
            });
          }

          // Fetch created + updated
          const fetchIds = [...created, ...updated];
          if (fetchIds.length > 0) {
            const getResponse = await jmapCall(
              session.apiUrl,
              token,
              jmapAccountId,
              [
                [
                  "Email/get",
                  {
                    accountId: jmapAccountId,
                    ids: fetchIds,
                    properties: [
                      "id",
                      "threadId",
                      "mailboxIds",
                      "keywords",
                      "subject",
                      "preview",
                      "from",
                      "to",
                      "receivedAt",
                      "sentAt",
                      "hasAttachment",
                    ],
                  },
                  "0",
                ],
              ]
            );

            const [, emailData] = getResponse.methodResponses[0];
            const emails = (emailData.list as JmapEmail[]) ?? [];

            for (const email of emails) {
              // Only cache if in our target mailbox
              if (!email.mailboxIds?.[jmapMailboxId]) continue;

              const emailId = `${accountId}:${email.id}`;
              const keywords = email.keywords ?? {};

              await prisma.cachedEmail.upsert({
                where: { id: emailId },
                update: {
                  isRead: !!keywords["$seen"],
                  flagStatus: keywords["$flagged"] ? "flagged" : "notFlagged",
                  syncedAt: new Date(),
                },
                create: {
                  id: emailId,
                  userId,
                  homeAccountId: accountId,
                  folderId,
                  subject: email.subject ?? "",
                  bodyPreview: email.preview ?? "",
                  fromName: email.from?.[0]?.name ?? "",
                  fromAddress: email.from?.[0]?.email ?? "",
                  toRecipients: JSON.parse(
                    JSON.stringify(
                      (email.to ?? []).map((r) => ({
                        name: r.name ?? "",
                        address: r.email ?? "",
                      }))
                    )
                  ),
                  receivedDateTime: new Date(email.receivedAt),
                  sentDateTime: email.sentAt ? new Date(email.sentAt) : null,
                  isRead: !!keywords["$seen"],
                  hasAttachments: email.hasAttachment ?? false,
                  flagStatus: keywords["$flagged"] ? "flagged" : "notFlagged",
                  categories: [],
                },
              });
            }
          }

          // Save new state
          if (newState) {
            await prisma.jmapConnectedAccount.updateMany({
              where: { userId, accountId },
              data: { emailState: newState },
            });
          }

          return;
        }
      } catch {
        // Fall through to full sync
      }
    }

    // Full sync — query all emails in this mailbox
    const response = await jmapCall(session.apiUrl, token, jmapAccountId, [
      [
        "Email/query",
        {
          accountId: jmapAccountId,
          filter: { inMailbox: jmapMailboxId },
          sort: [{ property: "receivedAt", isAscending: false }],
          limit: 200,
        },
        "0",
      ],
      [
        "Email/get",
        {
          accountId: jmapAccountId,
          "#ids": { resultOf: "0", name: "Email/query", path: "/ids" },
          properties: [
            "id",
            "threadId",
            "mailboxIds",
            "keywords",
            "subject",
            "preview",
            "from",
            "to",
            "receivedAt",
            "sentAt",
            "hasAttachment",
          ],
        },
        "1",
      ],
    ]);

    const getResult = response.methodResponses.find(
      ([method]) => method === "Email/get"
    );
    if (!getResult) return;

    const [, emailData] = getResult;
    const emails = (emailData.list as JmapEmail[]) ?? [];
    const queryResult = response.methodResponses.find(
      ([method]) => method === "Email/query"
    );
    const newState = queryResult
      ? (queryResult[1].queryState as string)
      : undefined;

    for (const email of emails) {
      const emailId = `${accountId}:${email.id}`;
      const keywords = email.keywords ?? {};

      await prisma.cachedEmail.upsert({
        where: { id: emailId },
        update: {
          isRead: !!keywords["$seen"],
          flagStatus: keywords["$flagged"] ? "flagged" : "notFlagged",
          syncedAt: new Date(),
        },
        create: {
          id: emailId,
          userId,
          homeAccountId: accountId,
          folderId,
          subject: email.subject ?? "",
          bodyPreview: email.preview ?? "",
          fromName: email.from?.[0]?.name ?? "",
          fromAddress: email.from?.[0]?.email ?? "",
          toRecipients: JSON.parse(
            JSON.stringify(
              (email.to ?? []).map((r) => ({
                name: r.name ?? "",
                address: r.email ?? "",
              }))
            )
          ),
          receivedDateTime: new Date(email.receivedAt),
          sentDateTime: email.sentAt ? new Date(email.sentAt) : null,
          isRead: !!keywords["$seen"],
          hasAttachments: email.hasAttachment ?? false,
          flagStatus: keywords["$flagged"] ? "flagged" : "notFlagged",
          categories: [],
        },
      });
    }

    // Save email state for future delta sync
    if (newState) {
      await prisma.jmapConnectedAccount.updateMany({
        where: { userId, accountId },
        data: { emailState: newState },
      });
    }
  }
}
