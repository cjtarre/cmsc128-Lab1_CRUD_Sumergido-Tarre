import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronDown } from "lucide-react";

import ActionButtons from "../crud/ActionButtons";
import taskStyles from "../../styles/taskStyles";
import { formatDueDate } from "../../utils/dateUtils";
import { STATUS, priorityLabels } from "../../constants/taskOptions";

function TaskRow({
    title = "Untitled Task",
    description = "",
    status = STATUS.NOT_STARTED,
    priority = 0,
    dueDate = "",
    dueTime = "",
    tags = [],
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

    const statusOptions = [
        { value: STATUS.NOT_STARTED, label: "Not Started" },
        { value: STATUS.IN_PROGRESS, label: "In Progress" },
        { value: STATUS.COMPLETED, label: "Completed" },
    ];

    const currentStatus =
        statusOptions.find((option) => option.value === status) ||
        statusOptions[0];

    const getTagStyle = (tagId) =>
        taskStyles.tag[Number(tagId)] || "bg-slate-100 text-slate-500";

    useLayoutEffect(() => {
        if (!isStatusOpen) return;

        updateMenuPosition();

        window.addEventListener("scroll", updateMenuPosition, true);
        window.addEventListener("resize", updateMenuPosition);

        return () => {
            window.removeEventListener("scroll", updateMenuPosition, true);
            window.removeEventListener("resize", updateMenuPosition);
        };
    }, [isStatusOpen]);

    useEffect(() => {
        if (!isStatusOpen) return;

        const handleClickOutside = (event) => {
            if (
                statusButtonRef.current?.contains(event.target) ||
                statusMenuRef.current?.contains(event.target)
            ) {
                return;
            }
            setIsStatusOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isStatusOpen]);

    const updateMenuPosition = () => {
        const rect = statusButtonRef.current?.getBoundingClientRect();
        if (rect) {
            setMenuPosition({ top: rect.bottom + 4, left: rect.left });
        }
    };

    return (
        <div className="group relative grid grid-cols-[minmax(0,2.5fr)_1fr_2fr] items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-slate-50/50">
            {/* Task Column */}
            <div className="flex min-w-0 items-start gap-3">
                <button
                    type="button"
                    onClick={onView}
                    className="w-full min-w-0 text-left"
                >
                    {/* Title and Description */}
                    <h3
                        className={`truncate text-sm font-semibold ${
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

                    {/* Metadata Badges Wrapper (Priority and Tag) */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {/* Priority */}
                        <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                isCompleted
                                    ? "bg-slate-100 text-slate-400"
                                    : priority > 0
                                    ? taskStyles.priority[priority]
                                    : "bg-slate-100 text-slate-400"
                            }`}
                        >
                            {priorityLabels[priority] || "None"}
                        </span>

                        {/* Tags */}
                        {tags.length > 0 &&
                            tags.map((t) => (
                                <span
                                    key={t.tag_id}
                                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                        isCompleted
                                            ? "bg-slate-100 text-slate-400"
                                            : getTagStyle(t.tag_id)
                                    }`}
                                >
                                    {t.tag_name}
                                </span>
                            ))
                        }
                    </div>
                </button>
            </div>


            {/* Status */}
            <div className="relative min-w-0">
                <button
                    ref={statusButtonRef}
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsStatusOpen((previous) => !previous);
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isStatusOpen}
                    aria-label={`Change status for ${title}`}
                    className={`flex w-full min-w-0 items-center gap-0.5 font-medium transition focus:outline-none ${
                        status === STATUS.COMPLETED
                            ? "text-green-600"
                            : status === STATUS.IN_PROGRESS
                            ? "text-amber-600"
                            : "text-slate-500"
                    }`}
                    style={{ fontSize: "12px", lineHeight: "1" }}
                >
                    <span className="truncate text-left">{currentStatus.label}</span>
                    <ChevronDown
                        size={8}
                        strokeWidth={2}
                        className={`transition-transform duration-200 ${
                            isStatusOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {isStatusOpen &&
                    createPortal(
                        <div
                            ref={statusMenuRef}
                            style={{
                                position: "fixed",
                                top: menuPosition.top,
                                left: menuPosition.left,
                            }}
                            className="z-[9999] min-w-[110px] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
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
                                            ? "bg-green-50 text-green-600"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
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
            
            {/* Due Date */}
            <div
                className={`flex min-w-0 items-start gap-1.5 text-xs ${
                    isCompleted ? "text-slate-300" : "text-slate-400"
                }`}
            >
                <CalendarDays size={14} className="mt-0.5 shrink-0" />

                <div className="min-w-0 truncate">
                    {dueDate ? formatDueDate(dueDate) : "No due date"}
                    {dueTime && ` - ${dueTime}`}
                </div>
            </div>

            {/* Actions */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 bg-gradient-to-l from-white via-white pl-4">                <ActionButtons
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
}

export default TaskRow;