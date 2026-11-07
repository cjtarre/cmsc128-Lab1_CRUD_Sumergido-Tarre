import { describe, expect, it } from "vitest";
import { getTagInlineStyle, getTagSwatchStyle } from "../../src/features/tasks/styles/taskStyles";

const luminance = (hex) => {
    const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const linear = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

const contrast = (a, b) => {
    const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (values[0] + 0.05) / (values[1] + 0.05);
};

describe("tag color readability", () => {
    it.each(["#b9e6c2", "#fde68a", "#3b82f6", "#64748b", "#ffffff", "#000000"])(
        "keeps %s text legible on selected and unselected chips", (color) => {
            for (const selected of [true, false]) {
                const style = getTagInlineStyle({ color }, selected);
                expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
            }
        },
    );

    it.each(["#ffffff", "#f7f7f7", "#d1fae5", "#3b82f6", "#000000"])(
        "keeps selection checks legible for swatch %s", (color) => {
            const style = getTagSwatchStyle(color);
            expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
            expect(style.borderColor).toMatch(/^#[0-9a-f]{6}$/i);
        },
    );

    it("keeps a visible outline for white and other very light colors", () => {
        expect(getTagSwatchStyle("#ffffff").borderColor).not.toBe("#ffffff");
    });

    it("renders a selected black tag as a dark chip with white text", () => {
        const style = getTagInlineStyle({ color: "#000000" }, true);
        expect(style.backgroundColor).toBe("#111318");
        expect(style.color).toBe("#ffffff");
        expect(contrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    });

    it("keeps near-black tags visibly dark when unselected", () => {
        const style = getTagInlineStyle({ color: "#101010" }, false);
        expect(style.backgroundColor).toBe("#1c2028");
        expect(style.color).toBe("#ffffff");
    });

    it("uses a safe fallback for invalid stored colors", () => {
        expect(getTagInlineStyle({ color: "not-a-hex" }).color).toMatch(/^#[0-9a-f]{6}$/i);
    });
});
