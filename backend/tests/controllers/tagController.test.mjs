import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const mock = require("mock-require");

const mockQuery = {
    select: vi.fn(),
    order: vi.fn(),
    or: vi.fn(),
    is: vi.fn(),
    insert: vi.fn(),
    single: vi.fn(),
};

const supabase = { from: vi.fn() };

const projectAccess = {
    ROLE_RANK: { viewer: 1, editor: 2, owner: 3 },
    getRole: vi.fn(),
    getMemberProjectIds: vi.fn(),
    getDefaultProjectId: vi.fn(),
};

mock(path.resolve("config/supabaseAdmin.js"), supabase);
mock(path.resolve("utils/projectAccess.js"), projectAccess);

const { getAllTags, createTag } = require("../../controllers/tagController.js");

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
});

beforeEach(() => {
    vi.clearAllMocks();

    supabase.from.mockReturnValue(mockQuery);
    mockQuery.select.mockReturnValue(mockQuery);
    mockQuery.order.mockReturnValue(mockQuery);
    mockQuery.insert.mockReturnValue(mockQuery);

    projectAccess.getRole.mockResolvedValue("owner");
    projectAccess.getMemberProjectIds.mockResolvedValue([7]);
    projectAccess.getDefaultProjectId.mockResolvedValue(7);

    mockQuery.or.mockResolvedValue({
        data: [
            { tag_id: 2, tag_name: "Personal", project_id: null },
            { tag_id: 1, tag_name: "School", project_id: 7 },
        ],
        error: null,
    });

    mockQuery.is.mockResolvedValue({
        data: [{ tag_id: 2, tag_name: "Personal", project_id: null }],
        error: null,
    });
});

describe("getAllTags", () => {
    it("should return global and project tags available to the authenticated user", async () => {
        const req = { user: { id: "test-user-id" }, query: {} };
        const res = createResponse();

        await getAllTags(req, res);

        expect(supabase.from).toHaveBeenCalledWith("tags");
        expect(mockQuery.select).toHaveBeenCalledWith("*");
        expect(mockQuery.order).toHaveBeenCalledWith("tag_name", { ascending: true });
        expect(mockQuery.or).toHaveBeenCalledWith("project_id.is.null,project_id.in.(7)");
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 500 when fetching tags fails", async () => {
        const req = { user: { id: "test-user-id" }, query: {} };
        const res = createResponse();

        mockQuery.or.mockResolvedValue({
            data: null,
            error: new Error("Database error"),
        });

        await getAllTags(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Internal Server Error",
        });
    });
});

describe("createTag", () => {
    it("should create a custom project tag for an authorized user", async () => {
        const createdTag = {
            tag_id: 4,
            tag_name: "CMSC 128",
            color: "#eab308",
            project_id: 7,
        };

        const req = {
            user: { id: "test-user-id" },
            body: {
                tag_name: "CMSC 128",
                color: "#eab308",
                project_id: 7,
            },
        };
        const res = createResponse();

        mockQuery.single.mockResolvedValue({
            data: createdTag,
            error: null,
        });

        await createTag(req, res);

        expect(projectAccess.getRole).toHaveBeenCalledWith(
            7,
            "test-user-id"
        );
        expect(supabase.from).toHaveBeenCalledWith("tags");

        const insertArg = mockQuery.insert.mock.calls[0][0];
        const payload = Array.isArray(insertArg) ? insertArg[0] : insertArg;

        expect(payload).toMatchObject({
            tag_name: "CMSC 128",
            color: "#eab308",
            project_id: 7,
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdTag);
    });
});
