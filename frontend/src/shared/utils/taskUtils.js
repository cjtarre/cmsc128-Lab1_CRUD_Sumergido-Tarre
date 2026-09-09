export const TASK_SORT_MODES = {
    TITLE_ASC: "title_asc",
    TITLE_DESC: "title_desc",
    PRIORITY_ASC: "priority_asc",
    PRIORITY_DESC: "priority_desc",
};

export const DUEDATE_SORT_MODES = {
    DUE_ASC: "due_asc",
    DUE_DESC: "due_desc",
    CRE_ASC: "cre_asc",
    CRE_DESC: "cre_desc",
};

export const TASK_SORT_CYCLE = Object.values(TASK_SORT_MODES);

export const DUEDATE_SORT_CYCLE = Object.values(DUEDATE_SORT_MODES);

export const taskSortLabels = {
    [TASK_SORT_MODES.TITLE_ASC]: "A-Z",
    [TASK_SORT_MODES.TITLE_DESC]: "Z-A",
    [TASK_SORT_MODES.PRIORITY_ASC]: "Low-High",
    [TASK_SORT_MODES.PRIORITY_DESC]: "High-Low",
};

export const dueDateSortLabels = {
    [DUEDATE_SORT_MODES.DUE_ASC]: "Due ↑",
    [DUEDATE_SORT_MODES.DUE_DESC]: "Due ↓",
    [DUEDATE_SORT_MODES.CRE_ASC]: "Added ↑",
    [DUEDATE_SORT_MODES.CRE_DESC]: "Added ↓",
};

export function getNextSort(previous, column, cycle) {
    if (previous.column !== column) {
        return { column, mode: cycle[0] };
    }

    return {
        column,
        mode: cycle[(cycle.indexOf(previous.mode) + 1) % cycle.length],
    };
}

function getDueDateTimestamp(task) {
    if (!task.dueDate) return Infinity;

    const [day, month, year] = task.dueDate.split("/").map(Number);
    const [time, period] = (task.dueTime || "12:00 AM").split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minutes).getTime();
}

export function sortTasksByTaskColumn(tasks, mode) {
    const sorted = [...tasks];

    switch (mode) {
        case TASK_SORT_MODES.TITLE_ASC:
            return sorted.sort((a, b) =>
                (a.title || "").localeCompare(b.title || "")
            );
        case TASK_SORT_MODES.TITLE_DESC:
            return sorted.sort((a, b) =>
                (b.title || "").localeCompare(a.title || "")
            );
        case TASK_SORT_MODES.PRIORITY_ASC:
            return sorted.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        case TASK_SORT_MODES.PRIORITY_DESC:
            return sorted.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        default:
            return sorted;
    }
}

export function sortTasksByDueDateColumn(tasks, mode) {
    const sorted = [...tasks];

    if (mode === DUEDATE_SORT_MODES.CRE_ASC) {
        return sorted.sort(
            (a, b) =>
                new Date(a.createdAt || 0).getTime() -
                new Date(b.createdAt || 0).getTime()
        );
    }

    if (mode === DUEDATE_SORT_MODES.CRE_DESC) {
        return sorted.sort(
            (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
        );
    }

    return sorted.sort((a, b) => {
        const dateA = getDueDateTimestamp(a);
        const dateB = getDueDateTimestamp(b);

        if (!Number.isFinite(dateA)) return Number.isFinite(dateB) ? 1 : 0;
        if (!Number.isFinite(dateB)) return -1;

        return mode === DUEDATE_SORT_MODES.DUE_DESC
            ? dateB - dateA
            : dateA - dateB;
    });
}