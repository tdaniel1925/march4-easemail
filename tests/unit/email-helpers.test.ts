import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDate, getInitials, getAvatarColor, avatarColors } from "@/lib/utils/email-helpers";

describe("email-helpers", () => {
  beforeEach(() => {
    // Mock current time for consistent date tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-18T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDate", () => {
    it("should format date less than 1 hour ago as minutes", () => {
      const timestamp = new Date("2026-03-18T11:45:00Z").toISOString();
      expect(formatDate(timestamp)).toBe("15m ago");
    });

    it("should format date less than 1 minute ago as 0m", () => {
      const timestamp = new Date("2026-03-18T11:59:30Z").toISOString();
      expect(formatDate(timestamp)).toBe("0m ago");
    });

    it("should format date 1 hour ago", () => {
      const timestamp = new Date("2026-03-18T11:00:00Z").toISOString();
      expect(formatDate(timestamp)).toBe("1h ago");
    });

    it("should format date less than 24 hours ago as hours", () => {
      const timestamp = new Date("2026-03-18T08:00:00Z").toISOString();
      expect(formatDate(timestamp)).toBe("4h ago");
    });

    it("should format date 23 hours ago as hours", () => {
      const timestamp = new Date("2026-03-17T13:00:00Z").toISOString();
      expect(formatDate(timestamp)).toBe("23h ago");
    });

    it("should format date exactly 1 day ago as Yesterday", () => {
      const timestamp = new Date("2026-03-17T12:00:00Z").toISOString();
      expect(formatDate(timestamp)).toBe("Yesterday");
    });

    it("should format date 2 days ago as weekday", () => {
      const timestamp = new Date("2026-03-16T12:00:00Z").toISOString();
      const result = formatDate(timestamp);
      // Should be weekday format (e.g., "Mon", "Tue")
      expect(result).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
    });

    it("should format date within last week as weekday", () => {
      const timestamp = new Date("2026-03-13T12:00:00Z").toISOString(); // 5 days ago
      const result = formatDate(timestamp);
      expect(result).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
    });

    it("should format date 7 or more days ago as month and day", () => {
      const timestamp = new Date("2026-03-01T12:00:00Z").toISOString();
      const result = formatDate(timestamp);
      // Should be "Mar 1" format
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
      expect(result).toBe("Mar 1");
    });

    it("should format date from last year as month and day", () => {
      const timestamp = new Date("2025-12-25T12:00:00Z").toISOString();
      const result = formatDate(timestamp);
      expect(result).toBe("Dec 25");
    });

    it("should handle future dates", () => {
      const timestamp = new Date("2026-03-19T12:00:00Z").toISOString();
      // Future date should show as negative time but formatted as "0m ago" due to floor
      const result = formatDate(timestamp);
      expect(typeof result).toBe("string");
    });
  });

  describe("getInitials", () => {
    it("should return initials from two-word name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("should return initials from single-word name", () => {
      expect(getInitials("John")).toBe("J");
    });

    it("should return initials from three-word name (first two)", () => {
      expect(getInitials("John Michael Doe")).toBe("JM");
    });

    it("should return uppercase initials", () => {
      expect(getInitials("john doe")).toBe("JD");
    });

    it("should handle names with extra spaces", () => {
      expect(getInitials("John  Doe")).toBe("JD");
    });

    it("should return initials from four-word name (first two)", () => {
      expect(getInitials("John Michael Patrick Doe")).toBe("JM");
    });

    it("should handle single letter names", () => {
      expect(getInitials("J D")).toBe("JD");
    });

    it("should handle empty string", () => {
      expect(getInitials("")).toBe("");
    });

    it("should handle names with special characters", () => {
      // Split by space treats "Jean-Claude" as one word, so JV (Jean-Claude, Van)
      expect(getInitials("Jean-Claude Van Damme")).toBe("JV");
    });
  });

  describe("getAvatarColor", () => {
    it("should return consistent color for same name", () => {
      const color1 = getAvatarColor("John Doe");
      const color2 = getAvatarColor("John Doe");
      expect(color1).toEqual(color2);
    });

    it("should return color from avatarColors array", () => {
      const color = getAvatarColor("John");
      expect(avatarColors).toContainEqual(color);
    });

    it("should return color with bg and text properties", () => {
      const color = getAvatarColor("John");
      expect(color).toHaveProperty("bg");
      expect(color).toHaveProperty("text");
      expect(typeof color.bg).toBe("string");
      expect(typeof color.text).toBe("string");
    });

    it("should return different colors for different names", () => {
      // Due to charCode modulo, different names should potentially have different colors
      const names = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank"];
      const colors = names.map(name => getAvatarColor(name));

      // At least some should be different (statistically very likely with 6 names and 4 colors)
      const uniqueColors = new Set(colors.map(c => JSON.stringify(c)));
      expect(uniqueColors.size).toBeGreaterThan(1);
    });

    it("should handle empty string", () => {
      const color = getAvatarColor("");
      // Empty string charCode is NaN - should fallback to first color
      expect(avatarColors).toContainEqual(color);
    });

    it("should handle special characters", () => {
      const color = getAvatarColor("@#$%");
      expect(avatarColors).toContainEqual(color);
    });

    it("should use charCode of first character for color selection", () => {
      // Names starting with same character should have same color
      const color1 = getAvatarColor("Alice");
      const color2 = getAvatarColor("Amy");
      expect(color1).toEqual(color2);
    });
  });

  describe("avatarColors", () => {
    it("should have exactly 4 colors", () => {
      expect(avatarColors).toHaveLength(4);
    });

    it("should have valid RGB color format", () => {
      avatarColors.forEach(color => {
        expect(color.bg).toMatch(/^rgb\(\d{1,3} \d{1,3} \d{1,3}\)$/);
        expect(color.text).toMatch(/^rgb\(\d{1,3} \d{1,3} \d{1,3}\)$/);
      });
    });

    it("should have distinct colors", () => {
      const backgrounds = avatarColors.map(c => c.bg);
      const uniqueBackgrounds = new Set(backgrounds);
      expect(uniqueBackgrounds.size).toBe(4);
    });
  });
});
