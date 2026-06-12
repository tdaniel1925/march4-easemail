import { describe, it, expect, beforeAll } from "vitest";
import { formatAddress, parseGraphDateTime } from "@/lib/providers/mime-helpers";
import { detectProviderType } from "@/lib/providers/registry";
import { proxyExternalImages } from "@/lib/utils/proxy-images";

describe("formatAddress (SMTP header injection safety)", () => {
  it("emits a bare address when no display name", () => {
    expect(formatAddress({ address: "a@x.com" })).toBe("a@x.com");
    expect(formatAddress({ name: "", address: "a@x.com" })).toBe("a@x.com");
    expect(formatAddress({ name: null, address: "a@x.com" })).toBe("a@x.com");
  });

  it("quotes a normal display name", () => {
    expect(formatAddress({ name: "Jane Doe", address: "j@x.com" })).toBe('"Jane Doe" <j@x.com>');
  });

  it("escapes double-quotes in the name so it cannot break out of the quoted string", () => {
    // A name like  Evil" <attacker@evil.com>  must not produce a second address.
    const out = formatAddress({ name: 'Evil" <attacker@evil.com>', address: "j@x.com" });
    expect(out).toBe('"Evil\\" <attacker@evil.com>" <j@x.com>');
    // The injected quote is escaped; the only real recipient is j@x.com.
    expect(out.endsWith("<j@x.com>")).toBe(true);
  });

  it("escapes backslashes", () => {
    expect(formatAddress({ name: "a\\b", address: "j@x.com" })).toBe('"a\\\\b" <j@x.com>');
  });
});

describe("parseGraphDateTime (timezone-naive parsing)", () => {
  it("treats an offset-less Graph datetime as UTC (does not shift by local zone)", () => {
    const d = parseGraphDateTime("2026-06-12T10:00:00.0000000");
    expect(d.toISOString()).toBe("2026-06-12T10:00:00.000Z");
  });

  it("respects an explicit Z", () => {
    expect(parseGraphDateTime("2026-06-12T10:00:00Z").toISOString()).toBe("2026-06-12T10:00:00.000Z");
  });

  it("respects an explicit numeric offset", () => {
    // 10:00 at +02:00 == 08:00 UTC
    expect(parseGraphDateTime("2026-06-12T10:00:00+02:00").toISOString()).toBe("2026-06-12T08:00:00.000Z");
  });
});

describe("detectProviderType", () => {
  it("routes by accountId prefix", () => {
    expect(detectProviderType("imap:abc")).toBe("imap");
    expect(detectProviderType("jmap:abc")).toBe("jmap");
    expect(detectProviderType("some-graph-home-account-id")).toBe("microsoft");
  });
});

describe("proxyExternalImages", () => {
  it("rewrites http(s) image src through the proxy", () => {
    const html = '<img src="https://cdn.example.com/a.png">';
    const out = proxyExternalImages(html);
    expect(out).toContain("/api/mail/image-proxy?url=");
    expect(out).toContain(encodeURIComponent("https://cdn.example.com/a.png"));
  });

  it("leaves cid:, data:, blob:, and relative/api URLs untouched", () => {
    for (const src of ["cid:logo123", "data:image/png;base64,AAAA", "blob:abc", "/api/mail/attachments/x", "/local.png"]) {
      const html = `<img src="${src}">`;
      expect(proxyExternalImages(html)).toBe(html);
    }
  });

  it("handles single quotes and multiple images", () => {
    const html = `<img src='https://a.com/1.png'><img src="https://b.com/2.png">`;
    const out = proxyExternalImages(html);
    expect(out).toContain(encodeURIComponent("https://a.com/1.png"));
    expect(out).toContain(encodeURIComponent("https://b.com/2.png"));
  });
});

describe("credential crypto (AES-256-GCM round trip + tamper detection)", () => {
  // crypto.ts reads CREDENTIAL_ENCRYPTION_KEY at call time via getKey().
  beforeAll(() => {
    process.env.CREDENTIAL_ENCRYPTION_KEY =
      process.env.CREDENTIAL_ENCRYPTION_KEY ||
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  it("encrypts then decrypts back to the original", async () => {
    const { encryptCredential, decryptCredential } = await import("@/lib/providers/crypto");
    const secret = "hunter2-imap-password";
    const enc = encryptCredential(secret);
    expect(enc.encrypted).not.toContain(secret);
    expect(decryptCredential(enc.encrypted, enc.iv, enc.tag)).toBe(secret);
  });

  it("uses a fresh IV per encryption (no deterministic ciphertext)", async () => {
    const { encryptCredential } = await import("@/lib/providers/crypto");
    const a = encryptCredential("same-input");
    const b = encryptCredential("same-input");
    expect(a.iv).not.toBe(b.iv);
    expect(a.encrypted).not.toBe(b.encrypted);
  });

  it("rejects a tampered ciphertext (auth tag mismatch throws)", async () => {
    const { encryptCredential, decryptCredential } = await import("@/lib/providers/crypto");
    const enc = encryptCredential("secret");
    const tampered = (enc.encrypted[0] === "a" ? "b" : "a") + enc.encrypted.slice(1);
    expect(() => decryptCredential(tampered, enc.iv, enc.tag)).toThrow();
  });
});
