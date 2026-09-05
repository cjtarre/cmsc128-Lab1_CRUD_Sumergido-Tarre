import TaskRow from "./TaskRow";

function TaskTable({
    tasks,
    onToggleComplete,
    onEdit,
    onDelete,
    onView,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[minmax(0,2.5fr)_1.3fr_0.8fr_1fr_0.8fr] items-center gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Task
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Due Date
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Priority
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Tag
                </span>

                <span className="text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                </span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100">
                {tasks.map((task) => (
                    <TaskRow
                        key={task.id}
                        title={task.title}
                        description={task.description}
                        status={task.status}
                        priority={task.priority}
                        dueDate={task.dueDate}
                        dueTime={task.dueTime}
                        tag={task.tag}
                        onToggleComplete={() =>
                            onToggleComplete(task.id)
                        }
                        onEdit={() => onEdit(task.id)}
                        onDelete={() => onDelete(task.id)}
                        onView={() => onView(task.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default TaskTable;