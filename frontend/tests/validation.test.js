import { describe, expect, it, vi, afterEach } from "vitest";

import {
    formatDueDate,
    convertToInputDate,
    convertToInputTime,
    formatDueTime,
    getTaskCategory,
} from "../src/shared/utils/dateUtils";

describe("dateUtils", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe("formatDueDate", () => {
        it("returns an empty string when no date is provided", () => {
            expect(formatDueDate("")).toBe("");
        });

        it("returns Today when the date is today", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 8, 21));

            expect(formatDueDate("21/09/2026")).toBe("Today");
        });

        it("formats a valid date", () => {
            expect(formatDueDate("25/12/2026")).toBe("December 25");
        });

        it("returns Invalid date for an invalid date format", () => {
            expect(formatDueDate("2026-12-25")).toBe("Invalid date");
        });
    });

    describe("convertToInputDate", () => {
        it("returns an empty string when no date is provided", () => {
            expect(convertToInputDate("")).toBe("");
        });

        it("converts DD/MM/YYYY to YYYY-MM-DD", () => {
            expect(convertToInputDate("21/09/2026")).toBe("2026-09-21");
        });

        it("pads single-digit day and month", () => {
            expect(convertToInputDate("5/3/2026")).toBe("2026-03-05");
        });

        it("returns an empty string for invalid input", () => {
            expect(convertToInputDate("21/09")).toBe("");
        });
    });

    describe("convertToInputTime", () => {
        it("returns an empty string when no time is provided", () => {
            expect(convertToInputTime("")).toBe("");
        });

        it("returns a 24-hour time unchanged", () => {
            expect(convertToInputTime("14:30")).toBe("14:30");
        });

        it("converts PM time to 24-hour format", () => {
            expect(convertToInputTime("2:30 PM")).toBe("14:30");
        });

        it("converts 12 PM correctly", () => {
            expect(convertToInputTime("12:00 PM")).toBe("12:00");
        });

        it("converts 12 AM correctly", () => {
            expect(convertToInputTime("12:00 AM")).toBe("00:00");
        });

        it("returns an empty string for invalid input", () => {
            expect(convertToInputTime("invalid")).toBe("");
        });
    });

    describe("formatDueTime", () => {
        it("returns an empty string when no time is provided", () => {
            expect(formatDueTime("")).toBe("");
        });

        it("formats a 24-hour time as 12-hour time", () => {
            expect(formatDueTime("14:30")).toBe("2:30 PM");
        });

        it("formats an AM time correctly", () => {
            expect(formatDueTime("09:05")).toBe("9:05 AM");
        });

        it("formats 12 PM correctly", () => {
            expect(formatDueTime("12:00")).toBe("12:00 PM");
        });

        it("formats midnight correctly", () => {
            expect(formatDueTime("00:30")).toBe("12:30 AM");
        });

        it("keeps an already formatted time unchanged", () => {
            expect(formatDueTime("2:30 PM")).toBe("2:30 PM");
        });

        it("returns an empty string for invalid input", () => {
            expect(formatDueTime("invalid")).toBe("");
        });
    });

    describe("getTaskCategory", () => {
        it("returns upcoming when no date is provided", () => {
            expect(getTaskCategory("")).toBe("upcoming");
        });

        it("returns overdue for a past date", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 8, 21));

            expect(getTaskCategory("20/09/2026")).toBe("overdue");
        });

        it("returns today for today's date", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 8, 21));

            expect(getTaskCategory("21/09/2026")).toBe("today");
        });

        it("returns upcoming for a future date", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 8, 21));

            expect(getTaskCategory("22/09/2026")).toBe("upcoming");
        });

        it("returns upcoming for invalid input", () => {
            expect(getTaskCategory("invalid")).toBe("upcoming");
        });
    });
});