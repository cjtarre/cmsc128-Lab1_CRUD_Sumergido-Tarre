import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import useTasks from "../hooks/useTasks";
import { useTaskData } from "../context/TaskContext";
import { createTaskHandlers } from "../handlers/taskHandlers";
import emptyState from "../../../shared/constants/emptyState";
import { filterTasks } from "../utils/taskFilters";
import { sortTasksByTaskColumn, sortTasksByDueDateColumn, DUEDATE_SORT_MODES, TASK_SORT_CYCLE, DUEDATE_SORT_CYCLE, getNextSort } from "../utils/taskUtils";

import Pagination from "../../../shared/components/common/Pagination";
import EmptyState from "../../../shared/components/common/EmptyState";
import EncouragementCard from "../../../shared/components/common/EncouragementCard";
import TaskFilter from "../components/filters/TaskFilter";
import TaskFilterPanel from "../components/filters/TaskFilterPanel";
import TaskTable from "../components/table/TaskTable";
import TaskDetails from "../components/table/TaskDetails";
import CalendarWidget from "../../calendar/components/CalendarWidget";
import AddTask from "../components/forms/AddTask";
import EditTask from "../components/forms/EditTask";
import DeleteTask from "../components/forms/DeleteTask";

function MyTasks() {
    const { tasks, setTasks, searchTerm, loading } = useTaskData();
    const [searchParams] = useSearchParams();
    const highlightedTaskId = searchParams.get("task");

    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [activeSort, setActiveSort] = useState({ column: "dueDate", mode: DUEDATE_SORT_MODES.DUE_ASC });
    const [priorityFilter, setPriorityFilter] = useState([]);
    const [statusFilter, setStatusFilter] = useState([]);
    const [tagFilter, setTagFilter] = useState([]);

    const tasksPerPage = 5;
    const currentEmptyState = emptyState[filter];
    const taskActions = useTasks(tasks, setTasks);
    const handlers = createTaskHandlers({ ...taskActions, setSelectedTask, setTaskToEdit, setTaskToDelete, setIsAddTaskOpen });

    const handleSortTask = () => setActiveSort((previous) => getNextSort(previous, "task", TASK_SORT_CYCLE));
    const handleSortDueDate = () => setActiveSort((previous) => getNextSort(previous, "dueDate", DUEDATE_SORT_CYCLE));

    const filteredTasks = filterTasks(tasks, filter, searchTerm, priorityFilter, statusFilter, tagFilter);
    const sortedTasks = activeSort.column === "task" ? sortTasksByTaskColumn(filteredTasks, activeSort.mode) : sortTasksByDueDateColumn(filteredTasks, activeSort.mode);
    const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);
    const displayedTasks = filter === "all" ? sortedTasks : sortedTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [filter, searchTerm, activeSort, priorityFilter, statusFilter, tagFilter]);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    useEffect(() => {
        if (!highlightedTaskId) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilter("all");
        setPriorityFilter([]);
        setStatusFilter([]);
        setTagFilter([]);
    }, [highlightedTaskId]);

    return (
        <div className="space-y-5 pb-2">
            <header className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold leading-tight tracking-tight text-slate-800 dark:text-white sm:text-2xl">My Tasks</h1>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">Manage and organize your tasks.</p>
                </div>

                <button type="button" onClick={handlers.handleOpenAddTask} aria-label="Add task" className="group inline-flex h-9 w-9 shrink-0 items-center justify-start overflow-hidden rounded-full bg-green-500 px-2.5 text-white shadow-[0_6px_18px_rgba(34,197,94,0.2)] transition-all duration-200 hover:w-24 hover:bg-green-600 focus:w-24 focus:outline-none focus:ring-2 focus:ring-green-300/60 xl:hidden">
                    <Plus size={17} className="shrink-0" />
                    <span className="ml-1.5 whitespace-nowrap text-xs font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100">Add Task</span>
                </button>

                <button type="button" onClick={handlers.handleOpenAddTask} className="hidden shrink-0 items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(34,197,94,0.22)] transition-all hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-[0_10px_28px_rgba(34,197,94,0.28)] focus:outline-none focus:ring-2 focus:ring-green-300/60 dark:hover:bg-green-400 xl:inline-flex">
                    <Plus size={17} />
                    Add Task
                </button>
            </header>

            <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
                <div className="min-w-0 rounded-2xl border border-white/70 bg-white/45 p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/45 dark:shadow-black/20">
                    <TaskFilter value={filter} onChange={setFilter} />
                </div>

                <TaskFilterPanel
                    priorityFilter={priorityFilter}
                    statusFilter={statusFilter}
                    tagFilter={tagFilter}
                    onPriorityFilterChange={setPriorityFilter}
                    onStatusFilterChange={setStatusFilter}
                    onTagFilterChange={setTagFilter}
                />
            </div>

            <div className={`grid min-w-0 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)] ${filter === "all" ? "xl:items-stretch" : "items-start"}`}>
                <section className={`min-w-0 ${filter === "all" && filteredTasks.length && !loading ? "xl:h-full" : ""}`}>
                    {loading ? (
                        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-white/80 bg-white/85 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/85">
                            <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                                Loading tasks...
                            </div>
                        </div>
                    ) : filteredTasks.length ? (
                        <div className={`overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/20 ${filter === "all" ? "xl:h-full" : ""}`}>
                            <TaskTable
                                tasks={displayedTasks}
                                scrollable={filter === "all"}
                                fillHeight={filter === "all"}
                                highlightedTaskId={highlightedTaskId}
                                activeSort={activeSort}
                                onSortTask={handleSortTask}
                                onSortDueDate={handleSortDueDate}
                                onToggleComplete={handlers.handleToggleComplete}
                                onStatusChange={handlers.handleStatusChange}
                                onEdit={handlers.handleEditTask}
                                onDelete={handlers.handleDeleteTask}
                                onView={handlers.handleViewTask}
                            />

                            {filter !== "all" && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={sortedTasks.length}
                                    itemsPerPage={tasksPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            title={currentEmptyState.title}
                            description={currentEmptyState.description}
                            actionLabel={currentEmptyState.actionLabel}
                            onAction={currentEmptyState.showAction ? handlers.handleOpenAddTask : undefined}
                        />
                    )}
                </section>

                <aside className="min-w-0 space-y-4">
                    <CalendarWidget tasks={tasks} />
                    <EncouragementCard />
                </aside>
            </div>

            {selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    onClose={handlers.handleCloseTaskDetails}
                    onEdit={() => handlers.handleEditTask(selectedTask.id)}
                    onDelete={() => handlers.handleDeleteTask(selectedTask.id)}
                />
            )}

            <AddTask isOpen={isAddTaskOpen} onClose={handlers.handleCloseAddTask} onSubmit={handlers.handleAddTaskSubmit} />
            <EditTask task={taskToEdit} isOpen={Boolean(taskToEdit)} onClose={handlers.handleCloseEditTask} onSave={handlers.handleUpdateTask} />
            <DeleteTask task={taskToDelete} onConfirm={() => handlers.handleConfirmDelete(taskToDelete)} onCancel={handlers.handleCancelDelete} />
        </div>
    );
}

export default MyTasks;
