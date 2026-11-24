import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "../../src/shared/hooks/useIsMobile";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
});

describe("useIsMobile", () => {
    function mockMatchMedia(initialMatches) {
        let listener;
        const media = {
            matches: initialMatches,
            addEventListener: vi.fn((event, callback) => {
                if (event === "change") listener = callback;
            }),
            removeEventListener: vi.fn(),
        };

        window.matchMedia = vi.fn(() => media);

        return {
            media,
            change(matches) {
                act(() => {
                    media.matches = matches;
                    listener?.({ matches });
                });
            },
        };
    }

    it("detects a mobile screen", () => {
        mockMatchMedia(true);
        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
        expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 639px)");
    });

    it("updates when the screen size changes", () => {
        const mock = mockMatchMedia(false);
        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
        mock.change(true);
        expect(result.current).toBe(true);
    });

    it("removes the listener on unmount", () => {
        const mock = mockMatchMedia(false);
        const { unmount } = renderHook(() => useIsMobile());

        unmount();
        expect(mock.media.removeEventListener).toHaveBeenCalledWith(
            "change", expect.any(Function)
        );
    });
});
