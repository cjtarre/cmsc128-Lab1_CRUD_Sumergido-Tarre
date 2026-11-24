import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const supabase = { from: vi.fn() };
const validation = { parseId: vi.fn() };

mock(path.resolve("config/supabaseAdmin.js"), supabase);
mock(path.resolve("utils/validation.js"), validation);

const {
    ROLE_RANK,
    getRole,
    getMemberProjectIds,
    getDefaultProjectId,
    validateTagIdsForProject,
    requireProjectRole,
} = require("../../utils/projectAccess.js");

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
});

const makeQuery = (result = { data: null, error: null }) => {
    const query = {};

    ["select", "eq", "is", "in"].forEach((method) => {
        query[method] = vi.fn().mockReturnValue(query);
    });

    query.maybeSingle = vi.fn().mockResolvedValue(result);

    query.then = (resolve, reject) =>
        Promise.resolve(result).then(resolve, reject);

    return query;
};

beforeEach(() => {
    vi.clearAllMocks();

    validation.parseId.mockImplementation((value) => {
        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
    });
});

describe("projectAccess", () => {
    it("defines increasing viewer, editor, and owner permissions", () => {
        expect(ROLE_RANK).toEqual({
            viewer: 1,
            editor: 2,
            owner: 3,
        });
    });

    describe("getRole", () => {
        it("returns the role for an active project membership", async () => {
            const query = makeQuery({
                data: { role: "editor" },
                error: null,
            });

            supabase.from.mockReturnValue(query);

            await expect(getRole(7, "user-1")).resolves.toBe("editor");

            expect(query.eq).toHaveBeenCalledWith("project_id", 7);
            expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
            expect(query.is).toHaveBeenCalledWith(
                "projects.deleted_at",
                null
            );
        });

        it("returns null when the user is not a member", async () => {
            const query = makeQuery({ data: null, error: null });
            supabase.from.mockReturnValue(query);

            await expect(getRole(7, "user-1")).resolves.toBeNull();
        });

        it("includes deleted projects when requested", async () => {
            const query = makeQuery({
                data: { role: "owner" },
                error: null,
            });

            supabase.from.mockReturnValue(query);

            await expect(
                getRole(7, "user-1", { includeDeleted: true })
            ).resolves.toBe("owner");

            expect(query.is).not.toHaveBeenCalled();
        });

        it("throws database errors", async () => {
            const error = new Error("Database failed");

            const query = makeQuery({
                data: null,
                error,
            });

            supabase.from.mockReturnValue(query);

            await expect(getRole(7, "user-1")).rejects.toBe(error);
        });
    });

    it("returns all active project ids for a member", async () => {
        const query = makeQuery({
            data: [
                { project_id: 2 },
                { project_id: 7 },
                { project_id: 9 },
            ],
            error: null,
        });

        supabase.from.mockReturnValue(query);

        await expect(
            getMemberProjectIds("user-1")
        ).resolves.toEqual([2, 7, 9]);

        expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
        expect(query.is).toHaveBeenCalledWith(
            "projects.deleted_at",
            null
        );
    });

    describe("getDefaultProjectId", () => {
        it("returns the user's active default project id", async () => {
            const query = makeQuery({
                data: { id: 4 },
                error: null,
            });

            supabase.from.mockReturnValue(query);

            await expect(
                getDefaultProjectId("user-1")
            ).resolves.toBe(4);

            expect(query.eq).toHaveBeenCalledWith("owner", "user-1");
            expect(query.eq).toHaveBeenCalledWith("is_default", true);
        });

        it("returns null when no default project exists", async () => {
            const query = makeQuery({ data: null, error: null });
            supabase.from.mockReturnValue(query);

            await expect(
                getDefaultProjectId("user-1")
            ).resolves.toBeNull();
        });
    });

    describe("validateTagIdsForProject", () => {
        it("rejects a non-array tag list", async () => {
            await expect(
                validateTagIdsForProject("1,2", 7)
            ).resolves.toBe("tag_ids must be an array of tag ids");
        });

        it("rejects invalid tag ids", async () => {
            validation.parseId.mockImplementation((value) =>
                value === "bad" ? null : Number(value)
            );

            await expect(
                validateTagIdsForProject([1, "bad"], 7)
            ).resolves.toBe("tag_ids must be an array of tag ids");
        });

        it("accepts an empty tag list without querying Supabase", async () => {
            await expect(
                validateTagIdsForProject([], 7)
            ).resolves.toBeNull();

            expect(supabase.from).not.toHaveBeenCalled();
        });

        it("accepts global and same-project tags", async () => {
            const query = makeQuery({
                data: [
                    { tag_id: 1, project_id: null },
                    { tag_id: 2, project_id: 7 },
                ],
                error: null,
            });

            supabase.from.mockReturnValue(query);

            await expect(
                validateTagIdsForProject([1, 2, 2], 7)
            ).resolves.toBeNull();

            expect(query.in).toHaveBeenCalledWith(
                "tag_id",
                [1, 2]
            );
        });

        it("rejects missing or foreign-project tags", async () => {
            const query = makeQuery({
                data: [
                    { tag_id: 1, project_id: null },
                    { tag_id: 2, project_id: 99 },
                ],
                error: null,
            });

            supabase.from.mockReturnValue(query);

            await expect(
                validateTagIdsForProject([1, 2], 7)
            ).resolves.toBe(
                "One or more tags do not exist or do not belong to this project"
            );
        });
    });

    describe("requireProjectRole", () => {
        it("rejects an invalid project id", async () => {
            validation.parseId.mockReturnValue(null);

            const req = {
                params: { project_id: "bad" },
                user: { id: "user-1" },
            };

            const res = createResponse();
            const next = vi.fn();

            await requireProjectRole("viewer")(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        it("returns 404 for a non-member", async () => {
            const query = makeQuery({ data: null, error: null });
            supabase.from.mockReturnValue(query);

            const req = {
                params: { project_id: "7" },
                user: { id: "user-1" },
            };

            const res = createResponse();
            const next = vi.fn();

            await requireProjectRole("viewer")(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "Project not found",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("returns 403 when the user's role is too low", async () => {
            const query = makeQuery({
                data: { role: "viewer" },
                error: null,
            });

            supabase.from.mockReturnValue(query);

            const req = {
                params: { project_id: "7" },
                user: { id: "user-1" },
            };

            const res = createResponse();
            const next = vi.fn();

            await requireProjectRole("editor")(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: "Insufficient permissions",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("attaches project access and continues for a sufficient role", async () => {
            const query = makeQuery({
                data: { role: "editor" },
                error: null,
            });

            supabase.from.mockReturnValue(query);

            const req = {
                params: { project_id: "7" },
                user: { id: "user-1" },
            };

            const res = createResponse();
            const next = vi.fn();

            await requireProjectRole("viewer")(req, res, next);

            expect(req.projectId).toBe(7);
            expect(req.projectRole).toBe("editor");
            expect(next).toHaveBeenCalledOnce();
        });

        it("can authorize restoration against a deleted project", async () => {
            const query = makeQuery({
                data: { role: "owner" },
                error: null,
            });

            supabase.from.mockReturnValue(query);

            const req = {
                params: { project_id: "7" },
                user: { id: "user-1" },
            };

            const res = createResponse();
            const next = vi.fn();

            await requireProjectRole("owner", {
                includeDeleted: true,
            })(req, res, next);

            expect(query.is).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledOnce();
        });
    });
});
