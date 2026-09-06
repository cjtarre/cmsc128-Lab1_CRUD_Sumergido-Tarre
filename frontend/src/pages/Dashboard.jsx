import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import useTasks from "../hooks/useTasks";
import { useTaskData } from "../shared/context/taskContext";
import { createTaskHandlers } from "../handlers/taskHandlers";
import { getTaskCategory } from "../shared/utils/dateUtils";
import { sortTasksByDueDate } from "../shared/utils/taskUtils";
import { STATUS } from "../shared/constants/taskOptions";
import emptyState from "../shared/constants/emptyState";
import Pagination from "../shared/components/common/Pagination";

import TaskFilter from "../shared/components/tasks/TaskFilter";
import TaskTable from "../shared/components/tasks/TaskTable";
import TaskDetails from "../shared/components/tasks/TaskDetails";
import CalendarWidget from "../shared/components/calendar/CalendarWidget";
import EmptyState from "../shared/components/common/EmptyState";
import AddTask from "../shared/components/crud/AddTask";
import EditTask from "../shared/components/crud/EditTask";
import DeleteTask from "../shared/components/crud/DeleteTask";

function Dashboard() {
    const { tasks, setTasks, searchTerm, loading } = useTaskData();
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    const tasksPerPage = 5;
    const currentEmptyState = emptyState[filter];
    const taskActions = useTasks(tasks, setTasks);

    const handlers = createTaskHandlers({
        ...taskActions,
        setSelectedTask,
        setTaskToEdit,
        setTaskToDelete,
        setIsAddTaskOpen,
    });

    const filteredTasks = tasks.filter((task) => {
        const search = (searchTerm || "").trim().toLowerCase();
        const title = task.title?.toLowerCase() || "";
        const description = task.description?.toLowerCase() || "";
        const tag = task.tag?.toLowerCase() || "";

        if (
            search &&
            !title.includes(search) &&
            !description.includes(search) &&
            !tag.includes(search)
        ) return false;

        if (filter === "completed") return task.status === STATUS.COMPLETED;
        if (task.status === STATUS.COMPLETED) return false;
        if (filter === "all") return true;

        return getTaskCategory(task.dueDate) === filter;
    });

    const sortedTasks = sortTasksByDueDate(filteredTasks);
    const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);
    const paginatedTasks = sortedTasks.slice(
        (currentPage - 1) * tasksPerPage,
        currentPage * tasksPerPage
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [filter, searchTerm]);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="space-y-8">
            <header className="flex items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                        My Tasks
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage and organize your tasks.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handlers.handleOpenAddTask}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-medium text-green-600 shadow-sm transition-all hover:border-green-300 hover:bg-green-100 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                    <Plus size={16} />
                    Add Task
                </button>
            </header>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                <section className="min-w-0">
                    <TaskFilter value={filter} onChange={setFilter} />

                    <div className="mt-6">
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
                    </div>
                </section>

                <aside>
                    <CalendarWidget tasks={tasks} />
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