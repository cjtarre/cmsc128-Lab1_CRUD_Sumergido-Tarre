export const PRIORITY = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };

export const STATUS = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    COMPLETED: 2,
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

export const DATE_TIME_FIELDS = [
    ["dueDate", "Due Date", "date"],
    ["dueTime", "Due Time", "time"],
];

export const EDIT_SELECT_FIELDS = [
    [
        "priority",
        "Priority",
        [
            [PRIORITY.NONE, "None"],
            [PRIORITY.LOW, "Low"],
            [PRIORITY.MEDIUM, "Medium"],
            [PRIORITY.HIGH, "High"],
        ],
    ],
    [
        "status",
        "Status",
        [
            [STATUS.NOT_STARTED, "Not Started"],
            [STATUS.IN_PROGRESS, "In Progress"],
            [STATUS.COMPLETED, "Completed"],
        ],
    ],
];