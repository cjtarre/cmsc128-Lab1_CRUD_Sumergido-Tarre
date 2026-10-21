import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const USER_ID = "11111111-1111-4111-8111-111111111111";
const MEMBER_ID = "22222222-2222-4222-8222-222222222222";
const PROJECT_ID = 7;

const supabase = {
    from: vi.fn(),
    rpc: vi.fn(),
};

const validation = {
    isUuid: vi.fn(),
    validateInviteRole: vi.fn(),
};

mock(path.resolve("config/supabaseAdmin.js"), supabase);
mock(path.resolve("utils/validation.js"), validation);

const {
    getMembers,
    changeMemberRole,
    removeMember,
    leaveProject,
} = require("../../controllers/memberController.js");

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

beforeEach(() => {
    vi.clearAllMocks();

    validation.isUuid.mockReturnValue(true);
    validation.validateInviteRole.mockReturnValue(null);
});

describe("memberController", () => {
    it("returns members with the owner first", async () => {
        const query = makeQuery({
            data: [
                {
                    user_id: MEMBER_ID,
                    role: "editor",
                    created_at: "2026-01-01",
                    profiles: {
                        username: "editor",
                        display_name: "Editor User",
                    },
                },
                {
                    user_id: USER_ID,
                    role: "owner",
                    created_at: "2026-01-02",
                    profiles: {
                        username: "owner",
                        display_name: "Owner User",
                    },
                },
            ],
            error: null,
        });

        supabase.from.mockReturnValue(query);

        const req = { projectId: PROJECT_ID };
        const res = createResponse();

        await getMembers(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith([
            {
                user_id: USER_ID,
                role: "owner",
                joined_at: "2026-01-02",
                username: "owner",
                display_name: "Owner User",
            },
            {
                user_id: MEMBER_ID,
                role: "editor",
                joined_at: "2026-01-01",
                username: "editor",
                display_name: "Editor User",
            },
        ]);
    });

    describe("changeMemberRole", () => {
        it("rejects an invalid user id", async () => {
            validation.isUuid.mockReturnValue(false);

            const req = {
                params: { user_id: "bad" },
                user: { id: USER_ID },
                body: { role: "editor" },
            };

            const res = createResponse();

            await changeMemberRole(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Invalid user id",
            });
        });

        it("rejects an invalid role", async () => {
            validation.validateInviteRole.mockReturnValue(
                "Role must be editor or viewer"
            );

            const req = {
                params: { user_id: MEMBER_ID },
                user: { id: USER_ID },
                body: { role: "owner" },
            };

            const res = createResponse();

            await changeMemberRole(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("does not allow changing your own role", async () => {
            const req = {
                params: { user_id: USER_ID },
                user: { id: USER_ID },
                body: { role: "viewer" },
            };

            const res = createResponse();

            await changeMemberRole(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "You can't change your own role",
            });
        });

        it("changes another member's role", async () => {
            const query = makeQuery({
                data: [{ user_id: MEMBER_ID, role: "viewer" }],
                error: null,
            });

            supabase.from.mockReturnValue(query);

            const req = {
                params: { user_id: MEMBER_ID },
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: { role: "viewer" },
            };

            const res = createResponse();

            await changeMemberRole(req, res);

            expect(query.update).toHaveBeenCalledWith({
                role: "viewer",
            });

            expect(query.neq).toHaveBeenCalledWith("role", "owner");

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                user_id: MEMBER_ID,
                role: "viewer",
            });
        });

        it("returns 404 when the target is not an editable member", async () => {
            const query = makeQuery({ data: [], error: null });
            supabase.from.mockReturnValue(query);

            const req = {
                params: { user_id: MEMBER_ID },
                user: { id: USER_ID },
                projectId: PROJECT_ID,
                body: { role: "viewer" },
            };

            const res = createResponse();

            await changeMemberRole(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "Member not found",
            });
        });
    });

    describe("removeMember", () => {
        it("requires the leave endpoint when removing yourself", async () => {
            const req = {
                params: { user_id: USER_ID },
                user: { id: USER_ID },
                projectId: PROJECT_ID,
            };

            const res = createResponse();

            await removeMember(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Use the leave endpoint to leave a project",
            });
        });

        it("removes another non-owner member", async () => {
            const query = makeQuery({
                data: [{ user_id: MEMBER_ID }],
                error: null,
            });

            supabase.from.mockReturnValue(query);

            const req = {
                params: { user_id: MEMBER_ID },
                user: { id: USER_ID },
                projectId: PROJECT_ID,
            };

            const res = createResponse();

            await removeMember(req, res);

            expect(query.delete).toHaveBeenCalled();
            expect(query.neq).toHaveBeenCalledWith("role", "owner");

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Member removed",
            });
        });
    });

    describe("leaveProject", () => {
        it("leaves the project and returns the new owner when transferred", async () => {
            supabase.rpc.mockResolvedValue({
                data: {
                    result: "left",
                    new_owner_id: MEMBER_ID,
                },
                error: null,
            });

            const req = {
                projectId: PROJECT_ID,
                user: { id: USER_ID },
            };

            const res = createResponse();

            await leaveProject(req, res);

            expect(supabase.rpc).toHaveBeenCalledWith(
                "leave_project",
                {
                    p_project_id: PROJECT_ID,
                    p_user_id: USER_ID,
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "You left the project",
                new_owner_id: MEMBER_ID,
            });
        });

        it.each([
            [
                "default_project",
                400,
                "You can't leave your default project",
            ],
            [
                "sole_member",
                400,
                "You are the only member. Delete the project instead of leaving it.",
            ],
            [
                "missing",
                404,
                "Project not found",
            ],
        ])("handles leave result %s", async (result, status, message) => {
            supabase.rpc.mockResolvedValue({
                data: { result },
                error: null,
            });

            const req = {
                projectId: PROJECT_ID,
                user: { id: USER_ID },
            };

            const res = createResponse();

            await leaveProject(req, res);

            expect(res.status).toHaveBeenCalledWith(status);
            expect(res.json).toHaveBeenCalledWith({
                error: message,
            });
        });
    });
});
