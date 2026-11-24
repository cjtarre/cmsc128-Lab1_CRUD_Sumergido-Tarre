import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectService } from "../services/projectService";
import { queryKeys } from "../../../shared/utils/queryKeys";
import { INVITATION_SYNC_INTERVAL_MS } from "../../../shared/constants/notificationSync";

// Active for the entire authenticated layout, not only on the Projects page.
// Watch successful membership snapshots so removed members get feedback even
// when they are elsewhere in Takda. Failed requests must not imply revocation.
export function useProjectAccessSync() {
    const queryClient = useQueryClient();
    const previousProjects = useRef(null);
    const projectsQuery = useQuery({
        queryKey: queryKeys.projects,
        queryFn: projectService.getProjects,
        refetchInterval: INVITATION_SYNC_INTERVAL_MS,
        refetchOnWindowFocus: "always",
        refetchOnReconnect: "always",
    });

    useEffect(() => {
        if (!projectsQuery.isSuccess || !Array.isArray(projectsQuery.data)) return;

        const latest = projectsQuery.data;
        if (previousProjects.current !== null) {
            const currentIds = new Set(latest.map((project) => String(project.id)));
            for (const project of previousProjects.current) {
                // Owner deletion already has its own feedback and is not removal.
                if (project.role === "owner" || currentIds.has(String(project.id))) continue;
                toast.warning(`You no longer have access to ${project.project_name}.`, {
                    id: `project-access-removed-${project.id}`,
                    duration: 7000,
                });
                // Prompt an open workspace/settings page to check its access now.
                void queryClient.invalidateQueries({ queryKey: queryKeys.project(project.id) });
            }
        }
        previousProjects.current = latest;
    }, [projectsQuery.data, projectsQuery.isSuccess, queryClient]);
}
