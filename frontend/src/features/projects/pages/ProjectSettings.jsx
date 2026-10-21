import { useState } from "react";
import { Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import AccessDenied from "../../../pages/AccessDenied";
import ProjectUnavailable from "../../../pages/ProjectUnavailable";
import ConfirmDialog from "../../../shared/components/common/ConfirmDialog";
import EditProject from "../components/forms/EditProject";
import ProjectMembers from "../components/members/ProjectMembers";
import ProjectSettingsAppearance from "../components/settings/ProjectSettingsAppearance";
import ProjectSettingsDangerZone from "../components/settings/ProjectSettingsDangerZone";
import { useProjectSettings } from "../hooks/useProjectSettings";
import { isProjectOwner } from "../utils/projectUtils";

function ProjectSettings() {
    const { projectId } = useParams();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const {
        project, loading, deleting, projectUnavailable,
        updateProject, deleteProject,
    } = useProjectSettings(projectId);

    // Project settings loading state.
    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
            </div>
        );
    }

    if (projectUnavailable || !project) return <ProjectUnavailable />;

    // Only project owners can access settings.
    if (!isProjectOwner(project.role)) {
        return (
            <AccessDenied
                message="Only the project owner can access project settings."
                backTo={`/projects/${projectId}`}
                backLabel="Back to Project"
            />
        );
    }

    return (
        <>
            <div className="mx-auto w-full max-w-7xl pb-10">
                {/* Settings breadcrumb and heading. */}
                <header className="px-1 pt-1">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500"
                    >
                        <Link
                            to="/projects"
                            className="shrink-0 transition hover:text-green-600 dark:hover:text-green-400"
                        >
                            Projects
                        </Link>

                        <span className="shrink-0 text-slate-300 dark:text-slate-600">/</span>

                        <Link
                            to={`/projects/${projectId}`}
                            className="min-w-0 truncate transition hover:text-green-600 dark:hover:text-green-400"
                        >
                            {project.project_name}
                        </Link>

                        <span className="shrink-0 text-slate-300 dark:text-slate-600">/</span>

                        <span className="shrink-0 text-slate-500 dark:text-slate-400">
                            Settings
                        </span>
                    </nav>

                    <div className="mt-4 min-w-0">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-white sm:text-[26px]">
                            Project Settings
                        </h1>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Manage project appearance, members, roles, and access.
                        </p>
                    </div>
                </header>

                <main className="mt-6 space-y-4">
                    {/* Project appearance. */}
                    <ProjectSettingsAppearance onEdit={() => setIsEditOpen(true)} />

                    {/* Project access. */}
                    <div className="flex items-center gap-2 px-1 pt-2">
                        <Users size={14} className="text-green-500" />
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Project Access
                        </p>
                    </div>

                    <ProjectMembers project={project} />

                    {/* Destructive project actions. */}
                    <ProjectSettingsDangerZone onDelete={() => setIsDeleteOpen(true)} />
                </main>
            </div>

            <EditProject
                isOpen={isEditOpen}
                project={project}
                onClose={() => setIsEditOpen(false)}
                onSubmit={updateProject}
            />

            <ConfirmDialog
                isOpen={isDeleteOpen}
                title="Delete project?"
                message={`Delete "${project.project_name}"? The project will be moved to Deleted Projects. Project members will lose access until it is restored.`}
                confirmText="Delete Project"
                loading={deleting}
                loadingText="Deleting..."
                onConfirm={deleteProject}
                onCancel={() => {
                    if (!deleting) setIsDeleteOpen(false);
                }}
            />
        </>
    );
}

export default ProjectSettings;
