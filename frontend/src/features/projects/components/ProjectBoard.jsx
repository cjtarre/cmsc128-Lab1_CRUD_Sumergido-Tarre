import { useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import { toast } from "sonner";

import { STATUS } from "../../tasks/constants/taskOptions";
import useTasks from "../../tasks/hooks/useTasks";

const columns = [
    { id: STATUS.NOT_STARTED, label: "To Do" },
    { id: STATUS.IN_PROGRESS, label: "In Progress" },
    { id: STATUS.COMPLETED, label: "Done" },
];

const formatStatus = (status) => status?.replaceAll("_", " ") || "";

function ProjectBoard({ projectId, tasks, setTasks, canEdit }) {
    const [searchTerm, setSearchTerm] = useState("");
    const taskActions = useTasks(tasks, setTasks, projectId);

    const filteredTasks = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return tasks;
        return tasks.filter((task) => task.title?.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query));
    }, [tasks, searchTerm]);

    const handleStatusChange = async (taskId, status) => {
        if (!canEdit) return;

        try {
            await taskActions.updateTaskStatus(taskId, status);
            toast.success("Task status updated.");
        } catch (error) {
            console.error("Error updating task status:", error);
            toast.error(error.response?.data?.error || "Unable to update task.");
        }
    };

    return (
        <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">Board</h2>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Track project work across each stage.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search tasks..."
                        className="h-10 w-full rounded-xl border border-white/70 bg-white/50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-200 focus:bg-white/70 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200 dark:focus:border-green-800 dark:focus:ring-green-900/30"
                    />
                </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {columns.map((column) => {
                    const columnTasks = filteredTasks.filter((task) => task.status === column.id);

                    return (
                        <section key={column.id} className="flex min-h-[390px] flex-col rounded-2xl border border-white/65 bg-white/30 p-3 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.015]">
                            <header className="mb-3 flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${column.id === STATUS.COMPLETED ? "bg-green-500" : column.id === STATUS.IN_PROGRESS ? "bg-sky-400" : "bg-slate-300 dark:bg-slate-600"}`} />
                                    <h3 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{column.label}</h3>
                                    <span className="text-[9px] text-slate-400">{columnTasks.length}</span>
                                </div>
                            </header>

                            <div className="space-y-2.5">
                                {columnTasks.map((task) => (
                                    <article key={task.id} className="rounded-xl border border-white/80 bg-white/75 p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.035)] transition hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/65">
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="min-w-0 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">{task.title}</h4>

                                            {task.priority && task.priority !== "none" && (
                                                <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">{task.priority}</span>
                                            )}
                                        </div>

                                        {task.description && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400 dark:text-slate-500">{task.description}</p>}

                                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                            {task.dueDate && (
                                                <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500">
                                                    <CalendarDays size={10} />
                                                    {task.dueDate}
                                                </span>
                                            )}

                                            {(task.tags || []).slice(0, 2).map((tag) => (
                                                <span key={tag.tag_id} className="rounded-md bg-green-50 px-1.5 py-0.5 text-[8px] font-medium text-green-600 dark:bg-green-950/30 dark:text-green-400">{tag.tag_name}</span>
                                            ))}
                                        </div>

                                        {canEdit ? (
                                            <select
                                                value={task.status}
                                                onChange={(event) => handleStatusChange(task.id, event.target.value)}
                                                aria-label={`Change status for ${task.title}`}
                                                className="mt-3 w-full rounded-lg border border-slate-100/80 bg-slate-50/60 px-2 py-1.5 text-[9px] text-slate-500 outline-none transition focus:border-green-300 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400"
                                            >
                                                {columns.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                                            </select>
                                        ) : (
                                            <p className="mt-3 text-[9px] capitalize text-slate-400">{formatStatus(task.status)}</p>
                                        )}
                                    </article>
                                ))}
                            </div>

                            {!columnTasks.length && (
                                <div className="flex flex-1 items-center justify-center py-10">
                                    <p className="text-[9px] text-slate-400 dark:text-slate-600">No tasks</p>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </section>
    );
}

export default ProjectBoard;