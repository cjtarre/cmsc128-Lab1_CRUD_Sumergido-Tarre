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

        handleAddTaskSubmit: async (event, formData) => {
            event.preventDefault();

            if (!formData.title.trim()) {
                toast.error("Task title is required.");
                return;
            }

            try {
                await addTask({
                    ...formData,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    dueDate: formatDate(formData.dueDate),
                    status: STATUS.NOT_STARTED,
                });

                setIsAddTaskOpen(false);
                toast.success("Task added successfully!");
            } catch (error) {
                console.error("Error adding task:", error);
                toast.error("Failed to add task.");
            }
        },

        handleViewTask: (id) => setSelectedTask(getTask(id)),
        handleCloseTaskDetails: () => setSelectedTask(null),

        handleEditTask: (id) => setTaskToEdit(getTask(id)),
        handleCloseEditTask: () => setTaskToEdit(null),

        handleUpdateTask: async (task) => {
            if (!task.title.trim()) {
                toast.error("Task title is required.");
                return;
            }

            try {
                const updatedTask = {
                    ...task,
                    title: task.title.trim(),
                    description: task.description.trim(),
                    dueDate: formatDate(task.dueDate),
                };

                await updateTask(updatedTask);

                setSelectedTask((selected) =>
                    selected?.id === updatedTask.id ? updatedTask : selected
                );

                setTaskToEdit(null);
                toast.success("Task updated successfully!");
            } catch (error) {
                console.error("Error updating task:", error);
                toast.error("Failed to update task.");
            }
        },

        handleStatusChange: async (id, status) => {
            try {
                await updateTaskStatus(id, status);

                setSelectedTask((selected) =>
                    selected?.id === id ? { ...selected, status } : selected
                );

                toast.success("Task status updated!");
            } catch (error) {
                console.error("Error updating status:", error);
                toast.error("Failed to update task status.");
            }
        },

        handleDeleteTask: (id) => setTaskToDelete(getTask(id)),

        handleConfirmDelete: async (task) => {
            if (!task) return;

            try {
                await deleteTask(task.id);

                setSelectedTask((selected) =>
                    selected?.id === task.id ? null : selected
                );

                setTaskToDelete(null);
                toast.success("Task deleted successfully!");
            } catch (error) {
                console.error("Error deleting task:", error);
                toast.error("Failed to delete task.");
            }
        },

        handleCancelDelete: () => setTaskToDelete(null),

        handleToggleComplete: async (id) => {
            try {
                await toggleTaskComplete(id);
                toast.success("Task status updated!");
            } catch (error) {
                console.error(
                    "Error toggling task:",
                    error.response?.data || error
                );
                toast.error(
                    error.response?.data?.error || "Failed to update task status."
                );
            }
        },
    };
}