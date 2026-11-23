import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

import AccessDenied from "../../../pages/AccessDenied";
import ProjectUnavailable from "../../../pages/ProjectUnavailable";
import ProjectWorkspaceContent from "../components/workspace/ProjectWorkspaceContent";
import { PROJECT_TABS } from "../constants/projectOptions";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { useProjectWorkspaceTab } from "../hooks/useProjectWorkspaceTab";
import { canEditProject } from "../utils/projectUtils";

function ProjectWorkspace() {
    const { projectId } = useParams();
    const { activeTab, setActiveTab } = useProjectWorkspaceTab();
    const reduceMotion = useReducedMotion();
    const {
        project, tasks, setTasks, activities, loading, refreshingActivity,
        error, projectUnavailable, accessDenied, accessRevoked, loadActivities,
    } = useProjectWorkspace(projectId);

    const canEdit = canEditProject(project?.role);
    const activeTabIndex = PROJECT_TABS.findIndex(({ id }) => id === activeTab);
    const tabRefs = useRef([]);
    const tabIndicatorRef = useRef(null);
    const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const updateIndicator = () => {
            const nav = tabIndicatorRef.current?.parentElement;
            const activeButton = tabRefs.current[activeTabIndex];
            if (!nav || !activeButton) return;

            const navRect = nav.getBoundingClientRect();
            const buttonRect = activeButton.getBoundingClientRect();
            setTabIndicator({
                left: buttonRect.left - navRect.left,
                width: buttonRect.width,
            });
        };

        updateIndicator();
        window.addEventListener("resize", updateIndicator);
        return () => window.removeEventListener("resize", updateIndicator);
    }, [activeTabIndex, activeTab]);

    // Workspace loading state.
    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
            </div>
        );
    }

    // A previously accessible project was removed from this session.
    if (accessRevoked) {
        return (
            <AccessDenied
                title="Project access removed"
                message="You no longer have access to this project."
                backTo="/projects"
                backLabel="Back to Projects"
            />
        );
    }

    // Access and availability states.
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
                <Link
                    to="/projects"
                    className="mt-5 inline-block text-sm font-semibold text-green-600 dark:text-green-400"
                >
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl pb-10">
            {/* Project breadcrumb and heading. */}
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

                    <span className="truncate text-slate-500 dark:text-slate-400">
                        {project.project_name}
                    </span>
                </nav>

                <div className="mt-4 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-800 dark:text-white sm:text-[26px]">
                            {project.project_name}
                        </h1>

                        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500">
                            <span>Collaborative workspace</span>
                            <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="font-medium capitalize text-green-600 dark:text-green-400">
                                {project.role}
                            </span>
                        </div>
                    </div>

                </div>
            </header>

            {/* Workspace views with owner settings included on mobile. */}
            <nav
                ref={tabIndicatorRef}
                className="relative mt-5 flex border-b border-slate-200/60 px-1 dark:border-white/10"
                aria-label="Project views"
            >
                {PROJECT_TABS.map(({ id, label, icon: Icon }, index) => {
                    const selected = activeTab === id;

                    return (
                        <button
                            key={id}
                            ref={(element) => { tabRefs.current[index] = element; }}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            aria-label={label}
                            title={label}
                            className={`relative flex min-w-0 flex-1 items-center justify-center gap-1 px-1.5 py-2 font-medium transition sm:flex-none sm:px-2.5 ${
                                selected
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            }`}
                            style={{ fontSize: "12px", lineHeight: "1" }}
                        >
                            <Icon
                                size={13}
                                className="shrink-0"
                                strokeWidth={selected ? 2 : 1.7}
                            />

                            <span
                                className={
                                    selected
                                        ? "whitespace-nowrap sm:inline"
                                        : "hidden whitespace-nowrap sm:inline"
                                }
                            >
                                {label}
                            </span>

                        </button>
                    );
                })}

                {activeTabIndex >= 0 && (
                    <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-[-1px] left-0 h-0.5 rounded-full bg-green-500"
                        initial={false}
                        animate={{
                            left: tabIndicator.left,
                            width: tabIndicator.width,
                        }}
                        transition={
                            reduceMotion
                                ? { duration: 0 }
                                : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
                        }
                    />
                )}

            </nav>

            {/* Active project workspace view. */}
            <main className="pt-5">
                <ProjectWorkspaceContent
                    activeTab={activeTab}
                    project={project}
                    projectId={projectId}
                    tasks={tasks}
                    setTasks={setTasks}
                    activities={activities}
                    canEdit={canEdit}
                    setActiveTab={setActiveTab}
                    loadActivities={loadActivities}
                    refreshingActivity={refreshingActivity}
                />
            </main>
        </div>
    );
}

export default ProjectWorkspace;
