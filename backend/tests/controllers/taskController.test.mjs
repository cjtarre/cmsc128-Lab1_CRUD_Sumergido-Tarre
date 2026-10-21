import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const mockUser = { id: "test-user-id" }, PROJECT_ID = 7;
const mockQuery = {
    select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(),
    eq: vi.fn(), is: vi.fn(), in: vi.fn(), order: vi.fn(),
    single: vi.fn(), maybeSingle: vi.fn(),
};
const supabase = { from: vi.fn() };
const projectAccess = {
    ROLE_RANK: { viewer: 1, editor: 2, owner: 3 },
    getRole: vi.fn(), getMemberProjectIds: vi.fn(),
    getDefaultProjectId: vi.fn(), validateTagIdsForProject: vi.fn(),
};

mock(path.resolve("config/supabaseAdmin.js"), supabase);
mock(path.resolve("utils/projectAccess.js"), projectAccess);

const { getAllTasks, createTask, updateTask, deleteTask, restoreTask } =
    require("../../controllers/taskController.js");

const createResponse = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });
const baseTask = {
    task_id: 1, task_name: "Test Task", project_id: PROJECT_ID,
    status: "not_started", assignee_id: null, deleted_at: null,
};

beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(mockQuery);

    ["select", "insert", "update", "delete", "eq", "is", "in", "order", "single", "maybeSingle"]
        .forEach(key => mockQuery[key].mockReturnValue(mockQuery));

    projectAccess.getRole.mockResolvedValue("owner");
    projectAccess.getMemberProjectIds.mockResolvedValue([PROJECT_ID]);
    projectAccess.getDefaultProjectId.mockResolvedValue(PROJECT_ID);
    projectAccess.validateTagIdsForProject.mockResolvedValue(null);
});

