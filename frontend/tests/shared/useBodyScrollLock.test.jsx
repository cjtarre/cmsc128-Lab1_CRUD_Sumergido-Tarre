import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useBodyScrollLock } from "../../src/shared/hooks/useBodyScrollLock";

describe("useBodyScrollLock", () => {
    afterEach(() => {
        document.body.style.overflow = "";
    });

    it("does not change overflow while closed", () => {
        document.body.style.overflow = "auto";

        renderHook(() => useBodyScrollLock(false));

        expect(document.body.style.overflow).toBe("auto");
    });

    it("locks scrolling while open", () => {
        const { unmount } = renderHook(() => useBodyScrollLock(true));

        expect(document.body.style.overflow).toBe("hidden");

        unmount();
        expect(document.body.style.overflow).toBe("");
    });

    it("restores the previous overflow value", () => {
        document.body.style.overflow = "scroll";

        const { unmount } = renderHook(() => useBodyScrollLock(true));

        expect(document.body.style.overflow).toBe("hidden");

        unmount();
        expect(document.body.style.overflow).toBe("scroll");
    });

    it("restores overflow when changing from open to closed", () => {
        document.body.style.overflow = "auto";

        const { rerender } = renderHook(
            ({ open }) => useBodyScrollLock(open),
            { initialProps: { open: true } }
        );

        expect(document.body.style.overflow).toBe("hidden");

        act(() => rerender({ open: false }));

        expect(document.body.style.overflow).toBe("auto");
    });
});
