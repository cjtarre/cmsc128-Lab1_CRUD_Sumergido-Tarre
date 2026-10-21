import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjectMembers } from "../../src/features/projects/hooks/useProjectMembers";
import { inviteService } from "../../src/features/projects/services/inviteService";
import { projectService } from "../../src/features/projects/services/projectService";

vi.mock("../../src/features/projects/services/projectService", () => ({
    projectService: {
        getMembers: vi.fn(),
        changeMemberRole: vi.fn(),
        removeMember: vi.fn(),
    },
}));

vi.mock("../../src/features/projects/services/inviteService", () => ({
    inviteService: {
        getProjectInvites: vi.fn(),
        createInvite: vi.fn(),
        cancelInvite: vi.fn(),
    },
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useProjectMembers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        projectService.getMembers.mockResolvedValue([
            { user_id: 1, display_name: "Owner", role: "owner" },
            { user_id: 2, display_name: "Member", role: "viewer" },
        ]);
        inviteService.getProjectInvites.mockResolvedValue([{ id: 8 }]);
    });

    it("loads members and owner invitations", async () => {
        const { result } = renderHook(() => useProjectMembers({ id: 10 }, true));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.members).toHaveLength(2);
        expect(result.current.invites).toEqual([{ id: 8 }]);
        expect(inviteService.getProjectInvites).toHaveBeenCalledWith(10);
    });

    it("does not load invitations for a non-owner", async () => {
        const { result } = renderHook(() => useProjectMembers({ id: 10 }, false));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(inviteService.getProjectInvites).not.toHaveBeenCalled();
        expect(result.current.invites).toEqual([]);
    });

    it("invites a member and reloads", async () => {
        inviteService.createInvite.mockResolvedValue({ id: 9 });

        const { result } = renderHook(() => useProjectMembers({ id: 10 }, true));
        await waitFor(() => expect(result.current.loading).toBe(false));

        projectService.getMembers.mockClear();

        let success;
        await act(async () => {
            success = await result.current.inviteMember("user@example.com", "editor");
        });

        expect(success).toBe(true);
        expect(inviteService.createInvite).toHaveBeenCalledWith(10, "user@example.com", "editor");
        expect(projectService.getMembers).toHaveBeenCalled();
    });

    it("returns false when inviting fails", async () => {
        inviteService.createInvite.mockRejectedValue(new Error("failed"));

        const { result } = renderHook(() => useProjectMembers({ id: 10 }, true));
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.inviteMember("user@example.com", "viewer");
        });

        expect(success).toBe(false);
    });

    it("changes a member role locally", async () => {
        projectService.changeMemberRole.mockResolvedValue({});

        const { result } = renderHook(() => useProjectMembers({ id: 10 }, true));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.changeRole(2, "editor");
        });

        expect(projectService.changeMemberRole).toHaveBeenCalledWith(10, 2, "editor");
        expect(result.current.members.find((member) => member.user_id === 2).role).toBe("editor");
    });

    it("removes a member locally", async () => {
        projectService.removeMember.mockResolvedValue({});

        const { result } = renderHook(() => useProjectMembers({ id: 10 }, true));
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.removeMember({ user_id: 2, display_name: "Member" });
        });

        expect(success).toBe(true);
        expect(projectService.removeMember).toHaveBeenCalledWith(10, 2);
        expect(result.current.members.some((member) => member.user_id === 2)).toBe(false);
        expect(result.current.removingMember).toBe(false);
    });

    it("does not remove an empty member", async () => {
        const { result } = renderHook(() => useProjectMembers({ id: 10 }, true));
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.removeMember(null);
        });

        expect(success).toBe(false);
        expect(projectService.removeMember).not.toHaveBeenCalled();
    });

    it("cancels an invitation locally", async () => {
        inviteService.cancelInvite.mockResolvedValue({});

        const { result } = renderHook(() => useProjectMembers({ id: 10 }, true));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.cancelInvite(8);
        });

        expect(inviteService.cancelInvite).toHaveBeenCalledWith(10, 8);
        expect(result.current.invites).toEqual([]);
    });
});
