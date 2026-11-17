import { useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronUp, FolderKanban, Plus } from "lucide-react";

import { formatDueTime } from "../../../shared/utils/dateUtils";
import { STATUS, PRIORITY, priorityLabels, statusLabels } from "../../tasks/constants/taskOptions";
import taskStyles, { getTagInlineStyle } from "../../tasks/styles/taskStyles";

import { compareTasksByDueTime } from "../utils/calendarTaskOrder";

function SelectedDayPanel({
    date,
    tasks,
    onTaskClick,
    onToggleComplete,
    onAddTask,
    readOnly = false,
    getTaskMeta,
    getTaskProject,
    taskMetaLabel = "Created by",
}) {
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const dateLabel = date.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" });
    const dayLabel = date.toLocaleDateString("default", { weekday: "long" });
    const toggleExpanded = (taskId) => setExpandedTaskId((currentId) => currentId === taskId ? null : taskId);

    return (
        <aside data-takda-selected-day className="overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/20">
            <div className="border-b border-green-100/60 bg-green-50/45 px-4 py-4 dark:border-green-900/30 dark:bg-green-950/20 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/65 text-green-500 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:text-green-400">
                            <CalendarDays size={15} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{dateLabel}</h2>
                            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">{dayLabel}</p>
                        </div>
                    </div>

                    {!readOnly && onAddTask && (
                        <button type="button" onClick={onAddTask} aria-label="Add task" title="Add task" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white shadow-[0_5px_15px_rgba(34,197,94,0.2)] transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300/50 dark:hover:bg-green-400">
                            <Plus size={15} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {tasks.length} {tasks.length === 1 ? "Activity" : "Activities"}
                </p>

                {tasks.length > 0 ? (
                    <div className="divide-y divide-slate-200/70 dark:divide-white/10">
                        {[...tasks].sort(compareTasksByDueTime).map((task) => {
                            const isCompleted = task.status === STATUS.COMPLETED;
                            const isExpanded = expandedTaskId === task.id;
                            const taskMeta = getTaskMeta?.(task);
                            const taskProject = getTaskProject?.(task);
                            const canToggle = !readOnly && onToggleComplete && !taskProject;
                            const hasDetails = Boolean(task.description?.trim() || task.tags?.length);

                            return (
                                <div key={task.id} className="py-3 first:pt-0 last:pb-0">
                                    <div className="flex min-w-0 items-start gap-2 sm:gap-2.5">
                                        {canToggle ? (
                                            <button
                                                type="button"
                                                onClick={() => onToggleComplete(task.id)}
                                                aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
                                                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-green-300/60 ${isCompleted ? "border-green-500 bg-green-500 text-white" : "border-slate-300 bg-white/50 hover:border-green-500 dark:border-slate-600 dark:bg-white/[0.03]"}`}
                                            >
                                                {isCompleted && <Check size={11} strokeWidth={3} />}
                                            </button>
                                        ) : (
                                            <span aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />
                                        )}

                                        <span className="w-[3.7rem] shrink-0 pt-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:w-[4.1rem]">
                                            {task.dueTime ? formatDueTime(task.dueTime) : "—"}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex min-w-0 items-start gap-1.5">
                                                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                                                    <button type="button" onClick={() => onTaskClick?.(task)} className="min-w-0 max-w-full text-left">
                                                        <span className={`block break-words text-[13px] font-semibold leading-snug transition hover:text-green-600 dark:hover:text-green-400 ${isCompleted ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                                                            {task.title}
                                                        </span>
                                                    </button>
                                                    <span className={`whitespace-nowrap text-[10px] font-medium ${taskStyles.status[task.status] || "text-slate-500 dark:text-slate-400"}`}>
                                                        {statusLabels[task.status] || task.status}
                                                    </span>
                                                    {task.priority && task.priority !== PRIORITY.NONE && (
                                                        <span className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${isCompleted ? "bg-slate-100/80 text-slate-400 dark:bg-slate-700/70 dark:text-slate-500" : taskStyles.priority[task.priority]}`}>
                                                            {priorityLabels[task.priority]}
                                                        </span>
                                                    )}
                                                </div>

                                                {hasDetails ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpanded(task.id)}
                                                        aria-label={isExpanded ? `Collapse ${task.title}` : `Expand ${task.title}`}
                                                        aria-expanded={isExpanded}
                                                        className={`shrink-0 rounded-lg p-1.5 transition ${isExpanded ? "bg-green-100/80 text-green-600 dark:bg-green-900/40 dark:text-green-400" : "text-slate-400 hover:bg-green-50/70 hover:text-green-600 dark:text-slate-500 dark:hover:bg-green-950/30 dark:hover:text-green-400"}`}
                                                    >
                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                ) : (
                                                    <span aria-hidden="true" className="h-[26px] w-[26px] shrink-0" />
                                                )}
                                            </div>

                                            {(taskProject || taskMeta?.name) && (
                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    {taskProject && (
                                                        <span className="inline-flex min-w-0 items-center gap-1 text-[9px] font-medium text-green-600 dark:text-green-400">
                                                            <FolderKanban size={10} className="shrink-0" />
                                                            <span className="max-w-32 truncate">{taskProject.name}</span>
                                                            <span className="text-slate-300 dark:text-slate-600">·</span>
                                                            <span className="text-slate-400 dark:text-slate-500">Project task</span>
                                                        </span>
                                                    )}
                                                    {taskMeta?.name && (
                                                        <span className="inline-flex min-w-0 items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500">
                                                            {taskMeta.initials && (
                                                                <span title={taskMeta.name} className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-50 text-[8px] font-bold text-green-600 dark:bg-green-950/40 dark:text-green-400">
                                                                    {taskMeta.initials}
                                                                </span>
                                                            )}
                                                            <span>{taskMeta.name === "Unassigned" ? "Unassigned" : `${taskMetaLabel} ${taskMeta.name}`}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {isExpanded && hasDetails && (
                                                <div className="mt-2.5 space-y-2 border-l-2 border-green-100/80 pl-3 dark:border-green-900/50">
                                                    {task.description?.trim() && (
                                                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">{task.description.trim()}</p>
                                                    )}
                                                    {task.tags?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {task.tags.map((tag) => (
                                                                <span key={tag.tag_id} className="rounded-full border border-transparent px-2 py-0.5 text-[9px] font-medium" style={getTagInlineStyle(tag)}>
                                                                    {tag.tag_name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-7 text-center">
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-green-50/70 text-green-400 dark:bg-green-950/30 dark:text-green-500">
                            <CalendarDays size={16} />
                        </div>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">No activities</p>
                        <p className="mt-1 text-[10px] text-slate-300 dark:text-slate-600">No tasks are scheduled for this day.</p>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default SelectedDayPanel;