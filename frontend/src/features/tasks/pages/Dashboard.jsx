import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import useTasks from "../hooks/useTasks";
import { useTaskData } from "../context/TaskContext";
import { createTaskHandlers } from "../handlers/taskHandlers";
import emptyState from "../../../shared/constants/emptyState";
import { filterTasks } from "../utils/taskFilters";
import { sortTasksByTaskColumn, sortTasksByDueDateColumn, DUEDATE_SORT_MODES, TASK_SORT_CYCLE, DUEDATE_SORT_CYCLE, getNextSort,} from "../utils/taskUtils";

import Pagination from "../../../shared/components/common/Pagination";
import EmptyState from "../../../shared/components/common/EmptyState";
import EncouragementCard from "../../../shared/components/common/EncouragementCard";

import TaskFilter from "../components/TaskFilter";
import TaskFilterPanel from "../components/TaskFilterPanel";
import TaskTable from "../components/TaskTable";
import TaskDetails from "../components/TaskDetails";

import CalendarWidget from "../../calendar/components/CalendarWidget";

import AddTask from "../components/AddTask";
import EditTask from "../components/EditTask";
import DeleteTask from "../components/DeleteTask";

function Dashboard() {
    const { tasks, setTasks, searchTerm, loading } = useTaskData();

    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [activeSort, setActiveSort] = useState({ column: "dueDate", mode: DUEDATE_SORT_MODES.DUE_ASC,});
    const [priorityFilter, setPriorityFilter] = useState([]);
    const [statusFilter, setStatusFilter] = useState([]);
    const [tagFilter, setTagFilter] = useState([]);

    const tasksPerPage = 5;
    const currentEmptyState = emptyState[filter];

    const taskActions = useTasks(tasks, setTasks);
    const handlers = createTaskHandlers({ ...taskActions, setSelectedTask, setTaskToEdit, setTaskToDelete, setIsAddTaskOpen,});

    const handleSortTask = () => { setActiveSort((previous) => getNextSort(previous, "task", TASK_SORT_CYCLE) ); };
    const handleSortDueDate = () => { setActiveSort((previous) => getNextSort(previous, "dueDate", DUEDATE_SORT_CYCLE) ); };

    const filteredTasks = filterTasks( tasks, filter, searchTerm, priorityFilter, statusFilter, tagFilter);

    const sortedTasks = activeSort.column === "task"
            ? sortTasksByTaskColumn(filteredTasks, activeSort.mode)
            : sortTasksByDueDateColumn(filteredTasks, activeSort.mode);

    const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);
    const paginatedTasks = sortedTasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);}, [filter, searchTerm, activeSort, priorityFilter, statusFilter, tagFilter]);

    useEffect(() => { if (totalPages > 0 && currentPage > totalPages) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage(totalPages); }}, [totalPages, currentPage]);

     return (
        <div className="space-y-6 sm:space-y-8">
            <header className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-2xl">
                        My Tasks
                    </h1>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                        Manage and organize your tasks.
                    </p>
                </div>

                {/* Mobile / tablet */}
                <button
                    type="button"
                    onClick={handlers.handleOpenAddTask}
                    aria-label="Add task"
                    className="group inline-flex h-9 w-9 shrink-0 items-center justify-start overflow-hidden rounded-full bg-green-500 px-2.5 text-white shadow-sm transition-all duration-200 hover:w-24 hover:bg-green-600 focus:w-24 focus:outline-none focus:ring-2 focus:ring-green-200 xl:hidden"
                >
                    <Plus size={17} className="shrink-0" />
                    <span className="ml-1.5 whitespace-nowrap text-xs font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100">
                        Add Task
                    </span>
                </button>

                {/* Desktop */}
                <button
                    type="button"
                    onClick={handlers.handleOpenAddTask}
                    className="hidden shrink-0 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-medium text-green-600 shadow-sm transition hover:border-green-300 hover:bg-green-100 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-200 xl:inline-flex"
                >
                    <Plus size={16} />
                    Add Task
                </button>
            </header>

            <div className="flex min-w-0 items-start gap-2 xl:grid xl:gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
                <div className="min-w-0 flex-1 xl:flex-none">
                    <TaskFilter value={filter} onChange={setFilter} />
                </div>

                <div className="shrink-0">
                    <TaskFilterPanel
                        priorityFilter={priorityFilter}
                        statusFilter={statusFilter}
                        tagFilter={tagFilter}
                        onPriorityFilterChange={setPriorityFilter}
                        onStatusFilterChange={setStatusFilter}
                        onTagFilterChange={setTagFilter}
                    />
                </div>
            </div>

            <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
                <section className="min-w-0 space-y-4">
                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-green-500" />
                                Loading tasks...
                            </div>
                        </div>
                    ) : filteredTasks.length ? (
                        <>
                            <TaskTable
                                tasks={paginatedTasks}
                                activeSort={activeSort}
                                onSortTask={handleSortTask}
                                onSortDueDate={handleSortDueDate}
                                onToggleComplete={handlers.handleToggleComplete}
                                onStatusChange={handlers.handleStatusChange}
                                onEdit={handlers.handleEditTask}
                                onDelete={handlers.handleDeleteTask}
                                onView={handlers.handleViewTask}
                            />
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={sortedTasks.length}
                                itemsPerPage={tasksPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    ) : (
                        <EmptyState
                            title={currentEmptyState.title}
                            description={currentEmptyState.description}
                            actionLabel={currentEmptyState.actionLabel}
                            onAction={
                                currentEmptyState.showAction
                                    ? handlers.handleOpenAddTask
                                    : undefined
                            }
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

            <AddTask
                isOpen={isAddTaskOpen}
                onClose={handlers.handleCloseAddTask}
                onSubmit={handlers.handleAddTaskSubmit}
            />

            <EditTask
                task={taskToEdit}
                isOpen={Boolean(taskToEdit)}
                onClose={handlers.handleCloseEditTask}
                onSave={handlers.handleUpdateTask}
            />

            <DeleteTask
                task={taskToDelete}
                onConfirm={() => handlers.handleConfirmDelete(taskToDelete)}
                onCancel={handlers.handleCancelDelete}
            />
        </div>
    );
}

export default Dashboard;