import { describe, it, expect } from "vitest";
import { isReauthError } from "@/lib/microsoft/auth-errors";

describe("auth-errors", () => {
  describe("isReauthError", () => {
    it("should return true for REAUTH_REQUIRED error", () => {
      const error = new Error("REAUTH_REQUIRED: Please re-authenticate");
      expect(isReauthError(error)).toBe(true);
    });

    it("should return true for 'not found in MSAL cache' error", () => {
      const error = new Error("Account not found in MSAL cache");
      expect(isReauthError(error)).toBe(true);
    });

    it("should return true for no_tokens_found error", () => {
      const error = new Error("no_tokens_found for this account");
      expect(isReauthError(error)).toBe(true);
    });

    it("should return true for InteractionRequired error", () => {
      const error = new Error("InteractionRequired: User interaction required");
      expect(isReauthError(error)).toBe(true);
    });

    it("should return false for unrelated error messages", () => {
      const error = new Error("Network connection failed");
      expect(isReauthError(error)).toBe(false);
    });

    it("should return false for empty error message", () => {
      const error = new Error("");
      expect(isReauthError(error)).toBe(false);
    });

    it("should handle non-Error objects", () => {
      const errorString = "REAUTH_REQUIRED error occurred";
      expect(isReauthError(errorString)).toBe(true);
    });

    it("should handle null and undefined", () => {
      expect(isReauthError(null)).toBe(false);
      expect(isReauthError(undefined)).toBe(false);
    });

    it("should handle objects without message property", () => {
      const errorObj = { code: 401, status: "unauthorized" };
      expect(isReauthError(errorObj)).toBe(false);
    });

    it("should be case-sensitive", () => {
      const error1 = new Error("reauth_required");
      const error2 = new Error("REAUTH_REQUIRED");
      expect(isReauthError(error1)).toBe(false);
      expect(isReauthError(error2)).toBe(true);
    });

    it("should match multiple error patterns in single message", () => {
      const error = new Error("InteractionRequired: no_tokens_found in cache");
      expect(isReauthError(error)).toBe(true);
    });

    it("should handle error with REAUTH_REQUIRED in middle of message", () => {
      const error = new Error("Something went wrong: REAUTH_REQUIRED please try again");
      expect(isReauthError(error)).toBe(true);
    });

    it("should handle MSAL-specific error formats", () => {
      const error = new Error("ClientAuthError: Account not found in MSAL cache");
      expect(isReauthError(error)).toBe(true);
    });

    it("should return false for similar but different error messages", () => {
      const error1 = new Error("AUTH_REQUIRED");
      const error2 = new Error("tokens_found");
      const error3 = new Error("Interaction");
      const error4 = new Error("not found in cache");

      expect(isReauthError(error1)).toBe(false);
      expect(isReauthError(error2)).toBe(false);
      expect(isReauthError(error3)).toBe(false);
      expect(isReauthError(error4)).toBe(false);
    });
  });
});
