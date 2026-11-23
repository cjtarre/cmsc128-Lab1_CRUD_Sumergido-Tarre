import { TAG_SORT_MODES, dueDateSortLabels, taskSortLabels } from "../../utils/taskUtils";
import TaskFilterSelect from "./TaskFilterSelect";

// A single sorting control shared by personal and collaborative task lists.
function TaskTagSortSelect({ activeSort, onSortChange, className = "w-full lg:w-[120px]", nested = false }) {
    const currentLabel = activeSort.column === "dueDate"
        ? `Sort: ${dueDateSortLabels[activeSort.mode] || "Due"}`
        : activeSort.column === "task"
            ? `Sort: ${taskSortLabels[activeSort.mode] || "Task"}`
            : "Sort: Due ↑";

    return (
        <TaskFilterSelect
            value={activeSort.column === "tag" ? activeSort.mode : ""}
            onChange={(event) => onSortChange(event.target.value)}
            className={className}
            ariaLabel="Sort tasks by tag"
            nested={nested}
        >
            <option value="">{currentLabel}</option>
            <option value={TAG_SORT_MODES.ASC}>Tag A-Z</option>
            <option value={TAG_SORT_MODES.DESC}>Tag Z-A</option>
        </TaskFilterSelect>
    );
}

export default TaskTagSortSelect;
