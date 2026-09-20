import { Pencil, Trash2 } from "lucide-react";

function ActionButtons({ onEdit, onDelete }) {
    return (
        <div className="flex items-center justify-end gap-1">
            <button
                type="button"
                onClick={onEdit}
                aria-label="Edit task"
                title="Edit task"
                className="rounded-lg p-1.5 text-slate-400 transition duration-200 hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
                <Pencil size={15} />
            </button>

            <button
                type="button"
                onClick={onDelete}
                aria-label="Delete task"
                title="Delete task"
                className="rounded-lg p-1.5 text-red-400 transition duration-200 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            >
                <Trash2 size={15} />
            </button>
        </div>
    );
}

export default ActionButtons;