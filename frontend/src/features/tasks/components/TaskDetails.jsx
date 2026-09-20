import { CalendarDays, X, Pencil, Trash2 } from "lucide-react";
import { useEffect } from "react";

import taskStyles from "../styles/taskStyles";
import { STATUS, priorityLabels, statusLabels } from "../constants/taskOptions";
import { formatDueDate } from "../../../shared/utils/dateUtils";

function TaskDetails({ task, onClose, onEdit, onDelete }) {
    useEffect(() => {
        if (!task) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [task]);

    if (!task) return null;

    const isCompleted = task.status === STATUS.COMPLETED;

    const getTagStyle = (tagId) =>
        taskStyles.tag[Number(tagId)] ||
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

    return (
        <div
            className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/25 p-3 pt-7 dark:bg-black/50 sm:flex sm:items-center sm:justify-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-details-title"
        >
            <div className="mx-auto flex max-h-[calc(100dvh-2.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:max-h-[85vh] sm:rounded-2xl">
                <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-700 sm:px-6 sm:py-5">
                    <div className="min-w-0 pr-4">
                        <h2
                            id="task-details-title"
                            className={`break-words text-lg font-semibold ${
                                isCompleted
                                    ? "text-slate-400 line-through dark:text-slate-500"
                                    : "text-slate-800 dark:text-slate-100"
                            }`}
                        >
                            {task.title}
                        </h2>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Task Details
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close task details"
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Description
                        </p>

                        <p className="break-words whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                Due Date
                            </p>

                            <div className="mt-2 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <CalendarDays size={15} className="mt-0.5 shrink-0" />

                                <div className="min-w-0 break-words">
                                    {task.dueDate
                                        ? formatDueDate(task.dueDate)
                                        : "No due date"}

                                    {task.dueTime && (
                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                            {" - "}{task.dueTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                Priority
                            </p>

                            {task.priority > 0 ? (
                                <span
                                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                        isCompleted
                                            ? "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                                            : taskStyles.priority[task.priority]
                                    }`}
                                >
                                    {priorityLabels[task.priority]}
                                </span>
                            ) : (
                                <span className="mt-2 block text-sm text-slate-400 dark:text-slate-500">
                                    No priority
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Status
                        </p>

                        <span
                            className={`text-xs font-medium ${
                                isCompleted
                                    ? "text-green-600 dark:text-green-400"
                                    : taskStyles.status[task.status] ||
                                      taskStyles.status[STATUS.NOT_STARTED]
                            }`}
                        >
                            {statusLabels[task.status] || "Not Started"}
                        </span>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Tags
                        </p>

                        {task.tags?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {task.tags.map((tag) => (
                                    <span
                                        key={tag.tag_id}
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                            isCompleted
                                                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                                : getTagStyle(tag.tag_id)
                                        }`}
                                    >
                                        {tag.tag_name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500">
                                No tags
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <button
                        type="button"
                        onClick={() => onDelete(task)}
                        className="w-full rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 sm:w-auto"
                    >
                        <span className="inline-flex items-center justify-center gap-2">
                            <Trash2 size={15} />
                            Delete
                        </span>
                    </button>

                    <div className="flex w-full gap-2 sm:w-auto">
                        <button
                            type="button"
                            onClick={() => onEdit(task)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-green-500 transition hover:bg-green-50 hover:text-green-600 dark:border-slate-700 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:text-green-300 sm:flex-none"
                        >
                            <Pencil size={15} />
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex flex-1 items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 sm:flex-none"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetails;