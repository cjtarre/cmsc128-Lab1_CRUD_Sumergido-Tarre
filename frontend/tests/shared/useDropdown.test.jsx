import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDropdown } from "../../src/shared/hooks/useDropdown";

describe("useDropdown", () => {
    it("starts closed", () => {
        const { result } = renderHook(() => useDropdown());

        expect(result.current.open).toBe(false);
        expect(result.current.ref.current).toBeNull();
    });

    it("toggles and closes the dropdown", () => {
        const { result } = renderHook(() => useDropdown());

        act(() => result.current.toggle());
        expect(result.current.open).toBe(true);

        act(() => result.current.close());
        expect(result.current.open).toBe(false);
    });

    it("runs a selection callback and closes", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDropdown());

        act(() => result.current.toggle());
        act(() => result.current.select(callback));

        expect(callback).toHaveBeenCalledOnce();
        expect(result.current.open).toBe(false);
    });

    it("closes on Escape", () => {
        const { result } = renderHook(() => useDropdown());

        act(() => result.current.toggle());
        act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));

        expect(result.current.open).toBe(false);
    });

    it("closes after an outside click", () => {
        const { result } = renderHook(() => useDropdown());
        const container = document.createElement("div");
        document.body.appendChild(container);

        act(() => {
            result.current.ref.current = container;
            result.current.toggle();
        });

        act(() =>
            document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
        );

        expect(result.current.open).toBe(false);
        container.remove();
    });

    it("stays open after a click inside", () => {
        const { result } = renderHook(() => useDropdown());
        const container = document.createElement("div");
        const child = document.createElement("button");
        container.appendChild(child);
        document.body.appendChild(container);

        act(() => {
            result.current.ref.current = container;
            result.current.toggle();
        });

        act(() =>
            child.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
        );

        expect(result.current.open).toBe(true);
        container.remove();
    });
});
