import { STATUS } from "../shared/constants/taskOptions";
import { taskService } from "../services/taskService";

const toApiTask = (task, includeTags = true) => {
    const [day, month, year] = (task.dueDate || "").split("/");

    const dueDate =
        day && month && year
            ? `${year}-${month}-${day}T${task.dueTime || "00:00"}`
            : null;

    return {
        task_name: task.title?.trim() || "",
        task_info: task.description?.trim() || "",
        priority_level: task.priority ?? 0,
        status: task.status ?? STATUS.NOT_STARTED,
        due_date: dueDate,

        ...(includeTags && {
            tag_ids: task.tag ? [task.tag] : [],
        }),
    };
};

const convertApiTask = (task) => {
    const due = task.due_date ? new Date(task.due_date) : null;

    const tags =
        task.task_tag?.map((item) => item.tags).filter(Boolean) || [];

    return {
        id: task.task_id,
        title: task.task_name,
        description: task.task_info || "",
        status: task.status,
        priority: task.priority_level,

        dueDate: due ? due.toLocaleDateString("en-GB") : "",

        dueTime: due
            ? due.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "",

        tag: tags[0]?.tag_name || "General",
        tagId: tags[0]?.tag_id ?? null,
        tags,
    };
};

function useTasks(tasks, setTasks) {
    const getTask = (id) => tasks.find((task) => task.id === id);

    const addTask = async (task) => {
        const created = await taskService.createTask(toApiTask(task));

        setTasks((prev) => [
            ...prev,
            convertApiTask(created),
        ]);

        return created;
    };

    const updateTask = async (task) => {
        const updated = await taskService.updateTask(
            task.id,
            toApiTask(task)
        );

        setTasks((prev) =>
            prev.map((item) =>
                item.id === task.id
                    ? convertApiTask(updated)
                    : item
            )
        );

        return updated;
    };

    const deleteTask = async (id) => {
        await taskService.deleteTask(id);

        setTasks((prev) =>
            prev.filter((task) => task.id !== id)
        );
    };

    const updateTaskStatus = async (id, status) => {
        const task = getTask(id);

        if (!task) return;

        // Status changes do not need to modify task tags.
        const updated = await taskService.updateTask(id, {
            ...toApiTask(task, false),
            status,
        });

        setTasks((prev) =>
            prev.map((item) =>
                item.id === id
                    ? convertApiTask(updated)
                    : item
            )
        );
    };

    const toggleTaskComplete = async (id) => {
        const task = getTask(id);

        if (!task) return;

        const status =
            task.status === STATUS.COMPLETED
                ? STATUS.NOT_STARTED
                : STATUS.COMPLETED;

        await updateTaskStatus(id, status);
    };

    return {
        getTask,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        toggleTaskComplete,
    };
}

export default useTasks;