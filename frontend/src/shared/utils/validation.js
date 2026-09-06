export function validateTask(task) {
    const errors = {};

    if (!task.title?.trim()) {
        errors.title = "Task title is required.";
        return errors;
    }

    if (!task.dueDate) {
        errors.dueDate = "Due date is required.";
        return errors;
    }

    if (!task.dueTime) {
        errors.dueTime = "Due time is required.";
        return errors;
    }

    return errors;
}