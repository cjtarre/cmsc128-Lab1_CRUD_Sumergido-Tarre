import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const USER_ID = "user-1";

const supabase = {
    from: vi.fn(),
};

const validation = {
    parseId: vi.fn(),
};

mock(path.resolve("config/supabaseAdmin.js"), supabase);
mock(path.resolve("utils/validation.js"), validation);

const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} = require("../../controllers/notificationController.js");

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
});

const makeQuery = (result = { data: null, error: null }) => {
    const query = {};

    [
        "select", "insert", "update", "delete",
        "eq", "neq", "is", "in", "order", "limit",
    ].forEach((method) => {
        query[method] = vi.fn().mockReturnValue(query);
    });

    query.single = vi.fn().mockResolvedValue(result);
    query.maybeSingle = vi.fn().mockResolvedValue(result);

    query.then = (resolve, reject) =>
        Promise.resolve(result).then(resolve, reject);

    return query;
};

const setTableQueues = (tables) => {
    const queues = Object.fromEntries(
        Object.entries(tables).map(([key, value]) => [
            key,
            Array.isArray(value) ? [...value] : [value],
        ])
    );

    supabase.from.mockImplementation((table) => {
        const query = queues[table]?.shift();

        if (!query) {
            throw new Error(`No mock query configured for table: ${table}`);
        }

        return query;
    });
};

beforeEach(() => {
    vi.clearAllMocks();

    validation.parseId.mockImplementation((value) => {
        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
    });
});

describe("notificationController", () => {
    describe("getNotifications", () => {
        it("returns notifications with unread count and invitation status", async () => {
            const notificationsQuery = makeQuery({
                data: [
                    {
                        id: 1,
                        type: "project_invite",
                        data: { invite_id: "5" },
                        read_at: null,
                    },
                    {
                        id: 2,
                        type: "task_assigned",
                        data: { task_id: 9 },
                        read_at: null,
                    },
                ],
                error: null,
            });

            const countQuery = makeQuery({
                count: 2,
                error: null,
            });

            const invitesQuery = makeQuery({
                data: [
                    {
                        id: 5,
                        status: "accepted",
                    },
                ],
                error: null,
            });

            setTableQueues({
                notifications: [
                    notificationsQuery,
                    countQuery,
                ],
                project_invite: invitesQuery,
            });

            const req = {
                user: { id: USER_ID },
                query: {},
            };

            const res = createResponse();

            await getNotifications(req, res);

            expect(notificationsQuery.limit).toHaveBeenCalledWith(50);

            expect(invitesQuery.in).toHaveBeenCalledWith(
                "id",
                [5]
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                notifications: [
                    {
                        id: 1,
                        type: "project_invite",
                        data: { invite_id: "5" },
                        read_at: null,
                        invite_status: "accepted",
                    },
                    {
                        id: 2,
                        type: "task_assigned",
                        data: { task_id: 9 },
                        read_at: null,
                    },
                ],
                unread_count: 2,
            });
        });

        it("filters unread notifications and clamps the limit to 100", async () => {
            const notificationsQuery = makeQuery({
                data: [],
                error: null,
            });

            const countQuery = makeQuery({
                count: 0,
                error: null,
            });

            setTableQueues({
                notifications: [
                    notificationsQuery,
                    countQuery,
                ],
            });

            const req = {
                user: { id: USER_ID },
                query: {
                    unread: "true",
                    limit: "500",
                },
            };

            const res = createResponse();

            await getNotifications(req, res);

            expect(notificationsQuery.limit).toHaveBeenCalledWith(100);

            expect(notificationsQuery.is).toHaveBeenCalledWith(
                "read_at",
                null
            );

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("markNotificationRead", () => {
        it("rejects an invalid notification id", async () => {
            validation.parseId.mockReturnValue(null);

            const req = {
                params: { notification_id: "bad" },
                user: { id: USER_ID },
            };

            const res = createResponse();

            await markNotificationRead(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Invalid notification id",
            });
        });

        it("marks an unread notification as read", async () => {
            const updateQuery = makeQuery({
                data: [{ id: 4 }],
                error: null,
            });

            setTableQueues({
                notifications: updateQuery,
            });

            const req = {
                params: { notification_id: "4" },
                user: { id: USER_ID },
            };

            const res = createResponse();

            await markNotificationRead(req, res);

            expect(updateQuery.update).toHaveBeenCalledWith({
                read_at: expect.any(String),
            });

            expect(updateQuery.eq).toHaveBeenCalledWith(
                "user_id",
                USER_ID
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Notification marked as read",
            });
        });

        it("is idempotent when the notification was already read", async () => {
            const updateQuery = makeQuery({
                data: [],
                error: null,
            });

            const existingQuery = makeQuery({
                data: { id: 4 },
                error: null,
            });

            setTableQueues({
                notifications: [
                    updateQuery,
                    existingQuery,
                ],
            });

            const req = {
                params: { notification_id: "4" },
                user: { id: USER_ID },
            };

            const res = createResponse();

            await markNotificationRead(req, res);

            expect(existingQuery.maybeSingle).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("returns 404 for another user's or missing notification", async () => {
            const updateQuery = makeQuery({
                data: [],
                error: null,
            });

            const existingQuery = makeQuery({
                data: null,
                error: null,
            });

            setTableQueues({
                notifications: [
                    updateQuery,
                    existingQuery,
                ],
            });

            const req = {
                params: { notification_id: "4" },
                user: { id: USER_ID },
            };

            const res = createResponse();

            await markNotificationRead(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "Notification not found",
            });
        });
    });

    describe("markAllNotificationsRead", () => {
        it("marks all unread notifications as read", async () => {
            const query = makeQuery({
                data: [{ id: 1 }, { id: 2 }, { id: 3 }],
                error: null,
            });

            setTableQueues({
                notifications: query,
            });

            const req = {
                user: { id: USER_ID },
            };

            const res = createResponse();

            await markAllNotificationsRead(req, res);

            expect(query.eq).toHaveBeenCalledWith(
                "user_id",
                USER_ID
            );

            expect(query.is).toHaveBeenCalledWith(
                "read_at",
                null
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                updated: 3,
            });
        });
    });

    describe("deleteNotification", () => {
        it("rejects an invalid notification id", async () => {
            validation.parseId.mockReturnValue(null);

            const req = {
                params: { notification_id: "bad" },
                user: { id: USER_ID },
            };

            const res = createResponse();

            await deleteNotification(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("deletes the authenticated user's notification", async () => {
            const query = makeQuery({
                data: [{ id: 9 }],
                error: null,
            });

            setTableQueues({
                notifications: query,
            });

            const req = {
                params: { notification_id: "9" },
                user: { id: USER_ID },
            };

            const res = createResponse();

            await deleteNotification(req, res);

            expect(query.delete).toHaveBeenCalled();
            expect(query.eq).toHaveBeenCalledWith(
                "user_id",
                USER_ID
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Notification deleted",
            });
        });

        it("returns 404 when the notification cannot be deleted", async () => {
            const query = makeQuery({
                data: [],
                error: null,
            });

            setTableQueues({
                notifications: query,
            });

            const req = {
                params: { notification_id: "9" },
                user: { id: USER_ID },
            };

            const res = createResponse();

            await deleteNotification(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "Notification not found",
            });
        });
    });
});
