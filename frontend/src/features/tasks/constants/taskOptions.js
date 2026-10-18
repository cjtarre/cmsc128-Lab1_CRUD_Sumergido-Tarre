// Values match the Postgres enums `task_priority` and `task_status`.
export const PRIORITY = { NONE: "none", LOW: "low", MEDIUM: "medium", HIGH: "high" };

export const STATUS = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
};

export const priorityLabels = {
    [PRIORITY.NONE]: "None",
    [PRIORITY.LOW]: "Low",
    [PRIORITY.MEDIUM]: "Medium",
    [PRIORITY.HIGH]: "High",
};

export const statusLabels = {
    [STATUS.NOT_STARTED]: "Not Started",
    [STATUS.IN_PROGRESS]: "In Progress",
    [STATUS.COMPLETED]: "Completed",
};

// Numeric rank for sorting (enum strings can't be compared with < or -).
export const PRIORITY_RANK = {
    [PRIORITY.NONE]: 0,
    [PRIORITY.LOW]: 1,
    [PRIORITY.MEDIUM]: 2,
    [PRIORITY.HIGH]: 3,
};

export const PRIORITY_OPTIONS = Object.values(PRIORITY).map((value) => [value, priorityLabels[value]]);
export const STATUS_OPTIONS = Object.values(STATUS).map((value) => [value, statusLabels[value]]);

export const DATE_TIME_FIELDS = [
    ["dueDate", "Due Date", "date"],
    ["dueTime", "Due Time", "time"],
];

export const EDIT_SELECT_FIELDS = [
    ["priority", "Priority", PRIORITY_OPTIONS],
    ["status", "Status", STATUS_OPTIONS],
];
