import { describe, expect, it } from "vitest";
import {
  MAX_TOTAL_ATTACHMENT_BYTES,
  assertAttachmentTotalWithinLimit,
  estimatedAttachmentBytes,
} from "@/lib/email/attachment-limits";

describe("attachment aggregate limits", () => {
  it("adds the decoded size of every attachment", () => {
    expect(estimatedAttachmentBytes([{ data: "AAAA" }, { data: "AAAAAAAA" }])).toBe(9);
  });

  it("accepts the aggregate limit and rejects larger payloads", () => {
    const atLimit = "A".repeat(Math.floor(MAX_TOTAL_ATTACHMENT_BYTES / 0.75));
    expect(() => assertAttachmentTotalWithinLimit([{ data: atLimit }])).not.toThrow();
    expect(() =>
      assertAttachmentTotalWithinLimit([{ data: atLimit }, { data: "AAAA" }]),
    ).toThrow("25MB");
  });
});
