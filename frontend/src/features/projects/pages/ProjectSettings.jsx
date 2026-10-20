import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Palette, Settings, Trash2, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import ConfirmDialog from "../../../shared/components/common/ConfirmDialog";
import AccessDenied from "../../../pages/AccessDenied";
import ProjectUnavailable from "../../../pages/ProjectUnavailable";
import EditProject from "../components/EditProject";
import ProjectMembers from "../components/ProjectMembers";
import { projectService } from "../services/projectService";

function ProjectSettings() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [projectUnavailable, setProjectUnavailable] = useState(false);

    useEffect(() => {
        const loadProject = async () => {
            try {
                setLoading(true);
                setProjectUnavailable(false);

                const projectsData = await projectService.getProjects();
                const projects = Array.isArray(projectsData) ? projectsData : [];
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

    const handleUpdateProject = async (projectData) => {
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

    const handleDeleteProject = async () => {
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

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
            </div>
        );
    }

    if (projectUnavailable || !project) return <ProjectUnavailable />;

    if (project.role !== "owner") {
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
                <header className="px-1 pt-1">
                    <Link
                        to={`/projects/${projectId}`}
                        className="group inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition hover:text-green-600 dark:text-slate-500 dark:hover:text-green-400"
                    >
                        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                        {project.project_name}
                    </Link>

                    <div className="mt-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                            <Settings size={18} />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-white sm:text-[26px]">
                                Project Settings
                            </h1>

                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                Manage project appearance, members, roles, and access.
                            </p>
                        </div>
                    </div>
                </header>

                <main className="mt-6 space-y-4">
                    {/* Project Appearance */}
                    <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/65 text-green-500 dark:bg-white/[0.04] dark:text-green-400">
                                    <Palette size={15} />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Project appearance
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
                                        Change the project name, icon, and accent color.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsEditOpen(true)}
                                className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-green-500 px-4 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600"
                                style={{ fontSize: "12px", lineHeight: "1" }}
                            >
                                Edit Project
                            </button>
                        </div>
                    </section>

                    {/* Project Access */}
                    <div className="flex items-center gap-2 px-1 pt-2">
                        <Users size={14} className="text-green-500" />

                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Project Access
                        </p>
                    </div>

                    <ProjectMembers project={project} />

                    {/* Danger Zone */}
                    <div className="flex items-center gap-2 px-1 pt-4">
                        <AlertTriangle size={14} className="text-red-400" />

                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400 dark:text-red-400">
                            Danger Zone
                        </p>
                    </div>

                    <section className="rounded-3xl border border-red-100/80 bg-red-50/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.02)] backdrop-blur-xl dark:border-red-900/30 dark:bg-red-950/10 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-400 dark:bg-red-950/30 dark:text-red-400">
                                    <Trash2 size={15} />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Delete project
                                    </h2>

                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 dark:text-slate-500">
                                        Move this project to Deleted Projects. Project members will lose access until the project is restored.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(true)}
                                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/25 dark:text-red-400 dark:hover:bg-red-950/40"
                                style={{ fontSize: "12px", lineHeight: "1" }}
                            >
                                <Trash2 size={13} />
                                Delete Project
                            </button>
                        </div>
                    </section>
                </main>
            </div>

            <EditProject
                isOpen={isEditOpen}
                project={project}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleUpdateProject}
            />

            <ConfirmDialog
                isOpen={isDeleteOpen}
                title="Delete project?"
                message={`Delete "${project.project_name}"? The project will be moved to Deleted Projects. Project members will lose access until it is restored.`}
                confirmText="Delete Project"
                loading={deleting}
                loadingText="Deleting..."
                onConfirm={handleDeleteProject}
                onCancel={() => {
                    if (!deleting) setIsDeleteOpen(false);
                }}
            />
        </>
    );
}

export default ProjectSettings;