import { CalendarDays, X, Pencil, Trash2 } from "lucide-react";
import taskStyles from "../../styles/taskStyles";
import { STATUS, priorityLabels, statusLabels } from "../../constants/taskOptions";
import { formatDueDate } from "../../utils/dateUtils";

function TaskDetails({ task, onClose, onEdit, onDelete }) {
    if (!task) return null;

    const isCompleted = task.status === STATUS.COMPLETED;
    const getTagStyle = (tagId) =>
        taskStyles.tag[Number(tagId)] || "bg-slate-100 text-slate-500";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/25 px-4" role="dialog" aria-modal="true" aria-labelledby="task-details-title">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="min-w-0 pr-4">
                        <h2 id="task-details-title" className={`text-lg font-semibold ${isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                            {task.title}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">Task Details</p>
                    </div>

                    <button type="button" onClick={onClose} aria-label="Close task details" className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-6 px-6 py-6">
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
                        <p className="text-sm leading-6 text-slate-600">
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Due Date</p>
                            <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                                <CalendarDays size={15} className="mt-0.5 shrink-0" />
                                <div>
                                    {task.dueDate ? formatDueDate(task.dueDate) : "No due date"}
                                    {task.dueTime && <span className="text-xs text-slate-400">{" - "}{task.dueTime}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Priority</p>
                            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${isCompleted ? "bg-slate-100 text-slate-400" : taskStyles.priority[task.priority] || taskStyles.priority[0]}`}>
                                {priorityLabels[task.priority] || "None"}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
                        <span className={`text-xs font-medium ${isCompleted ? "text-green-600" : taskStyles.status[task.status] || taskStyles.status[STATUS.NOT_STARTED]}`}>
                            {statusLabels[task.status] || "Not Started"}
                        </span>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Tags</p>
                        {task.tags?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {task.tags.map((t) => (
                                    <span
                                        key={t.tag_id}
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                            isCompleted ? "bg-slate-100 text-slate-400" : getTagStyle(t.tag_id)
                                        }`}
                                    >
                                        {t.tag_name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-slate-400">No tags</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                    <button type="button" onClick={() => onDelete(task)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} /> Delete
                    </button>

                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onEdit(task)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-green-500 transition hover:bg-green-50 hover:text-green-600">
                            <Pencil size={15} /> Edit
                        </button>

                        <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetails;