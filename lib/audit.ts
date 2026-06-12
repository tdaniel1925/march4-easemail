import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

/**
 * Append-only audit logging for security/compliance.
 *
 * Design rules:
 * - Fire-and-forget: a failure to write an audit row must NEVER break or slow
 *   the user action. All writes are best-effort and swallow errors.
 * - Never log sensitive content: no email bodies, passwords, tokens, or full
 *   request payloads. Metadata is small, structured, non-sensitive context.
 * - Append-only: the app only ever inserts. No update/delete paths exist.
 */

export type AuditAction =
  | "auth.signin"
  | "auth.signout"
  | "auth.oauth_callback"
  | "account.connect"
  | "account.disconnect"
  | "account.set_default"
  | "email.send"
  | "email.send_scheduled"
  | "email.delete"
  | "email.permanent_delete"
  | "draft.delete"
  | "rule.create"
  | "rule.delete"
  | "signature.create"
  | "signature.delete"
  | "admin.signature_assign"
  | "admin.signature_delete"
  | "settings.update"
  | "contact.delete"
  | (string & {}); // allow new actions without a type change

export interface AuditInput {
  action: AuditAction;
  userId?: string | null;
  orgId?: string | null;
  actorEmail?: string | null;
  target?: string | null;
  metadata?: Record<string, unknown> | null;
  req?: NextRequest | Request | null;
}

function clientIp(req?: NextRequest | Request | null): string | null {
  if (!req) return null;
  const h = req.headers;
  // Vercel/proxies set x-forwarded-for; take the first hop.
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  return h.get("x-real-ip")?.slice(0, 64) ?? null;
}

/**
 * Records an audit event. Returns a promise that always resolves (never
 * rejects). Callers may `void audit(...)` to avoid blocking the response.
 */
export async function audit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        userId: input.userId ?? null,
        orgId: input.orgId ?? null,
        actorEmail: input.actorEmail ?? null,
        target: input.target ?? null,
        metadata: (input.metadata ?? undefined) as object | undefined,
        ip: clientIp(input.req),
        userAgent: input.req?.headers.get("user-agent")?.slice(0, 256) ?? null,
      },
    });
  } catch (err) {
    // Never propagate — audit must not break the user action.
    console.error("[audit] failed to write audit log:", err);
  }
}
