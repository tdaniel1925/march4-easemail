/**
 * Microsoft Graph provider — thin adapter wrapping existing graph.ts and sync modules
 * into the unified EmailProvider interface.
 */
import {
  graphGet,
  graphPost,
  graphPatch,
  graphDelete,
} from "@/lib/microsoft/graph";
import { syncFolders as graphSyncFolders } from "@/lib/sync/folder-sync";
import { syncEmails as graphSyncEmails } from "@/lib/sync/email-sync";
import { prisma } from "@/lib/prisma";
import type {
  EmailProvider,
  NormalizedEmail,
  NormalizedFolder,
  SendEmailParams,
  FetchEmailsOptions,
} from "./types";

interface GraphMessage {
  id: string;
  subject?: string;
  bodyPreview?: string;
  receivedDateTime?: string;
  sentDateTime?: string;
  isRead?: boolean;
  hasAttachments?: boolean;
  flag?: { flagStatus?: string };
  from?: { emailAddress?: { name?: string; address?: string } };
  toRecipients?: { emailAddress?: { name?: string; address?: string } }[];
  ccRecipients?: { emailAddress?: { name?: string; address?: string } }[];
  categories?: string[];
  importance?: string;
  parentFolderId?: string;
  conversationId?: string;
  isDraft?: boolean;
  body?: { content?: string; contentType?: string };
  attachments?: {
    id: string;
    name: string;
    size: number;
    contentType: string;
  }[];
}

interface GraphMessageList {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

interface GraphFolder {
  id: string;
  displayName: string;
  parentFolderId?: string | null;
  unreadItemCount: number;
  totalItemCount: number;
  wellKnownName?: string | null;
}

interface GraphFolderList {
  value: GraphFolder[];
}

function normalizeGraphMessage(m: GraphMessage): NormalizedEmail {
  return {
    id: m.id,
    subject: m.subject ?? "",
    bodyPreview: m.bodyPreview ?? "",
    bodyHtml: m.body?.contentType === "html" ? m.body.content : undefined,
    bodyText: m.body?.contentType === "text" ? m.body.content : undefined,
    receivedDateTime: m.receivedDateTime ?? new Date().toISOString(),
    sentDateTime: m.sentDateTime,
    isRead: m.isRead ?? false,
    hasAttachments: m.hasAttachments ?? false,
    flagStatus: m.flag?.flagStatus === "flagged" ? "flagged" : "notFlagged",
    from: {
      name: m.from?.emailAddress?.name ?? "",
      address: m.from?.emailAddress?.address ?? "",
    },
    toRecipients: (m.toRecipients ?? []).map((r) => ({
      name: r.emailAddress?.name ?? "",
      address: r.emailAddress?.address ?? "",
    })),
    ccRecipients: (m.ccRecipients ?? []).map((r) => ({
      name: r.emailAddress?.name ?? "",
      address: r.emailAddress?.address ?? "",
    })),
    categories: m.categories ?? [],
    importance: (m.importance as "normal" | "high" | "low") ?? "normal",
    folderId: m.parentFolderId ?? "",
    conversationId: m.conversationId,
    isDraft: m.isDraft,
    attachments: m.attachments?.map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      contentType: a.contentType,
    })),
  };
}

export class MicrosoftProvider implements EmailProvider {
  readonly type = "microsoft" as const;

  async fetchFolders(
    userId: string,
    accountId: string
  ): Promise<NormalizedFolder[]> {
    const data = await graphGet<GraphFolderList>(
      userId,
      accountId,
      "/me/mailFolders?$select=id,displayName,parentFolderId,unreadItemCount,totalItemCount&$top=100"
    );
    return (data.value ?? []).map((f) => ({
      id: f.id,
      displayName: f.displayName,
      parentFolderId: f.parentFolderId ?? null,
      unreadCount: f.unreadItemCount ?? 0,
      totalCount: f.totalItemCount ?? 0,
      wellKnownName: f.wellKnownName ?? null,
    }));
  }

  async syncFolders(
    userId: string,
    accountId: string
  ): Promise<NormalizedFolder[]> {
    const refs = await graphSyncFolders(userId, accountId);
    // Return the cached folders after sync
    const folders = await prisma.cachedFolder.findMany({
      where: { userId, homeAccountId: accountId },
    });
    return folders.map((f) => ({
      id: f.id,
      displayName: f.displayName,
      parentFolderId: f.parentFolderId,
      unreadCount: f.unreadCount,
      totalCount: f.totalCount,
      wellKnownName: f.wellKnownName,
    }));
  }

