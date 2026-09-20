import { beforeEach, describe, expect, it, vi } from "vitest";

const mockQuery = {
    select: vi.fn(),
    order: vi.fn(),
};

const supabase = (await import("../../config/supabaseClient.js")).default;
const { getAllTags } = await import("../../controllers/tagController.js");

describe("getAllTags", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        supabase.from = vi.fn().mockReturnValue(mockQuery);

        mockQuery.select.mockReturnValue(mockQuery);
        mockQuery.order.mockResolvedValue({
            data: [
                { tag_id: 1, tag_name: "School" },
                { tag_id: 2, tag_name: "Personal" },
            ],
            error: null,
        });
    });

    it("should return all tags ordered by tag name", async () => {
        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        await getAllTags(req, res);

        expect(supabase.from).toHaveBeenCalledWith("tags");
        expect(mockQuery.select).toHaveBeenCalledWith("*");
        expect(mockQuery.order).toHaveBeenCalledWith(
            "tag_name",
            { ascending: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            { tag_id: 1, tag_name: "School" },
            { tag_id: 2, tag_name: "Personal" },
        ]);
    });

    it("should return 500 when fetching tags fails", async () => {
        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        mockQuery.order.mockResolvedValue({
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