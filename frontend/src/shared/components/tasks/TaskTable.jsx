import TaskRow from "./TaskRow";

function TaskTable({
    tasks,
    onToggleComplete,
    onStatusChange,
    onEdit,
    onDelete,
    onView,
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[minmax(0,2.3fr)_1.3fr_0.8fr_1fr_0.8fr_0.8fr] items-center gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                {["Task", "Due Date", "Priority", "Status", "Tag"].map((label) => (
                    <span
                        key={label}
                        className="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                    >
                        {label}
                    </span>
                ))}

                <span className="text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                </span>
            </div>

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
                        tagId={task.tagId}
                        onToggleComplete={() => onToggleComplete(task.id)}
                        onStatusChange={(status) =>
                            onStatusChange(task.id, status)
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