import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    apiInstance: {
        get: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}));

vi.mock("axios", () => ({
    default: { create: vi.fn(() => mocks.apiInstance) },
}));

import { tagService } from "../src/features/tasks/services/tagService";

describe("tagService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("gets all tags", async () => {
        const tags = [
            { tag_id: 1, tag_name: "School", tag_info: "School-related tasks" },
            { tag_id: 2, tag_name: "Personal", tag_info: "Personal tasks" },
        ];

        mocks.apiInstance.get.mockResolvedValue({ data: tags });

        const result = await tagService.getTags();

        expect(mocks.apiInstance.get).toHaveBeenCalledWith("/api/tags");
        expect(result).toEqual(tags);
    });
});