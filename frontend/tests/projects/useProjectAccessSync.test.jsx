// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { useProjectAccessSync } from "../../src/features/projects/hooks/useProjectAccessSync";
import { projectService } from "../../src/features/projects/services/projectService";
import { queryKeys } from "../../src/shared/utils/queryKeys";
import { INVITATION_SYNC_INTERVAL_MS } from "../../src/shared/constants/notificationSync";
import { toast } from "sonner";

vi.mock("../../src/features/projects/services/projectService", () => ({
    projectService: { getProjects: vi.fn() },
}));

vi.mock("sonner", () => ({
    toast: { warning: vi.fn() },
}));

const initialProjects = [
    { id: 1, project_name: "My Project", role: "owner" },
    { id: 2, project_name: "Group Alpha", role: "editor" },
    { id: 3, project_name: "Group Beta", role: "viewer" },
];

function withClient() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    return { client, wrapper };
}

// Observe the actual React render, not only the query cache. Query cache data
// can update before useProjectAccessSync has committed its previous snapshot.
function useObservedAccessSync() {
    useProjectAccessSync();
    return useQuery({ queryKey: queryKeys.projects, queryFn: projectService.getProjects });
}

describe("useProjectAccessSync", () => {
    // Vitest does not enable Testing Library's automatic cleanup by default.
    // Without it, pending observer updates can leak to the next test.
    afterEach(cleanup);

    beforeEach(() => {
        vi.clearAllMocks();
        projectService.getProjects.mockResolvedValue(initialProjects);
    });

    it("checks membership every five seconds and on focus without a reload", async () => {
        const { client, wrapper } = withClient();
        renderHook(() => useProjectAccessSync(), { wrapper });
        await waitFor(() => expect(projectService.getProjects).toHaveBeenCalled());

        const query = client.getQueryCache().find({ queryKey: queryKeys.projects });
        expect(query.options.refetchInterval).toBe(INVITATION_SYNC_INTERVAL_MS);
        expect(query.options.refetchOnWindowFocus).toBe("always");
        expect(query.options.refetchOnReconnect).toBe("always");
        expect(toast.warning).not.toHaveBeenCalled();
    });

    it("alerts once when a shared project disappears from the current user's access", async () => {
        const { client, wrapper } = withClient();
        const { result } = renderHook(() => useObservedAccessSync(), { wrapper });
        await waitFor(() => expect(result.current.data).toEqual(initialProjects));

        const remainingProjects = initialProjects.filter((p) => p.id !== 2);
        await act(async () => {
            client.setQueryData(queryKeys.projects, remainingProjects);
        });

        await waitFor(() => expect(result.current.data).toEqual(remainingProjects));
        await waitFor(() => expect(toast.warning).toHaveBeenCalledTimes(1));
        expect(toast.warning).toHaveBeenCalledWith(
            "You no longer have access to Group Alpha.",
            expect.objectContaining({ id: "project-access-removed-2" })
        );

        await act(async () => {
            client.setQueryData(queryKeys.projects, [...initialProjects.filter((p) => p.id !== 2)]);
        });
        expect(toast.warning).toHaveBeenCalledTimes(1);
    });

    it("does not report removal for owner deletion or a newly added membership", async () => {
        const { client, wrapper } = withClient();
        const { result } = renderHook(() => useObservedAccessSync(), { wrapper });
        await waitFor(() => expect(result.current.data).toEqual(initialProjects));

        const latestProjects = [
            ...initialProjects.filter((p) => p.id !== 1),
            { id: 4, project_name: "New Project", role: "viewer" },
        ];
        await act(async () => {
            client.setQueryData(queryKeys.projects, latestProjects);
        });
        await waitFor(() => expect(result.current.data).toEqual(latestProjects));
        expect(toast.warning).not.toHaveBeenCalled();
    });

    it("does not mistake a temporary API failure for lost membership", async () => {
        const { client, wrapper } = withClient();
        const { result } = renderHook(() => useObservedAccessSync(), { wrapper });
        await waitFor(() => expect(result.current.data).toEqual(initialProjects));

        projectService.getProjects.mockRejectedValueOnce(new Error("network offline"));
        await act(async () => {
            await client.invalidateQueries({ queryKey: queryKeys.projects });
        });
        expect(toast.warning).not.toHaveBeenCalled();
    });
});
