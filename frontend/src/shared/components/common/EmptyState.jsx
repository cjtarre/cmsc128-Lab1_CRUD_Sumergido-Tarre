import { ListTodo, Plus } from "lucide-react";

function EmptyState({
    title = "No tasks yet",
    description = "You don't have any tasks here yet.",
    actionLabel = "Add Task",
    onAction,
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-30 text-center">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500">
                <ListTodo size={26} />
            </div>

            {/* Text */}
            <h2 className="mt-4 text-lg font-semibold text-slate-800">
                {title}
            </h2>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
                {description}
            </p>

            {/* Action */}
            {onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-600"
                >
                    <Plus size={17} />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export default EmptyState;