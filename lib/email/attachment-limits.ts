export const MAX_TOTAL_ATTACHMENT_BYTES = 25 * 1024 * 1024;

type Base64Attachment = {
  data?: string;
};

export function estimatedAttachmentBytes(attachments: Base64Attachment[]): number {
  return attachments.reduce(
    (total, attachment) =>
      total + (attachment.data ? Math.ceil(attachment.data.length * 0.75) : 0),
    0,
  );
}

export function assertAttachmentTotalWithinLimit(
  attachments: Base64Attachment[],
): void {
  if (estimatedAttachmentBytes(attachments) > MAX_TOTAL_ATTACHMENT_BYTES) {
    throw new Error("Total attachment size exceeds the 25MB limit");
  }
}
