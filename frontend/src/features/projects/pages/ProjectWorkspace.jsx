import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, LayoutDashboard, ListTodo, PanelsTopLeft, Settings, Users } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { projectService } from "../services/projectService";
import { taskService } from "../../tasks/services/taskService";
import { convertApiTask } from "../../tasks/hooks/useTasks";

import ProjectOverview from "../components/ProjectOverview";
import ProjectList from "../components/ProjectList";
import ProjectBoard from "../components/ProjectBoard";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectMembers from "../components/ProjectMembers";
import AccessDenied from "../../../pages/AccessDenied";
import ProjectUnavailable from "../../../pages/ProjectUnavailable";

const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "list", label: "List", icon: ListTodo },
    { id: "board", label: "Board", icon: PanelsTopLeft },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "members", label: "Members", icon: Users },
];

const validTabs = new Set(tabs.map((tab) => tab.id));

function ProjectWorkspace() {
    const { projectId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshingActivity, setRefreshingActivity] = useState(false);
    const [error, setError] = useState("");
    const [projectUnavailable, setProjectUnavailable] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    const requestedTab = searchParams.get("view");
    const activeTab = validTabs.has(requestedTab) ? requestedTab : "overview";

    const setActiveTab = useCallback((tab) => {
        if (!validTabs.has(tab)) return;

        if (tab === "overview") {
            setSearchParams({});
            return;
        }

        setSearchParams({ view: tab });
    }, [setSearchParams]);

    const loadActivities = useCallback(async () => {
        try {
            setRefreshingActivity(true);
            const data = await projectService.getActivities(projectId);
            setActivities(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err.response?.status !== 404 && err.response?.status !== 403) {
                console.error("Error refreshing project activity:", err);
            }
        } finally {
            setRefreshingActivity(false);
        }
    }, [projectId]);

    useEffect(() => {
        const loadWorkspace = async () => {
            try {
                setLoading(true);
                setError("");
                setProjectUnavailable(false);
                setAccessDenied(false);

                const [projectsData, tasksData, activitiesData] = await Promise.all([
                    projectService.getProjects(),
                    taskService.getTasks(projectId),
                    projectService.getActivities(projectId),
                ]);

                const projects = Array.isArray(projectsData) ? projectsData : [];
                const matchedProject = projects.find((item) => String(item.id) === String(projectId) && !item.is_default);

                if (!matchedProject) {
                    setProjectUnavailable(true);
                    return;
                }

                setProject(matchedProject);
                setTasks((Array.isArray(tasksData) ? tasksData : []).map(convertApiTask));
                setActivities(Array.isArray(activitiesData) ? activitiesData : []);
            } catch (err) {
                if (err.response?.status === 404) {
                    setProjectUnavailable(true);
                    return;
                }

                if (err.response?.status === 403) {
                    setAccessDenied(true);
                    return;
                }

                console.error("Error loading project workspace:", err);
                setError(err.response?.data?.error || "Unable to load this project.");
            } finally {
                setLoading(false);
            }
        };

        loadWorkspace();
    }, [projectId]);

    const canEdit = project?.role === "owner" || project?.role === "editor";

    const activeContent = useMemo(() => {
        if (!project) return null;

        switch (activeTab) {
            case "overview":
                return <ProjectOverview tasks={tasks} activities={activities} loading={false} onOpenList={() => setActiveTab("list")} onRefreshActivity={loadActivities} refreshingActivity={refreshingActivity} />;
            case "list":
                return <ProjectList projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;
            case "board":
                return <ProjectBoard projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;
            case "calendar":
                return <ProjectCalendar projectId={projectId} tasks={tasks} setTasks={setTasks} canEdit={canEdit} />;
            case "members":
                return <ProjectMembers project={project} />;
            default:
                return null;
        }
    }, [activeTab, project, projectId, tasks, activities, canEdit, loadActivities, refreshingActivity, setActiveTab]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
            </div>
        );
    }

    if (projectUnavailable) return <ProjectUnavailable />;

    if (accessDenied) {
        return (
            <AccessDenied
                message="Your current project role doesn't allow you to access this resource."
                backTo="/projects"
                backLabel="Back to Projects"
            />
        );
    }

    if (error || !project) {
        return (
            <div className="mx-auto max-w-xl py-16 text-center">
                <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Unable to load project
                </h1>

                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                    {error || "Something went wrong while loading this project."}
                </p>

                <Link to="/projects" className="mt-5 inline-block text-sm font-semibold text-green-600 dark:text-green-400">
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl pb-10">
            <header className="px-1 pt-1">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <Link to="/projects" className="group inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition hover:text-green-600 dark:text-slate-500 dark:hover:text-green-400">
                            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                            Projects
                        </Link>

                        <div className="mt-4">
                            <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-800 dark:text-white sm:text-[26px]">
                                {project.project_name}
                            </h1>

                            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                                <span>Collaborative workspace</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="font-medium capitalize text-green-600 dark:text-green-400">
                                    {project.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {project.role === "owner" && (
                        <Link
                            to={`/projects/${projectId}/settings`}
                            className="mt-7 inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/70 bg-white/60 px-3 font-semibold text-slate-500 shadow-[0_4px_16px_rgba(15,23,42,0.035)] backdrop-blur-xl transition hover:border-green-200 hover:bg-green-50/70 hover:text-green-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:border-green-900 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                            style={{ fontSize: "12px", lineHeight: "1" }}
                        >
                            <Settings size={14} />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>
                    )}
                </div>
            </header>

            <nav className="mt-5 flex flex-wrap gap-1 border-b border-slate-200/60 px-1 dark:border-white/10" aria-label="Project views">
                {tabs.map(({ id, label, icon: Icon }) => {
                    const selected = activeTab === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`relative flex items-center gap-1 px-2.5 py-2 font-medium transition ${
                                selected
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            }`}
                            style={{ fontSize: "12px", lineHeight: "1" }}
                        >
                            <Icon size={12} strokeWidth={selected ? 2 : 1.7} />
                            {label}
                            {selected && <span className="absolute inset-x-2 bottom-[-1px] h-0.5 rounded-full bg-green-500" />}
                        </button>
                    );
                })}
            </nav>

            <main className="pt-5">{activeContent}</main>
        </div>
    );
}

export default ProjectWorkspace;