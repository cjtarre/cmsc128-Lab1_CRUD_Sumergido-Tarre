import { useEffect, useMemo, useState } from "react";
import { FolderKanban, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import CreateProject from "../components/CreateProject";
import EditProject from "../components/EditProject";
import ProjectCard from "../components/ProjectCard";
import { projectService } from "../services/projectService";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await projectService.getProjects();
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading projects:", err);
            setError("Unable to load projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProjects();
    }, []);

    const collaborativeProjects = useMemo(
        () =>
            projects.filter(
                (project) =>
                    !project.is_default &&
                    project.project_name
                        ?.toLowerCase()
                        .includes(searchTerm.trim().toLowerCase())
            ),
        [projects, searchTerm]
    );

    const handleCreateProject = async (projectName) => {
        try {
            await projectService.createProject(projectName);
            await loadProjects();
            toast.success("Project created.");
            return true;
        } catch (err) {
            console.error("Error creating project:", err);
            toast.error(err.response?.data?.error || "Unable to create project.");
            return false;
        }
    };

    const handleUpdateProject = async (projectData) => {
        if (!editingProject) return false;

        try {
            const updatedProject = await projectService.updateProject(editingProject.id, projectData);

            setProjects((current) =>
                current.map((project) =>
                    project.id === editingProject.id
                        ? { ...project, ...updatedProject }
                        : project
                )
            );

            toast.success("Project updated.");
            return true;
        } catch (err) {
            console.error("Error updating project:", err);
            toast.error(err.response?.data?.error || "Unable to update project.");
            return false;
        }
    };

    const handleDeleteProject = async (project) => {
        const confirmed = window.confirm(
            `Delete "${project.project_name}"?\n\nThe project will be moved to deleted projects and can be restored later.`
        );

        if (!confirmed) return;

        try {
            await projectService.deleteProject(project.id);
            setProjects((current) => current.filter((item) => item.id !== project.id));
            toast.success("Project deleted.");
        } catch (err) {
            console.error("Error deleting project:", err);
            toast.error(err.response?.data?.error || "Unable to delete project.");
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl pb-10">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 px-1 pt-1">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-white">
                        Projects
                    </h1>

                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        Organize and collaborate on shared work.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3.5 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600"
                    style={{ fontSize: "12px", lineHeight: "1" }}
                >
                    <Plus size={14} />
                    New Project
                </button>
            </header>

            {/* Search */}
            <div className="mt-5 w-full max-w-sm">
                <div className="relative">
                    <div className="pointer-events-none absolute left-2.5 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100/90 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400">
                        <Search size={13} strokeWidth={2.2} />
                    </div>

                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search projects..."
                        className="h-10 w-full rounded-xl border border-white/70 bg-white/55 pl-10 pr-3 font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition placeholder:font-normal placeholder:text-slate-400 hover:bg-white/70 focus:border-green-200 focus:bg-white/80 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200 dark:placeholder:text-slate-500 dark:hover:bg-white/[0.05] dark:focus:border-green-800 dark:focus:bg-white/[0.055] dark:focus:ring-green-900/30"
                        style={{ fontSize: "12px", lineHeight: "1" }}
                    />
                </div>
            </div>

            {/* Projects */}
            <section className="mt-6">
                <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Your Projects
                    </h2>

                    {!loading && !error && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {collaborativeProjects.length}{" "}
                            {collaborativeProjects.length === 1 ? "project" : "projects"}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex min-h-40 w-full max-w-[380px] items-center justify-center rounded-2xl border border-white/60 bg-white/30 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                    </div>
                ) : error ? (
                    <div className="w-full max-w-[380px] rounded-2xl border border-red-100 bg-red-50/60 p-6 text-center dark:border-red-950 dark:bg-red-950/20">
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,380px))]">
                        {collaborativeProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onEdit={setEditingProject}
                                onDelete={handleDeleteProject}
                            />
                        ))}

                        {!searchTerm && (
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(true)}
                                className="group flex min-h-[155px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-white/20 px-5 text-center backdrop-blur-xl transition hover:border-green-200 hover:bg-green-50/30 dark:border-white/10 dark:bg-white/[0.015] dark:hover:border-green-900/60 dark:hover:bg-green-950/10"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 transition group-hover:bg-green-50 group-hover:text-green-500 dark:bg-white/[0.05] dark:text-slate-500 dark:group-hover:bg-green-950/40 dark:group-hover:text-green-400">
                                    <Plus size={18} />
                                </span>

                                <span className="mt-2.5 text-xs font-semibold text-slate-600 transition group-hover:text-green-600 dark:text-slate-300 dark:group-hover:text-green-400">
                                    New Project
                                </span>

                                <span className="mt-1 max-w-[170px] text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                                    Create a workspace for your team.
                                </span>
                            </button>
                        )}
                    </div>
                ) : searchTerm ? (
                    <div className="flex min-h-40 w-full max-w-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/20 px-6 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]">
                        <Search size={20} className="text-slate-300 dark:text-slate-600" />

                        <h3 className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
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
                        className="group flex min-h-44 w-full max-w-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-white/20 px-6 text-center backdrop-blur-xl transition hover:border-green-200 hover:bg-green-50/30 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-green-900/60 dark:hover:bg-green-950/10"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-950/40 dark:text-green-400">
                            <FolderKanban size={20} />
                        </span>

                        <span className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            No collaborative projects yet
                        </span>

                        <span className="mt-1 max-w-sm text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                            Create a project to start organizing tasks with other Takda users.
                        </span>

                        <span
                            className="mt-3 inline-flex items-center gap-1 font-semibold text-green-600 dark:text-green-400"
                            style={{ fontSize: "11px", lineHeight: "1" }}
                        >
                            <Plus size={13} />
                            Create project
                        </span>
                    </button>
                )}
            </section>

            <CreateProject
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateProject}
            />

            <EditProject
                isOpen={Boolean(editingProject)}
                project={editingProject}
                onClose={() => setEditingProject(null)}
                onSubmit={handleUpdateProject}
            />
        </div>
    );
}

export default Projects;