export function validateTask(task) {
    const errors = {};

    if (!task.title?.trim()) {
        errors.title = "Task title is required.";
        return errors;
    }

    // Due Date is optional, uncomment to make it mandatory
    // if (!task.dueDate) {
    //     errors.dueDate = "Due date is required.";
    //     return errors;
    // }

    // if (!task.dueTime) {
    //     errors.dueTime = "Due time is required.";
    //     return errors;
    // }

    return errors;
}