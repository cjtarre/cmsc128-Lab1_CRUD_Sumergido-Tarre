import { useMemo, useState } from "react";

import { TASK_FILTER_KEYS } from "../constants/taskFilterOptions";
import { filterProjectTasks, getTaskTags } from "../utils/taskFilters";
import { DUEDATE_SORT_CYCLE, DUEDATE_SORT_MODES, TAG_SORT_MODES, TASK_SORT_CYCLE, getNextSort, sortTasksByDueDateColumn, sortTasksByTagColumn, sortTasksByTaskColumn } from "../utils/taskUtils";

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
        if (activeSort.column === "tag") return sortTasksByTagColumn(filtered, activeSort.mode);
        return activeSort.column === "task" ? sortTasksByTaskColumn(filtered, activeSort.mode) : sortTasksByDueDateColumn(filtered, activeSort.mode);
    }, [tasks, searchTerm, assigneeFilter, statusFilter, priorityFilter, tagFilter, activeSort]);

    const filters = { assignee: assigneeFilter, status: statusFilter, priority: priorityFilter, tag: tagFilter };
    const setters = { assignee: setAssigneeFilter, status: setStatusFilter, priority: setPriorityFilter, tag: setTagFilter };
    const filterChangeHandlers = Object.fromEntries(TASK_FILTER_KEYS.map((key) => [
        key,
        (event) => setters[key](event.target.value),
    ]));

    const activeFilterCount = TASK_FILTER_KEYS.filter((key) => Boolean(filters[key])).length;
    const hasFilters = Boolean(searchTerm || activeFilterCount);

    const clearFilters = () => { setSearchTerm(""); setAssigneeFilter(""); setStatusFilter(""); setPriorityFilter(""); setTagFilter(""); };
    const handleSortTask = () => setActiveSort((previous) => getNextSort(previous, "task", TASK_SORT_CYCLE));
    const handleSortDueDate = () => setActiveSort((previous) => getNextSort(previous, "dueDate", DUEDATE_SORT_CYCLE));
    const handleSortTag = (mode) => setActiveSort(mode === TAG_SORT_MODES.ASC || mode === TAG_SORT_MODES.DESC
        ? { column: "tag", mode }
        : { column: "dueDate", mode: DUEDATE_SORT_MODES.DUE_ASC });

    return { searchTerm, setSearchTerm, filters, setters, filterChangeHandlers, activeSort, tags, displayedTasks, activeFilterCount, hasFilters, clearFilters, handleSortTask, handleSortDueDate, handleSortTag };
}