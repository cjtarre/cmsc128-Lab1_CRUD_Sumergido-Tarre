import { STATUS } from "../constants/taskOptions";
import { getTaskCategory } from "../../../shared/utils/dateUtils";

// Filter tasks by date category and standard task filters.
export function filterTasks(tasks, filter, searchTerm, priorityFilter, statusFilter, tagFilter) {
    const search = (searchTerm || "").trim().toLowerCase();

    return tasks.filter((task) => {
        const title = task.title?.toLowerCase() || "";
        const description = task.description?.toLowerCase() || "";
        const tagNames = task.tags?.map((tag) => tag.tag_name?.toLowerCase() || "") || [];

        if (search && !title.includes(search) && !description.includes(search) && !tagNames.some((name) => name.includes(search))) return false;
        if (priorityFilter.length && !priorityFilter.includes(task.priority)) return false;
        if (statusFilter.length && !statusFilter.includes(task.status)) return false;
        if (tagFilter.length && !task.tags?.some((tag) => tagFilter.includes(tag.tag_id))) return false;

        if (filter === "all") return true;
        if (filter === "completed") return task.status === STATUS.COMPLETED;
        if (task.status === STATUS.COMPLETED) return false;

        return getTaskCategory(task.dueDate) === filter;
    });
}

// Filter project-list tasks by its toolbar filters.
export function filterProjectTasks(tasks, { searchTerm, assigneeFilter, statusFilter, priorityFilter, tagFilter }) {
    const search = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
        const matchesSearch = !search || task.title?.toLowerCase().includes(search) || task.description?.toLowerCase().includes(search);
        const matchesAssignee = !assigneeFilter || (assigneeFilter === "unassigned" ? !task.assigneeId : String(task.assigneeId) === assigneeFilter);
        const matchesStatus = !statusFilter || task.status === statusFilter;
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        const matchesTag = !tagFilter || (task.tags || []).some((tag) => String(typeof tag === "object" ? tag.tag_id : tag) === tagFilter);
        return matchesSearch && matchesAssignee && matchesStatus && matchesPriority && matchesTag;
    });
}

// Return unique tags currently used by tasks.
export function getTaskTags(tasks) {
    const tags = new Map();

    tasks.forEach((task) => (task.tags || []).forEach((tag) => {
        const id = typeof tag === "object" ? tag.tag_id : tag;
        const name = typeof tag === "object" ? tag.tag_name || tag.name : String(tag);
        if (id != null) tags.set(String(id), name);
    }));

    return [...tags.entries()].map(([id, name]) => ({ id, name }));
}

// Calculate task counts and overall completion progress.
export function getTaskStats(tasks) {
    const completed = tasks.filter((task) => task.status === STATUS.COMPLETED).length;
    const overdue = tasks.filter((task) => task.status !== STATUS.COMPLETED && getTaskCategory(task.dueDate) === "overdue").length;
    const active = tasks.length - completed;
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    return { total: tasks.length, active, completed, overdue, progress };
}