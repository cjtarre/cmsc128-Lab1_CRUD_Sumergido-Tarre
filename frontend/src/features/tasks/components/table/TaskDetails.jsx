import { CalendarDays, UserRound, X, Pencil, Trash2 } from "lucide-react";
import { useEffect } from "react";

import taskStyles, { getTagInlineStyle } from "../../styles/taskStyles";
import { STATUS, PRIORITY, priorityLabels, statusLabels } from "../../constants/taskOptions";
import { formatDueDate } from "../../../../shared/utils/dateUtils";

function TaskDetails({ task, onClose, onEdit, onDelete, collaborative = false }) {
    useEffect(() => {
        if (!task) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => { document.body.style.overflow = originalOverflow; };
    }, [task]);

    if (!task) return null;

    const isCompleted = task.status === STATUS.COMPLETED;
    const assigneeName = task.assignee?.display_name || task.assignee?.username || "Unassigned";

    const tags = task.tags?.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
            {task.tags.map((tag) => (
                <span
                    key={tag.tag_id}
                    className={`inline-flex rounded-full border border-transparent px-2 py-1 text-[10px] font-medium ${
                        isCompleted ? "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500" : ""
                    }`}
                    style={isCompleted ? undefined : getTagInlineStyle(tag, true)}
                >
                    {tag.tag_name}
                </span>
            ))}
        </div>
    ) : (
        <span className="mt-1.5 block text-xs text-slate-400 dark:text-slate-500">None</span>
    );

    const priority = task.priority && task.priority !== PRIORITY.NONE ? (
        <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            isCompleted ? "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500" : taskStyles.priority[task.priority]
        }`}>
            {priorityLabels[task.priority]}
        </span>
    ) : (
        <span className="mt-1.5 block text-xs text-slate-400 dark:text-slate-500">None</span>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-900/20 px-3 pb-4 pt-20 backdrop-blur-sm dark:bg-black/55 sm:px-4 sm:pb-5 sm:pt-20" role="dialog" aria-modal="true" aria-labelledby="task-details-title">
            <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40">

                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/60 bg-white/25 px-5 py-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="min-w-0 pr-4">
                        <h2 id="task-details-title" className={`break-words text-lg font-semibold ${isCompleted ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-800 dark:text-slate-100"}`}>
                            {task.title}
                        </h2>
                        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">{collaborative ? "Project Task Details" : "Task Details"}</p>
                    </div>

                    <button type="button" onClick={onClose} aria-label="Close task details"
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/70 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200/60 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-slate-300">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-3.5 px-5 py-4">

                    {/* Description */}
                    <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Description</p>
                        <p className="break-words whitespace-pre-line text-sm leading-5 text-slate-600 dark:text-slate-300">{task.description || "No description provided."}</p>
                    </div>

                    {/* Due Date + Priority/Tags */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/70 bg-white/45 px-3.5 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Due Date</p>

                            <div className="mt-1.5 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <CalendarDays size={15} className="mt-0.5 shrink-0 text-green-500 dark:text-green-400" />
                                <div className="min-w-0 break-words">
                                    {task.dueDate ? formatDueDate(task.dueDate) : "No due date"}
                                    {task.dueTime && <span className="text-xs text-slate-400 dark:text-slate-500">{" - "}{task.dueTime}</span>}
                                </div>
                            </div>
                        </div>

                        {collaborative ? (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-xl border border-white/70 bg-white/45 px-3 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Priority</p>
                                    {priority}
                                </div>

                                <div className="rounded-xl border border-white/70 bg-white/45 px-3 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tags</p>
                                    {tags}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-white/70 bg-white/45 px-3.5 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Priority</p>
                                {priority}
                            </div>
                        )}
                    </div>

                    {/* Status + Assigned To/Tags */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/70 bg-white/45 px-3.5 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Status</p>
                            <span className={`text-xs font-medium ${isCompleted ? "text-green-600 dark:text-green-400" : taskStyles.status[task.status] || taskStyles.status[STATUS.NOT_STARTED]}`}>
                                {statusLabels[task.status] || "Not Started"}
                            </span>
                        </div>

                        {collaborative ? (
                            <div className="rounded-xl border border-white/70 bg-white/45 px-3.5 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Assigned To</p>

                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                                        <UserRound size={13} />
                                    </span>
                                    <span className="min-w-0 truncate text-sm text-slate-600 dark:text-slate-300">{assigneeName}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-white/70 bg-white/45 px-3.5 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tags</p>
                                {tags}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-2 border-t border-white/60 bg-white/30 px-5 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between">
                    {onDelete ? (
                        <button type="button" onClick={() => onDelete(task)}
                            className="w-full rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50/80 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 sm:w-auto">
                            <span className="inline-flex items-center justify-center gap-2"><Trash2 size={15} />Delete</span>
                        </button>
                    ) : <span />}

                    <div className="flex w-full gap-2 sm:w-auto">
                        {onEdit && (
                            <button type="button" onClick={() => onEdit(task)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/45 px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50/80 hover:text-green-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300 sm:flex-none">
                                <Pencil size={15} />Edit
                            </button>
                        )}

                        <button type="button" onClick={onClose}
                            className="flex flex-1 items-center justify-center rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(34,197,94,0.18)] transition hover:bg-green-600 hover:shadow-[0_8px_22px_rgba(34,197,94,0.24)] focus:outline-none focus:ring-2 focus:ring-green-300/60 dark:hover:bg-green-400 sm:flex-none">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetails;