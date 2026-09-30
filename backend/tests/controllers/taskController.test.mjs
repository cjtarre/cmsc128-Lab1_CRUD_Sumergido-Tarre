import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = (await import("../../config/supabaseAdmin.js")).default;

const {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    restoreTask,
} = await import("../../controllers/taskController.js");

const mockUser = {
    id: "test-user-id",
};

const mockQuery = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
};

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
});

beforeEach(() => {
    vi.clearAllMocks();

    supabase.from = vi.fn(() => mockQuery);

    mockQuery.select.mockReturnValue(mockQuery);
    mockQuery.insert.mockReturnValue(mockQuery);
    mockQuery.update.mockReturnValue(mockQuery);
    mockQuery.delete.mockReturnValue(mockQuery);
    mockQuery.eq.mockReturnValue(mockQuery);
    mockQuery.is.mockReturnValue(mockQuery);
    mockQuery.order.mockReturnValue(mockQuery);
    mockQuery.single.mockReturnValue(mockQuery);
});

describe("getAllTasks", () => {
    it("should return all active tasks belonging to the authenticated user", async () => {
        const req = { user: mockUser };
        const res = createResponse();

        mockQuery.order.mockResolvedValue({
            data: [{ task_id: 1, task_name: "Test Task" }],
            error: null,
        });

        await getAllTasks(req, res);

        expect(supabase.from).toHaveBeenCalledWith("tasks");
        expect(mockQuery.select).toHaveBeenCalled();
        expect(mockQuery.is).toHaveBeenCalledWith("deleted_at", null);
        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);
        expect(mockQuery.order).toHaveBeenCalledWith("created_at", {
            ascending: false,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            { task_id: 1, task_name: "Test Task" },
        ]);
    });

    it("should return 500 when fetching tasks fails", async () => {
        const req = { user: mockUser };
        const res = createResponse();

        mockQuery.order.mockResolvedValue({
            data: null,
            error: new Error("Database error"),
        });

        await getAllTasks(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Internal Server Error",
        });
    });
});

describe("createTask", () => {
    it("should create a task for the authenticated user without tags", async () => {
        const req = {
            user: mockUser,
            body: {
                task_name: "New Task",
                task_info: "Task information",
                priority_level: "High",
                status: "Pending",
                due_date: "2026-10-05",
            },
        };

        const res = createResponse();

        mockQuery.single
            .mockResolvedValueOnce({
                data: { task_id: 1, task_name: "New Task" },
                error: null,
            })
            .mockResolvedValueOnce({
                data: {
                    task_id: 1,
                    task_name: "New Task",
                    task_tag: [],
                },
                error: null,
            });

        await createTask(req, res);

        expect(supabase.from).toHaveBeenCalledWith("tasks");

        expect(mockQuery.insert).toHaveBeenCalledWith([
            {
                task_name: "New Task",
                task_info: "Task information",
                priority_level: "High",
                status: "Pending",
                due_date: "2026-10-05",
                user_id: mockUser.id,
            },
        ]);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            task_id: 1,
            task_name: "New Task",
            task_tag: [],
        });
    });

    it("should create a task with tags", async () => {
        const req = {
            user: mockUser,
            body: {
                task_name: "Tagged Task",
                task_info: "Task information",
                priority_level: "Medium",
                status: "Pending",
                due_date: "2026-10-06",
                tag_ids: [1, 2],
            },
        };

        const res = createResponse();

        mockQuery.single
            .mockResolvedValueOnce({
                data: {
                    task_id: 1,
                    task_name: "Tagged Task",
                },
                error: null,
            })
            .mockResolvedValueOnce({
                data: {
                    task_id: 1,
                    task_name: "Tagged Task",
                    task_tag: [
                        {
                            tags: {
                                tag_id: 1,
                                tag_name: "School",
                                tag_info: "School-related",
                            },
                        },
                    ],
                },
                error: null,
            });

        await createTask(req, res);

        expect(mockQuery.insert).toHaveBeenCalledWith([
            {
                task_name: "Tagged Task",
                task_info: "Task information",
                priority_level: "Medium",
                status: "Pending",
                due_date: "2026-10-06",
                user_id: mockUser.id,
            },
        ]);

        expect(supabase.from).toHaveBeenCalledWith("task_tag");

        expect(mockQuery.insert).toHaveBeenCalledWith([
            { task_id: 1, tag_id: 1 },
            { task_id: 1, tag_id: 2 },
        ]);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 500 when creating a task fails", async () => {
        const req = {
            user: mockUser,
            body: {
                task_name: "Failed Task",
                task_info: "Task information",
                priority_level: "Low",
                status: "Pending",
                due_date: "2026-10-07",
            },
        };

        const res = createResponse();

        mockQuery.single.mockResolvedValueOnce({
            data: null,
            error: new Error("Create failed"),
        });

        await createTask(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Internal Server Error",
        });
    });
});

describe("updateTask", () => {
    it("should update a task belonging to the authenticated user without changing tags", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "1" },
            body: {
                task_name: "Updated Task",
                task_info: "Updated information",
                priority_level: "High",
                status: "Completed",
                due_date: "2026-10-10",
            },
        };

        const res = createResponse();

        mockQuery.select
            .mockResolvedValueOnce({
                data: [{ task_id: 1, task_name: "Updated Task" }],
                error: null,
            })
            .mockReturnValueOnce(mockQuery);

        mockQuery.single.mockResolvedValueOnce({
            data: {
                task_id: 1,
                task_name: "Updated Task",
                task_info: "Updated information",
                priority_level: "High",
                status: "Completed",
                due_date: "2026-10-10",
            },
            error: null,
        });

        await updateTask(req, res);

        expect(mockQuery.update).toHaveBeenCalledWith({
            task_name: "Updated Task",
            task_info: "Updated information",
            priority_level: "High",
            status: "Completed",
            due_date: "2026-10-10",
        });

        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);
        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", "1");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            task_id: 1,
            task_name: "Updated Task",
            task_info: "Updated information",
            priority_level: "High",
            status: "Completed",
            due_date: "2026-10-10",
        });
    });

    it("should update a task and replace its tags", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "1" },
            body: {
                task_name: "Updated Tagged Task",
                task_info: "Updated information",
                priority_level: "Medium",
                status: "Pending",
                due_date: "2026-10-11",
                tag_ids: [2, 3],
            },
        };

        const res = createResponse();

        mockQuery.select
            .mockResolvedValueOnce({
                data: [{ task_id: 1 }],
                error: null,
            })
            .mockReturnValueOnce(mockQuery);

        mockQuery.single.mockResolvedValueOnce({
            data: {
                task_id: 1,
                task_name: "Updated Tagged Task",
                task_tag: [
                    { tags: { tag_id: 2, tag_name: "School" } },
                    { tags: { tag_id: 3, tag_name: "Urgent" } },
                ],
            },
            error: null,
        });

        await updateTask(req, res);

        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);
        expect(mockQuery.delete).toHaveBeenCalled();

        expect(mockQuery.insert).toHaveBeenCalledWith([
            { task_id: "1", tag_id: 2 },
            { task_id: "1", tag_id: 3 },
        ]);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should update a task and remove all tags when tag_ids is empty", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "1" },
            body: {
                task_name: "No Tags",
                task_info: "Updated information",
                priority_level: "Low",
                status: "Pending",
                due_date: "2026-10-12",
                tag_ids: [],
            },
        };

        const res = createResponse();

        mockQuery.select
            .mockResolvedValueOnce({
                data: [{ task_id: 1 }],
                error: null,
            })
            .mockReturnValueOnce(mockQuery);

        mockQuery.single.mockResolvedValueOnce({
            data: {
                task_id: 1,
                task_name: "No Tags",
                task_tag: [],
            },
            error: null,
        });

        await updateTask(req, res);

        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);
        expect(mockQuery.delete).toHaveBeenCalled();

        expect(mockQuery.insert).not.toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    task_id: "1",
                }),
            ])
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            task_id: 1,
            task_name: "No Tags",
            task_tag: [],
        });
    });

    it("should return 404 and not modify tags when the task does not belong to the authenticated user", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "99" },
            body: {
                task_name: "Unauthorized Update",
                task_info: "Should not be updated",
                priority_level: "High",
                status: "Pending",
                due_date: "2026-10-15",
                tag_ids: [1, 2],
            },
        };

        const res = createResponse();

        mockQuery.select.mockResolvedValueOnce({
            data: [],
            error: null,
        });

        await updateTask(req, res);

        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);
        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", "99");

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: "Task not found",
        });

        expect(mockQuery.delete).not.toHaveBeenCalled();
        expect(mockQuery.insert).not.toHaveBeenCalled();
        expect(mockQuery.single).not.toHaveBeenCalled();
    });

    it("should return 400 when updating a task fails", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "1" },
            body: {
                task_name: "Failed Update",
                task_info: "Updated information",
                priority_level: "High",
                status: "Pending",
                due_date: "2026-10-05",
            },
        };

        const res = createResponse();

        mockQuery.select.mockResolvedValueOnce({
            data: null,
            error: new Error("Update failed"),
        });

        await updateTask(req, res);

        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Update failed",
        });
    });
});

describe("deleteTask", () => {
    it("should soft delete a task belonging to the authenticated user", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "1" },
        };

        const res = createResponse();

        mockQuery.select.mockResolvedValueOnce({
            data: [
                {
                    task_id: 1,
                    deleted_at: "2026-09-20T10:00:00.000Z",
                },
            ],
            error: null,
        });

        await deleteTask(req, res);

        expect(mockQuery.update).toHaveBeenCalledWith({
            deleted_at: expect.any(String),
        });

        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", "1");
        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);
        expect(mockQuery.is).toHaveBeenCalledWith("deleted_at", null);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Task with ID 1 deleted successfully",
            data: [
                {
                    task_id: 1,
                    deleted_at: "2026-09-20T10:00:00.000Z",
                },
            ],
        });
    });

    it("should return 400 when deleting a task fails", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "1" },
        };

        const res = createResponse();

        mockQuery.select.mockResolvedValueOnce({
            data: null,
            error: new Error("Delete failed"),
        });

        await deleteTask(req, res);

        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Delete failed",
        });
    });
});

describe("restoreTask", () => {
    it("should restore a deleted task belonging to the authenticated user", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "1" },
        };

        const res = createResponse();

        mockQuery.eq
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({
                error: null,
            })
            .mockReturnValueOnce(mockQuery)
            .mockReturnValueOnce(mockQuery);

        mockQuery.single.mockResolvedValueOnce({
            data: {
                task_id: 1,
                task_name: "Restored Task",
                deleted_at: null,
            },
            error: null,
        });

        await restoreTask(req, res);

        expect(mockQuery.update).toHaveBeenCalledWith({
            deleted_at: null,
        });

        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", "1");
        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            task_id: 1,
            task_name: "Restored Task",
            deleted_at: null,
        });
    });

    it("should return 400 when restoring a task belonging to the authenticated user fails", async () => {
        const req = {
            user: mockUser,
            params: { task_id: "1" },
        };

        const res = createResponse();

        mockQuery.eq
            .mockReturnValueOnce(mockQuery)
            .mockResolvedValueOnce({
                error: new Error("Restore failed"),
            });

        await restoreTask(req, res);

        expect(mockQuery.update).toHaveBeenCalledWith({
            deleted_at: null,
        });

        expect(mockQuery.eq).toHaveBeenCalledWith("task_id", "1");
        expect(mockQuery.eq).toHaveBeenCalledWith("user_id", mockUser.id);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Restore failed",
        });
    });
});