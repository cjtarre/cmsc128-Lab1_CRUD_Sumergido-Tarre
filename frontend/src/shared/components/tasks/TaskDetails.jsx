import {
    CalendarDays,
    X,
    Pencil,
    Trash2,
} from "lucide-react";

import taskStyles from "../../styles/taskStyles";
import {
    STATUS,
    priorityLabels,
    tagLabels,
} from "../../constants/taskOptions";
import { formatDueDate } from "../../utils/dateUtils";

function TaskDetails({ task, onClose, onEdit, onDelete }) {
    if (!task) return null;

    const isCompleted = task.status === STATUS.COMPLETED;

    const statusLabels = {
        [STATUS.NOT_STARTED]: "Not Started",
        [STATUS.IN_PROGRESS]: "In Progress",
        [STATUS.COMPLETED]: "Completed",
    };

    const statusColors = {
        [STATUS.NOT_STARTED]: "text-slate-500",
        [STATUS.IN_PROGRESS]: "text-amber-600",
        [STATUS.COMPLETED]: "text-green-600",
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/25 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-details-title"
        >
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="min-w-0 pr-4">
                        <h2
                            id="task-details-title"
                            className={`text-lg font-semibold ${
                                isCompleted
                                    ? "text-slate-400 line-through"
                                    : "text-slate-800"
                            }`}
                        >
                            {task.title}
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Task Details
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close task details"
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6 px-6 py-6">
                    {/* Description */}
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                            Description
                        </p>

                        <p className="text-sm leading-6 text-slate-600">
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    {/* Task Information */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Due Date */}
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Due Date
                            </p>

                            <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                                <CalendarDays
                                    size={15}
                                    className="mt-0.5 shrink-0"
                                />

                                <div>
                                    {task.dueDate
                                        ? formatDueDate(task.dueDate)
                                        : "No due date"}

                                    {task.dueTime && (
                                        <span className="text-xs text-slate-400">
                                            {" - "}
                                            {task.dueTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Priority
                            </p>

                            <div className="mt-2">
                                {task.priority > 0 ? (
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                            isCompleted
                                                ? "bg-slate-100 text-slate-400"
                                                : taskStyles.priority[task.priority]
                                        }`}
                                    >
                                        {priorityLabels[task.priority]}
                                    </span>
                                ) : (
                                    <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-400">
                                        None
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                            Status
                        </p>

                        <span
                            className={`text-sm font-medium ${
                                isCompleted
                                    ? "text-green-600"
                                    : statusColors[task.status] ||
                                      "text-slate-500"
                            }`}
                        >
                            {statusLabels[task.status] || "Not Started"}
                        </span>
                    </div>

                    {/* Tag */}
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                            Tag
                        </p>

                        {tagLabels[task.tag] ? (
                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                    taskStyles.tag[task.tag] ||
                                    "bg-slate-100 text-slate-500"
                                }`}
                            >
                                {tagLabels[task.tag]}
                            </span>
                        ) : (
                            <span className="text-sm text-slate-400">
                                No tag
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={() => onDelete(task)}
                        aria-label="Delete task"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                        <Trash2 size={15} />
                        Delete
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onEdit(task)}
                            aria-label="Edit task"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-green-500 transition hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                        >
                            <Pencil size={15} />
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
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