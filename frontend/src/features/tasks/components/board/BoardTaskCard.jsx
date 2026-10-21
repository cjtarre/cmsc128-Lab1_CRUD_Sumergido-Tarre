import { CalendarDays, GripVertical, User } from "lucide-react";

import { BOARD_COLUMNS, PRIORITY } from "../../constants/taskOptions";
import taskStyles from "../../styles/taskStyles";

function BoardTaskCard({ task, canEdit, isDragging, isUpdating, onDragStart, onDragEnd, onStatusChange }) {
    const assigneeName = task.assignee?.display_name || task.assignee?.username || task.assigneeName || task.assignee_name || "Unassigned";

    return (
        <article draggable={canEdit && !isUpdating} onDragStart={(event) => onDragStart(event, task)} onDragEnd={onDragEnd}
            className={`rounded-xl border border-white/80 bg-white/75 p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.035)] transition dark:border-white/10 dark:bg-slate-900/65 ${canEdit ? "lg:cursor-grab lg:active:cursor-grabbing" : ""} ${isDragging ? "scale-[0.98] opacity-40" : "hover:bg-white/90 dark:hover:bg-slate-900/80"} ${isUpdating ? "pointer-events-none opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-1.5">
                    {canEdit && <GripVertical size={13} className="mt-1 hidden shrink-0 text-slate-300 dark:text-slate-600 lg:block" />}
                    <h4 className="min-w-0 break-words text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">{task.title}</h4>
                </div>

                {task.priority && task.priority !== PRIORITY.NONE && <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-semibold uppercase ${taskStyles.priority[task.priority] || taskStyles.priority[PRIORITY.NONE]}`}>{task.priority}</span>}
            </div>

            {task.description && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400 dark:text-slate-500">{task.description}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className={`inline-flex min-w-0 items-center gap-1 text-[9px] ${assigneeName === "Unassigned" ? "text-slate-400 dark:text-slate-500" : "font-medium text-slate-500 dark:text-slate-400"}`} title={assigneeName}>
                    <User size={10} /><span className="max-w-[110px] truncate">{assigneeName}</span>
                </span>

                {task.dueDate && <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500"><CalendarDays size={10} />{task.dueDate}</span>}

                {(task.tags || []).slice(0, 2).map((tag, index) => <span key={tag.tag_id} className={`rounded-md px-1.5 py-0.5 text-[8px] font-medium ${taskStyles.tag[index + 1] || taskStyles.tag[3]}`}>{tag.tag_name}</span>)}
            </div>

            {/* Touch screens use a status selector instead of native drag. */}
            {canEdit && (
                <div className="mt-3 border-t border-slate-100/70 pt-2.5 dark:border-white/[0.06] lg:hidden">
                    <label className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">Move to</span>
                        <select value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value)} disabled={isUpdating}
                            className="h-8 rounded-lg border border-slate-100/80 bg-white/60 px-2 text-[10px] font-medium text-slate-500 outline-none focus:border-green-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                            {BOARD_COLUMNS.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
                        </select>
                    </label>
                </div>
            )}
        </article>
    );
}

export default BoardTaskCard;
