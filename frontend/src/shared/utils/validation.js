export const NAME_MAX_LENGTH = 80;
export const INFO_MAX_LENGTH = 500;

export function validateTask(task) {
    const errors = {};

    if (!task.title?.trim()) {
        errors.title = "Task title is required.";
        return errors;
    }

    if (task.title.trim().length > NAME_MAX_LENGTH) {
        errors.title = `Task title must be ${NAME_MAX_LENGTH} characters or fewer.`;
        return errors;
    }

    if (task.description?.trim().length > INFO_MAX_LENGTH) {
        errors.description = `Description must be ${INFO_MAX_LENGTH} characters or fewer.`;
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