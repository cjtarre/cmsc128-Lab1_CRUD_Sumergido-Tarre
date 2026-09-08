import TaskRow from "./TaskRow";
import SortButtonToggle from "./TaskColumnSort";
import { TASK_SORT_MODES, DUEDATE_SORT_MODES } from "../../utils/taskUtils";

const taskSortLabels = {
    [TASK_SORT_MODES.TITLE_ASC]: "A-Z",
    [TASK_SORT_MODES.TITLE_DESC]: "Z-A",
    [TASK_SORT_MODES.PRIORITY_ASC]: "Low-High",
    [TASK_SORT_MODES.PRIORITY_DESC]: "High-Low",
};

const dueDateSortLabels = {
    [DUEDATE_SORT_MODES.DUE_ASC]: "Due ↑",
    [DUEDATE_SORT_MODES.DUE_DESC]: "Due ↓",
    [DUEDATE_SORT_MODES.CRE_ASC]: "Added ↑",
    [DUEDATE_SORT_MODES.CRE_DESC]: "Added ↓",
};

function TaskTable({
    tasks,
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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <div className="min-w-[640px]">
                <div className="grid grid-cols-[minmax(0,2.5fr)_1fr_2fr_44px] items-center gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                    <SortButtonToggle 
                        label="Task"
                        activeLabel={
                            activeSort.column === "task"
                                ? taskSortLabels[activeSort.mode]
                                : null
                        }
                        onClick={onSortTask}
                    />
                            
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Status
                    </span>
                    

                    <SortButtonToggle
                        label="Due Date"
                        activeLabel={
                            activeSort.column === "dueDate"
                                ? dueDateSortLabels[activeSort.mode]
                                : null
                        }
                        onClick={onSortDueDate}
                    />


                    {/* {["Task", "Status", "Due Date"].map((label) => (
                        <span
                            key={label}
                            className="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                        >
                            {label}
                        </span>
                    ))} */}

                    {/* <span className="text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Actions
                    </span> */}
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
                            tags={task.tags}
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
        </div>
    );
}

export default TaskTable;