import TaskRow from "./TaskRow";
import SortButtonToggle from "./TaskColumnSort";
import { taskSortLabels, dueDateSortLabels } from "../../utils/taskUtils";

function TaskTable({
    tasks, activeSort, onSortTask, onSortDueDate,
    onToggleComplete, onStatusChange, onEdit, onDelete, onView,
}) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="min-w-[640px]">
                <div className="grid grid-cols-[minmax(0,2.5fr)_1fr_2fr_44px] items-center gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                    <SortButtonToggle
                        label="Task"
                        activeLabel={activeSort.column === "task" ? taskSortLabels[activeSort.mode] : null}
                        onClick={onSortTask}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Status
                    </span>
                    <SortButtonToggle
                        label="Due Date"
                        activeLabel={activeSort.column === "dueDate" ? dueDateSortLabels[activeSort.mode] : null}
                        onClick={onSortDueDate}
                    />
                    <span />
                </div>

                <div className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            {...task}
                            onToggleComplete={() => onToggleComplete(task.id)}
                            onStatusChange={(status) => onStatusChange(task.id, status)}
                            onEdit={() => onEdit(task.id)}
                            onDelete={() => onDelete(task.id)}
                            onView={() => onView(task.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TaskTable;