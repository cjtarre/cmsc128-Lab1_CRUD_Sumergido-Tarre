export const convertApiTask = (task) => {
    const due = task.due_date ? new Date(task.due_date) : null;
    const tags = task.task_tag?.map((item) => item.tags).filter(Boolean) || [];

    return {
        id: task.task_id,
        title: task.task_name,
        description: task.task_info || "",
        status: task.status,
        priority: task.priority_level,
        dueDate: due ? due.toLocaleDateString("en-GB") : "",
        dueTime: due ? due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        tags,
        createdAt: task.created_at ?? null,
        projectId: task.project_id ?? null,
        creatorId: task.user_id ?? null,
        assigneeId: task.assignee_id ?? null,
        assignee: task.assignee ?? null,
        project: task.project ?? null,
    };
};
