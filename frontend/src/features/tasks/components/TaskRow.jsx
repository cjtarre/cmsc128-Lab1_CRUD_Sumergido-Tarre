import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronDown } from "lucide-react";

import ActionButtons from "./ActionButtons";
import taskStyles from "../styles/taskStyles";
import { formatDueDate } from "../../../shared/utils/dateUtils";
import { STATUS, priorityLabels, statusLabels } from "../constants/taskOptions";

function TaskRow({
    title = "Untitled Task",
    description = "",
    status = STATUS.NOT_STARTED,
    priority = 0,
    dueDate = "",
    dueTime = "",
    tags = [],
    onToggleComplete,
    onStatusChange,
    onEdit,
    onDelete,
    onView,
}) {
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const statusButtonRef = useRef(null);
    const statusMenuRef = useRef(null);

    const isCompleted = status === STATUS.COMPLETED;

    const statusOptions = Object.values(STATUS).map((value) => ({
        value,
        label: statusLabels[value] || value,
    }));

    const currentStatus =
        statusOptions.find((option) => option.value === status) ||
        statusOptions[0];

    const getTagStyle = (id) =>
        taskStyles.tag[Number(id)] ||
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

    // Keep status dropdown aligned with its trigger.
    const updateMenuPosition = useCallback(() => {
        const rect = statusButtonRef.current?.getBoundingClientRect();
        if (rect) setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }, []);

    useLayoutEffect(() => {
        if (!isStatusOpen) return;

        updateMenuPosition();
        window.addEventListener("scroll", updateMenuPosition, true);
        window.addEventListener("resize", updateMenuPosition);

        return () => {
            window.removeEventListener("scroll", updateMenuPosition, true);
            window.removeEventListener("resize", updateMenuPosition);
        };
    }, [isStatusOpen, updateMenuPosition]);

    // Close status dropdown when clicking outside.
    useEffect(() => {
        if (!isStatusOpen) return;

        const handleClickOutside = (event) => {
            if (
                statusButtonRef.current?.contains(event.target) ||
                statusMenuRef.current?.contains(event.target)
            ) return;

            setIsStatusOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isStatusOpen]);

    return (
        <div className="group relative grid min-w-0 grid-cols-1 gap-2 px-4 py-3.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40 sm:grid-cols-[minmax(0,2.3fr)_minmax(110px,0.9fr)_minmax(180px,1.2fr)_44px] sm:items-center sm:gap-4 sm:py-4">

            {/* Task */}
            <div className="flex min-w-0 items-start gap-2.5">
                <button
                    type="button"
                    onClick={onToggleComplete}
                    aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition sm:h-4 sm:w-4 ${
                        isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-slate-300 hover:border-green-400 dark:border-slate-600"
                    }`}
                >
                    {isCompleted && <Check size={8} strokeWidth={3} />}
                </button>

                <button type="button" onClick={onView} className="w-full min-w-0 text-left">
                    <h3
                        className={`truncate text-[13px] font-semibold sm:text-sm ${
                            isCompleted
                                ? "text-slate-400 line-through dark:text-slate-500"
                                : "text-slate-800 hover:text-green-600 dark:text-slate-100 dark:hover:text-green-400"
                        }`}
                    >
                        {title}
                    </h3>

                    {description && (
                        <p
                            className={`mt-0.5 truncate text-[11px] sm:text-xs ${
                                isCompleted
                                    ? "text-slate-300 dark:text-slate-600"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                        >
                            {description}
                        </p>
                    )}

                    {/* Priority and tags */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {priority > 0 && (
                            <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] ${
                                    isCompleted
                                        ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                        : taskStyles.priority[priority]
                                }`}
                            >
                                {priorityLabels[priority]}
                            </span>
                        )}

                        {tags.map((tag) => (
                            <span
                                key={tag.tag_id}
                                className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-medium sm:text-[10px] ${
                                    isCompleted
                                        ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                        : getTagStyle(tag.tag_id)
                                }`}
                            >
                                {tag.tag_name}
                            </span>
                        ))}
                    </div>
                </button>
            </div>

            {/* Mobile footer aligns with title/tags; desktop restores columns. */}
            <div className="ml-6 flex min-w-0 items-center gap-2 sm:ml-0 sm:contents">

            {/* Status */}
            <div className="relative min-w-0 shrink-0">
                <button
                    ref={statusButtonRef}
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsStatusOpen((prev) => !prev);
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isStatusOpen}
                    aria-label={`Change status for ${title}`}
                    className={`flex min-w-0 items-center gap-0.5 font-medium transition focus:outline-none ${
                        status === STATUS.COMPLETED
                            ? "text-green-600 dark:text-green-400"
                            : status === STATUS.IN_PROGRESS
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-500 dark:text-slate-400"
                    }`}
                    style={{ fontSize: "12px", lineHeight: "1" }}
                >
                    <span className="truncate">{currentStatus.label}</span>

                    <ChevronDown
                        size={8}
                        strokeWidth={2}
                        className={`transition-transform ${
                            isStatusOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>
                
                    {/* Status dropdown */}
                    {isStatusOpen &&
                        createPortal(
                            <div
                                ref={statusMenuRef}
                                style={{
                                    position: "fixed",
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                }}
                                className="z-[9999] min-w-[110px] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                            >
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onStatusChange(option.value);
                                            setIsStatusOpen(false);
                                        }}
                                        className={`block w-full rounded-md px-2 py-1 text-left font-medium transition ${
                                            option.value === status
                                                ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                        }`}
                                        style={{ fontSize: "12px", lineHeight: "1" }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>,
                            document.body
                        )}
                </div>

                {/* Due date */}
                <div
                    className={`ml-auto flex min-w-0 items-center gap-1 whitespace-nowrap text-[10px] sm:ml-0 sm:gap-1.5 sm:text-xs ${
                        isCompleted
                            ? "text-slate-300 dark:text-slate-600"
                            : "text-slate-500 dark:text-slate-400"
                    }`}
                >
                    <CalendarDays size={12} className="shrink-0 sm:hidden" />
                    <CalendarDays size={13} className="hidden shrink-0 sm:block" />
                    <span className="truncate">
                        {dueDate ? formatDueDate(dueDate) : "No due date"}
                        {dueTime && ` · ${dueTime}`}
                    </span>
                </div>

                {/* Mobile: visible. Desktop: reveal on hover. */}
                <div className="flex shrink-0 items-center justify-end sm:sticky sm:right-4 sm:z-10 sm:bg-gradient-to-l sm:from-white sm:via-white sm:pl-4 sm:opacity-0 sm:pointer-events-none sm:transition-all sm:duration-150 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100 dark:sm:bg-gradient-to-l dark:sm:from-slate-900 dark:sm:via-slate-900">
                    <ActionButtons onEdit={onEdit} onDelete={onDelete} />
                </div>
            </div>
        </div>
    );
}

export default TaskRow;