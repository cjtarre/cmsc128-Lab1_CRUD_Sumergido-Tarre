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
};

const supabase = { from: vi.fn() };

mock(path.resolve("config/supabaseAdmin.js"), supabase);
mock(path.resolve("utils/projectAccess.js"), {
    getRole: vi.fn().mockResolvedValue("owner"),
    getMemberProjectIds: vi.fn().mockResolvedValue([7]),
});

const { getAllTags } = require("../../controllers/tagController.js");

const createResponse = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });

describe("getAllTags", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        supabase.from.mockReturnValue(mockQuery);
        mockQuery.select.mockReturnValue(mockQuery);
        mockQuery.order.mockReturnValue(mockQuery);
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

        mockQuery.or.mockResolvedValue({ data: null, error: new Error("Database error") });

        await getAllTags(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
});