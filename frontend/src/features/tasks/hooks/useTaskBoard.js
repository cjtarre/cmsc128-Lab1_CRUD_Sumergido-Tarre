import { useMemo, useState } from "react";
import { toast } from "sonner";

import useTasks from "./useTasks";

// Manage board filtering, status updates, and desktop drag-and-drop.
export function useTaskBoard(tasks, setTasks, projectId, canEdit) {
    const [searchTerm, setSearchTerm] = useState("");
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverStatus, setDragOverStatus] = useState(null);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);
    const taskActions = useTasks(tasks, setTasks, projectId);

    const filteredTasks = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return query ? tasks.filter((task) => task.title?.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query)) : tasks;
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

    const handleDragEnd = () => { setDraggedTaskId(null); setDragOverStatus(null); };

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

        const rawTaskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
        const task = tasks.find((item) => String(item.id) === String(rawTaskId));
        setDraggedTaskId(null); setDragOverStatus(null);

        if (task && task.status !== status) await handleStatusChange(task.id, status);
    };

    return { searchTerm, setSearchTerm, filteredTasks, draggedTaskId, dragOverStatus, updatingTaskId, handleStatusChange, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop };
}