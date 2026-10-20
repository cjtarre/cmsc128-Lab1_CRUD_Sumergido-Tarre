import { useMemo, useState } from "react";
import { CalendarDays, GripVertical, Search, User } from "lucide-react";
import { toast } from "sonner";

import { STATUS } from "../../tasks/constants/taskOptions";
import useTasks from "../../tasks/hooks/useTasks";

const columns = [
    { id: STATUS.NOT_STARTED, label: "To Do" },
    { id: STATUS.IN_PROGRESS, label: "In Progress" },
    { id: STATUS.COMPLETED, label: "Done" },
];

const getAssigneeName = (task) =>
    task.assignee?.display_name ||
    task.assignee?.username ||
    task.assigneeName ||
    task.assignee_name ||
    "Unassigned";

function ProjectBoard({ projectId, tasks, setTasks, canEdit }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverStatus, setDragOverStatus] = useState(null);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    const taskActions = useTasks(tasks, setTasks, projectId);

    const filteredTasks = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return tasks;

        return tasks.filter(
            (task) =>
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query)
        );
    }, [tasks, searchTerm]);

    const handleStatusChange = async (taskId, status) => {
        if (!canEdit || updatingTaskId === taskId) return;

        const task = tasks.find((item) => item.id === taskId);
        if (!task || task.status === status) return;

        try {
            setUpdatingTaskId(taskId);
            await taskActions.updateTaskStatus(taskId, status);
            toast.success("Task status updated.");
        } catch (error) {
            console.error("Error updating task status:", error);
            toast.error(error.response?.data?.error || "Unable to update task.");
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const handleDragStart = (event, task) => {
        if (!canEdit) return;

        setDraggedTaskId(task.id);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
    };

    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverStatus(null);
    };

    const handleDragOver = (event, status) => {
        if (!canEdit) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOverStatus(status);
    };

    const handleDragLeave = (event, status) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        if (dragOverStatus === status) setDragOverStatus(null);
    };

    const handleDrop = async (event, status) => {
        if (!canEdit) return;

        event.preventDefault();

        const rawTaskId =
            event.dataTransfer.getData("text/plain") || draggedTaskId;

        const task = tasks.find(
            (item) => String(item.id) === String(rawTaskId)
        );

        setDraggedTaskId(null);
        setDragOverStatus(null);

        if (!task || task.status === status) return;

        await handleStatusChange(task.id, status);
    };

    return (
        <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                        Board
                    </h2>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {canEdit
                            ? "Drag tasks between columns to update their status."
                            : "Track project work across each stage."}
                    </p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search tasks..."
                        className="h-10 w-full rounded-xl border border-white/70 bg-white/50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-green-200 focus:bg-white/70 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200 dark:focus:border-green-800 dark:focus:ring-green-900/30"
                    />
                </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {columns.map((column) => {
                    const columnTasks = filteredTasks.filter(
                        (task) => task.status === column.id
                    );

                    const isDragOver =
                        canEdit &&
                        draggedTaskId !== null &&
                        dragOverStatus === column.id;

                    return (
                        <section
                            key={column.id}
                            onDragOver={(event) =>
                                handleDragOver(event, column.id)
                            }
                            onDragLeave={(event) =>
                                handleDragLeave(event, column.id)
                            }
                            onDrop={(event) =>
                                handleDrop(event, column.id)
                            }
                            className={`flex min-h-[390px] flex-col rounded-2xl border p-3 backdrop-blur-xl transition ${
                                isDragOver
                                    ? "border-green-300 bg-green-50/55 ring-2 ring-green-200/60 dark:border-green-700 dark:bg-green-950/20 dark:ring-green-900/40"
                                    : "border-white/65 bg-white/30 dark:border-white/[0.08] dark:bg-white/[0.015]"
                            }`}
                        >
                            <header className="mb-3 flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            column.id === STATUS.COMPLETED
                                                ? "bg-green-500"
                                                : column.id === STATUS.IN_PROGRESS
                                                  ? "bg-sky-400"
                                                  : "bg-slate-300 dark:bg-slate-600"
                                        }`}
                                    />

                                    <h3 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                        {column.label}
                                    </h3>

                                    <span className="text-[9px] text-slate-400">
                                        {columnTasks.length}
                                    </span>
                                </div>
                            </header>

                            <div className="space-y-2.5">
                                {columnTasks.map((task) => {
                                    const isDragging =
                                        String(draggedTaskId) === String(task.id);

                                    const assigneeName = getAssigneeName(task);

                                    return (
                                        <article
                                            key={task.id}
                                            draggable={
                                                canEdit &&
                                                updatingTaskId !== task.id
                                            }
                                            onDragStart={(event) =>
                                                handleDragStart(event, task)
                                            }
                                            onDragEnd={handleDragEnd}
                                            className={`rounded-xl border border-white/80 bg-white/75 p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.035)] transition dark:border-white/10 dark:bg-slate-900/65 ${
                                                canEdit
                                                    ? "cursor-grab active:cursor-grabbing"
                                                    : ""
                                            } ${
                                                isDragging
                                                    ? "scale-[0.98] opacity-40"
                                                    : "hover:bg-white/90"
                                            } ${
                                                updatingTaskId === task.id
                                                    ? "pointer-events-none opacity-60"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-start gap-1.5">
                                                    {canEdit && (
                                                        <GripVertical
                                                            size={13}
                                                            className="mt-1 shrink-0 text-slate-300 dark:text-slate-600"
                                                        />
                                                    )}

                                                    <h4 className="min-w-0 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">
                                                        {task.title}
                                                    </h4>
                                                </div>

                                                {task.priority &&
                                                    task.priority !== "none" && (
                                                        <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                                                            {task.priority}
                                                        </span>
                                                    )}
                                            </div>

                                            {task.description && (
                                                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                                <span
                                                    className={`inline-flex min-w-0 items-center gap-1 text-[9px] ${
                                                        assigneeName === "Unassigned"
                                                            ? "text-slate-400 dark:text-slate-500"
                                                            : "font-medium text-slate-500 dark:text-slate-400"
                                                    }`}
                                                    title={assigneeName}
                                                >
                                                    <User size={10} />
                                                    <span className="max-w-[110px] truncate">
                                                        {assigneeName}
                                                    </span>
                                                </span>

                                                {task.dueDate && (
                                                    <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500">
                                                        <CalendarDays size={10} />
                                                        {task.dueDate}
                                                    </span>
                                                )}

                                                {(task.tags || [])
                                                    .slice(0, 2)
                                                    .map((tag) => (
                                                        <span
                                                            key={tag.tag_id}
                                                            className="rounded-md bg-green-50 px-1.5 py-0.5 text-[8px] font-medium text-green-600 dark:bg-green-950/30 dark:text-green-400"
                                                        >
                                                            {tag.tag_name}
                                                        </span>
                                                    ))}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {!columnTasks.length && (
                                <div
                                    className={`flex flex-1 items-center justify-center rounded-xl py-10 transition ${
                                        isDragOver
                                            ? "border border-dashed border-green-300 bg-green-50/30 dark:border-green-800 dark:bg-green-950/10"
                                            : ""
                                    }`}
                                >
                                    <p
                                        className={`text-[9px] ${
                                            isDragOver
                                                ? "font-medium text-green-500 dark:text-green-400"
                                                : "text-slate-400 dark:text-slate-600"
                                        }`}
                                    >
                                        {isDragOver
                                            ? `Move to ${column.label}`
                                            : "No tasks"}
                                    </p>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </section>
    );
}

export default ProjectBoard;