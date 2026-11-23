import { useQuery } from "@tanstack/react-query";

import { projectService } from "../services/projectService";
import { queryKeys } from "../../../shared/utils/queryKeys";

// Load project members for task assignment and filtering.
export function useProjectMembersList(projectId) {
    const membersQuery = useQuery({
        queryKey: queryKeys.members(projectId),
        queryFn: () => projectService.getMembers(projectId),
        enabled: Boolean(projectId),
    });
    return Array.isArray(membersQuery.data) ? membersQuery.data : [];
}