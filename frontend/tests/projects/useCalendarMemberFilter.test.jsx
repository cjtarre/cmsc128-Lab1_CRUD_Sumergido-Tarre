import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCalendarMemberFilter } from "../../src/features/projects/hooks/useCalendarMemberFilter";

const members = [
    { user_id: 1, display_name: "Christie Tarre" },
    { user_id: 2, username: "josef" },
];

const tasks = [
    { id: 1, assigneeId: 1 },
    { id: 2, assigneeId: 2 },
    { id: 3, assigneeId: null },
];

describe("useCalendarMemberFilter", () => {
    it("shows all tasks by default", () => {
        const { result } = renderHook(() => useCalendarMemberFilter(tasks, members));

        expect(result.current.selectedMemberId).toBe("all");
        expect(result.current.calendarTasks).toEqual(tasks);
    });

    it("filters tasks by member", () => {
        const { result } = renderHook(() => useCalendarMemberFilter(tasks, members));

        act(() => result.current.setSelectedMemberId("1"));

        expect(result.current.calendarTasks).toEqual([tasks[0]]);
    });

    it("filters unassigned tasks", () => {
        const { result } = renderHook(() => useCalendarMemberFilter(tasks, members));

        act(() => result.current.setSelectedMemberId("unassigned"));

        expect(result.current.calendarTasks).toEqual([tasks[2]]);
    });

    it("builds filter options from project members", () => {
        const { result } = renderHook(() => useCalendarMemberFilter(tasks, members));

        expect(result.current.filterOptions[0]).toMatchObject({ id: "all", name: "All assignees" });
        expect(result.current.filterOptions[1]).toMatchObject({ id: "unassigned", name: "Unassigned" });
        expect(result.current.filterOptions[2]).toMatchObject({ id: "1", name: "Christie Tarre", initials: "CT" });
    });

    it("gets task member metadata", () => {
        const { result } = renderHook(() => useCalendarMemberFilter(tasks, members));

        expect(result.current.getTaskMeta(tasks[0])).toEqual({
            initials: "CT",
            name: "Christie Tarre",
        });

        expect(result.current.getTaskMeta(tasks[2]).name).toBe("Unassigned");
    });

    it("uses an embedded assignee when available", () => {
        const { result } = renderHook(() => useCalendarMemberFilter(tasks, members));

        expect(result.current.getTaskMeta({
            assigneeId: 99,
            assignee: { display_name: "Mary Grace Santos" },
        })).toEqual({
            initials: "MS",
            name: "Mary Grace Santos",
        });
    });
});


