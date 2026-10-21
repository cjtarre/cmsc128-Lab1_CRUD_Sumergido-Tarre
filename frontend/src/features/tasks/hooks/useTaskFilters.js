import { useMemo, useState } from "react";

import { filterProjectTasks, getTaskTags } from "../utils/taskFilters";
import { DUEDATE_SORT_CYCLE, DUEDATE_SORT_MODES, TASK_SORT_CYCLE, getNextSort, sortTasksByDueDateColumn, sortTasksByTaskColumn } from "../utils/taskUtils";

// Manage project-list filtering and sorting.
export function useTaskFilters(tasks) {
    const [searchTerm, setSearchTerm] = useState("");
    const [assigneeFilter, setAssigneeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [activeSort, setActiveSort] = useState({ column: "dueDate", mode: DUEDATE_SORT_MODES.DUE_ASC });

    const tags = useMemo(() => getTaskTags(tasks), [tasks]);
    const displayedTasks = useMemo(() => {
        const filtered = filterProjectTasks(tasks, { searchTerm, assigneeFilter, statusFilter, priorityFilter, tagFilter });
        return activeSort.column === "task" ? sortTasksByTaskColumn(filtered, activeSort.mode) : sortTasksByDueDateColumn(filtered, activeSort.mode);
    }, [tasks, searchTerm, assigneeFilter, statusFilter, priorityFilter, tagFilter, activeSort]);

    const activeFilterCount = [assigneeFilter, statusFilter, priorityFilter, tagFilter].filter(Boolean).length;
    const hasFilters = Boolean(searchTerm || activeFilterCount);

    const clearFilters = () => { setSearchTerm(""); setAssigneeFilter(""); setStatusFilter(""); setPriorityFilter(""); setTagFilter(""); };
    const handleSortTask = () => setActiveSort((previous) => getNextSort(previous, "task", TASK_SORT_CYCLE));
    const handleSortDueDate = () => setActiveSort((previous) => getNextSort(previous, "dueDate", DUEDATE_SORT_CYCLE));

    const filters = { assignee: assigneeFilter, status: statusFilter, priority: priorityFilter, tag: tagFilter };
    const setters = { assignee: setAssigneeFilter, status: setStatusFilter, priority: setPriorityFilter, tag: setTagFilter };

    return { searchTerm, setSearchTerm, filters, setters, activeSort, tags, displayedTasks, activeFilterCount, hasFilters, clearFilters, handleSortTask, handleSortDueDate };
}