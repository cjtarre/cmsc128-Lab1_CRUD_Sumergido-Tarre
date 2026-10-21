import { describe, expect, it } from "vitest";
import { getDisplayName, getInitials } from "../../src/shared/utils/userUtils";

describe("userUtils", () => {
    describe("getDisplayName", () => {
        it("prefers a trimmed display name", () => {
            expect(getDisplayName({
                display_name: "  Christie Tarre  ",
                username: "cjtarre",
            })).toBe("Christie Tarre");
        });

        it("falls back to the trimmed username", () => {
            expect(getDisplayName({
                display_name: "   ",
                username: "  cjtarre ",
            })).toBe("cjtarre");
        });

        it("uses the supplied fallback", () => {
            expect(getDisplayName(null, "Unknown")).toBe("Unknown");
        });

        it("uses User as the default fallback", () => {
            expect(getDisplayName({})).toBe("User");
        });
    });

    describe("getInitials", () => {
        it("uses the first letter for a single name", () => {
            expect(getInitials("christie")).toBe("C");
        });

        it("uses first and last initials for multiple names", () => {
            expect(getInitials("Mary Grace Santos")).toBe("MS");
        });

        it("trims whitespace and uppercases initials", () => {
            expect(getInitials("  ma.   tarre  ")).toBe("MT");
        });

        it("returns U for an empty name", () => {
            expect(getInitials("   ")).toBe("U");
            expect(getInitials()).toBe("U");
        });
    });
});
