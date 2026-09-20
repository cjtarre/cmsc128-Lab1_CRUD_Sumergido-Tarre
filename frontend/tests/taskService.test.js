import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

import { taskService } from "../src/features/tasks/services/taskService";

vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
    },
}));

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

        axios.get.mockResolvedValue({
            data: tasks,
        });

        const result = await taskService.getTasks();

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/tasks")
        );

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

        axios.post.mockResolvedValue({
            data: createdTask,
        });

        const result = await taskService.createTask(taskData);

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining("/api/tasks"),
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

        axios.put.mockResolvedValue({
            data: updatedTask,
        });

        const result = await taskService.updateTask(1, taskData);

        expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining("/api/tasks/1"),
            taskData
        );

        expect(result).toEqual(updatedTask);
    });

    it("deletes a task", async () => {
        const response = {
            message: "Task with ID 1 deleted successfully",
        };

        axios.delete.mockResolvedValue({
            data: response,
        });

        const result = await taskService.deleteTask(1);

        expect(axios.delete).toHaveBeenCalledWith(
            expect.stringContaining("/api/tasks/1")
        );

        expect(result).toEqual(response);
    });

    it("restores a deleted task", async () => {
        const restoredTask = {
            task_id: 1,
            task_name: "Task A",
            deleted_at: null,
        };

        axios.patch.mockResolvedValue({
            data: restoredTask,
        });

        const result = await taskService.restoreTask(1);

        expect(axios.patch).toHaveBeenCalledWith(
            expect.stringContaining("/api/tasks/1/restore")
        );

        expect(result).toEqual(restoredTask);
    });
});