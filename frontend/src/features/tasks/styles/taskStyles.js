import { PRIORITY, STATUS } from "../constants/taskOptions";

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

tag: {
    1: "bg-blue-50/50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400",
    2: "bg-purple-50/50 text-purple-500 dark:bg-purple-950/20 dark:text-purple-400",
    3: "bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400",
},
};

export default taskStyles;