  async fetchEmails(
    userId: string,
    accountId: string,
    folderId: string,
    options?: FetchEmailsOptions
  ): Promise<{ emails: NormalizedEmail[]; nextCursor?: string }> {
    const top = options?.top ?? 50;
    let filterParts: string[] = [];
    if (options?.filter === "unread") filterParts.push("isRead eq false");
    if (options?.filter === "starred")
      filterParts.push("flag/flagStatus eq 'flagged'");
    if (options?.filter === "attachments")
      filterParts.push("hasAttachments eq true");

    let path = `/me/mailFolders/${folderId}/messages?$select=id,subject,bodyPreview,receivedDateTime,sentDateTime,isRead,hasAttachments,flag,from,toRecipients,ccRecipients,categories,importance,parentFolderId,conversationId&$top=${top}&$orderby=receivedDateTime desc`;

    if (filterParts.length > 0) {
      path += `&$filter=${filterParts.join(" and ")}`;
    }

    if (options?.cursor) {
      // cursor is an @odata.nextLink path
      path = options.cursor;
    }

    const data = await graphGet<GraphMessageList>(userId, accountId, path);
    const nextLink = data["@odata.nextLink"];
    const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
    const nextCursor = nextLink
      ? nextLink.startsWith(GRAPH_BASE)
        ? nextLink.slice(GRAPH_BASE.length)
        : nextLink
      : undefined;

    return {
      emails: (data.value ?? []).map(normalizeGraphMessage),
      nextCursor,
    };
  }

  async fetchMessage(
    userId: string,
    accountId: string,
    messageId: string
  ): Promise<NormalizedEmail> {
    const m = await graphGet<GraphMessage>(
      userId,
      accountId,
      `/me/messages/${messageId}?$expand=attachments`
    );
    return normalizeGraphMessage(m);
  }

  async sendEmail(
    userId: string,
    accountId: string,
    params: SendEmailParams
  ): Promise<void> {
    const message: Record<string, unknown> = {
      subject: params.subject,
      body: { contentType: "html", content: params.bodyHtml },
      toRecipients: params.to.map((r) => ({
        emailAddress: { address: r.address, name: r.name ?? "" },
      })),
    };
    if (params.cc?.length) {
      message.ccRecipients = params.cc.map((r) => ({
        emailAddress: { address: r.address, name: r.name ?? "" },
      }));
    }
    if (params.bcc?.length) {
      message.bccRecipients = params.bcc.map((r) => ({
        emailAddress: { address: r.address, name: r.name ?? "" },
      }));
    }
    if (params.importance && params.importance !== "normal") {
      message.importance = params.importance;
    }
    if (params.attachments?.length) {
      message.attachments = params.attachments.map((a) => ({
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: a.name,
        contentType: a.contentType,
        contentBytes: a.data,
      }));
    }

    await graphPost(userId, accountId, "/me/sendMail", {
      message,
      saveToSentItems: true,
    });
  }

  async markRead(
    userId: string,
    accountId: string,
    messageId: string,
    isRead: boolean
  ): Promise<void> {
    await graphPatch(userId, accountId, `/me/messages/${messageId}`, {
      isRead,
    });
  }

  async flagMessage(
    userId: string,
    accountId: string,
    messageId: string,
    flagged: boolean
  ): Promise<void> {
    await graphPatch(userId, accountId, `/me/messages/${messageId}`, {
      flag: { flagStatus: flagged ? "flagged" : "notFlagged" },
    });
  }

  async moveMessage(
    userId: string,
    accountId: string,
    messageId: string,
    destFolderId: string
  ): Promise<void> {
    await graphPost(userId, accountId, `/me/messages/${messageId}/move`, {
      destinationId: destFolderId,
    });
  }

  async deleteMessage(
    userId: string,
    accountId: string,
    messageId: string
  ): Promise<void> {
    await graphDelete(userId, accountId, `/me/messages/${messageId}`);
  }

  async searchEmails(
    userId: string,
    accountId: string,
    query: string
  ): Promise<NormalizedEmail[]> {
    const encodedQuery = encodeURIComponent(query);
    const data = await graphGet<GraphMessageList>(
      userId,
      accountId,
      `/me/messages?$search="${encodedQuery}"&$select=id,subject,bodyPreview,receivedDateTime,sentDateTime,isRead,hasAttachments,flag,from,toRecipients,ccRecipients,categories,importance,parentFolderId,conversationId&$top=25`
    );
    return (data.value ?? []).map(normalizeGraphMessage);
  }

  async syncEmails(
    userId: string,
    accountId: string,
    folderId: string
  ): Promise<void> {
    await graphSyncEmails(userId, accountId, folderId);
  }
}
