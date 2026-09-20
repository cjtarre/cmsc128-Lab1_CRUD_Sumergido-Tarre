import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

import { tagService } from "./tagService";

vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
    },
}));

describe("tagService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("gets all tags", async () => {
        const tags = [
            {
                tag_id: 1,
                tag_name: "School",
                tag_info: "School-related tasks",
            },
            {
                tag_id: 2,
                tag_name: "Personal",
                tag_info: "Personal tasks",
            },
        ];

        axios.get.mockResolvedValue({
            data: tags,
        });

        const result = await tagService.getTags();

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/tags")
        );

        expect(result).toEqual(tags);
    });
});