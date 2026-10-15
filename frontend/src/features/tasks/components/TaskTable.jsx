import TaskRow from "./TaskRow";
import SortButtonToggle from "./TaskColumnSort";
import { taskSortLabels, dueDateSortLabels } from "../utils/taskUtils";

function TaskTable({
    tasks,
    scrollable = false,
    highlightedTaskId = null,
    activeSort,
    onSortTask,
    onSortDueDate,
    onToggleComplete,
    onStatusChange,
    onEdit,
    onDelete,
    onView,
}) {
    return (
        <div className="min-w-0">
            <div className="hidden grid-cols-[minmax(0,2.3fr)_minmax(110px,0.9fr)_minmax(180px,1.2fr)_44px] items-center gap-4 border-b border-slate-200/60 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.025] sm:grid">
                <SortButtonToggle
                    label="Task"
                    activeLabel={activeSort.column === "task" ? taskSortLabels[activeSort.mode] : null}
                    onClick={onSortTask}
                />

                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Status
                </span>

                <SortButtonToggle
                    label="Due Date"
                    activeLabel={activeSort.column === "dueDate" ? dueDateSortLabels[activeSort.mode] : null}
                    onClick={onSortDueDate}
                />

                <span />
            </div>

            <div className={`divide-y divide-slate-100/80 dark:divide-white/[0.07] ${scrollable ? "max-h-[430px] overflow-y-auto" : ""}`}>
                {tasks.map((task) => (
                    <TaskRow
                        key={task.id}
                        {...task}
                        highlighted={String(task.id) === String(highlightedTaskId)}
                        onToggleComplete={() => onToggleComplete(task.id)}
                        onStatusChange={(status) => onStatusChange(task.id, status)}
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