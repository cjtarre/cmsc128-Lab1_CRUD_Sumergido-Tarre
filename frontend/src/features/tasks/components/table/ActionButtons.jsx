import { Pencil, Trash2 } from "lucide-react";

function ActionButtons({ onEdit, onDelete }) {
    return (
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button
                type="button"
                onClick={onEdit}
                aria-label="Edit task"
                title="Edit task"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-green-50/70 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-100/70 dark:text-slate-500 dark:hover:bg-green-950/40 dark:hover:text-green-400 dark:focus:ring-green-900/50"
            >
                <Pencil size={13} strokeWidth={1.8} className="sm:h-3.5 sm:w-3.5" />
            </button>

            <button
                type="button"
                onClick={onDelete}
                aria-label="Delete task"
                title="Delete task"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50/70 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-100/70 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:focus:ring-red-900/50"
            >
                <Trash2 size={13} strokeWidth={1.8} className="sm:h-3.5 sm:w-3.5" />
            </button>
        </div>
    );
}

export default ActionButtons;
