import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjectSettings } from "../../src/features/projects/hooks/useProjectSettings";
import { projectService } from "../../src/features/projects/services/projectService";

const navigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigate,
}));

vi.mock("../../src/features/projects/services/projectService", () => ({
    projectService: {
        getProjects: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn(),
    },
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useProjectSettings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        projectService.getProjects.mockResolvedValue([
            { id: 5, project_name: "Project", is_default: false },
        ]);
    });

    it("loads the selected collaborative project", async () => {
        const { result } = renderHook(() => useProjectSettings(5));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.project).toEqual({
            id: 5,
            project_name: "Project",
            is_default: false,
        });
        expect(result.current.projectUnavailable).toBe(false);
    });

    it("marks a missing project unavailable", async () => {
        projectService.getProjects.mockResolvedValue([]);

        const { result } = renderHook(() => useProjectSettings(5));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.projectUnavailable).toBe(true);
    });

    it("does not allow the default project as project settings target", async () => {
        projectService.getProjects.mockResolvedValue([
            { id: 5, project_name: "My Tasks", is_default: true },
        ]);

        const { result } = renderHook(() => useProjectSettings(5));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.projectUnavailable).toBe(true);
    });

    it("updates project state", async () => {
        projectService.updateProject.mockResolvedValue({ project_name: "Renamed" });

        const { result } = renderHook(() => useProjectSettings(5));
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.updateProject({ project_name: "Renamed" });
        });

        expect(success).toBe(true);
        expect(projectService.updateProject).toHaveBeenCalledWith(5, { project_name: "Renamed" });
        expect(result.current.project.project_name).toBe("Renamed");
    });

    it("returns false when update fails", async () => {
        projectService.updateProject.mockRejectedValue(new Error("failed"));

        const { result } = renderHook(() => useProjectSettings(5));
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.updateProject({ project_name: "Renamed" });
        });

        expect(success).toBe(false);
    });

    it("deletes the project and returns to projects", async () => {
        projectService.deleteProject.mockResolvedValue({});

        const { result } = renderHook(() => useProjectSettings(5));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.deleteProject();
        });

        expect(projectService.deleteProject).toHaveBeenCalledWith(5);
        expect(navigate).toHaveBeenCalledWith("/projects", { replace: true });
        expect(result.current.deleting).toBe(false);
    });
});
