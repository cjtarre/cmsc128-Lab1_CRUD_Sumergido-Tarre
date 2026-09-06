export const PRIORITY = {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
};

export const STATUS = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    COMPLETED: 3,
};

export const TAG = {
    SCHOOL: 0,
    PERSONAL: 1,
    OTHERS: 2,
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

export const tagLabels = {
    [TAG.SCHOOL]: "School",
    [TAG.PERSONAL]: "Personal",
    [TAG.OTHERS]: "Others",
};