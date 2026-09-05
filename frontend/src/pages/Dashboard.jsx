import { useState } from "react";
import { Plus } from "lucide-react";

import TaskFilter from "../components/tasks/TaskFilter";
import TaskTable from "../components/tasks/TaskTable";
import TaskDetails from "../components/tasks/TaskDetails";
import CalendarWidget from "../components/calendar/CalendarWidget";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";

function Dashboard() {
    const [filter, setFilter] = useState("all");
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const tasks = [
        {
            id: 1,
            title: "Finish CMSC 128 Lab",
            description: "Complete the CRUD application.",
            status: "pending",
            priority: "high",
            dueDate: "Today",
            dueTime: "11:59 PM",
            tag: "School",
            category: "today",
        },
        {
            id: 2,
            title: "Review CMSC 124 notes",
            description: "Review the latest lecture materials.",
            status: "pending",
            priority: "medium",
            dueDate: "Today",
            dueTime: "2:00 PM",
            tag: "School",
            category: "today",
        },
        {
            id: 3,
            title: "Buy groceries",
            description: "Pick up groceries for the week.",
            status: "pending",
            priority: "low",
            dueDate: "September 7",
            dueTime: "3:00 PM",
            tag: "Personal",
            category: "upcoming",
        },
        {
            id: 4,
            title: "Submit activity",
            description: "Submit the completed activity.",
            status: "pending",
            priority: "high",
            dueDate: "September 2",
            dueTime: "11:59 PM",
            tag: "School",
            category: "overdue",
        },
    ];

    const filteredTasks = tasks.filter((task) => {
        if (filter === "all") {
            return true;
        }

        return task.category === filter;
    });

    const handleViewTask = (taskId) => {
        const task = tasks.find((task) => task.id === taskId);
        setSelectedTask(task);
    };

    const handleDeleteTask = (taskId) => {
        const task = tasks.find((task) => task.id === taskId);
        setTaskToDelete(task);
    };

    const handleConfirmDelete = () => {
        console.log("Delete:", taskToDelete.id);

        // Actual CRUD deletion will be implemented later.
        setTaskToDelete(null);
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
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
                    onClick={() => console.log("Add Task clicked")}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-medium text-green-600 shadow-sm transition-all duration-200 hover:border-green-300 hover:bg-green-100 hover:shadow focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                    <Plus size={16} strokeWidth={2} />
                    Add Task
                </button>
            </header>

            {/* Main Content */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                {/* Tasks */}
                <section className="min-w-0">
                    <TaskFilter
                        value={filter}
                        onChange={setFilter}
                    />

                    <div className="mt-6">
                        {filteredTasks.length > 0 ? (
                            <TaskTable
                                tasks={filteredTasks}
                                onToggleComplete={(id) =>
                                    console.log("Toggle:", id)
                                }
                                onEdit={(id) =>
                                    console.log("Edit:", id)
                                }
                                onDelete={handleDeleteTask}
                                onView={handleViewTask}
                            />
                        ) : (
                            <EmptyState
                                title="No tasks found"
                                description="There are no tasks in this category."
                                actionLabel="Add Task"
                                onAction={() =>
                                    console.log("Add Task clicked")
                                }
                            />
                        )}
                    </div>
                </section>

                {/* Calendar */}
                <aside className="min-w-0">
                    <CalendarWidget />
                </aside>
            </div>

            {/* Task Details */}
            {selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={Boolean(taskToDelete)}
                title="Delete task?"
                message={
                    taskToDelete
                        ? `Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`
                        : ""
                }
                confirmText="Delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setTaskToDelete(null)}
            />
        </div>
    );
}

export default Dashboard;