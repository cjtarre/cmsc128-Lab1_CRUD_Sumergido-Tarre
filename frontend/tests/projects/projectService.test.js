import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../src/shared/services/api";
import { inviteService } from "../../src/features/projects/services/inviteService";
import { projectService } from "../../src/features/projects/services/projectService";

vi.mock("../../src/shared/services/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("projectService", () => {
    beforeEach(() => vi.clearAllMocks());

    it("gets active projects", async () => {
        api.get.mockResolvedValue({ data: [{ id: 1 }] });
        await expect(projectService.getProjects()).resolves.toEqual([{ id: 1 }]);
        expect(api.get).toHaveBeenCalledWith("/api/projects");
    });

    it("gets deleted projects", async () => {
        api.get.mockResolvedValue({ data: [{ id: 2 }] });
        await expect(projectService.getDeletedProjects()).resolves.toEqual([{ id: 2 }]);
        expect(api.get).toHaveBeenCalledWith("/api/projects", { params: { deleted: true } });
    });

    it("creates a project", async () => {
        api.post.mockResolvedValue({ data: { id: 1, project_name: "Takda" } });
        await expect(projectService.createProject("Takda")).resolves.toEqual({ id: 1, project_name: "Takda" });
        expect(api.post).toHaveBeenCalledWith("/api/projects", { project_name: "Takda" });
    });

    it("updates a project", async () => {
        const data = { project_name: "Updated" };
        api.put.mockResolvedValue({ data });
        await expect(projectService.updateProject(7, data)).resolves.toEqual(data);
        expect(api.put).toHaveBeenCalledWith("/api/projects/7", data);
    });

    it("deletes and restores a project", async () => {
        api.delete.mockResolvedValue({ data: { success: true } });
        api.patch.mockResolvedValue({ data: { success: true } });
        await projectService.deleteProject(7);
        await projectService.restoreProject(7);
        expect(api.delete).toHaveBeenCalledWith("/api/projects/7");
        expect(api.patch).toHaveBeenCalledWith("/api/projects/7/restore");
    });

    it("gets project members", async () => {
        api.get.mockResolvedValue({ data: [{ user_id: 3 }] });
        await expect(projectService.getMembers(7)).resolves.toEqual([{ user_id: 3 }]);
        expect(api.get).toHaveBeenCalledWith("/api/projects/7/members");
    });

    it("changes a member role", async () => {
        api.patch.mockResolvedValue({ data: { role: "editor" } });
        await projectService.changeMemberRole(7, 3, "editor");
        expect(api.patch).toHaveBeenCalledWith("/api/projects/7/members/3", { role: "editor" });
    });

    it("removes a member and leaves a project", async () => {
        api.delete.mockResolvedValue({ data: { success: true } });
        api.post.mockResolvedValue({ data: { success: true } });
        await projectService.removeMember(7, 3);
        await projectService.leaveProject(7);
        expect(api.delete).toHaveBeenCalledWith("/api/projects/7/members/3");
        expect(api.post).toHaveBeenCalledWith("/api/projects/7/leave");
    });

    it("gets project activities using the supplied limit", async () => {
        api.get.mockResolvedValue({ data: [{ id: 1 }] });
        await projectService.getActivities(7, 10);
        expect(api.get).toHaveBeenCalledWith("/api/projects/7/activities", { params: { limit: 10 } });
    });

    it("uses 20 as the default activity limit", async () => {
        api.get.mockResolvedValue({ data: [] });
        await projectService.getActivities(7);
        expect(api.get).toHaveBeenCalledWith("/api/projects/7/activities", { params: { limit: 20 } });
    });
});

describe("inviteService", () => {
    beforeEach(() => vi.clearAllMocks());

    it("gets project invitations", async () => {
        api.get.mockResolvedValue({ data: [{ id: 4 }] });
        await expect(inviteService.getProjectInvites(7)).resolves.toEqual([{ id: 4 }]);
        expect(api.get).toHaveBeenCalledWith("/api/projects/7/invites");
    });

    it("creates an invitation", async () => {
        api.post.mockResolvedValue({ data: { id: 4 } });
        await inviteService.createInvite(7, "christie", "editor");
        expect(api.post).toHaveBeenCalledWith("/api/projects/7/invites", { identifier: "christie", role: "editor" });
    });

    it("cancels an invitation", async () => {
        api.delete.mockResolvedValue({ data: { success: true } });
        await inviteService.cancelInvite(7, 4);
        expect(api.delete).toHaveBeenCalledWith("/api/projects/7/invites/4");
    });

    it("gets the current user's invitations", async () => {
        api.get.mockResolvedValue({ data: [] });
        await inviteService.getMyInvites();
        expect(api.get).toHaveBeenCalledWith("/api/invites");
    });

    it("accepts and declines invitations", async () => {
        api.post.mockResolvedValue({ data: { success: true } });
        await inviteService.acceptInvite(4);
        await inviteService.declineInvite(5);
        expect(api.post).toHaveBeenCalledWith("/api/invites/4/accept");
        expect(api.post).toHaveBeenCalledWith("/api/invites/5/decline");
    });
});
