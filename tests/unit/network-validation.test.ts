import { describe, expect, it } from "vitest";
import {
  validateNetworkHost,
  validateSessionUrl,
} from "@/app/api/accounts/_lib/validate-session-url";

describe("account connection target validation", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.5",
    "169.254.169.254",
    "192.168.1.20",
    "::1",
    "::ffff:10.0.0.5",
    "localhost",
    "mail.internal",
  ])("rejects private or internal host %s", async (host) => {
    await expect(validateNetworkHost(host)).resolves.toMatchObject({ ok: false });
  });

  it("allows a public IP literal", async () => {
    await expect(validateNetworkHost("8.8.8.8")).resolves.toEqual({ ok: true });
  });

  it("requires HTTPS for JMAP session URLs", async () => {
    await expect(
      validateSessionUrl("http://8.8.8.8/jmap/session")
    ).resolves.toMatchObject({ ok: false });
  });
});
