import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useNotifications } from "../../notifications/context/NotificationContext";
import { inviteService } from "../services/inviteService";
import { projectService } from "../services/projectService";

// Manage project lists, invitations, and project actions.
export function useProjects() {
    const { refreshNotifications } = useNotifications();
    const [projects, setProjects] = useState([]);
    const [deletedProjects, setDeletedProjects] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingProject, setDeletingProject] = useState(false);
    const [restoringProject, setRestoringProject] = useState(false);
    const [respondingInviteId, setRespondingInviteId] = useState(null);

    // Load projects, deleted projects, and pending invitations.
    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [projectsData, deletedData, invitesData] = await Promise.all([
                projectService.getProjects(),
                projectService.getDeletedProjects(),
                inviteService.getMyInvites(),
            ]);

            setProjects(Array.isArray(projectsData) ? projectsData : []);
            setDeletedProjects(Array.isArray(deletedData) ? deletedData : []);
            setInvites(Array.isArray(invitesData) ? invitesData : []);
        } catch (error) {
            console.error("Error loading projects:", error);
            setError("Unable to load projects.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProjects();

        const handleInvitesChanged = () => loadProjects();
        window.addEventListener("takda:invites-changed", handleInvitesChanged);
        return () => window.removeEventListener("takda:invites-changed", handleInvitesChanged);
    }, [loadProjects]);

    // Create a collaborative project.
    const createProject = async (projectName) => {
        try {
            await projectService.createProject(projectName);
            await loadProjects();
            toast.success("Project created.");
            return true;
        } catch (error) {
            console.error("Error creating project:", error);
            toast.error(error.response?.data?.error || "Unable to create project.");
            return false;
        }
    };

    // Update a project and sync it locally.
    const updateProject = async (projectId, projectData) => {
        try {
            const updatedProject = await projectService.updateProject(projectId, projectData);
            setProjects((current) =>
                current.map((project) => project.id === projectId ? { ...project, ...updatedProject } : project)
            );
            toast.success("Project updated.");
            return true;
        } catch (error) {
            console.error("Error updating project:", error);
            toast.error(error.response?.data?.error || "Unable to update project.");
            return false;
        }
    };

    // Move a project to Deleted Projects.
    const deleteProject = async (project) => {
        if (!project || deletingProject) return false;

        try {
            setDeletingProject(true);
            await projectService.deleteProject(project.id);
            toast.success("Project moved to Deleted Projects.");
            await loadProjects();
            return true;
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error(error.response?.data?.error || "Unable to delete project.");
            return false;
        } finally {
            setDeletingProject(false);
        }
    };

    // Restore a deleted project.
    const restoreProject = async (project) => {
        if (!project || restoringProject) return false;

        try {
            setRestoringProject(true);
            await projectService.restoreProject(project.id);
            toast.success(`${project.project_name} restored.`);
            await loadProjects();
            return true;
        } catch (error) {
            console.error("Error restoring project:", error);
            toast.error(error.response?.data?.error || "Unable to restore project.");
            return false;
        } finally {
            setRestoringProject(false);
        }
    };

    // Accept or decline a project invitation.
    const respondToInvite = async (invite, accept) => {
        try {
            setRespondingInviteId(invite.id);

            if (accept) {
                await inviteService.acceptInvite(invite.id);
                toast.success(`Joined ${invite.project?.project_name || "project"}.`);
            } else {
                await inviteService.declineInvite(invite.id);
                toast.success("Invitation declined.");
            }

            await loadProjects();
            await refreshNotifications();
        } catch (error) {
            console.error("Error responding to invitation:", error);
            toast.error(error.response?.data?.error || "Unable to respond to invitation.");
        } finally {
            setRespondingInviteId(null);
        }
    };

    return {
        projects, deletedProjects, invites, loading, error,
        deletingProject, restoringProject, respondingInviteId,
        loadProjects, createProject, updateProject,
        deleteProject, restoreProject, respondToInvite,
    };
}