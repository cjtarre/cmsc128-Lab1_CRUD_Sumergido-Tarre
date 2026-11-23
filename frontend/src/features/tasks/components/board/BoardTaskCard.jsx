import { CalendarDays, ChevronDown, GripVertical, User } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import CompactSelect from "../../../../shared/components/common/CompactSelect";
import { BOARD_COLUMNS, PRIORITY } from "../../constants/taskOptions";
import taskStyles, { getTagInlineStyle } from "../../styles/taskStyles";

function BoardTaskCard({ task, canEdit, isDragging, isUpdating, onDragStart, onDragEnd, onStatusChange }) {
    const prefersReducedMotion = useReducedMotion();
    const assigneeName = task.assignee?.display_name || task.assignee?.username || task.assigneeName || task.assignee_name || "Unassigned";

    return (
        <motion.article
            draggable={canEdit && !isUpdating}
            onDragStart={(event) => onDragStart(event, task)}
            onDragEnd={onDragEnd}
            animate={{ y: 0, transition: { duration: 0 } }}
            whileHover={prefersReducedMotion || isDragging || isUpdating ? undefined : {
                y: -4,
                transition: { duration: 0.1, ease: "easeOut" },
            }}
            whileTap={isDragging || isUpdating ? undefined : { scale: 0.985 }}
            className={`rounded-xl border border-white/80 bg-white/75 p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.035)] transition-[background-color,border-color,box-shadow] hover:shadow-[0_10px_24px_rgba(15,23,42,0.09)] dark:border-white/10 dark:bg-slate-900/65 dark:hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)] motion-reduce:transform-none ${canEdit ? "lg:cursor-grab lg:active:cursor-grabbing" : ""} ${isDragging ? "scale-[0.98] opacity-40" : "hover:bg-white/90 dark:hover:bg-slate-900/80"} ${isUpdating ? "pointer-events-none opacity-60" : ""}`}>
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

                {(task.tags || []).slice(0, 2).map((tag) => (
                    <span key={tag.tag_id} className="rounded-md px-1.5 py-0.5 text-[8px] font-medium" style={getTagInlineStyle(tag)}>
                        {tag.tag_name}
                    </span>
                ))}
            </div>

            {/* Touch screens use a status selector instead of native drag. */}
            {canEdit && (
                <div className="mt-3 border-t border-slate-100/70 pt-2.5 dark:border-white/[0.06] lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">Move to</span>
                        <div className="relative w-32 min-w-0 shrink-0">
                            <CompactSelect name="status" value={task.status} disabled={isUpdating}
                                ariaLabel={`Change status for ${task.title}`}
                                onChange={(event) => onStatusChange(task.id, event.target.value)}
                                className="h-8 w-full rounded-lg border border-slate-100/80 bg-white/60 px-2 pr-7 font-medium text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-green-200 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                                style={{ appearance: "none", WebkitAppearance: "none" }}>
                                {BOARD_COLUMNS.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
                            </CompactSelect>
                            <ChevronDown size={12} aria-hidden="true"
                                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </div>
            )}
        </motion.article>
    );
}

export default BoardTaskCard;