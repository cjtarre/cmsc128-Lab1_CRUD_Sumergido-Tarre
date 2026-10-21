import TaskRow from "./TaskRow";
import SortButtonToggle from "../filters/TaskColumnSort";
import { taskSortLabels, dueDateSortLabels } from "../../utils/taskUtils";

function TaskTable({
    tasks,
    scrollable = false,
    highlightedTaskId = null,
    collaborative = false,
    activeSort,
    onSortTask,
    onSortDueDate,
    onToggleComplete,
    onStatusChange,
    onEdit,
    onDelete,
    onView,
}) {
    const gridColumns = collaborative
        ? "sm:grid-cols-[minmax(180px,2fr)_minmax(100px,0.9fr)_minmax(95px,0.8fr)_minmax(75px,0.65fr)_minmax(135px,1.05fr)_minmax(110px,1fr)_44px]"
        : "sm:grid-cols-[minmax(0,2.3fr)_minmax(110px,0.9fr)_minmax(180px,1.2fr)_44px]";

    return (
        <div className="min-w-0">
            <div className={`hidden items-center gap-3 border-b border-slate-200/60 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.025] sm:grid ${gridColumns}`}>
                <SortButtonToggle
                    label="Task"
                    activeLabel={activeSort.column === "task" ? taskSortLabels[activeSort.mode] : null}
                    onClick={onSortTask}
                />

                {collaborative && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Assignee
                    </span>
                )}

                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Status
                </span>

                {collaborative && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Priority
                    </span>
                )}

                <SortButtonToggle
                    label="Due"
                    activeLabel={activeSort.column === "dueDate" ? dueDateSortLabels[activeSort.mode] : null}
                    onClick={onSortDueDate}
                />

                {collaborative && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Tags
                    </span>
                )}

                <span />
            </div>

            <div className={`divide-y divide-slate-100/80 dark:divide-white/[0.07] ${scrollable ? "max-h-[430px] overflow-y-auto" : ""}`}>
                {tasks.map((task) => (
                    <TaskRow
                        key={task.id}
                        {...task}
                        collaborative={collaborative}
                        highlighted={String(task.id) === String(highlightedTaskId)}
                        onToggleComplete={onToggleComplete ? () => onToggleComplete(task.id) : undefined}
                        onStatusChange={onStatusChange ? (status) => onStatusChange(task.id, status) : undefined}
                        onEdit={onEdit ? () => onEdit(task.id) : undefined}
                        onDelete={onDelete ? () => onDelete(task.id) : undefined}
                        onView={onView ? () => onView(task.id) : undefined}
                    />
                ))}
            </div>
        </div>
    );
}

export default TaskTable;

