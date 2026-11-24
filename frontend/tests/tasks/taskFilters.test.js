import { describe, expect, it } from "vitest";
import { filterTasks, filterProjectTasks, getTaskTags, getTaskStats } from "../../src/features/tasks/utils/taskFilters";
import { STATUS } from "../../src/features/tasks/constants/taskOptions";

describe("taskFilters", () => {
    const tasks = [
        {
            id: 1,
            title: "Write report",
            description: "Prepare final document",
            priority: "high",
            status: "pending",
            assigneeId: 10,
            dueDate: null,
            tags: [{ tag_id: 1, tag_name: "School" }],
        },
        {
            id: 2,
            title: "Fix frontend",
            description: "Responsive layout",
            priority: "medium",
            status: STATUS.COMPLETED,
            assigneeId: null,
            dueDate: null,
            tags: [{ tag_id: 2, tag_name: "Code" }],
        },
        {
            id: 3,
            title: "Review API",
            description: "Check endpoints",
            priority: "low",
            status: "pending",
            assigneeId: 20,
            dueDate: null,
            tags: [1],
        },
    ];

    describe("filterTasks", () => {
        it("returns all matching tasks for the all category", () => {
            expect(filterTasks(tasks, "all", "", [], [], [])).toHaveLength(3);
        });

        it("searches title, description, and tag names case-insensitively", () => {
            expect(filterTasks(tasks, "all", "REPORT", [], [], []).map((task) => task.id)).toEqual([1]);
            expect(filterTasks(tasks, "all", "responsive", [], [], []).map((task) => task.id)).toEqual([2]);
            expect(filterTasks(tasks, "all", "school", [], [], []).map((task) => task.id)).toEqual([1]);
        });

        it("filters by priority", () => {
            expect(filterTasks(tasks, "all", "", ["high"], [], []).map((task) => task.id)).toEqual([1]);
        });

        it("filters by status", () => {
            expect(filterTasks(tasks, "all", "", [], [STATUS.COMPLETED], []).map((task) => task.id)).toEqual([2]);
        });

        it("filters by tag id", () => {
            expect(filterTasks(tasks, "all", "", [], [], [1]).map((task) => task.id)).toEqual([1]);
        });

        it("returns only completed tasks for completed", () => {
            expect(filterTasks(tasks, "completed", "", [], [], []).map((task) => task.id)).toEqual([2]);
        });
    });

    describe("filterProjectTasks", () => {
        it("searches project tasks by title and description", () => {
            expect(filterProjectTasks(tasks, {
                searchTerm: "frontend", assigneeFilter: "", statusFilter: "", priorityFilter: "", tagFilter: "",
            }).map((task) => task.id)).toEqual([2]);
        });

        it("filters assigned and unassigned tasks", () => {
            const base = { searchTerm: "", statusFilter: "", priorityFilter: "", tagFilter: "" };

            expect(filterProjectTasks(tasks, { ...base, assigneeFilter: "10" }).map((task) => task.id)).toEqual([1]);
            expect(filterProjectTasks(tasks, { ...base, assigneeFilter: "unassigned" }).map((task) => task.id)).toEqual([2]);
        });

        it("combines status, priority, and tag filters", () => {
            expect(filterProjectTasks(tasks, {
                searchTerm: "",
                assigneeFilter: "",
                statusFilter: "pending",
                priorityFilter: "high",
                tagFilter: "1",
            }).map((task) => task.id)).toEqual([1]);
        });

        it("supports object and primitive task tags", () => {
            const base = { searchTerm: "", assigneeFilter: "", statusFilter: "", priorityFilter: "" };
            expect(filterProjectTasks(tasks, { ...base, tagFilter: "1" }).map((task) => task.id)).toEqual([1, 3]);
        });
    });

    describe("getTaskTags", () => {
        it("returns unique normalized tags", () => {
            expect(getTaskTags(tasks)).toEqual([
                { id: "1", name: "1" },
                { id: "2", name: "Code" },
            ]);
        });

        it("keeps the latest name for a duplicate tag id", () => {
            expect(getTaskTags([
                { tags: [{ tag_id: 1, tag_name: "Old" }] },
                { tags: [{ tag_id: 1, tag_name: "Updated" }] },
            ])).toEqual([{ id: "1", name: "Updated" }]);
        });
    });

    describe("getTaskStats", () => {
        it("calculates total, active, completed, and progress", () => {
            expect(getTaskStats(tasks)).toMatchObject({
                total: 3,
                active: 2,
                completed: 1,
                progress: 33,
            });
        });

        it("returns zero progress for an empty list", () => {
            expect(getTaskStats([])).toEqual({
                total: 0,
                active: 0,
                completed: 0,
                overdue: 0,
                progress: 0,
            });
        });
    });
});
