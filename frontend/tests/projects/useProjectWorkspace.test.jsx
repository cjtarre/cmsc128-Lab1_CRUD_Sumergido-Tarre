import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "../../src/shared/utils/queryKeys";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjectWorkspace } from "../../src/features/projects/hooks/useProjectWorkspace";
import { projectService } from "../../src/features/projects/services/projectService";
import { taskService } from "../../src/features/tasks/services/taskService";
import { createQueryWrapper } from "../queryTestUtils";

vi.mock("../../src/features/projects/services/projectService", () => ({
    projectService: {
        getProjects: vi.fn(),
        getProject: vi.fn(),
        getActivities: vi.fn(),
    },
}));

vi.mock("../../src/features/tasks/services/taskService", () => ({
    taskService: { getTasks: vi.fn() },
}));

vi.mock("../../src/features/tasks/hooks/useTasks", () => ({
    convertApiTask: vi.fn((task) => ({ ...task, converted: true })),
}));

describe("useProjectWorkspace", () => {
    let wrapper = createQueryWrapper();
    beforeEach(() => {
        wrapper = createQueryWrapper();
        vi.clearAllMocks();
        projectService.getProjects.mockResolvedValue([
            { id: 5, project_name: "Project", is_default: false },
        ]);
        projectService.getProject.mockImplementation((id) => Promise.resolve({
            id: Number(id),
            project_name: Number(id) === 5 ? "Project" : "Project",
            is_default: false,
        }));
        taskService.getTasks.mockResolvedValue([{ id: 1, task_name: "Task" }]);
        projectService.getActivities.mockResolvedValue([{ id: 2 }]);
    });

    it("loads project, tasks, and activities", async () => {
        const { result } = renderHook(() => useProjectWorkspace(5), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.project.project_name).toBe("Project");
        expect(result.current.tasks).toEqual([{ id: 1, task_name: "Task", converted: true }]);
        expect(result.current.activities).toEqual([{ id: 2 }]);
    });

    it("marks an unknown project unavailable", async () => {
        projectService.getProject.mockRejectedValue({ response: { status: 404 } });

        const { result } = renderHook(() => useProjectWorkspace(99), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.projectUnavailable).toBe(true);
        expect(result.current.project).toBe(null);
    });

    it("handles a 404 response", async () => {
        projectService.getProject.mockRejectedValue({ response: { status: 404 } });

        const { result } = renderHook(() => useProjectWorkspace(5), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.projectUnavailable).toBe(true);
    });

    it("shows access revoked after membership disappears without a page refresh", async () => {
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const queryWrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
        const { result } = renderHook(() => useProjectWorkspace(5), { wrapper: queryWrapper });
        await waitFor(() => expect(result.current.project?.id).toBe(5));

        projectService.getProject.mockRejectedValue({ response: { status: 404 } });
        await act(async () => {
            await client.invalidateQueries({ queryKey: queryKeys.project(5) });
        });
        await waitFor(() => expect(result.current.accessRevoked).toBe(true));
        expect(result.current.projectUnavailable).toBe(false);
    });

    it("handles a 403 response", async () => {
        projectService.getProject.mockRejectedValue({ response: { status: 403 } });

        const { result } = renderHook(() => useProjectWorkspace(5), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.accessDenied).toBe(true);
    });

    it("sets a general workspace error", async () => {
        projectService.getProject.mockRejectedValue({
            response: { status: 500, data: { error: "Server failed" } },
        });

        const { result } = renderHook(() => useProjectWorkspace(5), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("Server failed");
    });

    it("refreshes only project activity", async () => {
        const { result } = renderHook(() => useProjectWorkspace(5), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        projectService.getActivities.mockResolvedValue([{ id: 10 }]);

        await act(async () => {
            await result.current.loadActivities();
        });

        expect(result.current.activities).toEqual([{ id: 10 }]);
        expect(result.current.refreshingActivity).toBe(false);
    });

    it("falls back to empty task and activity collections", async () => {
        taskService.getTasks.mockResolvedValue(null);
        projectService.getActivities.mockResolvedValue(null);

        const { result } = renderHook(() => useProjectWorkspace(5), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.tasks).toEqual([]);
        expect(result.current.activities).toEqual([]);
    });

    it("ignores an outdated response after switching projects", async () => {
        let resolveOldTasks;
        taskService.getTasks.mockImplementation((id) => id === 5
            ? new Promise((resolve) => { resolveOldTasks = resolve; })
            : Promise.resolve([{ id: 20, task_name: "New project task" }]));
        projectService.getProject.mockImplementation((id) => Promise.resolve(
            Number(id) === 5
                ? { id: 5, project_name: "Old project", is_default: false }
                : { id: 6, project_name: "New project", is_default: false }
        ));

        const { result, rerender } = renderHook(({ id }) => useProjectWorkspace(id), {
            initialProps: { id: 5 },
            wrapper,
        });
        await waitFor(() => expect(resolveOldTasks).toBeTypeOf("function"));
        rerender({ id: 6 });
        await waitFor(() => expect(result.current.project?.id).toBe(6));

        await act(async () => {
            resolveOldTasks([{ id: 10, task_name: "Stale task" }]);
        });

        expect(result.current.project.id).toBe(6);
        expect(result.current.tasks).toEqual([{ id: 20, task_name: "New project task", converted: true }]);
        expect(result.current.loading).toBe(false);
    });

    it("ignores stale activity refreshes after a project switch", async () => {
        projectService.getProject.mockImplementation((id) => Promise.resolve(
            Number(id) === 5
                ? { id: 5, project_name: "Old project", is_default: false }
                : { id: 6, project_name: "New project", is_default: false }
        ));
        const { result, rerender } = renderHook(({ id }) => useProjectWorkspace(id), {
            initialProps: { id: 5 },
            wrapper,
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        let resolveOldActivity;
        projectService.getActivities.mockImplementation((id) => id === 5
            ? new Promise((resolve) => { resolveOldActivity = resolve; })
            : Promise.resolve([{ id: 60 }]));

        act(() => { void result.current.loadActivities(); });
        await waitFor(() => expect(resolveOldActivity).toBeTypeOf("function"));
        rerender({ id: 6 });
        await waitFor(() => expect(result.current.project?.id).toBe(6));

        await act(async () => { resolveOldActivity([{ id: 50 }]); });
        expect(result.current.activities).toEqual([{ id: 60 }]);
        expect(result.current.refreshingActivity).toBe(false);
    });
});
