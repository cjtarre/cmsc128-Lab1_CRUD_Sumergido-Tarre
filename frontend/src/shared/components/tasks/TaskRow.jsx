import { useState } from "react";
import {
    CalendarDays,
    Check,
    ChevronDown,
} from "lucide-react";

import ActionButtons from "../crud/ActionButtons";
import taskStyles from "../../styles/taskStyles";
import { formatDueDate } from "../../utils/dateUtils";

import {
    STATUS,
    priorityLabels,
    tagLabels,
} from "../../constants/taskOptions";

function TaskRow({
    title = "Untitled Task",
    description = "",
    status = STATUS.NOT_STARTED,
    priority = 0,
    dueDate = "",
    dueTime = "",
    tag = 0,
    onToggleComplete,
    onStatusChange,
    onEdit,
    onDelete,
    onView,
}) {
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const isCompleted =
        status === STATUS.COMPLETED;

    const statusOptions = [
        {
            value: STATUS.NOT_STARTED,
            label: "Not Started",
        },
        {
            value: STATUS.IN_PROGRESS,
            label: "In Progress",
        },
        {
            value: STATUS.COMPLETED,
            label: "Completed",
        },
    ];

    const currentStatus =
        statusOptions.find(
            (option) => option.value === status
        ) || statusOptions[0];

    const handleStatusChange = (newStatus) => {
        onStatusChange(newStatus);
        setIsStatusOpen(false);
    };

    return (
        <div className="grid grid-cols-[minmax(0,2.3fr)_1.3fr_0.8fr_1fr_0.8fr_0.8fr] items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-slate-50/50">

            {/* Task */}
            <div className="flex min-w-0 items-start gap-3">
                <button
                    type="button"
                    onClick={onToggleComplete}
                    aria-label={
                        isCompleted
                            ? "Mark task as not completed"
                            : "Mark task as completed"
                    }
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition duration-200 ${
                        isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-slate-300 text-transparent hover:border-green-400 hover:bg-green-50"
                    }`}
                >
                    {isCompleted && (
                        <Check size={13} />
                    )}
                </button>

                <button
                    type="button"
                    onClick={onView}
                    className="min-w-0 text-left"
                >
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

                <div className="min-w-0 truncate">
                    {dueDate
                        ? formatDueDate(dueDate)
                        : "No due date"}

                    {dueTime && ` - ${dueTime}`}
                </div>
            </div>

            {/* Priority */}
            <div>
                {priority > 0 ? (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            isCompleted
                                ? "bg-slate-100 text-slate-400"
                                :priority > 0
                                ? taskStyles.priority[priority]
                                : "bg-slate-100 text-slate-400"
                        }`}
                    >
                        {priorityLabels[priority] || "None"}
                    </span>
                ) : (
                    <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-400">
                        None
                    </span>
                )}
            </div>

            {/* Status */}
            <div className="relative">
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsStatusOpen(
                            (previous) => !previous
                        );
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isStatusOpen}
                    aria-label={`Change status for ${title}`}
                    className={`flex items-center gap-0.5 font-medium transition focus:outline-none ${
                        status === STATUS.COMPLETED
                            ? "text-green-600"
                            : status === STATUS.IN_PROGRESS
                            ? "text-amber-600"
                            : "text-slate-500"
                    }`}
                    style={{ fontSize: "12px", lineHeight: "1" }}
                >
                    <span>{currentStatus.label}</span>

                    <ChevronDown
                        size={8}
                        strokeWidth={2}
                        className={`transition-transform duration-200 ${
                            isStatusOpen
                                ? "rotate-180"
                                : ""
                        }`}
                    />
                </button>

                {isStatusOpen && (
                    <div
                        role="listbox"
                        className="absolute left-0 top-full z-50 mt-1 min-w-[110px] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                    >
                        {statusOptions.map((option) => {
                            const isSelected =
                                option.value === status;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleStatusChange(
                                            option.value
                                        );
                                    }}
                                    className={`block w-full rounded-md px-2 py-1 text-left font-medium transition ${
                                        isSelected
                                            ? "bg-green-50 text-green-600"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                    }`}
                                    style={{ fontSize: "12px", lineHeight: "1" }}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tag */}
            <div>
                <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                        taskStyles.tag[tag] ||
                        "bg-slate-100 text-slate-500"
                    }`}
                >
                    {tagLabels[tag] || "Others"}
                </span>
            </div>

            {/* Actions */}
            <ActionButtons
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}

export default TaskRow;