import {
    CalendarDays,
    Check,
    Pencil,
    Trash2,
} from "lucide-react";
import taskStyles from "../../styles/taskStyles";

function TaskRow({
    title = "Untitled Task",
    description = "",
    status = "pending",
    priority = "medium",
    dueDate = "",
    dueTime = "",
    tag = "",
    onToggleComplete,
    onEdit,
    onDelete,
    onView,
}) {
    const tagKey = tag.toLowerCase();
    const isCompleted = status === "completed";

    return (
        <div className="grid grid-cols-[minmax(0,2.5fr)_1.3fr_0.8fr_1fr_0.8fr] items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-slate-50/50">
            {/* Task */}
            <div className="flex min-w-0 items-start gap-3">
                <button
                    type="button"
                    onClick={onToggleComplete}
                    aria-label={
                        isCompleted
                            ? "Mark task as pending"
                            : "Mark task as completed"
                    }
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition duration-200 ${
                        isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-slate-300 text-transparent hover:border-green-400 hover:bg-green-50"
                    }`}
                >
                    {isCompleted && <Check size={13} />}
                </button>

                <button
                    type="button"
                    onClick={onView}
                    className="min-w-0 text-left"
                >
                    <h3
                        className={`truncate text-sm font-semibold transition-colors ${
                            isCompleted
                                ? "text-slate-400 line-through"
                                : "text-slate-800 hover:text-green-600"
                        }`}
                    >
                        {title}
                    </h3>

                    {description && (
                        <p
                            className={`mt-1 truncate text-xs ${
                                isCompleted
                                    ? "text-slate-300"
                                    : "text-slate-500"
                            }`}
                        >
                            {description}
                        </p>
                    )}
                </button>
            </div>

            {/* Due Date */}
            <div
                className={`flex min-w-0 items-start gap-1.5 text-xs ${
                    isCompleted
                        ? "text-slate-300"
                        : "text-slate-400"
                }`}
            >
                <CalendarDays
                    size={14}
                    className="mt-0.5 shrink-0"
                />

                <div className="min-w-0">
                    <div className="truncate">
                        {dueDate || "No due date"}
                        {dueTime && ` - ${dueTime}`}
                    </div>
                </div>
            </div>

            {/* Priority */}
            <div>
                {priority && (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            isCompleted
                                ? "bg-slate-100 text-slate-400"
                                : taskStyles.priority[
                                      priority
                                  ] ||
                                  taskStyles.priority.medium
                        }`}
                    >
                        {priority}
                    </span>
                )}
            </div>

            {/* Tag */}
            <div>
                {tag && (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                            isCompleted
                                ? "bg-slate-100 text-slate-400"
                                : taskStyles.tag[tagKey] ||
                                  "bg-slate-100 text-slate-500"
                        }`}
                    >
                        {tag}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1">
                <button
                    type="button"
                    onClick={onEdit}
                    aria-label="Edit task"
                    title="Edit task"
                    className="rounded-lg p-1.5 text-green-400 transition duration-200 hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                >
                    <Pencil size={15} />
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    aria-label="Delete task"
                    title="Delete task"
                    className="rounded-lg p-1.5 text-red-400 transition duration-200 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

export default TaskRow;