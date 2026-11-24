import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useTaskBoard } from "../../src/features/tasks/hooks/useTaskBoard";
import useTasks from "../../src/features/tasks/hooks/useTasks";

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../../src/features/tasks/hooks/useTasks", () => ({
    default: vi.fn(),
}));

describe("useTaskBoard", () => {
    const tasks = [
        { id: 1, title: "Alpha task", description: "First", status: "pending" },
        { id: 2, title: "Beta task", description: "Second item", status: "completed" },
    ];

    let updateTaskStatus;

    beforeEach(() => {
        vi.clearAllMocks();
        updateTaskStatus = vi.fn().mockResolvedValue(undefined);
        useTasks.mockReturnValue({ updateTaskStatus });
    });

    it("filters board tasks by title or description", () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));

        act(() => result.current.setSearchTerm("second"));

        expect(result.current.filteredTasks.map((task) => task.id)).toEqual([2]);
    });

    it("updates a task status and shows success", async () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));

        await act(async () => {
            await result.current.handleStatusChange(1, "completed");
        });

        expect(updateTaskStatus).toHaveBeenCalledWith(1, "completed");
        expect(toast.success).toHaveBeenCalledWith("Task status updated.");
        expect(result.current.updatingTaskId).toBeNull();
    });

    it("does not update without edit permission", async () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, false));

        await act(async () => {
            await result.current.handleStatusChange(1, "completed");
        });

        expect(updateTaskStatus).not.toHaveBeenCalled();
    });

    it("does not update a missing task or unchanged status", async () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));

        await act(async () => {
            await result.current.handleStatusChange(999, "completed");
            await result.current.handleStatusChange(1, "pending");
        });

        expect(updateTaskStatus).not.toHaveBeenCalled();
    });

    it("shows the API error when a status update fails", async () => {
        updateTaskStatus.mockRejectedValue({ response: { data: { error: "Not allowed" } } });
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));

        await act(async () => {
            await result.current.handleStatusChange(1, "completed");
        });

        expect(toast.error).toHaveBeenCalledWith("Not allowed");
        expect(result.current.updatingTaskId).toBeNull();
    });

    it("starts and ends dragging", () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));
        const event = {
            dataTransfer: {
                effectAllowed: "",
                setData: vi.fn(),
            },
        };

        act(() => result.current.handleDragStart(event, tasks[0]));

        expect(result.current.draggedTaskId).toBe(1);
        expect(event.dataTransfer.effectAllowed).toBe("move");
        expect(event.dataTransfer.setData).toHaveBeenCalledWith("text/plain", "1");

        act(() => result.current.handleDragEnd());
        expect(result.current.draggedTaskId).toBeNull();
        expect(result.current.dragOverStatus).toBeNull();
    });

    it("ignores drag start without edit permission", () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, false));
        const event = { dataTransfer: { setData: vi.fn() } };

        act(() => result.current.handleDragStart(event, tasks[0]));

        expect(result.current.draggedTaskId).toBeNull();
        expect(event.dataTransfer.setData).not.toHaveBeenCalled();
    });

    it("tracks drag-over status", () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));
        const event = {
            preventDefault: vi.fn(),
            dataTransfer: { dropEffect: "" },
        };

        act(() => result.current.handleDragOver(event, "completed"));

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.dataTransfer.dropEffect).toBe("move");
        expect(result.current.dragOverStatus).toBe("completed");
    });

    it("clears drag-over state when leaving the column", () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));

        act(() => result.current.handleDragOver({
            preventDefault: vi.fn(),
            dataTransfer: {},
        }, "completed"));

        act(() => result.current.handleDragLeave({
            currentTarget: { contains: () => false },
            relatedTarget: null,
        }, "completed"));

        expect(result.current.dragOverStatus).toBeNull();
    });

    it("drops a task into another status", async () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));
        const event = {
            preventDefault: vi.fn(),
            dataTransfer: { getData: vi.fn(() => "1") },
        };

        await act(async () => {
            await result.current.handleDrop(event, "completed");
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(updateTaskStatus).toHaveBeenCalledWith(1, "completed");
    });

    it("does not update when dropped into its existing status", async () => {
        const { result } = renderHook(() => useTaskBoard(tasks, vi.fn(), 5, true));
        const event = {
            preventDefault: vi.fn(),
            dataTransfer: { getData: vi.fn(() => "1") },
        };

        await act(async () => {
            await result.current.handleDrop(event, "pending");
        });

        expect(updateTaskStatus).not.toHaveBeenCalled();
    });
});
