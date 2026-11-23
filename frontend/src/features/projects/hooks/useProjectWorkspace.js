import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { convertApiTask } from "../../tasks/hooks/useTasks";
import { taskService } from "../../tasks/services/taskService";
import { projectService } from "../services/projectService";
import { queryKeys } from "../../../shared/utils/queryKeys";
import { INVITATION_SYNC_INTERVAL_MS } from "../../../shared/constants/notificationSync";
import { useSyncedQueryState } from "../../../shared/hooks/useSyncedQueryState";

const convertProjectTasks = (items) => items.map(convertApiTask);

// Manage project workspace data and loading states.
export function useProjectWorkspace(projectId) {
    const queryClient = useQueryClient();
    const [refreshingActivity, setRefreshingActivity] = useState(false);
    const projectQuery = useQuery({
        queryKey: queryKeys.project(projectId),
        queryFn: () => projectService.getProject(projectId),
        retry: false,
        // Detect revoked access while the member remains in the workspace.
        refetchInterval: INVITATION_SYNC_INTERVAL_MS,
        refetchOnWindowFocus: "always",
        refetchOnReconnect: "always",
    });
    const tasksQuery = useQuery({
        queryKey: queryKeys.projectTasks(projectId),
        queryFn: () => taskService.getTasks(projectId),
        retry: false,
        enabled: Boolean(projectId),
    });
    const [tasks, setTasks] = useSyncedQueryState(tasksQuery.data, convertProjectTasks);
    const activitiesQuery = useQuery({
        queryKey: queryKeys.activities(projectId),
        queryFn: () => projectService.getActivities(projectId),
        retry: false,
        enabled: Boolean(projectId),
    });

    const project = projectQuery.data || null;
    const activities = Array.isArray(activitiesQuery.data) ? activitiesQuery.data : [];
    const loading = projectQuery.isLoading || tasksQuery.isLoading || activitiesQuery.isLoading;
    const error = projectQuery.error?.response?.data?.error
        || tasksQuery.error?.response?.data?.error
        || activitiesQuery.error?.response?.data?.error
        || (projectQuery.isError || tasksQuery.isError || activitiesQuery.isError
            ? "Unable to load this project."
            : "");
    const projectStatus = projectQuery.error?.response?.status;
    // A 404 after a successful load means the current session lost access.
    // A never-accessible or nonexistent project still shows the generic unavailable page.
    const accessRevoked = Boolean(projectQuery.data) && (projectStatus === 404 || projectStatus === 403);
    const projectUnavailable = (projectStatus === 404 && !accessRevoked) || Boolean(project?.is_default);
    const accessDenied = projectStatus === 403 && !accessRevoked;

    // Refresh only the activity feed.
    const loadActivities = useCallback(async () => {
        try {
            setRefreshingActivity(true);
            await queryClient.invalidateQueries({ queryKey: queryKeys.activities(projectId) });
        } catch (err) {
            console.error("Error refreshing project activity:", err);
        } finally {
            setRefreshingActivity(false);
        }
    }, [projectId, queryClient]);

    return {
        project, tasks, setTasks, activities,
        loading, refreshingActivity, error,
        projectUnavailable, accessDenied, accessRevoked, loadActivities,
    };
}