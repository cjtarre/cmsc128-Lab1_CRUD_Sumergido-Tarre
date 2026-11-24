import { afterEach, describe, expect, it, vi } from "vitest";

import { formatActivityTime, getActivityContent, getActorName, getInitials } from "../../src/features/projects/utils/projectActivityUtils";

describe("projectActivityUtils", () => {
    afterEach(() => vi.useRealTimers());

    it("gets the actor display name, username, or fallback", () => {
        expect(getActorName({ actor: { display_name: "Christie Tarre", username: "christie" } })).toBe("Christie Tarre");
        expect(getActorName({ actor: { username: "christie" } })).toBe("christie");
        expect(getActorName({})).toBe("A project member");
    });

    it("creates initials from the actor name", () => {
        expect(getInitials({ actor: { display_name: "Christie Tarre" } })).toBe("CT");
        expect(getInitials({ actor: { display_name: "Mary Grace Santos" } })).toBe("MG");
        expect(getInitials({})).toBe("?");
    });

    it("formats recent activity times", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));

        expect(formatActivityTime("2026-10-21T11:59:40Z")).toBe("Just now");
        expect(formatActivityTime("2026-10-21T11:55:00Z")).toBe("5m ago");
        expect(formatActivityTime("2026-10-21T09:00:00Z")).toBe("3h ago");
        expect(formatActivityTime("2026-10-19T12:00:00Z")).toBe("2d ago");
    });

    it("returns an empty string when activity time is missing", () => {
        expect(formatActivityTime(null)).toBe("");
    });

    it("describes task creation", () => {
        expect(getActivityContent({
            activity_type: "task_created",
            actor: { display_name: "Christie" },
            data: { task_name: "Write tests" },
        })).toEqual({ actor: "Christie", action: "created", subject: "Write tests" });
    });

    it("describes a task status change", () => {
        expect(getActivityContent({
            activity_type: "task_status_changed",
            actor: { username: "christie" },
            data: { task_name: "Write tests", status: "in_progress" },
        })).toEqual({
            actor: "christie",
            action: "moved",
            subject: "Write tests",
            detail: "to in progress",
        });
    });

    it("describes task assignment and reassignment", () => {
        expect(getActivityContent({
            activity_type: "task_assigned",
            data: { taskName: "Testing", assigneeName: "Josef" },
        })).toEqual({
            actor: "A project member",
            action: "assigned",
            subject: "Testing",
            detail: "to Josef",
        });

        expect(getActivityContent({
            activity_type: "task_reassigned",
            data: { task_name: "Testing", assignee_name: "Christie" },
        }).action).toBe("reassigned");
    });

    it("describes member activity", () => {
        expect(getActivityContent({
            activity_type: "member_joined",
            data: { display_name: "Josef" },
        })).toEqual({ actor: "Josef", action: "joined", subject: "the project" });

        expect(getActivityContent({
            activity_type: "member_removed",
            actor: { display_name: "Christie" },
            data: { member_name: "Josef" },
        })).toEqual({
            actor: "Christie",
            action: "removed",
            subject: "Josef",
            detail: "from the project",
        });
    });

    it("describes member role changes", () => {
        expect(getActivityContent({
            activity_type: "member_role_changed",
            actor: { display_name: "Owner" },
            data: { username: "member", role: "editor" },
        })).toEqual({
            actor: "Owner",
            action: "changed",
            subject: "member",
            detail: "to editor",
        });
    });

    it("falls back safely for an unknown activity type", () => {
        expect(getActivityContent({
            activity_type: "something_new",
            actor: { username: "christie" },
        })).toEqual({ actor: "christie", action: "updated", subject: "the project" });
    });
});
