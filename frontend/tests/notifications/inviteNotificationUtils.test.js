import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getInviteNotificationMeta } from "../../src/features/notifications/utils/inviteNotificationUtils";

describe("getInviteNotificationMeta", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0));
    });

    afterEach(() => vi.useRealTimers());

    it("derives pending invitation metadata", () => {
        const result = getInviteNotificationMeta({
            actor: { display_name: "Christie Tarre" },
            invite_status: "pending",
            created_at: new Date(2026, 9, 21, 11, 55).toISOString(),
            data: { project_id: 5, project_name: "CMSC 128", role: "editor" },
        });

        expect(result).toEqual({
            actor: "Christie Tarre",
            projectId: 5,
            projectName: "CMSC 128",
            role: "editor",
            status: "pending",
            pending: true,
            accepted: false,
            time: "5m",
        });
    });

    it("identifies accepted invitations", () => {
        const result = getInviteNotificationMeta({
            invite_status: "accepted",
            data: { project_id: 5 },
        });

        expect(result.accepted).toBe(true);
        expect(result.pending).toBe(false);
        expect(result.projectName).toBe("a project");
    });

    it("uses fallback actor and project names", () => {
        const result = getInviteNotificationMeta({
            invite_status: "declined",
            data: {},
        });

        expect(result.actor).toBe("A Takda user");
        expect(result.projectName).toBe("a project");
    });
});
