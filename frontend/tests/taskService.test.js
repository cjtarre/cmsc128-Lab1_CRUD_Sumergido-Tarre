import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    apiInstance: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),

        interceptors: {
            request: {
                use: vi.fn(),
            },
            response: {
                use: vi.fn(),
            },
        },
    },
}));

vi.mock("axios", () => ({
    default: {
        create: vi.fn(() => mocks.apiInstance),
    },
}));

import { taskService } from "../src/features/tasks/services/taskService";

describe("taskService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("gets all tasks", async () => {
        const tasks = [
            {
                task_id: 1,
                task_name: "Task A",
            },
        ];

        mocks.apiInstance.get.mockResolvedValue({
            data: tasks,
        });

        const result = await taskService.getTasks();

        expect(mocks.apiInstance.get).toHaveBeenCalledWith("/api/tasks");
        expect(result).toEqual(tasks);
    });

    it("creates a task", async () => {
        const taskData = {
            task_name: "Task A",
            task_info: "Test task",
            priority_level: 1,
            status: "Not Started",
            due_date: null,
        };

        const createdTask = {
            task_id: 1,
            ...taskData,
        };

        mocks.apiInstance.post.mockResolvedValue({
            data: createdTask,
        });

        const result = await taskService.createTask(taskData);

        expect(mocks.apiInstance.post).toHaveBeenCalledWith(
            "/api/tasks",
            taskData
        );

        expect(result).toEqual(createdTask);
    });

    it("updates a task", async () => {
        const taskData = {
            task_name: "Updated Task",
            task_info: "Updated description",
            priority_level: 2,
            status: "Completed",
            due_date: null,
        };

        const updatedTask = {
            task_id: 1,
            ...taskData,
        };

        mocks.apiInstance.put.mockResolvedValue({
            data: updatedTask,
        });

        const result = await taskService.updateTask(1, taskData);

        expect(mocks.apiInstance.put).toHaveBeenCalledWith(
            "/api/tasks/1",
            taskData
        );

        expect(result).toEqual(updatedTask);
    });

    it("deletes a task", async () => {
        const response = {
            message: "Task with ID 1 deleted successfully",
        };

        mocks.apiInstance.delete.mockResolvedValue({
            data: response,
        });

        const result = await taskService.deleteTask(1);

        expect(mocks.apiInstance.delete).toHaveBeenCalledWith(
            "/api/tasks/1"
        );

        expect(result).toEqual(response);
    });

    it("restores a deleted task", async () => {
        const restoredTask = {
            task_id: 1,
            task_name: "Task A",
            deleted_at: null,
        };

        mocks.apiInstance.patch.mockResolvedValue({
            data: restoredTask,
        });

        const result = await taskService.restoreTask(1);

        expect(mocks.apiInstance.patch).toHaveBeenCalledWith(
            "/api/tasks/1/restore"
        );

        expect(result).toEqual(restoredTask);
    });
});