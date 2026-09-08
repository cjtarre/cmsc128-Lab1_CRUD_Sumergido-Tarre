export const TASK_SORT_MODES = {
    TITLE_ASC: "title_asc",
    TITLE_DESC: "title_desc",
    PRIORITY_ASC: "priority_asc",
    PRIORITY_DESC: "priority_desc",
}

export const DUEDATE_SORT_MODES = {
    DUE_ASC: "due_asc",
    DUE_DESC: "due_desc",
    CRE_ASC: "cre_asc",
    CRE_DESC: "cre_desc",
}

function getDueDateTimestamp(task) {
    if (!task.dueDate) return Infinity;

    const [day, month, year] = task.dueDate.split("/").map(Number);
    let [time, period] = (task.dueTime || "12:00 AM").split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return new Date(year, month - 1, day, hours, minutes).getTime();
}

export function sortTasksByTaskColumn(tasks, mode) {
    const sortedTasks = [...tasks];
    switch (mode) {
        case TASK_SORT_MODES.TITLE_ASC:
            return sortedTasks.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        case TASK_SORT_MODES.TITLE_DESC:
            return sortedTasks.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        case TASK_SORT_MODES.PRIORITY_ASC:
            return sortedTasks.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        case TASK_SORT_MODES.PRIORITY_DESC:
            return sortedTasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        default:
            return sortedTasks;
    }
}

export function sortTasksByDueDateColumn(tasks, mode) {
    const sortedTasks = [...tasks];
    switch (mode) {
        case DUEDATE_SORT_MODES.DUE_DESC:
            return sortedTasks.sort((a, b) => {
                const tsA = getDueDateTimestamp(a);
                const tsB = getDueDateTimestamp(b);

                if (!Number.isFinite(tsA) && !Number.isFinite(tsB)) return 0;
                if (!Number.isFinite(tsA)) return 1;
                if (!Number.isFinite(tsB)) return -1;

                return tsB - tsA;
            });
        case DUEDATE_SORT_MODES.CRE_ASC:
        case DUEDATE_SORT_MODES.CRE_DESC:
            return [...sortedTasks.sort((a, b) => {
                const timestampA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timestampB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

                if (mode === DUEDATE_SORT_MODES.CRE_ASC) return timestampA - timestampB;
                return timestampB - timestampA;
            })];
        case DUEDATE_SORT_MODES.DUE_ASC:
        default:
            return sortedTasks.sort((a, b) => {
                const tsA = getDueDateTimestamp(a);
                const tsB = getDueDateTimestamp(b);

                if (!Number.isFinite(tsA) && !Number.isFinite(tsB)) return 0;
                if (!Number.isFinite(tsA)) return 1;
                if (!Number.isFinite(tsB)) return -1;

                return tsA - tsB;
            });
    }
}