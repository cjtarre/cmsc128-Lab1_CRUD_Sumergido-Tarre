import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateProject } from "../../src/features/projects/hooks/useCreateProject";
import { useProjectMembersList } from "../../src/features/projects/hooks/useProjectMembersList";
import { projectService } from "../../src/features/projects/services/projectService";

vi.mock("../../src/features/projects/services/projectService", () => ({
    projectService: { getMembers: vi.fn() },
}));

describe("useCreateProject", () => {
    it("tracks project name changes", () => {
        const { result } = renderHook(() => useCreateProject(true, vi.fn(), vi.fn()));

        act(() => {
            result.current.handleNameChange({ target: { value: "CMSC 128" } });
        });

        expect(result.current.projectName).toBe("CMSC 128");
    });

    it("submits and closes after successful creation", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);
        const onClose = vi.fn();
        const { result } = renderHook(() => useCreateProject(true, onSubmit, onClose));

        act(() => {
            result.current.handleNameChange({ target: { value: "Project" } });
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() });
        });

        expect(onSubmit).toHaveBeenCalledWith("Project");
        expect(onClose).toHaveBeenCalled();
        expect(result.current.projectName).toBe("");
        expect(result.current.submitting).toBe(false);
    });

    it("shows validation error for a blank name", async () => {
        const { result } = renderHook(() => useCreateProject(true, vi.fn(), vi.fn()));

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() });
        });

        expect(result.current.error).toBe("Project name is required.");
    });
});

describe("useProjectMembersList", () => {
    beforeEach(() => vi.clearAllMocks());

    it("loads project members", async () => {
        projectService.getMembers.mockResolvedValue([{ user_id: 1 }]);

        const { result } = renderHook(() => useProjectMembersList(5));

        await waitFor(() => expect(result.current).toEqual([{ user_id: 1 }]));
        expect(projectService.getMembers).toHaveBeenCalledWith(5);
    });

    it("falls back to an empty list when loading fails", async () => {
        projectService.getMembers.mockRejectedValue(new Error("failed"));

        const { result } = renderHook(() => useProjectMembersList(5));

        await waitFor(() => expect(projectService.getMembers).toHaveBeenCalled());
        expect(result.current).toEqual([]);
    });
});
