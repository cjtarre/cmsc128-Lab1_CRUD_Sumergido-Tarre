import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTaskHandlers } from "../src/features/tasks/handlers/taskHandlers";
import { STATUS } from "../src/features/tasks/constants/taskOptions";

vi.mock("sonner", () => {
    const toast = vi.fn();

    toast.success = vi.fn();
    toast.error = vi.fn();

    return { toast };
});

import { toast } from "sonner";

describe("createTaskHandlers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createMocks = () => ({
        getTask: vi.fn(),
        addTask: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
        restoreTask: vi.fn(),
        updateTaskStatus: vi.fn(),
        toggleTaskComplete: vi.fn(),

        setSelectedTask: vi.fn(),
        setTaskToEdit: vi.fn(),
        setTaskToDelete: vi.fn(),
        setIsAddTaskOpen: vi.fn(),
    });

    it("adds a task with trimmed and formatted data", async () => {
        const mocks = createMocks();

        mocks.addTask.mockResolvedValue({});

        const handlers = createTaskHandlers(mocks);

        const event = {
            preventDefault: vi.fn(),
        };

        const formData = {
            title: "  New Task  ",
            description: "  Task description  ",
            priority: 1,
            dueDate: "2026-09-25",
            dueTime: "10:30",
            tags: [],
        };

        await handlers.handleAddTaskSubmit(event, formData);

        expect(event.preventDefault).toHaveBeenCalled();

        expect(mocks.addTask).toHaveBeenCalledWith({
            ...formData,
            title: "New Task",
            description: "Task description",
            dueDate: "25/09/2026",
            status: STATUS.NOT_STARTED,
        });

        expect(mocks.setIsAddTaskOpen).toHaveBeenCalledWith(false);
        expect(toast.success).toHaveBeenCalledWith(
            "Task added successfully!"
        );
    });

    it("rejects a task with an empty title", async () => {
        const mocks = createMocks();

        const handlers = createTaskHandlers(mocks);

        const event = {
            preventDefault: vi.fn(),
        };

        await handlers.handleAddTaskSubmit(event, {
            title: "   ",
            description: "",
            priority: 1,
            dueDate: "",
            dueTime: "",
            tags: [],
        });

        expect(mocks.addTask).not.toHaveBeenCalled();

        expect(toast.error).toHaveBeenCalledWith(
            "Task title is required."
        );

        expect(mocks.setIsAddTaskOpen).not.toHaveBeenCalled();
    });

    it("updates a task with trimmed and formatted data", async () => {
        const mocks = createMocks();

        mocks.updateTask.mockResolvedValue({});

        const handlers = createTaskHandlers(mocks);

        const task = {
            id: 1,
            title: "  Updated Task  ",
            description: "  Updated description  ",
            priority: 2,
            status: STATUS.NOT_STARTED,
            dueDate: "2026-09-30",
            dueTime: "14:00",
            tags: [],
        };

        await handlers.handleUpdateTask(task);

        expect(mocks.updateTask).toHaveBeenCalledWith({
            ...task,
            title: "Updated Task",
            description: "Updated description",
            dueDate: "30/09/2026",
        });

        expect(mocks.setTaskToEdit).toHaveBeenCalledWith(null);

        expect(toast.success).toHaveBeenCalledWith(
            "Task updated successfully!"
        );
    });

    it("updates the selected task after editing", async () => {
        const mocks = createMocks();

        mocks.updateTask.mockResolvedValue({});

        let selectedTask = {
            id: 1,
            title: "Old Task",
        };

        mocks.setSelectedTask.mockImplementation((update) => {
            selectedTask =
                typeof update === "function"
                    ? update(selectedTask)
                    : update;
        });

        const handlers = createTaskHandlers(mocks);

        await handlers.handleUpdateTask({
            id: 1,
            title: "Updated Task",
            description: "",
            priority: 1,
            status: STATUS.NOT_STARTED,
            dueDate: "",
            dueTime: "",
            tags: [],
        });

        expect(selectedTask.title).toBe("Updated Task");
    });

    it("changes a task status", async () => {
        const mocks = createMocks();

        mocks.updateTaskStatus.mockResolvedValue({});

        let selectedTask = {
            id: 1,
            title: "Task A",
            status: STATUS.NOT_STARTED,
        };

        mocks.setSelectedTask.mockImplementation((update) => {
            selectedTask =
                typeof update === "function"
                    ? update(selectedTask)
                    : update;
        });

        const handlers = createTaskHandlers(mocks);

        await handlers.handleStatusChange(
            1,
            STATUS.COMPLETED
        );

        expect(mocks.updateTaskStatus).toHaveBeenCalledWith(
            1,
            STATUS.COMPLETED
        );

        expect(selectedTask.status).toBe(STATUS.COMPLETED);

        expect(toast.success).toHaveBeenCalledWith(
            "Task status updated!"
        );
    });

    it("selects a task for deletion", () => {
        const mocks = createMocks();

        const task = {
            id: 1,
            title: "Task A",
        };

        mocks.getTask.mockReturnValue(task);

        const handlers = createTaskHandlers(mocks);

        handlers.handleDeleteTask(1);

        expect(mocks.getTask).toHaveBeenCalledWith(1);
        expect(mocks.setTaskToDelete).toHaveBeenCalledWith(task);
    });

    it("deletes a task and provides an Undo action", async () => {
        const mocks = createMocks();

        const task = {
            id: 1,
            title: "Task A",
        };

        mocks.deleteTask.mockResolvedValue({});
        mocks.restoreTask.mockResolvedValue({});

        let selectedTask = task;

        mocks.setSelectedTask.mockImplementation((update) => {
            selectedTask =
                typeof update === "function"
                    ? update(selectedTask)
                    : update;
        });

        const handlers = createTaskHandlers(mocks);

        await handlers.handleConfirmDelete(task);

        expect(mocks.deleteTask).toHaveBeenCalledWith(1);
        expect(selectedTask).toBeNull();
        expect(mocks.setTaskToDelete).toHaveBeenCalledWith(null);

        expect(toast).toHaveBeenCalledWith(
            "Task deleted.",
            expect.objectContaining({
                position: "top-center",
                duration: 5000,
                action: expect.objectContaining({
                    label: "Undo",
                }),
            })
        );

        const toastOptions = toast.mock.calls[0][1];

        await toastOptions.action.onClick();

        expect(mocks.restoreTask).toHaveBeenCalledWith(1);

        expect(toast.success).toHaveBeenCalledWith(
            "Task restored!"
        );
    });

    it("toggles task completion", async () => {
        const mocks = createMocks();

        mocks.toggleTaskComplete.mockResolvedValue({});

        const handlers = createTaskHandlers(mocks);

        await handlers.handleToggleComplete(1);

        expect(
            mocks.toggleTaskComplete
        ).toHaveBeenCalledWith(1);

        expect(toast.success).toHaveBeenCalledWith(
            "Task status updated!"
        );
    });
});