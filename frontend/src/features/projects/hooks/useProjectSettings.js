import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectService } from "../services/projectService";
import { queryKeys } from "../../../shared/utils/queryKeys";

// Manage project settings data and mutations.
export function useProjectSettings(projectId) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const projectQuery = useQuery({
        queryKey: queryKeys.project(projectId),
        queryFn: () => projectService.getProject(projectId),
        retry: false,
    });
    const [projectOverride, setProjectOverride] = useState(null);
    const project = projectOverride || projectQuery.data || null;
    useEffect(() => {
        setProjectOverride(null);
    }, [projectId]);
    const loading = projectQuery.isLoading;
    const [deleting, setDeleting] = useState(false);
    const projectUnavailable = projectQuery.error?.response?.status === 404 || Boolean(project?.is_default);

    // Update the project and sync local state.
    const updateProject = async (projectData) => {
        try {
            const updatedProject = await projectService.updateProject(projectId, projectData);
            setProjectOverride((current) => ({ ...(current || projectQuery.data), ...updatedProject }));
            queryClient.setQueryData(queryKeys.project(projectId), (current) =>
                current ? { ...current, ...updatedProject } : current
            );
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
            toast.success("Project updated.");
            return true;
        } catch (error) {
            console.error("Error updating project:", error);
            toast.error(error.response?.data?.error || "Unable to update project.");
            return false;
        }
    };

    // Delete the project and return to the project list.
    const deleteProject = async () => {
        if (!project || deleting) return;

        try {
            setDeleting(true);
            await projectService.deleteProject(project.id);
            toast.success("Project deleted.");
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
            queryClient.invalidateQueries({ queryKey: queryKeys.deletedProjects });
            queryClient.removeQueries({ queryKey: queryKeys.project(projectId) });
            navigate("/projects", { replace: true });
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error(error.response?.data?.error || "Unable to delete project.");
        } finally {
            setDeleting(false);
        }
    };

    return { project, loading, deleting, projectUnavailable, updateProject, deleteProject };
}