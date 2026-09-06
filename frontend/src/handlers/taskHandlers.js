import { toast } from "sonner";
import { STATUS } from "../shared/constants/taskOptions";

const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};

export function createTaskHandlers({
    getTask,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    toggleTaskComplete,
    setSelectedTask,
    setTaskToEdit,
    setTaskToDelete,
    setIsAddTaskOpen,
}) {
    return {
        handleOpenAddTask: () => setIsAddTaskOpen(true),
        handleCloseAddTask: () => setIsAddTaskOpen(false),

        handleAddTaskSubmit: (event, formData) => {
            event.preventDefault();

            if (!formData.title.trim()) {
                toast.error("Task title is required.");
                return;
            }

            addTask({
                ...formData,
                title: formData.title.trim(),
                description: formData.description.trim(),
                dueDate: formatDate(formData.dueDate),
                status: STATUS.NOT_STARTED,
            });

            setIsAddTaskOpen(false);
            toast.success("Task added successfully!");
        },

        handleViewTask: (id) => setSelectedTask(getTask(id)),
        handleCloseTaskDetails: () => setSelectedTask(null),

        handleEditTask: (id) => setTaskToEdit(getTask(id)),
        handleCloseEditTask: () => setTaskToEdit(null),

        handleUpdateTask: (task) => {
            if (!task.title.trim()) {
                toast.error("Task title is required.");
                return;
            }

            const updatedTask = {
                ...task,
                title: task.title.trim(),
                description: task.description.trim(),
                dueDate: formatDate(task.dueDate),
            };

            updateTask(updatedTask);

            setSelectedTask((selected) =>
                selected?.id === updatedTask.id
                    ? updatedTask
                    : selected
            );

            setTaskToEdit(null);
            toast.success("Task updated successfully!");
        },

        handleStatusChange: (id, status) => {
            updateTaskStatus(id, status);

            setSelectedTask((selected) =>
                selected?.id === id
                    ? { ...selected, status }
                    : selected
            );

            toast.success("Task status updated!");
        },

        handleDeleteTask: (id) => setTaskToDelete(getTask(id)),

        handleConfirmDelete: (task) => {
            if (!task) return;

            deleteTask(task.id);

            setSelectedTask((selected) =>
                selected?.id === task.id ? null : selected
            );

            setTaskToDelete(null);
            toast.success("Task deleted successfully!");
        },

        handleCancelDelete: () => setTaskToDelete(null),
        handleToggleComplete: toggleTaskComplete,
    };
}