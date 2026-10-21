import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjectWorkspaceTab } from "../../src/features/projects/hooks/useProjectWorkspaceTab";

const setSearchParams = vi.fn();
let currentView = null;

vi.mock("react-router-dom", () => ({
    useSearchParams: () => [
        { get: () => currentView },
        setSearchParams,
    ],
}));

describe("useProjectWorkspaceTab", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        currentView = null;
    });

    it("defaults to overview", () => {
        const { result } = renderHook(() => useProjectWorkspaceTab());
        expect(result.current.activeTab).toBe("overview");
    });

    it("uses a valid requested tab", () => {
        currentView = "board";
        const { result } = renderHook(() => useProjectWorkspaceTab());
        expect(result.current.activeTab).toBe("board");
    });

    it("falls back to overview for an invalid tab", () => {
        currentView = "invalid";
        const { result } = renderHook(() => useProjectWorkspaceTab());
        expect(result.current.activeTab).toBe("overview");
    });

    it("writes non-overview tabs to search params", () => {
        const { result } = renderHook(() => useProjectWorkspaceTab());

        act(() => result.current.setActiveTab("board"));

        expect(setSearchParams).toHaveBeenCalledWith({ view: "board" });
    });

    it("clears search params for overview", () => {
        const { result } = renderHook(() => useProjectWorkspaceTab());

        act(() => result.current.setActiveTab("overview"));

        expect(setSearchParams).toHaveBeenCalledWith({});
    });

    it("ignores invalid tabs", () => {
        const { result } = renderHook(() => useProjectWorkspaceTab());

        act(() => result.current.setActiveTab("invalid"));

        expect(setSearchParams).not.toHaveBeenCalled();
    });
});
