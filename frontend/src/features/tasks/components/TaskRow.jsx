import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronDown, UserRound } from "lucide-react";

import ActionButtons from "./ActionButtons";
import taskStyles from "../styles/taskStyles";
import { formatDueDate } from "../../../shared/utils/dateUtils";
import { STATUS, PRIORITY, priorityLabels, statusLabels } from "../constants/taskOptions";

function TaskRow({
    title = "Untitled Task",
    description = "",
    status = STATUS.NOT_STARTED,
    priority = PRIORITY.NONE,
    dueDate = "",
    dueTime = "",
    tags = [],
    assignee = null,
    collaborative = false,
    highlighted = false,
    onToggleComplete,
    onStatusChange,
    onEdit,
    onDelete,
    onView,
}) {
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [showHighlight, setShowHighlight] = useState(false);

    const rowRef = useRef(null);
    const statusButtonRef = useRef(null);
    const statusMenuRef = useRef(null);

    const isCompleted = status === STATUS.COMPLETED;
    const statusOptions = Object.values(STATUS).map((value) => ({ value, label: statusLabels[value] || value }));
    const currentStatus = statusOptions.find((option) => option.value === status) || statusOptions[0];
    const getTagStyle = (id) => taskStyles.tag[Number(id)] || "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

    const assigneeName = assignee?.display_name || assignee?.username || "Unassigned";

    const assigneeInitials = assignee
        ? assigneeName
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : null;

    const updateMenuPosition = useCallback(() => {
        const rect = statusButtonRef.current?.getBoundingClientRect();
        if (rect) setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }, []);

    // Notification target: scroll to task, highlight for 5 seconds, then fade.
    useEffect(() => {
        if (!highlighted || !rowRef.current) return;

        setShowHighlight(true);
        rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

        const timer = setTimeout(() => setShowHighlight(false), 5000);
        return () => clearTimeout(timer);
    }, [highlighted]);

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

    useEffect(() => {
        if (!isStatusOpen) return;

        const handleClickOutside = (event) => {
            if (statusButtonRef.current?.contains(event.target) || statusMenuRef.current?.contains(event.target)) return;
            setIsStatusOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isStatusOpen]);

    const gridColumns = collaborative
        ? "sm:grid-cols-[minmax(180px,2fr)_minmax(100px,0.9fr)_minmax(95px,0.8fr)_minmax(75px,0.65fr)_minmax(135px,1.05fr)_minmax(110px,1fr)_44px]"
        : "sm:grid-cols-[minmax(0,2.3fr)_minmax(110px,0.9fr)_minmax(180px,1.2fr)_44px]";

    return (
        <div
            ref={rowRef}
            className={`group relative grid min-w-0 grid-cols-1 gap-2 px-4 py-3.5 transition-all duration-300 sm:items-center sm:gap-3 sm:py-4 ${gridColumns} ${
                showHighlight
                    ? "bg-green-50/80 shadow-[inset_3px_0_0_rgb(34,197,94)] dark:bg-green-950/25"
                    : "hover:bg-green-50/25 dark:hover:bg-white/[0.025]"
            }`}
        >
            {/* Task */}
            <div className="flex min-w-0 items-start gap-2.5">
                <button
                    type="button"
                    onClick={onToggleComplete}
                    disabled={!onToggleComplete}
                    aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition sm:h-4 sm:w-4 ${
                        isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-slate-300 bg-white/30 hover:border-green-400 dark:border-slate-600 dark:bg-transparent"
                    } ${!onToggleComplete ? "cursor-default" : ""}`}
                >
                    {isCompleted && <Check size={8} strokeWidth={3} />}
                </button>

                <button type="button" onClick={onView} className="w-full min-w-0 text-left">
                    <h3
                        className={`truncate ${
                            collaborative
                                ? "text-xs font-medium"
                                : "text-[13px] font-medium"
                        } ${
                            isCompleted
                                ? "text-slate-400 line-through dark:text-slate-500"
                                : "text-slate-700 hover:text-green-600 dark:text-slate-200 dark:hover:text-green-400"
                        }`}
                    >
                        {title}
                    </h3>

                    {description && (
                        <p
                            className={`mt-0.5 truncate ${
                                collaborative ? "text-[10px]" : "text-[11px] sm:text-xs"
                            } ${
                                isCompleted
                                    ? "text-slate-300 dark:text-slate-600"
                                    : "text-slate-400 dark:text-slate-500"
                            }`}
                        >
                            {description}
                        </p>
                    )}

                    {!collaborative && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {priority && priority !== PRIORITY.NONE && (
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] ${isCompleted ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" : taskStyles.priority[priority]}`}>
                                    {priorityLabels[priority]}
                                </span>
                            )}

                            {tags.map((tag) => (
                                <span key={tag.tag_id} className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-medium sm:text-[10px] ${isCompleted ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" : getTagStyle(tag.tag_id)}`}>
                                    {tag.tag_name}
                                </span>
                            ))}
                        </div>
                    )}
                </button>
            </div>

            {/* Mobile details */}
            <div className="ml-6 flex flex-wrap items-center gap-2 sm:hidden">
                {collaborative && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <UserRound size={10} />
                        {assigneeName}
                    </span>
                )}

                {priority && priority !== PRIORITY.NONE && (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                        isCompleted
                            ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            : taskStyles.priority[priority]
                    }`}>
                        {priorityLabels[priority]}
                    </span>
                )}

                {tags.map((tag) => (
                    <span key={tag.tag_id} className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                        isCompleted
                            ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            : getTagStyle(tag.tag_id)
                    }`}>
                        {tag.tag_name}
                    </span>
                ))}
            </div>

            {/* Assignee */}
            {collaborative && (
                <div className="hidden min-w-0 items-center sm:flex">
                    {assignee ? (
                        <div
                            title={assigneeName}
                            aria-label={`Assigned to ${assigneeName}`}
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold transition ${
                                isCompleted
                                    ? "border-slate-200/70 bg-slate-100 text-slate-400 dark:border-white/[0.06] dark:bg-slate-800 dark:text-slate-500"
                                    : "border-green-100 bg-green-50 text-green-600 hover:border-green-200 hover:bg-green-100/70 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-400 dark:hover:bg-green-950/60"
                            }`}
                        >
                            {assigneeInitials}
                        </div>
                    ) : (
                        <div
                            title="Unassigned"
                            aria-label="Unassigned"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-200 bg-white/30 text-[10px] font-medium text-slate-300 dark:border-slate-700 dark:bg-white/[0.02] dark:text-slate-600"
                        >
                            —
                        </div>
                    )}
                </div>
            )}

            {/* Status */}
            <div className="relative hidden min-w-0 sm:block">
                <button
                    ref={statusButtonRef}
                    type="button"
                    disabled={!onStatusChange}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (onStatusChange) setIsStatusOpen((prev) => !prev);
                    }}
                    aria-haspopup={onStatusChange ? "listbox" : undefined}
                    aria-expanded={onStatusChange ? isStatusOpen : undefined}
                    aria-label={onStatusChange ? `Change status for ${title}` : undefined}
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

                    {onStatusChange && (
                        <ChevronDown
                            size={8}
                            strokeWidth={2}
                            className={`transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                        />
                    )}
                </button>

                {isStatusOpen && onStatusChange &&
                    createPortal(
                        <div
                            ref={statusMenuRef}
                            style={{
                                position: "fixed",
                                top: menuPosition.top,
                                left: menuPosition.left,
                            }}
                            className="z-[9999] min-w-[110px] overflow-hidden rounded-lg border border-white/70 bg-white/90 p-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
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
                                            ? "bg-green-50/80 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                                            : "text-slate-500 hover:bg-green-50/50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-200"
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

            {/* Priority */}
            {collaborative && (
                <div className="hidden sm:block">
                    {priority && priority !== PRIORITY.NONE ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            isCompleted
                                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                : taskStyles.priority[priority]
                        }`}>
                            {priorityLabels[priority]}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                    )}
                </div>
            )}

            {/* Due date */}
            <div className={`hidden min-w-0 items-center gap-1.5 whitespace-nowrap text-xs sm:flex ${
                isCompleted
                    ? "text-slate-300 dark:text-slate-600"
                    : "text-slate-500 dark:text-slate-400"
            }`}>
                <CalendarDays size={13} className="shrink-0" />

                <span className="truncate">
                    {dueDate ? formatDueDate(dueDate) : "No due date"}
                    {dueTime && ` · ${dueTime}`}
                </span>
            </div>

            {/* Tags */}
            {collaborative && (
                <div className="hidden min-w-0 flex-wrap gap-1 sm:flex">
                    {tags.length ? (
                        tags.map((tag) => (
                            <span
                                key={tag.tag_id}
                                className={`max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    isCompleted
                                        ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                        : getTagStyle(tag.tag_id)
                                }`}
                            >
                                {tag.tag_name}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                    )}
                </div>
            )}

            {/* Mobile status / due date / actions */}
            <div className="ml-6 flex min-w-0 items-center gap-2 sm:hidden">
                <div className="relative min-w-0 shrink-0">
                    <button
                        ref={statusButtonRef}
                        type="button"
                        disabled={!onStatusChange}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (onStatusChange) setIsStatusOpen((prev) => !prev);
                        }}
                        className={`flex items-center gap-0.5 font-medium ${
                            status === STATUS.COMPLETED
                                ? "text-green-600 dark:text-green-400"
                                : status === STATUS.IN_PROGRESS
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-slate-500 dark:text-slate-400"
                        }`}
                        style={{ fontSize: "12px", lineHeight: "1" }}
                    >
                        <span className="truncate">{currentStatus.label}</span>

                        {onStatusChange && (
                            <ChevronDown
                                size={8}
                                strokeWidth={2}
                                className={`transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                            />
                        )}
                    </button>

                    {isStatusOpen && onStatusChange &&
                        createPortal(
                            <div
                                ref={statusMenuRef}
                                style={{
                                    position: "fixed",
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                }}
                                className="z-[9999] min-w-[110px] overflow-hidden rounded-lg border border-white/70 bg-white/90 p-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
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
                                                ? "bg-green-50/80 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                                                : "text-slate-500 hover:bg-green-50/50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-200"
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

                <div className={`ml-auto flex min-w-0 items-center gap-1 whitespace-nowrap text-[10px] ${
                    isCompleted
                        ? "text-slate-300 dark:text-slate-600"
                        : "text-slate-500 dark:text-slate-400"
                }`}>
                    <CalendarDays size={11} />

                    <span className="truncate">
                        {dueDate ? formatDueDate(dueDate) : "No due date"}
                        {dueTime && ` · ${dueTime}`}
                    </span>
                </div>

                {(onEdit || onDelete) && (
                    <div className="flex shrink-0 items-center justify-end">
                        <ActionButtons onEdit={onEdit} onDelete={onDelete} />
                    </div>
                )}
            </div>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center justify-end sm:flex sm:sticky sm:right-4 sm:z-10 sm:bg-gradient-to-l sm:from-white/95 sm:via-white/90 sm:to-transparent sm:pl-4 sm:opacity-0 sm:pointer-events-none sm:transition-all sm:duration-150 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100 dark:sm:from-slate-900/95 dark:sm:via-slate-900/90">
                {(onEdit || onDelete) && (
                    <ActionButtons onEdit={onEdit} onDelete={onDelete} />
                )}
            </div>
        </div>
    );
}

export default TaskRow;