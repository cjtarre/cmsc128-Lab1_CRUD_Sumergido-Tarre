import { convertApiTask } from "../utils/convertApiTask";

export { convertApiTask };
import { STATUS, PRIORITY } from "../constants/taskOptions";
import { taskService } from "../services/taskService";

const toApiTask = (task, includeTags = true, projectId = null) => {
    const [day, month, year] = (task.dueDate || "").split("/");
    const dueDate = day && month && year ? `${year}-${month}-${day}T${task.dueTime || "00:00"}` : null;

    return {
        task_name: task.title?.trim() || "",
        task_info: task.description?.trim() || "",
        priority_level: task.priority ?? PRIORITY.NONE,
        status: task.status ?? STATUS.NOT_STARTED,
        due_date: dueDate,
        ...(projectId && { project_id: Number(projectId) }),
        ...(Object.prototype.hasOwnProperty.call(task, "assigneeId") && { assignee_id: task.assigneeId || null }),
        ...(includeTags && { tag_ids: (task.tags || []).map((tag) => typeof tag === "object" ? tag.tag_id : tag) }),
    };
};



function useTasks(tasks, setTasks, projectId = null) {
    const getTask = (id) => tasks.find((task) => task.id === id);

    const addTask = async (task) => {
        const created = await taskService.createTask(toApiTask(task, true, projectId));
        setTasks((prev) => [...prev, convertApiTask(created)]);
        return created;
    };

    const updateTask = async (task) => {
        const updated = convertApiTask(await taskService.updateTask(task.id, toApiTask(task)));
        setTasks((prev) => prev.map((item) => item.id === task.id ? updated : item));
        return updated;
    };

    const deleteTask = async (id) => {
        await taskService.deleteTask(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const restoreTask = async (id) => {
        const restored = await taskService.restoreTask(id);
        setTasks((prev) => [...prev, convertApiTask(restored)]);
        return restored;
    };

    const updateTaskStatus = async (id, status) => {
        const task = getTask(id);
        if (!task) return;

        // A status change must not re-submit the existing assignment. The assignee
        // may have left the project, and only an explicit reassignment should be
        // checked against current project membership by the API.
        const payload = toApiTask(task, false);
        delete payload.assignee_id;
        const updated = await taskService.updateTask(id, { ...payload, status });
        setTasks((prev) => prev.map((item) => item.id === id ? convertApiTask(updated) : item));
    };

    const toggleTaskComplete = async (id) => {
        const task = getTask(id);
        if (!task) return;

        const status = task.status === STATUS.COMPLETED ? STATUS.NOT_STARTED : STATUS.COMPLETED;
        await updateTaskStatus(id, status);
    };

    return { getTask, addTask, updateTask, deleteTask, restoreTask, updateTaskStatus, toggleTaskComplete };
}

export default useTasks;