import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const USER_ID = "user-1";
const INVITEE_ID = "user-2";
const PROJECT_ID = 7;

const supabase = {
    from: vi.fn(),
    rpc: vi.fn(),
};

const validation = {
    parseId: vi.fn(),
    validateIdentifier: vi.fn(),
    validateInviteRole: vi.fn(),
};

const notifications = {
    notify: vi.fn(),
    removeInviteNotifications: vi.fn(),
};

mock(path.resolve("config/supabaseAdmin.js"), supabase);
mock(path.resolve("utils/validation.js"), validation);
mock(path.resolve("utils/notifications.js"), notifications);

const {
    createInvite,
    getProjectInvites,
    cancelInvite,
    getMyInvites,
    acceptInvite,
    declineInvite,
} = require("../../controllers/inviteController.js");

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
});

const makeQuery = (result = { data: null, error: null }) => {
    const query = {};

    [
        "select", "insert", "update", "delete",
        "eq", "neq", "is", "in", "order",
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

    validation.validateIdentifier.mockReturnValue(null);
    validation.validateInviteRole.mockReturnValue(null);

    notifications.notify.mockResolvedValue(undefined);
    notifications.removeInviteNotifications.mockResolvedValue(undefined);
});

describe("inviteController", () => {
    describe("createInvite", () => {
        it("rejects an invalid identifier", async () => {
            validation.validateIdentifier.mockReturnValue(
                "Username or email is required"
            );

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: {
                    identifier: "",
                    role: "viewer",
                },
            };

            const res = createResponse();

            await createInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(supabase.from).not.toHaveBeenCalled();
        });

        it("rejects an invalid invitation role", async () => {
            validation.validateInviteRole.mockReturnValue(
                "Invalid invitation role"
            );

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: {
                    identifier: "member",
                    role: "owner",
                },
            };

            const res = createResponse();

            await createInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 404 when the invitee cannot be found", async () => {
            const profileQuery = makeQuery({
                data: null,
                error: null,
            });

            setTableQueues({ profiles: profileQuery });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: {
                    identifier: "missing",
                    role: "viewer",
                },
            };

            const res = createResponse();

            await createInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "No user found with that username or email",
            });
        });

        it("does not allow inviting yourself", async () => {
            const profileQuery = makeQuery({
                data: {
                    user_id: USER_ID,
                    username: "owner",
                    display_name: "Owner",
                },
                error: null,
            });

            setTableQueues({ profiles: profileQuery });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: {
                    identifier: "owner",
                    role: "viewer",
                },
            };

            const res = createResponse();

            await createInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "You can't invite yourself",
            });
        });

        it("rejects a user who is already a member", async () => {
            const profileQuery = makeQuery({
                data: {
                    user_id: INVITEE_ID,
                    username: "member",
                    display_name: "Member",
                },
                error: null,
            });

            const membershipQuery = makeQuery({
                data: { user_id: INVITEE_ID },
                error: null,
            });

            setTableQueues({
                profiles: profileQuery,
                project_user: membershipQuery,
            });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: {
                    identifier: "member",
                    role: "editor",
                },
            };

            const res = createResponse();

            await createInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                error: "That user is already a member of this project",
            });
        });

        it("creates an invitation and notifies the invitee", async () => {
            const profileQuery = makeQuery({
                data: {
                    user_id: INVITEE_ID,
                    username: "member",
                    display_name: "Member User",
                },
                error: null,
            });

            const membershipQuery = makeQuery({
                data: null,
                error: null,
            });

            const inviteQuery = makeQuery({
                data: {
                    id: 12,
                    role: "editor",
                    status: "pending",
                    created_at: "2026-10-21",
                },
                error: null,
            });

            const projectQuery = makeQuery({
                data: {
                    project_name: "CMSC 128",
                },
                error: null,
            });

            setTableQueues({
                profiles: profileQuery,
                project_user: membershipQuery,
                project_invite: inviteQuery,
                projects: projectQuery,
            });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: {
                    identifier: "MEMBER",
                    role: "editor",
                },
            };

            const res = createResponse();

            await createInvite(req, res);

            expect(profileQuery.eq).toHaveBeenCalledWith(
                "username",
                "member"
            );

            expect(inviteQuery.insert).toHaveBeenCalledWith({
                project_id: PROJECT_ID,
                inviter_id: USER_ID,
                invitee_id: INVITEE_ID,
                role: "editor",
            });

            expect(notifications.notify).toHaveBeenCalledWith(
                [INVITEE_ID],
                "project_invite",
                {
                    actorId: USER_ID,
                    data: {
                        invite_id: 12,
                        project_id: PROJECT_ID,
                        project_name: "CMSC 128",
                        role: "editor",
                    },
                }
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                id: 12,
                role: "editor",
                status: "pending",
                created_at: "2026-10-21",
                invitee: {
                    username: "member",
                    display_name: "Member User",
                },
            });
        });

        it("returns 409 for an existing pending invitation", async () => {
            const profileQuery = makeQuery({
                data: {
                    user_id: INVITEE_ID,
                    username: "member",
                    display_name: "Member",
                },
                error: null,
            });

            const membershipQuery = makeQuery({
                data: null,
                error: null,
            });

            const inviteQuery = makeQuery({
                data: null,
                error: { code: "23505" },
            });

            setTableQueues({
                profiles: profileQuery,
                project_user: membershipQuery,
                project_invite: inviteQuery,
            });

            const req = {
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: {
                    identifier: "member",
                    role: "viewer",
                },
            };

            const res = createResponse();

            await createInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                error: "That user already has a pending invitation",
            });
        });
    });

    it("returns pending project invitations", async () => {
        const query = makeQuery({
            data: [
                {
                    id: 1,
                    role: "viewer",
                    status: "pending",
                },
            ],
            error: null,
        });

        setTableQueues({ project_invite: query });

        const req = { projectId: PROJECT_ID };
        const res = createResponse();

        await getProjectInvites(req, res);

        expect(query.eq).toHaveBeenCalledWith(
            "project_id",
            PROJECT_ID
        );

        expect(query.eq).toHaveBeenCalledWith(
            "status",
            "pending"
        );

        expect(res.status).toHaveBeenCalledWith(200);
    });

    describe("cancelInvite", () => {
        it("rejects an invalid invite id", async () => {
            validation.parseId.mockReturnValue(null);

            const req = {
                params: { invite_id: "bad" },
                projectId: PROJECT_ID,
            };

            const res = createResponse();

            await cancelInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 404 when a pending invite is not found", async () => {
            const query = makeQuery({ data: [], error: null });

            setTableQueues({ project_invite: query });

            const req = {
                params: { invite_id: "12" },
                projectId: PROJECT_ID,
            };

            const res = createResponse();

            await cancelInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("cancels a pending invitation and removes its notification", async () => {
            const query = makeQuery({
                data: [{ id: 12 }],
                error: null,
            });

            setTableQueues({ project_invite: query });

            const req = {
                params: { invite_id: "12" },
                projectId: PROJECT_ID,
            };

            const res = createResponse();

            await cancelInvite(req, res);

            expect(query.update).toHaveBeenCalledWith({
                status: "cancelled",
                responded_at: expect.any(String),
            });

            expect(
                notifications.removeInviteNotifications
            ).toHaveBeenCalledWith([12]);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invite cancelled",
            });
        });
    });

    it("returns the authenticated user's pending invitations", async () => {
        const query = makeQuery({
            data: [
                {
                    id: 5,
                    role: "editor",
                    status: "pending",
                    created_at: "2026-10-21",
                    projects: {
                        id: PROJECT_ID,
                        project_name: "CMSC 128",
                    },
                    inviter: {
                        username: "owner",
                        display_name: "Owner",
                    },
                },
            ],
            error: null,
        });

        setTableQueues({ project_invite: query });

        const req = {
            user: { id: INVITEE_ID },
        };

        const res = createResponse();

        await getMyInvites(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            {
                id: 5,
                role: "editor",
                status: "pending",
                created_at: "2026-10-21",
                inviter: {
                    username: "owner",
                    display_name: "Owner",
                },
                project: {
                    id: PROJECT_ID,
                    project_name: "CMSC 128",
                },
            },
        ]);
    });

    describe("respondToInvite", () => {
        it("accepts an invitation", async () => {
            supabase.rpc.mockResolvedValue({
                data: {
                    result: "accepted",
                    project_id: PROJECT_ID,
                },
                error: null,
            });

            const req = {
                params: { invite_id: "12" },
                user: { id: INVITEE_ID },
            };

            const res = createResponse();

            await acceptInvite(req, res);

            expect(supabase.rpc).toHaveBeenCalledWith(
                "respond_to_invite",
                {
                    p_invite_id: 12,
                    p_user_id: INVITEE_ID,
                    p_accept: true,
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                result: "accepted",
                project_id: PROJECT_ID,
            });
        });

        it("declines an invitation", async () => {
            supabase.rpc.mockResolvedValue({
                data: {
                    result: "declined",
                    project_id: PROJECT_ID,
                },
                error: null,
            });

            const req = {
                params: { invite_id: "12" },
                user: { id: INVITEE_ID },
            };

            const res = createResponse();

            await declineInvite(req, res);

            expect(supabase.rpc).toHaveBeenCalledWith(
                "respond_to_invite",
                expect.objectContaining({
                    p_accept: false,
                })
            );

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it.each([
            [
                "not_pending",
                409,
                "This invitation has already been answered",
            ],
            [
                "project_deleted",
                410,
                "This project no longer exists",
            ],
            [
                "missing",
                404,
                "Invitation not found",
            ],
        ])("handles response result %s", async (result, status, message) => {
            supabase.rpc.mockResolvedValue({
                data: { result },
                error: null,
            });

            const req = {
                params: { invite_id: "12" },
                user: { id: INVITEE_ID },
            };

            const res = createResponse();

            await acceptInvite(req, res);

            expect(res.status).toHaveBeenCalledWith(status);
            expect(res.json).toHaveBeenCalledWith({
                error: message,
            });
        });
    });
});
