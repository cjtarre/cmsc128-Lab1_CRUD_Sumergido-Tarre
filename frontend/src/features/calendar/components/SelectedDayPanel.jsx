import { useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronUp, Plus } from "lucide-react";

import { formatDueTime } from "../../../shared/utils/dateUtils";
import { STATUS, priorityLabels } from "../../tasks/constants/taskOptions";
import taskStyles from "../../tasks/styles/taskStyles";

function SelectedDayPanel({ date, tasks, onTaskClick, onToggleComplete, onAddTask }) {
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const dateLabel = date.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" });
    const dayLabel = date.toLocaleDateString("default", { weekday: "long" });
    const toggleExpanded = (taskId) => setExpandedTaskId((currentId) => currentId === taskId ? null : taskId);

    return (
        <aside className="overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/20">
            {/* Selected date */}
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

                    <button type="button" onClick={onAddTask} aria-label="Add task" title="Add task" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white shadow-[0_5px_15px_rgba(34,197,94,0.2)] transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300/50 dark:hover:bg-green-400">
                        <Plus size={15} />
                    </button>
                </div>
            </div>

            {/* Scheduled tasks */}
            <div className="p-4 sm:p-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {tasks.length} {tasks.length === 1 ? "Activity" : "Activities"}
                </p>

                {tasks.length > 0 ? (
                    <div className="space-y-2">
                        {tasks.map((task) => {
                            const isCompleted = task.status === STATUS.COMPLETED;
                            const isExpanded = expandedTaskId === task.id;

                            return (
                                <div key={task.id} className="overflow-hidden rounded-xl border border-white/80 bg-white/65 shadow-sm transition hover:border-green-200 hover:bg-white/80 hover:shadow-md dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-green-900/60 dark:hover:bg-white/[0.05]">
                                    <div className="flex items-start gap-2.5 p-3">
                                        <button type="button" onClick={() => onToggleComplete(task.id)} aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${isCompleted ? "border-green-500 bg-green-500 text-white" : "border-slate-300 bg-white/40 hover:border-green-500 dark:border-slate-600 dark:bg-white/[0.03]"}`}>
                                            {isCompleted && <Check size={11} strokeWidth={3} />}
                                        </button>

                                        <div className="min-w-0 flex-1">
                                            <button type="button" onClick={() => onTaskClick(task)} className="block max-w-full text-left">
                                                <p className={`truncate text-xs font-semibold transition hover:text-green-600 dark:hover:text-green-400 ${isCompleted ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>{task.title}</p>
                                            </button>

                                            <div className="mt-1 flex items-center gap-2">
                                                {task.dueTime && <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatDueTime(task.dueTime)}</span>}

                                                {task.priority > 0 && (
                                                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase ${isCompleted ? "bg-slate-100/80 text-slate-400 dark:bg-slate-700/70 dark:text-slate-500" : taskStyles.priority[task.priority]}`}>
                                                        {priorityLabels[task.priority]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button type="button" onClick={() => toggleExpanded(task.id)} aria-label={isExpanded ? `Collapse ${task.title}` : `Expand ${task.title}`} aria-expanded={isExpanded} className={`rounded-lg p-1.5 transition ${isExpanded ? "bg-green-100/80 text-green-600 dark:bg-green-900/40 dark:text-green-400" : "text-slate-400 hover:bg-green-50/70 hover:text-green-600 dark:text-slate-500 dark:hover:bg-green-950/30 dark:hover:text-green-400"}`}>
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-green-100/60 bg-green-50/30 px-3 py-3 dark:border-green-900/30 dark:bg-green-950/15">
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</p>
                                            <p className="mt-1 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-600 dark:text-slate-300">{task.description?.trim() || "No description."}</p>

                                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px]">
                                                <div>
                                                    <span className="text-slate-400 dark:text-slate-500">Status: </span>
                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{task.status}</span>
                                                </div>

                                                {task.priority > 0 && (
                                                    <div>
                                                        <span className="text-slate-400 dark:text-slate-500">Priority: </span>
                                                        <span className="font-medium text-slate-600 dark:text-slate-300">{priorityLabels[task.priority]}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {task.tags?.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {task.tags.map((tag) => <span key={tag.tag_id} className="rounded-full bg-white/65 px-2 py-0.5 text-[9px] text-slate-500 shadow-sm dark:bg-white/[0.05] dark:text-slate-300">{tag.tag_name}</span>)}
                                                </div>
                                            )}
                                        </div>
                                    )}
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