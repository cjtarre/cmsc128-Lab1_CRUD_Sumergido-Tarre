import { beforeEach, describe, expect, it, vi } from "vitest";

import useTasks from "./useTasks";
import { taskService } from "../services/taskService";
import { STATUS } from "../constants/taskOptions";

vi.mock("../services/taskService", () => ({
    taskService: {
        createTask: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
        restoreTask: vi.fn(),
    },
}));

describe("useTasks", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("gets a task by ID", () => {
        const tasks = [
            {
                id: 1,
                title: "Task A",
            },
            {
                id: 2,
                title: "Task B",
            },
        ];

        const setTasks = vi.fn();

        const { getTask } = useTasks(tasks, setTasks);

        expect(getTask(2)).toEqual({
            id: 2,
            title: "Task B",
        });
    });

    it("returns undefined when the task ID does not exist", () => {
        const tasks = [
            {
                id: 1,
                title: "Task A",
            },
        ];

        const setTasks = vi.fn();

        const { getTask } = useTasks(tasks, setTasks);

        expect(getTask(99)).toBeUndefined();
    });

    it("adds a new task", async () => {
        let tasks = [];

        const setTasks = (update) => {
            tasks =
                typeof update === "function"
                    ? update(tasks)
                    : update;
        };

        taskService.createTask.mockResolvedValue({
            task_id: 1,
            task_name: "Task A",
            task_info: "Test task",
            priority_level: 1,
            status: STATUS.NOT_STARTED,
            due_date: null,
            created_at: null,
            task_tag: [],
        });

        const { addTask } = useTasks(tasks, setTasks);

        await addTask({
            title: "Task A",
            description: "Test task",
            priority: 1,
            status: STATUS.NOT_STARTED,
            dueDate: "",
            dueTime: "",
            tags: [],
        });

        expect(taskService.createTask).toHaveBeenCalled();

        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe(1);
        expect(tasks[0].title).toBe("Task A");
    });

    it("updates an existing task", async () => {
        let tasks = [
            {
                id: 1,
                title: "Old Title",
                description: "Old description",
                priority: 1,
                status: STATUS.NOT_STARTED,
                dueDate: "",
                dueTime: "",
                tags: [],
            },
        ];

        const setTasks = (update) => {
            tasks =
                typeof update === "function"
                    ? update(tasks)
                    : update;
        };

        taskService.updateTask.mockResolvedValue({
            task_id: 1,
            task_name: "Updated Title",
            task_info: "Updated description",
            priority_level: 2,
            status: STATUS.NOT_STARTED,
            due_date: null,
            created_at: null,
            task_tag: [],
        });

        const { updateTask } = useTasks(tasks, setTasks);

        await updateTask({
            id: 1,
            title: "Updated Title",
            description: "Updated description",
            priority: 2,
            status: STATUS.NOT_STARTED,
            dueDate: "",
            dueTime: "",
            tags: [],
        });

        expect(taskService.updateTask).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                task_name: "Updated Title",
                task_info: "Updated description",
                priority_level: 2,
                status: STATUS.NOT_STARTED,
            })
        );

        expect(tasks[0].title).toBe("Updated Title");
        expect(tasks[0].description).toBe("Updated description");
        expect(tasks[0].priority).toBe(2);
    });

    it("removes a task after deletion", async () => {
        let tasks = [
            {
                id: 1,
                title: "Task A",
            },
            {
                id: 2,
                title: "Task B",
            },
        ];

        const setTasks = (update) => {
            tasks =
                typeof update === "function"
                    ? update(tasks)
                    : update;
        };

        taskService.deleteTask.mockResolvedValue({
            message: "Task deleted successfully",
        });

        const { deleteTask } = useTasks(tasks, setTasks);

        await deleteTask(1);

        expect(taskService.deleteTask).toHaveBeenCalledWith(1);

        expect(tasks).toEqual([
            {
                id: 2,
                title: "Task B",
            },
        ]);
    });

    it("restores a deleted task", async () => {
        let tasks = [
            {
                id: 2,
                title: "Task B",
            },
        ];

        const setTasks = (update) => {
            tasks =
                typeof update === "function"
                    ? update(tasks)
                    : update;
        };

        taskService.restoreTask.mockResolvedValue({
            task_id: 1,
            task_name: "Task A",
            task_info: "",
            priority_level: 0,
            status: STATUS.NOT_STARTED,
            due_date: null,
            created_at: null,
            task_tag: [],
        });

        const { restoreTask } = useTasks(tasks, setTasks);

        await restoreTask(1);

        expect(taskService.restoreTask).toHaveBeenCalledWith(1);

        expect(tasks).toHaveLength(2);
        expect(tasks[1].id).toBe(1);
        expect(tasks[1].title).toBe("Task A");
    });

    it("updates the status of a task", async () => {
        let tasks = [
            {
                id: 1,
                title: "Task A",
                description: "",
                priority: 1,
                status: STATUS.NOT_STARTED,
                dueDate: "",
                dueTime: "",
                tags: [],
            },
        ];

        const setTasks = (update) => {
            tasks =
                typeof update === "function"
                    ? update(tasks)
                    : update;
        };

        taskService.updateTask.mockResolvedValue({
            task_id: 1,
            task_name: "Task A",
            task_info: "",
            priority_level: 1,
            status: STATUS.COMPLETED,
            due_date: null,
            created_at: null,
            task_tag: [],
        });

        const { updateTaskStatus } = useTasks(tasks, setTasks);

        await updateTaskStatus(1, STATUS.COMPLETED);

        expect(taskService.updateTask).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                status: STATUS.COMPLETED,
            })
        );

        expect(tasks[0].status).toBe(STATUS.COMPLETED);
    });

    it("does not update the status of a task that does not exist", async () => {
        let tasks = [
            {
                id: 1,
                title: "Task A",
                status: STATUS.NOT_STARTED,
            },
        ];

        const setTasks = (update) => {
            tasks =
                typeof update === "function"
                    ? update(tasks)
                    : update;
        };

        const { updateTaskStatus } = useTasks(tasks, setTasks);

        await updateTaskStatus(99, STATUS.COMPLETED);

        expect(taskService.updateTask).not.toHaveBeenCalled();

        expect(tasks[0].status).toBe(STATUS.NOT_STARTED);
    });

    it("toggles a task from not started to completed", async () => {
        let tasks = [
            {
                id: 1,
                title: "Task A",
                description: "",
                priority: 1,
                status: STATUS.NOT_STARTED,
                dueDate: "",
                dueTime: "",
                tags: [],
            },
        ];

        const setTasks = (update) => {
            tasks =
                typeof update === "function"
                    ? update(tasks)
                    : update;
        };

        taskService.updateTask.mockResolvedValue({
            task_id: 1,
            task_name: "Task A",
            task_info: "",
            priority_level: 1,
            status: STATUS.COMPLETED,
            due_date: null,
            created_at: null,
            task_tag: [],
        });

        const { toggleTaskComplete } = useTasks(tasks, setTasks);

        await toggleTaskComplete(1);

        expect(taskService.updateTask).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                status: STATUS.COMPLETED,
            })
        );

        expect(tasks[0].status).toBe(STATUS.COMPLETED);
    });

    it("toggles a completed task back to not started", async () => {
        let tasks = [
            {
                id: 1,
                title: "Task A",
                description: "",
                priority: 1,
                status: STATUS.COMPLETED,
                dueDate: "",
                dueTime: "",
                tags: [],
            },
        ];

        const setTasks = (update) => {
            tasks =
                typeof update === "function"
                    ? update(tasks)
                    : update;
        };

        taskService.updateTask.mockResolvedValue({
            task_id: 1,
            task_name: "Task A",
            task_info: "",
            priority_level: 1,
            status: STATUS.NOT_STARTED,
            due_date: null,
            created_at: null,
            task_tag: [],
        });

        const { toggleTaskComplete } = useTasks(tasks, setTasks);

        await toggleTaskComplete(1);

        expect(taskService.updateTask).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                status: STATUS.NOT_STARTED,
            })
        );

        expect(tasks[0].status).toBe(STATUS.NOT_STARTED);
    });
});