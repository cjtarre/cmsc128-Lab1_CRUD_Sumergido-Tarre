import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useNotifications } from "../../notifications/context/NotificationContext";
import { inviteService } from "../services/inviteService";
import { projectService } from "../services/projectService";
import { queryKeys } from "../../../shared/utils/queryKeys";

// Manage project lists, invitations, and project actions.
export function useProjects() {
    const { refreshNotifications } = useNotifications();
    const queryClient = useQueryClient();
    const projectsQuery = useQuery({
        queryKey: queryKeys.projects,
        queryFn: projectService.getProjects,
    });
    const deletedProjectsQuery = useQuery({
        queryKey: queryKeys.deletedProjects,
        queryFn: projectService.getDeletedProjects,
    });
    const invitesQuery = useQuery({
        queryKey: queryKeys.myInvites,
        queryFn: inviteService.getMyInvites,
    });
    const [projects, setProjects] = useState([]);
    const [deletedProjects, setDeletedProjects] = useState([]);
    const [invites, setInvites] = useState([]);

    useEffect(() => {
        setProjects(Array.isArray(projectsQuery.data) ? projectsQuery.data : []);
    }, [projectsQuery.data]);
    useEffect(() => {
        setDeletedProjects(Array.isArray(deletedProjectsQuery.data) ? deletedProjectsQuery.data : []);
    }, [deletedProjectsQuery.data]);
    useEffect(() => {
        setInvites(Array.isArray(invitesQuery.data) ? invitesQuery.data : []);
    }, [invitesQuery.data]);
    const loading = projectsQuery.isLoading || deletedProjectsQuery.isLoading || invitesQuery.isLoading;
    const error = projectsQuery.isError || deletedProjectsQuery.isError || invitesQuery.isError
        ? "Unable to load projects."
        : "";
    const [deletingProject, setDeletingProject] = useState(false);
    const [restoringProject, setRestoringProject] = useState(false);
    const [respondingInviteId, setRespondingInviteId] = useState(null);

    // Load projects, deleted projects, and pending invitations.
    const loadProjects = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
            queryClient.invalidateQueries({ queryKey: queryKeys.deletedProjects }),
            queryClient.invalidateQueries({ queryKey: queryKeys.myInvites }),
        ]);
    }, [queryClient]);

    useEffect(() => {
        const handleInvitesChanged = () => loadProjects();
        window.addEventListener("takda:invites-changed", handleInvitesChanged);
        return () => window.removeEventListener("takda:invites-changed", handleInvitesChanged);
    }, [loadProjects]);

    // Create a collaborative project.
    const createProject = async (projectName) => {
        try {
            const created = await projectService.createProject(projectName);
            setProjects((current) => [...current, created]);
            queryClient.setQueryData(queryKeys.projects, (current = []) => [...current, created]);
            queryClient.invalidateQueries({ queryKey: queryKeys.deletedProjects });
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
            queryClient.setQueryData(queryKeys.projects, (current = []) =>
                current.map((project) => project.id === projectId ? { ...project, ...updatedProject } : project)
            );
            queryClient.setQueryData(queryKeys.project(projectId), (current) =>
                current ? { ...current, ...updatedProject } : current
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
            setProjects((current) => current.filter((item) => item.id !== project.id));
            setDeletedProjects((current) => [{ ...project, deleted_at: new Date().toISOString() }, ...current]);
            queryClient.setQueryData(queryKeys.projects, (current = []) =>
                current.filter((item) => item.id !== project.id)
            );
            queryClient.invalidateQueries({ queryKey: queryKeys.deletedProjects });
            toast.success("Project moved to Deleted Projects.");
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
            setDeletedProjects((current) => current.filter((item) => item.id !== project.id));
            setProjects((current) => [{ ...project, deleted_at: null }, ...current]);
            queryClient.invalidateQueries({ queryKey: queryKeys.projects });
            queryClient.invalidateQueries({ queryKey: queryKeys.deletedProjects });
            toast.success(`${project.project_name} restored.`);
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

            setInvites((current) => current.filter((item) => item.id !== invite.id));
            queryClient.setQueryData(queryKeys.myInvites, (current = []) =>
                current.filter((item) => item.id !== invite.id)
            );
            if (accept) await loadProjects();
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