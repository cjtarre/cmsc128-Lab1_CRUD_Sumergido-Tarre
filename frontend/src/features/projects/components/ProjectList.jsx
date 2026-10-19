import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Search, X } from "lucide-react";

import useTasks from "../../tasks/hooks/useTasks";
import { createTaskHandlers } from "../../tasks/handlers/taskHandlers";
import { sortTasksByDueDateColumn, sortTasksByTaskColumn, DUEDATE_SORT_MODES, DUEDATE_SORT_CYCLE, TASK_SORT_CYCLE, getNextSort } from "../../tasks/utils/taskUtils";
import { projectService } from "../services/projectService";

import TaskTable from "../../tasks/components/TaskTable";
import TaskDetails from "../../tasks/components/TaskDetails";
import AddTask from "../../tasks/components/AddTask";
import EditTask from "../../tasks/components/EditTask";
import DeleteTask from "../../tasks/components/DeleteTask";

const STATUS_OPTIONS = [
    { value: "", label: "Status" },
    { value: "not_started", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Done" },
];

const PRIORITY_OPTIONS = [
    { value: "", label: "Priority" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
    { value: "none", label: "None" },
];

const selectClass = "h-9 w-full appearance-none rounded-xl border border-white/80 bg-white/55 py-0 pl-3 pr-8 font-medium text-slate-500 outline-none transition hover:bg-white/75 focus:border-green-200 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:focus:border-green-800 dark:focus:ring-green-900/30";

function FilterSelect({ value, onChange, children, className = "" }) {
    return (
        <div className={`relative shrink-0 ${className}`}>
            <select
                value={value}
                onChange={onChange}
                className={selectClass}
                style={{ fontSize: "12px", lineHeight: "1" }}
            >
                {children}
            </select>

            <ChevronDown
                size={12}
                strokeWidth={2}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
        </div>
    );
}

function ProjectList({ projectId, tasks, setTasks, canEdit }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [members, setMembers] = useState([]);

    const [assigneeFilter, setAssigneeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [tagFilter, setTagFilter] = useState("");

    const [activeSort, setActiveSort] = useState({
        column: "dueDate",
        mode: DUEDATE_SORT_MODES.DUE_ASC,
    });

    useEffect(() => {
        let active = true;

        const loadMembers = async () => {
            try {
                const data = await projectService.getMembers(projectId);
                if (active) setMembers(data || []);
            } catch (error) {
                console.error("Error fetching project members:", error);
                if (active) setMembers([]);
            }
        };

        loadMembers();

        return () => {
            active = false;
        };
    }, [projectId]);

    const taskActions = useTasks(tasks, setTasks, projectId);
    const handlers = createTaskHandlers({
        ...taskActions,
        setSelectedTask,
        setTaskToEdit,
        setTaskToDelete,
        setIsAddTaskOpen,
    });

    const handleSortTask = () => setActiveSort((previous) => getNextSort(previous, "task", TASK_SORT_CYCLE));
    const handleSortDueDate = () => setActiveSort((previous) => getNextSort(previous, "dueDate", DUEDATE_SORT_CYCLE));

    const tags = useMemo(() => {
        const map = new Map();

        tasks.forEach((task) => {
            (task.tags || []).forEach((tag) => {
                const id = typeof tag === "object" ? tag.tag_id : tag;
                const name = typeof tag === "object" ? tag.tag_name || tag.name : String(tag);
                if (id != null) map.set(String(id), name);
            });
        });

        return [...map.entries()].map(([id, name]) => ({ id, name }));
    }, [tasks]);

    const displayedTasks = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        const filtered = tasks.filter((task) => {
            const matchesSearch =
                !query ||
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query);

            const matchesAssignee =
                !assigneeFilter ||
                (assigneeFilter === "unassigned"
                    ? !task.assigneeId
                    : String(task.assigneeId) === assigneeFilter);

            const matchesStatus = !statusFilter || task.status === statusFilter;
            const matchesPriority = !priorityFilter || task.priority === priorityFilter;

            const matchesTag =
                !tagFilter ||
                (task.tags || []).some(
                    (tag) => String(typeof tag === "object" ? tag.tag_id : tag) === tagFilter
                );

            return matchesSearch && matchesAssignee && matchesStatus && matchesPriority && matchesTag;
        });

        return activeSort.column === "task"
            ? sortTasksByTaskColumn(filtered, activeSort.mode)
            : sortTasksByDueDateColumn(filtered, activeSort.mode);
    }, [tasks, searchTerm, assigneeFilter, statusFilter, priorityFilter, tagFilter, activeSort]);

    const hasFilters = searchTerm || assigneeFilter || statusFilter || priorityFilter || tagFilter;

    const clearFilters = () => {
        setSearchTerm("");
        setAssigneeFilter("");
        setStatusFilter("");
        setPriorityFilter("");
        setTagFilter("");
    };

    return (
        <>
            <section className="rounded-3xl border border-white/55 bg-white/20 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.025)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-900/20 sm:p-5">
                <div>
                    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                        List
                    </h2>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Manage and review all tasks shared in this project.
                    </p>
                </div>

                {/* Toolbar */}
                <div className="mt-4 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">

                        {/* Search */}
                        <div className="relative min-w-[200px] flex-1 lg:max-w-[350px]">
                            <Search
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search tasks..."
                                className="h-9 w-full rounded-xl border border-white/80 bg-white/55 py-0 pl-9 pr-8 text-slate-700 outline-none transition placeholder:text-slate-400 hover:bg-white/75 focus:border-green-200 focus:ring-2 focus:ring-green-100/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:focus:border-green-800 dark:focus:ring-green-900/30"
                                style={{ fontSize: "12px", lineHeight: "1" }}
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    aria-label="Clear search"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Assignee */}
                        <FilterSelect
                            value={assigneeFilter}
                            onChange={(event) => setAssigneeFilter(event.target.value)}
                            className="w-[120px]"
                        >
                            <option value="">Assignee</option>
                            <option value="unassigned">Unassigned</option>

                            {members.map((member) => (
                                <option key={member.user_id} value={member.user_id}>
                                    {member.display_name || member.username || "Member"}
                                </option>
                            ))}
                        </FilterSelect>

                        {/* Status */}
                        <FilterSelect
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-[110px]"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value || "all"} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>

                        {/* Priority */}
                        <FilterSelect
                            value={priorityFilter}
                            onChange={(event) => setPriorityFilter(event.target.value)}
                            className="w-[105px]"
                        >
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option.value || "all"} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>

                        {/* Tag */}
                        <FilterSelect
                            value={tagFilter}
                            onChange={(event) => setTagFilter(event.target.value)}
                            className="w-[100px]"
                        >
                            <option value="">Tag</option>

                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.name}
                                </option>
                            ))}
                        </FilterSelect>

                        {/* Clear filters */}
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="h-9 rounded-xl px-2.5 font-medium text-slate-400 transition hover:bg-white/50 hover:text-slate-600 dark:hover:bg-white/[0.04] dark:hover:text-slate-300"
                                style={{ fontSize: "11px", lineHeight: "1" }}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Add Task */}
                    {canEdit && (
                        <button
                            type="button"
                            onClick={handlers.handleOpenAddTask}
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3.5 font-semibold text-white shadow-[0_5px_15px_rgba(34,197,94,0.16)] transition hover:bg-green-600"
                            style={{ fontSize: "12px", lineHeight: "1" }}
                        >
                            <Plus size={14} />
                            Add Task
                        </button>
                    )}
                </div>

                {/* Task Table */}
                <div className="mt-3">
                    {displayedTasks.length ? (
                        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-[0_6px_22px_rgba(15,23,42,0.035)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
                            <TaskTable
                                tasks={displayedTasks}
                                scrollable
                                collaborative
                                activeSort={activeSort}
                                onSortTask={handleSortTask}
                                onSortDueDate={handleSortDueDate}
                                onToggleComplete={canEdit ? handlers.handleToggleComplete : undefined}
                                onStatusChange={canEdit ? handlers.handleStatusChange : undefined}
                                onEdit={canEdit ? handlers.handleEditTask : undefined}
                                onDelete={canEdit ? handlers.handleDeleteTask : undefined}
                                onView={handlers.handleViewTask}
                            />
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/70 bg-white/30 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {hasFilters ? "No matching tasks" : "No tasks in this project yet"}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                                {hasFilters
                                    ? "Try changing or clearing your filters."
                                    : "Project tasks will appear here."}
                            </p>

                            {hasFilters ? (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-2 text-[11px] font-semibold text-green-600 dark:text-green-400"
                                >
                                    Clear filters
                                </button>
                            ) : (
                                canEdit && (
                                    <button
                                        type="button"
                                        onClick={handlers.handleOpenAddTask}
                                        className="mt-2 text-[11px] font-semibold text-green-600 dark:text-green-400"
                                    >
                                        Add the first task
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-2.5 flex justify-end">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {displayedTasks.length} {displayedTasks.length === 1 ? "task" : "tasks"}
                    </span>
                </div>
            </section>

            {selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    onClose={handlers.handleCloseTaskDetails}
                    onEdit={canEdit ? () => handlers.handleEditTask(selectedTask.id) : undefined}
                    onDelete={canEdit ? () => handlers.handleDeleteTask(selectedTask.id) : undefined}
                    collaborative
                />
            )}

            {canEdit && (
                <>
                    <AddTask
                        isOpen={isAddTaskOpen}
                        onClose={handlers.handleCloseAddTask}
                        onSubmit={handlers.handleAddTaskSubmit}
                        collaborative
                        members={members}
                    />

                    <EditTask
                        task={taskToEdit}
                        isOpen={Boolean(taskToEdit)}
                        onClose={handlers.handleCloseEditTask}
                        onSave={handlers.handleUpdateTask}
                        collaborative
                        members={members}
                    />

                    <DeleteTask
                        task={taskToDelete}
                        onConfirm={() => handlers.handleConfirmDelete(taskToDelete)}
                        onCancel={handlers.handleCancelDelete}
                    />
                </>
            )}
        </>
    );
}

export default ProjectList;