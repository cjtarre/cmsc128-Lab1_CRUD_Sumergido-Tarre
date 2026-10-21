import { useMemo, useState } from "react";
import { FolderKanban, Plus, Search } from "lucide-react";

import ConfirmDialog from "../../../shared/components/common/ConfirmDialog";
import CreateProject from "../components/forms/CreateProject";
import DeletedProjects from "../components/cards/DeletedProjects";
import EditProject from "../components/forms/EditProject";
import ProjectGrid from "../components/cards/ProjectGrid";
import ProjectInvitations from "../components/members/ProjectInvitations";
import {
    handleDeleteProject,
    handleRestoreProject,
    handleUpdateProject,
} from "../handlers/projectHandlers";
import { useProjects } from "../hooks/useProjects";
import { filterCollaborativeProjects } from "../utils/projectUtils";

function Projects() {
    const {
        projects, deletedProjects, invites, loading, error,
        deletingProject, restoringProject, respondingInviteId,
        loadProjects, createProject, updateProject,
        deleteProject, restoreProject, respondToInvite,
    } = useProjects();

    // Page UI state.
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeletedOpen, setIsDeletedOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [projectToRestore, setProjectToRestore] = useState(null);

    const collaborativeProjects = useMemo(
        () => filterCollaborativeProjects(projects, searchTerm),
        [projects, searchTerm]
    );

    return (
        <>
            <div className="mx-auto w-full max-w-7xl pb-8 sm:pb-10">
                {/* Page heading and project controls. */}
                <header className="px-1 pt-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        {/* Page heading. */}
                        <div className="min-w-0 shrink-0">
                            <h1 className="text-[22px] font-semibold tracking-tight text-slate-800 dark:text-white sm:text-2xl">
                                Projects
                            </h1>
                            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 sm:mt-1 sm:text-[11px]">
                                Organize and collaborate on shared work.
                            </p>
                        </div>

                        {/* Search and primary action. */}
                        <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[500px] sm:pt-3">
                            <div className="relative min-w-0 flex-1">
                                <span className="pointer-events-none absolute left-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100/80 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                                    <Search size={13} strokeWidth={2.2} />
                                </span>

                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search projects..."
                                    className="h-9 w-full rounded-xl border border-white/70 bg-white/45 pl-10 pr-3 font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition placeholder:font-normal placeholder:text-slate-400 hover:bg-white/60 focus:border-green-200 focus:bg-white/70 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:placeholder:text-slate-500 dark:hover:bg-white/[0.05] dark:focus:border-green-800 dark:focus:bg-white/[0.05] dark:focus:ring-green-900/30 sm:h-10"
                                    style={{ fontSize: "11px", lineHeight: "1" }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(true)}
                                aria-label="New Project"
                                title="New Project"
                                className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-xl border border-green-200/70 bg-green-50/75 px-2.5 font-semibold text-green-600 shadow-sm transition hover:border-green-200 hover:bg-green-100/80 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400 dark:hover:border-green-800/60 dark:hover:bg-green-950/50 sm:h-10 sm:gap-1.5 sm:px-3"
                                style={{ fontSize: "11px", lineHeight: "1" }}
                            >
                                <Plus size={13} strokeWidth={2.3} />
                                <span className="sm:hidden">New</span>
                                <span className="hidden sm:inline">New Project</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Pending invitations. */}
                {!loading && !error && (
                    <ProjectInvitations
                        invites={invites}
                        respondingInviteId={respondingInviteId}
                        onRespond={respondToInvite}
                    />
                )}

                {/* Collaborative projects. */}
                <section className="mt-5 rounded-2xl border border-white/60 bg-white/20 p-3 shadow-[0_8px_28px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.015] sm:mt-6 sm:p-4">
                    <div className="mb-3 flex items-center gap-2 px-1">
                        <h2 className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 sm:text-sm">
                            Your Projects
                        </h2>

                        {!loading && !error && (
                            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white/60 px-1.5 py-0.5 text-[9px] font-medium text-slate-400 shadow-sm dark:bg-white/[0.06] dark:text-slate-500">
                                {collaborativeProjects.length}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex min-h-28 w-full max-w-[380px] items-center justify-center rounded-2xl border border-white/60 bg-white/30 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] sm:min-h-40">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                        </div>
                    ) : error ? (
                        <div className="w-full max-w-[380px] rounded-2xl border border-red-100 bg-red-50/60 p-4 text-center dark:border-red-950 dark:bg-red-950/20 sm:p-6">
                            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                            <button
                                type="button"
                                onClick={loadProjects}
                                className="mt-3 text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400"
                            >
                                Try again
                            </button>
                        </div>
                    ) : collaborativeProjects.length ? (
                        <ProjectGrid
                            projects={collaborativeProjects}
                            onEdit={setEditingProject}
                            onDelete={setProjectToDelete}
                            searching={Boolean(searchTerm.trim())}
                        />
                    ) : searchTerm ? (
                        <div className="flex min-h-28 w-full max-w-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/20 px-6 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] sm:min-h-40">
                            <Search size={18} className="text-slate-300 dark:text-slate-600 sm:h-5 sm:w-5" />
                            <h3 className="mt-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                No matching projects
                            </h3>
                            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                                Try another project name.
                            </p>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="group flex min-h-32 w-full max-w-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-white/20 px-5 text-center backdrop-blur-xl transition hover:border-green-200 hover:bg-green-50/30 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-green-900/60 dark:hover:bg-green-950/10 sm:min-h-44 sm:px-6"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-950/40 dark:text-green-400 sm:h-11 sm:w-11">
                                <FolderKanban size={18} className="sm:h-5 sm:w-5" />
                            </span>

                            <span className="mt-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:mt-3">
                                No collaborative projects yet
                            </span>

                            <span className="mt-1 max-w-sm text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                                Create a project to start organizing tasks with other Takda users.
                            </span>

                            <span
                                className="mt-2.5 inline-flex items-center gap-1 font-semibold text-green-600 dark:text-green-400 sm:mt-3"
                                style={{ fontSize: "11px", lineHeight: "1" }}
                            >
                                <Plus size={13} />
                                Create project
                            </span>
                        </button>
                    )}
                </section>

                {/* Recoverable deleted projects. */}
                {!loading && !error && (
                    <DeletedProjects
                        projects={deletedProjects}
                        open={isDeletedOpen}
                        onToggle={() => setIsDeletedOpen((current) => !current)}
                        onRestore={setProjectToRestore}
                    />
                )}
            </div>

            {/* Project modals and confirmations. */}
            <CreateProject
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={createProject}
            />

            <EditProject
                isOpen={Boolean(editingProject)}
                project={editingProject}
                onClose={() => setEditingProject(null)}
                onSubmit={(projectData) =>
                    handleUpdateProject(projectData, {
                        project: editingProject,
                        updateProject,
                    })
                }
            />

            <ConfirmDialog
                isOpen={Boolean(projectToDelete)}
                title="Delete project?"
                message={
                    projectToDelete
                        ? `Delete "${projectToDelete.project_name}"? The project will be moved to Deleted Projects. Project members will lose access until it is restored.`
                        : ""
                }
                confirmText="Delete Project"
                loading={deletingProject}
                loadingText="Deleting..."
                onConfirm={() =>
                    handleDeleteProject({
                        project: projectToDelete,
                        deleteProject,
                        onSuccess: () => setProjectToDelete(null),
                    })
                }
                onCancel={() => !deletingProject && setProjectToDelete(null)}
            />

            <ConfirmDialog
                isOpen={Boolean(projectToRestore)}
                title="Restore project?"
                message={
                    projectToRestore
                        ? `Restore "${projectToRestore.project_name}"? Existing project members will regain access.`
                        : ""
                }
                confirmText="Restore Project"
                loading={restoringProject}
                loadingText="Restoring..."
                onConfirm={() =>
                    handleRestoreProject({
                        project: projectToRestore,
                        restoreProject,
                        onSuccess: () => setProjectToRestore(null),
                    })
                }
                onCancel={() => !restoringProject && setProjectToRestore(null)}
            />
        </>
    );
}

export default Projects;
