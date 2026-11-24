import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "../../src/features/notifications/utils/formatRelativeTime";

describe("formatRelativeTime", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0));
    });

    afterEach(() => vi.useRealTimers());

    it("returns empty text for missing or invalid dates", () => {
        expect(formatRelativeTime()).toBe("");
        expect(formatRelativeTime("not-a-date")).toBe("");
    });

    it("formats recent times", () => {
        expect(formatRelativeTime(new Date(2026, 9, 21, 11, 59, 30).toISOString())).toBe("Just now");
        expect(formatRelativeTime(new Date(2026, 9, 21, 11, 45).toISOString())).toBe("15m");
        expect(formatRelativeTime(new Date(2026, 9, 21, 9, 0).toISOString())).toBe("3h");
    });

    it("formats yesterday and recent calendar days", () => {
        expect(formatRelativeTime(new Date(2026, 9, 20, 10, 0).toISOString())).toBe("Yesterday");
        expect(formatRelativeTime(new Date(2026, 9, 18, 10, 0).toISOString())).toBe("3d");
    });

    it("formats recent weeks", () => {
        expect(formatRelativeTime(new Date(2026, 9, 7, 10, 0).toISOString())).toBe("2w");
    });

    it("uses a calendar date for older notifications", () => {
        const value = formatRelativeTime(new Date(2026, 7, 1, 10, 0).toISOString());
        expect(value).toContain("Aug");
        expect(value).toContain("1");
    });

    it("includes the year for an older notification from another year", () => {
        expect(formatRelativeTime(new Date(2025, 7, 1).toISOString())).toContain("2025");
    });

    it("treats future timestamps as just now", () => {
        expect(formatRelativeTime(new Date(2026, 9, 21, 13, 0).toISOString())).toBe("Just now");
    });
});
