import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { projectService } from "../services/projectService";

// Manage project settings data and mutations.
export function useProjectSettings(projectId) {
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [projectUnavailable, setProjectUnavailable] = useState(false);

    // Load the requested project.
    useEffect(() => {
        const loadProject = async () => {
            try {
                setLoading(true);
                setProjectUnavailable(false);

                const data = await projectService.getProjects();
                const projects = Array.isArray(data) ? data : [];
                const matchedProject = projects.find((item) => String(item.id) === String(projectId) && !item.is_default);

                if (!matchedProject) {
                    setProjectUnavailable(true);
                    return;
                }

                setProject(matchedProject);
            } catch (error) {
                if (error.response?.status === 404) {
                    setProjectUnavailable(true);
                    return;
                }

                console.error("Error loading project settings:", error);
                toast.error(error.response?.data?.error || "Unable to load project settings.");
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [projectId]);

    // Update the project and sync local state.
    const updateProject = async (projectData) => {
        try {
            const updatedProject = await projectService.updateProject(projectId, projectData);
            setProject((current) => ({ ...current, ...updatedProject }));
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