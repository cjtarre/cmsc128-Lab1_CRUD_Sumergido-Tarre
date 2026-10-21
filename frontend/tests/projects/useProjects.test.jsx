import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjects } from "../../src/features/projects/hooks/useProjects";
import { inviteService } from "../../src/features/projects/services/inviteService";
import { projectService } from "../../src/features/projects/services/projectService";

const refreshNotifications = vi.fn();

vi.mock("../../src/features/notifications/context/NotificationContext", () => ({
    useNotifications: () => ({ refreshNotifications }),
}));

vi.mock("../../src/features/projects/services/projectService", () => ({
    projectService: {
        getProjects: vi.fn(),
        getDeletedProjects: vi.fn(),
        createProject: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn(),
        restoreProject: vi.fn(),
    },
}));

vi.mock("../../src/features/projects/services/inviteService", () => ({
    inviteService: {
        getMyInvites: vi.fn(),
        acceptInvite: vi.fn(),
        declineInvite: vi.fn(),
    },
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

const mockLoad = () => {
    projectService.getProjects.mockResolvedValue([{ id: 1, project_name: "Alpha" }]);
    projectService.getDeletedProjects.mockResolvedValue([{ id: 2, project_name: "Deleted" }]);
    inviteService.getMyInvites.mockResolvedValue([{ id: 3 }]);
};

const clearLoadMocks = () => {
    projectService.getProjects.mockClear();
    projectService.getDeletedProjects.mockClear();
    inviteService.getMyInvites.mockClear();
};

const waitForReload = async (result) => {
    await waitFor(() => {
        expect(projectService.getProjects).toHaveBeenCalled();
        expect(projectService.getDeletedProjects).toHaveBeenCalled();
        expect(inviteService.getMyInvites).toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
    });
};

describe("useProjects", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLoad();
    });

    it("loads projects, deleted projects, and invitations", async () => {
        const { result } = renderHook(() => useProjects());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.projects).toEqual([{ id: 1, project_name: "Alpha" }]);
        expect(result.current.deletedProjects).toEqual([{ id: 2, project_name: "Deleted" }]);
        expect(result.current.invites).toEqual([{ id: 3 }]);
        expect(result.current.error).toBe("");
    });

    it("falls back to empty arrays for invalid API collections", async () => {
        projectService.getProjects.mockResolvedValue(null);
        projectService.getDeletedProjects.mockResolvedValue({});
        inviteService.getMyInvites.mockResolvedValue("invalid");

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.projects).toEqual([]);
        expect(result.current.deletedProjects).toEqual([]);
        expect(result.current.invites).toEqual([]);
    });

    it("sets an error when loading fails", async () => {
        projectService.getProjects.mockRejectedValue(new Error("failed"));

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe("Unable to load projects.");
    });

    it("creates a project and reloads data", async () => {
        projectService.createProject.mockResolvedValue({ id: 4 });

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        clearLoadMocks();

        let success;
        await act(async () => {
            success = await result.current.createProject("New Project");
        });

        await waitForReload(result);

        expect(success).toBe(true);
        expect(projectService.createProject).toHaveBeenCalledWith("New Project");
    });

    it("returns false when project creation fails", async () => {
        projectService.createProject.mockRejectedValue(new Error("failed"));

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.createProject("New Project");
        });

        expect(success).toBe(false);
    });

    it("updates a project locally", async () => {
        projectService.updateProject.mockResolvedValue({ project_name: "Renamed" });

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.updateProject(1, { project_name: "Renamed" });
        });

        expect(success).toBe(true);
        expect(result.current.projects[0].project_name).toBe("Renamed");
    });

    it("deletes and reloads a project", async () => {
        projectService.deleteProject.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        clearLoadMocks();

        let success;
        await act(async () => {
            success = await result.current.deleteProject({ id: 1 });
        });

        await waitForReload(result);

        expect(success).toBe(true);
        expect(projectService.deleteProject).toHaveBeenCalledWith(1);
        expect(result.current.deletingProject).toBe(false);
    });

    it("restores and reloads a project", async () => {
        projectService.restoreProject.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        clearLoadMocks();

        let success;
        await act(async () => {
            success = await result.current.restoreProject({
                id: 2,
                project_name: "Deleted",
            });
        });

        await waitForReload(result);

        expect(success).toBe(true);
        expect(projectService.restoreProject).toHaveBeenCalledWith(2);
        expect(result.current.restoringProject).toBe(false);
    });

    it("accepts an invitation and refreshes notifications", async () => {
        inviteService.acceptInvite.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.respondToInvite({
                id: 5,
                project: { project_name: "CMSC 128" },
            }, true);
        });

        expect(inviteService.acceptInvite).toHaveBeenCalledWith(5);
        expect(refreshNotifications).toHaveBeenCalled();
        expect(result.current.respondingInviteId).toBe(null);
    });

    it("declines an invitation", async () => {
        inviteService.declineInvite.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.respondToInvite({ id: 6 }, false);
        });

        expect(inviteService.declineInvite).toHaveBeenCalledWith(6);
        expect(refreshNotifications).toHaveBeenCalled();
    });

    it("reloads when the invitation change event fires", async () => {
        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.loading).toBe(false));

        clearLoadMocks();

        await act(async () => {
            window.dispatchEvent(new Event("takda:invites-changed"));
        });

        await waitForReload(result);
    });
});