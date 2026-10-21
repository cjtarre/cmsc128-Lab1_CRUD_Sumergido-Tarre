import { PRIORITY, STATUS } from "../constants/taskOptions";

export const DEFAULT_TAG_COLOR = "#64748b";

const taskStyles = {
    priority: {
        [PRIORITY.NONE]: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
        [PRIORITY.LOW]: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
        [PRIORITY.MEDIUM]: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400",
        [PRIORITY.HIGH]: "bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400",
    },

    status: {
        [STATUS.NOT_STARTED]: "text-slate-500 dark:text-slate-400",
        [STATUS.IN_PROGRESS]: "text-amber-600 dark:text-amber-400",
        [STATUS.COMPLETED]: "text-green-600 dark:text-green-400",
    },

    statusDot: {
        [STATUS.NOT_STARTED]: "bg-slate-300 dark:bg-slate-600",
        [STATUS.IN_PROGRESS]: "bg-sky-400",
        [STATUS.COMPLETED]: "bg-green-500",
    },

    // Legacy preset styles remain as a fallback while tag colors move to database values.
    tag: {
        1: "bg-blue-50/50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400",
        2: "bg-purple-50/50 text-purple-500 dark:bg-purple-950/20 dark:text-purple-400",
        3: "bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400",
    },
};

// Custom tag colors are stored as six-digit hex values in the database.
export const getTagColor = (tag) => tag?.color || DEFAULT_TAG_COLOR;

export const getTagInlineStyle = (tag, selected = false) => {
    const color = getTagColor(tag);

    return {
        borderColor: selected ? `${color}40` : "transparent",
        backgroundColor: selected ? `${color}20` : `${color}0D`,
        color,
    };
};

export default taskStyles;