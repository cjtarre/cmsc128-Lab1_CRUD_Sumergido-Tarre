import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMobileTaskFilters } from "../../src/features/tasks/hooks/useMobileTaskFilters";

describe("useMobileTaskFilters", () => {
    it("starts closed", () => {
        const { result } = renderHook(() => useMobileTaskFilters());
        expect(result.current.isOpen).toBe(false);
        expect(result.current.ref.current).toBeNull();
    });

    it("can be opened and closed", () => {
        const { result } = renderHook(() => useMobileTaskFilters());

        act(() => result.current.setIsOpen(true));
        expect(result.current.isOpen).toBe(true);

        act(() => result.current.setIsOpen(false));
        expect(result.current.isOpen).toBe(false);
    });

    it("closes on Escape", () => {
        const { result } = renderHook(() => useMobileTaskFilters());

        act(() => result.current.setIsOpen(true));
        act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));

        expect(result.current.isOpen).toBe(false);
    });

    it("closes after an outside mouse click", () => {
        const { result } = renderHook(() => useMobileTaskFilters());
        const container = document.createElement("div");
        document.body.appendChild(container);

        act(() => {
            result.current.ref.current = container;
            result.current.setIsOpen(true);
        });

        act(() => document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));

        expect(result.current.isOpen).toBe(false);
        container.remove();
    });

    it("stays open after a click inside the referenced element", () => {
        const { result } = renderHook(() => useMobileTaskFilters());
        const container = document.createElement("div");
        const child = document.createElement("button");
        container.appendChild(child);
        document.body.appendChild(container);

        act(() => {
            result.current.ref.current = container;
            result.current.setIsOpen(true);
        });

        act(() => child.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })));

        expect(result.current.isOpen).toBe(true);
        container.remove();
    });
});
