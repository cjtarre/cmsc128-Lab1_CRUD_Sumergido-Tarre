
import { describe, expect, it } from "vitest";
import { convertApiTask } from "../../src/features/tasks/utils/convertApiTask";

describe("convertApiTask", () => {
    it("converts an API task into a frontend task", () => {
        const task = {
            task_id: 12,
            task_name: "Finish CMSC 128",
            task_info: "Review the frontend",
            status: "pending",
            priority_level: "high",
            due_date: null,
            created_at: "2026-11-08T00:00:00Z",
            project_id: 3,
            user_id: 5,
            assignee_id: 7,
            task_tag: [
                { tags: { tag_id: 1, tag_name: "School" } },
            ],
        };

        const result = convertApiTask(task);

        expect(result).toMatchObject({
            id: 12,
            title: "Finish CMSC 128",
            description: "Review the frontend",
            status: "pending",
            priority: "high",
            dueDate: "",
            dueTime: "",
            createdAt: "2026-11-08T00:00:00Z",
            projectId: 3,
            creatorId: 5,
            assigneeId: 7,
            tags: [{ tag_id: 1, tag_name: "School" }],
        });
    });

    it("handles missing optional fields", () => {
        const result = convertApiTask({
            task_id: 1,
            task_name: "Test task",
        });

        expect(result.description).toBe("");
        expect(result.dueDate).toBe("");
        expect(result.dueTime).toBe("");
        expect(result.tags).toEqual([]);
        expect(result.createdAt).toBeNull();
        expect(result.projectId).toBeNull();
        expect(result.assigneeId).toBeNull();
    });
});
