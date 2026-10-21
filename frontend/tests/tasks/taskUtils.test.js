import { describe, expect, it } from "vitest";
import {
    TASK_SORT_MODES,
    DUEDATE_SORT_MODES,
    TASK_SORT_CYCLE,
    getNextSort,
    sortCompletedLast,
    sortTasksByTaskColumn,
    sortTasksByDueDateColumn,
} from "../../src/features/tasks/utils/taskUtils";
import { STATUS } from "../../src/features/tasks/constants/taskOptions";

describe("taskUtils", () => {
    const active = "pending";

    it("starts at the first mode when switching sort columns", () => {
        expect(getNextSort(
            { column: "dueDate", mode: DUEDATE_SORT_MODES.DUE_ASC },
            "task",
            TASK_SORT_CYCLE,
        )).toEqual({ column: "task", mode: TASK_SORT_MODES.TITLE_ASC });
    });

    it("cycles through modes and wraps around", () => {
        expect(getNextSort(
            { column: "task", mode: TASK_SORT_MODES.TITLE_ASC },
            "task",
            TASK_SORT_CYCLE,
        ).mode).toBe(TASK_SORT_MODES.TITLE_DESC);

        expect(getNextSort(
            { column: "task", mode: TASK_SORT_MODES.PRIORITY_DESC },
            "task",
            TASK_SORT_CYCLE,
        ).mode).toBe(TASK_SORT_MODES.TITLE_ASC);
    });

    it("keeps completed tasks after active tasks", () => {
        const result = sortCompletedLast([
            { id: 1, status: STATUS.COMPLETED },
            { id: 2, status: active },
            { id: 3, status: STATUS.COMPLETED },
        ]);

        expect(result.map((task) => task.id)).toEqual([2, 1, 3]);
    });

    it("sorts task titles ascending and descending", () => {
        const tasks = [
            { id: 1, title: "Beta", status: active },
            { id: 2, title: "Alpha", status: active },
        ];

        expect(sortTasksByTaskColumn(tasks, TASK_SORT_MODES.TITLE_ASC).map((task) => task.id)).toEqual([2, 1]);
        expect(sortTasksByTaskColumn(tasks, TASK_SORT_MODES.TITLE_DESC).map((task) => task.id)).toEqual([1, 2]);
    });

    it("sorts task priorities while keeping completed tasks last", () => {
        const tasks = [
            { id: 1, priority: "high", status: active },
            { id: 2, priority: "low", status: active },
            { id: 3, priority: "medium", status: STATUS.COMPLETED },
        ];

        const asc = sortTasksByTaskColumn(tasks, TASK_SORT_MODES.PRIORITY_ASC);
        const desc = sortTasksByTaskColumn(tasks, TASK_SORT_MODES.PRIORITY_DESC);

        expect(asc.at(-1).id).toBe(3);
        expect(desc.at(-1).id).toBe(3);
        expect(asc[0].id).not.toBe(desc[0].id);
    });

    it("sorts due dates ascending and descending", () => {
        const tasks = [
            { id: 1, dueDate: "20/10/2026", dueTime: "10:00 AM", status: active },
            { id: 2, dueDate: "19/10/2026", dueTime: "11:00 PM", status: active },
        ];

        expect(sortTasksByDueDateColumn(tasks, DUEDATE_SORT_MODES.DUE_ASC).map((task) => task.id)).toEqual([2, 1]);
        expect(sortTasksByDueDateColumn(tasks, DUEDATE_SORT_MODES.DUE_DESC).map((task) => task.id)).toEqual([1, 2]);
    });

    it("handles 12 AM and 12 PM correctly", () => {
        const tasks = [
            { id: 1, dueDate: "20/10/2026", dueTime: "12:00 PM", status: active },
            { id: 2, dueDate: "20/10/2026", dueTime: "12:00 AM", status: active },
        ];

        expect(sortTasksByDueDateColumn(tasks, DUEDATE_SORT_MODES.DUE_ASC).map((task) => task.id)).toEqual([2, 1]);
    });

    it("places tasks without due dates after dated tasks", () => {
        const tasks = [
            { id: 1, dueDate: null, status: active },
            { id: 2, dueDate: "20/10/2026", dueTime: "10:00 AM", status: active },
        ];

        expect(sortTasksByDueDateColumn(tasks, DUEDATE_SORT_MODES.DUE_ASC).map((task) => task.id)).toEqual([2, 1]);
    });

    it("sorts by creation date", () => {
        const tasks = [
            { id: 1, createdAt: "2026-10-20T10:00:00Z", status: active },
            { id: 2, createdAt: "2026-10-19T10:00:00Z", status: active },
        ];

        expect(sortTasksByDueDateColumn(tasks, DUEDATE_SORT_MODES.CRE_ASC).map((task) => task.id)).toEqual([2, 1]);
        expect(sortTasksByDueDateColumn(tasks, DUEDATE_SORT_MODES.CRE_DESC).map((task) => task.id)).toEqual([1, 2]);
    });

    it("does not mutate the original array", () => {
        const tasks = [
            { id: 1, title: "B", status: active },
            { id: 2, title: "A", status: active },
        ];
        const original = [...tasks];

        sortTasksByTaskColumn(tasks, TASK_SORT_MODES.TITLE_ASC);
        expect(tasks).toEqual(original);
    });
});
