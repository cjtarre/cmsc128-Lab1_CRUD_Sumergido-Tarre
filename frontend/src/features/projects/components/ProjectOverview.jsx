import { Activity, AlertTriangle, ChevronRight, ClipboardList, Clock3, ListChecks, ListTodo, RefreshCw } from "lucide-react";
import { priorityLabels, STATUS } from "../../tasks/constants/taskOptions";

const getActorName = (activity) => activity.actor?.display_name || activity.actor?.username || "A project member";

const getInitials = (activity) => {
    const name = getActorName(activity);
    if (name === "A project member") return "?";
    return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
};

const formatActivityTime = (value) => {
    if (!value) return "";

    const date = new Date(value);
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getActivityContent = (activity) => {
    const actor = getActorName(activity);
    const data = activity.data || {};
    const taskName = data.task_name || data.taskName || "a task";

    switch (activity.activity_type) {
        case "task_created":
            return { actor, action: "created", subject: taskName };

        case "task_status_changed":
            return { actor, action: "moved", subject: taskName, detail: `to ${String(data.status || data.new_status || "a new status").replaceAll("_", " ")}` };

        case "task_completed":
            return { actor, action: "completed", subject: taskName };

        case "task_assigned":
            return { actor, action: "assigned", subject: taskName, detail: `to ${data.assignee_name || data.assigneeName || "a project member"}` };

        case "task_reassigned":
            return { actor, action: "reassigned", subject: taskName, detail: `to ${data.assignee_name || data.assigneeName || "a project member"}` };

        case "task_unassigned":
            return { actor, action: "unassigned", subject: taskName };

        case "member_joined":
            return { actor: data.display_name || data.username || data.member_name || "A member", action: "joined", subject: "the project" };

        case "member_removed":
            return { actor, action: "removed", subject: data.display_name || data.username || data.member_name || "a member", detail: "from the project" };

        case "member_role_changed":
            return { actor, action: "changed", subject: data.display_name || data.username || data.member_name || "a member", detail: `to ${data.role || data.new_role || "a new role"}` };

        default:
            return { actor, action: "updated", subject: "the project" };
    }
};

const statusStyles = {
    [STATUS.NOT_STARTED]: "bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400",
    [STATUS.IN_PROGRESS]: "bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400",
    [STATUS.COMPLETED]: "bg-green-50 text-green-600 dark:bg-green-950/35 dark:text-green-400",
};

function ProjectOverview({ tasks, activities = [], loading, onOpenList, onRefreshActivity, refreshingActivity = false }) {
    const completed = tasks.filter((task) => task.status === STATUS.COMPLETED).length;

    const overdue = tasks.filter((task) => {
        if (!task.dueDate || task.status === STATUS.COMPLETED) return false;
        const [day, month, year] = task.dueDate.split("/").map(Number);
        return new Date(year, month - 1, day, 23, 59, 59) < new Date();
    }).length;

    const active = tasks.length - completed;
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    const stats = [
        { label: "Total Tasks", value: tasks.length, icon: ClipboardList },
        { label: "Active", value: active, icon: Clock3 },
        { label: "Completed", value: completed, icon: ListChecks },
        { label: "Overdue", value: overdue, icon: AlertTriangle },
    ];

    const currentWork = [...tasks].sort((a, b) => {
        const aCompleted = a.status === STATUS.COMPLETED;
        const bCompleted = b.status === STATUS.COMPLETED;
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        return 0;
    });

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/60 bg-white/20 backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
            </div>
        );
    }

    return (
        <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
            <div>
                <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">Overview</h2>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Track the project's work and overall progress.</p>
            </div>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap gap-2.5">
                {stats.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex h-11 items-center gap-2 rounded-xl border border-white/75 bg-white/55 px-3.5 shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.04]">
                        <Icon size={14} className="shrink-0 text-green-500 dark:text-green-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-5 grid items-stretch gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1.15fr)_minmax(210px,0.8fr)]">
                {/* Current Work */}
                <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_6px_22px_rgba(15,23,42,0.035)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55">
                    <div className="flex shrink-0 items-center justify-between border-b border-white/60 px-4 py-3 dark:border-white/[0.07]">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Current Work</h3>
                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">Tasks currently in this project.</p>
                        </div>

                        <button type="button" onClick={onOpenList} aria-label="See all project tasks" className="group flex h-8 items-center justify-end overflow-hidden rounded-full border border-green-100/80 bg-green-50/60 px-2.5 text-[11px] font-medium text-green-600 transition-all duration-300 ease-out hover:bg-green-100/70 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/35">
                            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:mr-1.5 group-hover:max-w-12 group-hover:opacity-100">See all</span>
                            <ChevronRight size={13} strokeWidth={2} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>
                    </div>

                    {currentWork.length ? (
                        <div className="min-w-0">
                            <div className="grid grid-cols-[minmax(0,1fr)_100px_80px_80px] gap-3 border-b border-slate-100/70 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 dark:border-white/[0.05] dark:text-slate-600">
                                <span>Task</span>
                                <span>Status</span>
                                <span>Priority</span>
                                <span className="text-right">Due</span>
                            </div>

                            <div className="max-h-[245px] overflow-y-auto overscroll-contain">
                                <div className="divide-y divide-slate-100/60 dark:divide-white/[0.05]">
                                    {currentWork.map((task) => {
                                        const isCompleted = task.status === STATUS.COMPLETED;

                                        return (
                                            <div key={task.id} className={`grid grid-cols-[minmax(0,1fr)_100px_80px_80px] items-center gap-3 px-4 py-3.5 ${isCompleted ? "bg-slate-50/35 dark:bg-white/[0.01]" : ""}`}>
                                                <div className="min-w-0">
                                                    <p className={`truncate text-xs font-semibold ${isCompleted ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-600 dark:text-slate-300"}`}>{task.title}</p>
                                                    {task.description && <p className={`mt-1 truncate text-[11px] ${isCompleted ? "text-slate-300 dark:text-slate-600" : "text-slate-400 dark:text-slate-500"}`}>{task.description}</p>}
                                                </div>

                                                <span className={`w-fit rounded-full px-2 py-1 text-[10px] font-medium capitalize ${statusStyles[task.status] || statusStyles[STATUS.NOT_STARTED]}`}>
                                                    {task.status?.replaceAll("_", " ") || "not started"}
                                                </span>

                                                <span className={`text-[11px] capitalize ${isCompleted ? "text-slate-300 dark:text-slate-600" : "text-slate-400 dark:text-slate-500"}`}>
                                                    {priorityLabels?.[task.priority] || task.priority || "—"}
                                                </span>

                                                <span className={`text-right text-[11px] ${isCompleted ? "text-slate-300 dark:text-slate-600" : "text-slate-400 dark:text-slate-500"}`}>
                                                    {task.dueDate || "—"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
                            <ListTodo size={21} className="text-slate-300 dark:text-slate-600" />
                            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">No project tasks yet</p>
                            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Project tasks will appear here.</p>
                        </div>
                    )}
                </section>

                {/* Recent Activity */}
                <section className="flex flex-col overflow-hidden rounded-2xl border border-white/75 bg-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between border-b border-white/60 px-4 py-3 dark:border-white/[0.07]">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Recent Activity</h3>
                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">Latest project updates.</p>
                        </div>

                        <button type="button" onClick={onRefreshActivity} disabled={refreshingActivity} aria-label="Refresh recent activity" title="Refresh activity" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-green-50 hover:text-green-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-950/30 dark:hover:text-green-400">
                            <RefreshCw size={13} className={refreshingActivity ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {activities.length ? (
                        <div className="max-h-[285px] overflow-y-auto overscroll-contain">
                            <div className="divide-y divide-slate-100/60 dark:divide-white/[0.05]">
                                {activities.map((activity, index) => {
                                    const content = getActivityContent(activity);

                                    return (
                                        <div key={activity.id} className={`relative flex gap-2.5 px-4 py-3 ${index === 0 ? "bg-green-50/35 dark:bg-green-950/[0.08]" : ""}`}>
                                            {index === 0 && <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-green-400" />}

                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-[9px] font-bold text-green-600 ring-1 ring-green-100/70 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-900/40">
                                                {getInitials(activity)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] leading-4 text-slate-400 dark:text-slate-500">
                                                    <span className="font-semibold text-slate-600 dark:text-slate-300">{content.actor}</span>
                                                    {" "}{content.action}{" "}
                                                    <span className="font-semibold text-green-600 dark:text-green-400">{content.subject}</span>
                                                    {content.detail && <> <span>{content.detail}</span></>}
                                                </p>

                                                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-300 dark:text-slate-600">
                                                    <Activity size={9} />
                                                    <span>{formatActivityTime(activity.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-48 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/65 text-green-500 dark:bg-white/[0.04] dark:text-green-400">
                                <Activity size={15} />
                            </div>
                            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">No recent activity yet</p>
                            <p className="mt-1 max-w-40 text-[11px] leading-4 text-slate-400 dark:text-slate-500">New project activity will appear here.</p>
                        </div>
                    )}
                </section>

                {/* Project Progress */}
                <aside className="flex flex-col rounded-2xl border border-white/70 bg-white/40 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/35">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Project Progress</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">Overall task completion</p>

                    <div className="mt-7 flex items-end gap-1.5">
                        <span className="text-3xl font-semibold tracking-tight text-slate-700 dark:text-white">{progress}%</span>
                        <span className="mb-1 text-[11px] text-slate-400 dark:text-slate-500">complete</span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/60 dark:bg-white/[0.06]">
                        <div className="h-full rounded-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="mt-auto border-t border-white/60 pt-4 dark:border-white/[0.07]">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{completed} of {tasks.length} tasks completed</p>

                        <p className="mt-1 text-[11px] leading-4 text-slate-400 dark:text-slate-500">
                            {active
                                ? `${active} ${active === 1 ? "task remains" : "tasks remain"} in this project.`
                                : tasks.length
                                    ? "All tasks are complete."
                                    : "No tasks to track yet."}
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default ProjectOverview;