describe("getAllTasks", () => {
    it("returns active tasks from the user's projects", async () => {
        const req = { user: mockUser, query: {} }, res = createResponse();
        const tasks = [{ task_id: 1, task_name: "Test Task", project_id: PROJECT_ID }];
        mockQuery.in.mockResolvedValue({ data: tasks, error: null });

        await getAllTasks(req, res);

        expect(supabase.from).toHaveBeenCalledWith("tasks");
        expect(mockQuery.is).toHaveBeenCalledWith("deleted_at", null);
        expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
        expect(projectAccess.getMemberProjectIds).toHaveBeenCalledWith(mockUser.id);
        expect(mockQuery.in).toHaveBeenCalledWith("project_id", [PROJECT_ID]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(tasks);
    });

    it("returns 500 when fetching fails", async () => {
        const req = { user: mockUser, query: {} }, res = createResponse();
        mockQuery.in.mockResolvedValue({ data: null, error: new Error("Database error") });

        await getAllTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("createTask", () => {
    it("creates a task in the default project without tags", async () => {
        const req = {
            user: mockUser,
            body: {
                task_name: "New Task", task_info: "Task information",
                priority_level: "high", status: "not_started", due_date: "2026-10-05",
            },
        }, res = createResponse();

        const newTask = {
            task_id: 1, task_name: "New Task",
            project_id: PROJECT_ID, assignee_id: null,
        };
        const taskWithTags = { ...newTask, task_tag: [] };

        mockQuery.single
            .mockResolvedValueOnce({ data: newTask, error: null })
            .mockResolvedValueOnce({ data: taskWithTags, error: null });

        await createTask(req, res);

        expect(projectAccess.getDefaultProjectId).toHaveBeenCalledWith(mockUser.id);
        expect(projectAccess.getRole).toHaveBeenCalledWith(PROJECT_ID, mockUser.id);
        expect(mockQuery.insert).toHaveBeenCalledWith([{
            task_name: "New Task", task_info: "Task information",
            priority_level: "high", status: "not_started", due_date: "2026-10-05",
            project_id: PROJECT_ID, assignee_id: null, user_id: mockUser.id,
        }]);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(taskWithTags);
    });

    it("creates a task with tags", async () => {
        const req = {
            user: mockUser,
            body: {
                task_name: "Tagged Task", task_info: "Task information",
                priority_level: "medium", status: "not_started",
                due_date: "2026-10-06", tag_ids: [1, 2],
            },
        }, res = createResponse();

        const newTask = {
            task_id: 1, task_name: "Tagged Task",
            project_id: PROJECT_ID, assignee_id: null,
        };
        const taskWithTags = {
            ...newTask,
            task_tag: [
                { tags: { tag_id: 1, tag_name: "School" } },
                { tags: { tag_id: 2, tag_name: "Personal" } },
            ],
        };

        mockQuery.single
            .mockResolvedValueOnce({ data: newTask, error: null })
            .mockResolvedValueOnce({ data: taskWithTags, error: null });

        await createTask(req, res);

        expect(projectAccess.validateTagIdsForProject).toHaveBeenCalledWith([1, 2], PROJECT_ID);
        expect(mockQuery.insert).toHaveBeenCalledWith([
            { task_id: 1, tag_id: 1 }, { task_id: 1, tag_id: 2 },
        ]);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(taskWithTags);
    });

    it("returns 400 for invalid priority or status", async () => {
        const res = createResponse(), res2 = createResponse();

        await createTask({
            user: mockUser,
            body: { task_name: "Bad", priority_level: "urgent", status: "not_started" },
        }, res);

        await createTask({
            user: mockUser,
            body: { task_name: "Bad", priority_level: "high", status: "Pending" },
        }, res2);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res2.status).toHaveBeenCalledWith(400);
        expect(mockQuery.insert).not.toHaveBeenCalled();
    });

    it("returns 500 when creation fails", async () => {
        const req = {
            user: mockUser,
            body: {
                task_name: "Failed Task", task_info: "Task information",
                priority_level: "low", status: "not_started", due_date: "2026-10-07",
            },
        }, res = createResponse();

        mockQuery.single.mockResolvedValueOnce({ data: null, error: new Error("Create failed") });

        await createTask(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("updateTask", () => {
    it("returns 400 for invalid status", async () => {
        const res = createResponse();

        await updateTask({
            user: mockUser, params: { task_id: 1 }, body: { status: "Completed" },
        }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockQuery.update).not.toHaveBeenCalled();
    });

    it("updates a task without changing tags", async () => {
        const req = {
            user: mockUser, params: { task_id: "1" },
            body: {
                task_name: "Updated Task", task_info: "Updated information",
                priority_level: "high", status: "completed", due_date: "2026-10-10",
            },
        }, res = createResponse();

        const updatedTask = {
            task_id: 1, task_name: "Updated Task", task_info: "Updated information",
            project_id: PROJECT_ID, priority_level: "high",
            status: "completed", due_date: "2026-10-10",
        };

        mockQuery.maybeSingle.mockResolvedValueOnce({ data: baseTask, error: null });
        mockQuery.select
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ data: [updatedTask], error: null })
            .mockReturnValueOnce(mockQuery);
        mockQuery.single.mockResolvedValueOnce({ data: updatedTask, error: null });

        await updateTask(req, res);

        expect(projectAccess.getRole).toHaveBeenCalledWith(PROJECT_ID, mockUser.id);
        expect(mockQuery.update).toHaveBeenCalledWith({
            task_name: "Updated Task", task_info: "Updated information",
            priority_level: "high", status: "completed", due_date: "2026-10-10",
        });
        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", 1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedTask);
    });

    it("updates a task and replaces its tags", async () => {
        const req = {
            user: mockUser, params: { task_id: "1" },
            body: {
                task_name: "Updated Tagged Task", task_info: "Updated information",
                priority_level: "medium", status: "not_started",
                due_date: "2026-10-11", tag_ids: [2, 3],
            },
        }, res = createResponse();

        const updatedTask = {
            task_id: 1, task_name: "Updated Tagged Task",
            project_id: PROJECT_ID, status: "not_started",
        };

        mockQuery.maybeSingle.mockResolvedValueOnce({ data: baseTask, error: null });
        mockQuery.select
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ data: [updatedTask], error: null })
            .mockReturnValueOnce(mockQuery);
        mockQuery.eq
            .mockReturnValueOnce(mockQuery)
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ error: null });
        mockQuery.single.mockResolvedValueOnce({ data: updatedTask, error: null });

        await updateTask(req, res);

        expect(projectAccess.validateTagIdsForProject).toHaveBeenCalledWith([2, 3], PROJECT_ID);
        expect(mockQuery.delete).toHaveBeenCalled();
        expect(mockQuery.insert).toHaveBeenCalledWith([
            { task_id: 1, tag_id: 2 }, { task_id: 1, tag_id: 3 },
        ]);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updates a task and removes all tags", async () => {
        const req = {
            user: mockUser, params: { task_id: "1" },
            body: {
                task_name: "No Tags", task_info: "Updated information",
                priority_level: "low", status: "not_started",
                due_date: "2026-10-12", tag_ids: [],
            },
        }, res = createResponse();

        const updatedTask = {
            task_id: 1, task_name: "No Tags",
            project_id: PROJECT_ID, status: "not_started", task_tag: [],
        };

        mockQuery.maybeSingle.mockResolvedValueOnce({ data: baseTask, error: null });
        mockQuery.select
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ data: [updatedTask], error: null })
            .mockReturnValueOnce(mockQuery);
        mockQuery.eq
            .mockReturnValueOnce(mockQuery)
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ error: null });
        mockQuery.single.mockResolvedValueOnce({ data: updatedTask, error: null });

        await updateTask(req, res);

        expect(projectAccess.validateTagIdsForProject).toHaveBeenCalledWith([], PROJECT_ID);
        expect(mockQuery.delete).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedTask);
    });

    it("returns 404 when the task does not exist", async () => {
        const req = {
            user: mockUser, params: { task_id: "99" },
            body: {
                task_name: "Unauthorized Update", task_info: "Should not be updated",
                priority_level: "high", status: "not_started",
                due_date: "2026-10-15", tag_ids: [1, 2],
            },
        }, res = createResponse();

        mockQuery.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

        await updateTask(req, res);

        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", 99);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Task not found" });
        expect(mockQuery.delete).not.toHaveBeenCalled();
    });

    it("returns 500 when updating fails", async () => {
        const req = {
            user: mockUser, params: { task_id: "1" },
            body: {
                task_name: "Failed Update", task_info: "Updated information",
                priority_level: "high", status: "not_started", due_date: "2026-10-05",
            },
        }, res = createResponse();

        mockQuery.maybeSingle.mockResolvedValueOnce({
            data: null, error: new Error("Update failed"),
        });

        await updateTask(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("deleteTask", () => {
    it("soft deletes an editable project task", async () => {
        const req = { user: mockUser, params: { task_id: "1" } }, res = createResponse();
        const data = [{ task_id: 1, deleted_at: "2026-10-19T10:00:00.000Z" }];

        mockQuery.maybeSingle.mockResolvedValueOnce({ data: baseTask, error: null });
        mockQuery.select
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ data, error: null });

        await deleteTask(req, res);

        expect(mockQuery.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", 1);
        expect(mockQuery.is).toHaveBeenCalledWith("deleted_at", null);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Task with ID 1 deleted successfully", data,
        });
    });

    it("returns 500 when deletion fails", async () => {
        const req = { user: mockUser, params: { task_id: "1" } }, res = createResponse();

        mockQuery.maybeSingle.mockResolvedValueOnce({ data: baseTask, error: null });
        mockQuery.select
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ data: null, error: new Error("Delete failed") });

        await deleteTask(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});

describe("restoreTask", () => {
    it("restores an editable project task", async () => {
        const req = { user: mockUser, params: { task_id: "1" } }, res = createResponse();
        const deletedTask = { ...baseTask, deleted_at: "2026-10-19T10:00:00.000Z" };
        const restoredTask = { ...baseTask, task_name: "Restored Task", deleted_at: null };

        mockQuery.maybeSingle.mockResolvedValueOnce({ data: deletedTask, error: null });
        mockQuery.eq
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ error: null })
            .mockReturnValueOnce(mockQuery);
        mockQuery.single.mockResolvedValueOnce({ data: restoredTask, error: null });

        await restoreTask(req, res);

        expect(mockQuery.update).toHaveBeenCalledWith({ deleted_at: null });
        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", 1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(restoredTask);
    });

    it("returns 500 when restoration fails", async () => {
        const req = { user: mockUser, params: { task_id: "1" } }, res = createResponse();
        const deletedTask = { ...baseTask, deleted_at: "2026-10-19T10:00:00.000Z" };

        mockQuery.maybeSingle.mockResolvedValueOnce({ data: deletedTask, error: null });
        mockQuery.eq
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({ error: new Error("Restore failed") });

        await restoreTask(req, res);

        expect(mockQuery.update).toHaveBeenCalledWith({ deleted_at: null });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});