import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTaskFilters } from "../../src/features/tasks/hooks/useTaskFilters";

describe("useTaskFilters", () => {
    const tasks = [
        { id: 1, title: "Beta", description: "", status: "pending", priority: "high", assigneeId: 10, dueDate: "20/10/2026", tags: [{ tag_id: 1, tag_name: "School" }] },
        { id: 2, title: "Alpha", description: "", status: "completed", priority: "low", assigneeId: null, dueDate: "19/10/2026", tags: [] },
    ];

    beforeEach(() => vi.clearAllMocks());

    it("starts with no filters and due-date ascending sort", () => {
        const { result } = renderHook(() => useTaskFilters(tasks));

        expect(result.current.searchTerm).toBe("");
        expect(result.current.activeFilterCount).toBe(0);
        expect(result.current.hasFilters).toBe(false);
        expect(result.current.activeSort).toEqual({ column: "dueDate", mode: "due_asc" });
        expect(result.current.displayedTasks.map((task) => task.id)).toEqual([1, 2]);
    });

    it("filters by search term", () => {
        const { result } = renderHook(() => useTaskFilters(tasks));

        act(() => result.current.setSearchTerm("beta"));

        expect(result.current.displayedTasks.map((task) => task.id)).toEqual([1]);
        expect(result.current.hasFilters).toBe(true);
    });

    it("tracks active toolbar filters", () => {
        const { result } = renderHook(() => useTaskFilters(tasks));

        act(() => {
            result.current.setters.assignee("10");
            result.current.setters.priority("high");
        });

        expect(result.current.activeFilterCount).toBe(2);
        expect(result.current.hasFilters).toBe(true);
        expect(result.current.displayedTasks.map((task) => task.id)).toEqual([1]);
    });

    it("maps dropdown events to the corresponding filter state", () => {
        const { result } = renderHook(() => useTaskFilters(tasks));

        act(() => {
            result.current.filterChangeHandlers.assignee({ target: { value: "10" } });
            result.current.filterChangeHandlers.priority({ target: { value: "high" } });
        });

        expect(result.current.filters).toEqual({ assignee: "10", status: "", priority: "high", tag: "" });
        expect(result.current.activeFilterCount).toBe(2);
        expect(result.current.displayedTasks.map((task) => task.id)).toEqual([1]);
    });

    it("collects task tags", () => {
        const { result } = renderHook(() => useTaskFilters(tasks));
        expect(result.current.tags).toEqual([{ id: "1", name: "School" }]);
    });

    it("clears every filter", () => {
        const { result } = renderHook(() => useTaskFilters(tasks));

        act(() => {
            result.current.setSearchTerm("beta");
            result.current.setters.assignee("10");
            result.current.setters.status("pending");
            result.current.setters.priority("high");
            result.current.setters.tag("1");
        });

        act(() => result.current.clearFilters());

        expect(result.current.searchTerm).toBe("");
        expect(result.current.filters).toEqual({ assignee: "", status: "", priority: "", tag: "" });
        expect(result.current.activeFilterCount).toBe(0);
        expect(result.current.hasFilters).toBe(false);
    });

    it("cycles task-column sorting", () => {
        const { result } = renderHook(() => useTaskFilters(tasks));

        act(() => result.current.handleSortTask());
        expect(result.current.activeSort).toEqual({ column: "task", mode: "title_asc" });

        act(() => result.current.handleSortTask());
        expect(result.current.activeSort).toEqual({ column: "task", mode: "title_desc" });
    });

    it("sorts project tasks by tag through the toolbar and resets to due date", () => {
        const taggedTasks = [
            { id: 1, title: "Alpha", status: "pending", dueDate: "20/10/2026", tags: [{ tag_id: 1, tag_name: "Zebra" }] },
            { id: 2, title: "Beta", status: "pending", dueDate: "19/10/2026", tags: [{ tag_id: 2, tag_name: "Alpha" }] },
            { id: 3, title: "Untagged", status: "pending", dueDate: "18/10/2026", tags: [] },
        ];
        const { result } = renderHook(() => useTaskFilters(taggedTasks));
        act(() => result.current.handleSortTag("tag_asc"));
        expect(result.current.displayedTasks.map(({ id }) => id)).toEqual([2, 1, 3]);
        expect(result.current.activeSort).toEqual({ column: "tag", mode: "tag_asc" });

        act(() => result.current.handleSortTag("tag_desc"));
        expect(result.current.displayedTasks.map(({ id }) => id)).toEqual([1, 2, 3]);

        act(() => result.current.handleSortTag(""));
        expect(result.current.activeSort).toEqual({ column: "dueDate", mode: "due_asc" });
        expect(result.current.displayedTasks.map(({ id }) => id)).toEqual([3, 2, 1]);
    });

    it("cycles due-date sorting", () => {
        const { result } = renderHook(() => useTaskFilters(tasks));

        act(() => result.current.handleSortDueDate());
        expect(result.current.activeSort).toEqual({ column: "dueDate", mode: "due_desc" });
    });
});
