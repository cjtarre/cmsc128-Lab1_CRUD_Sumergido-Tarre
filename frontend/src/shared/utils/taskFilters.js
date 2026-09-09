import { STATUS } from "../constants/taskOptions";
import { getTaskCategory } from "./dateUtils";

export function filterTasks(
    tasks,
    filter,
    searchTerm,
    priorityFilter,
    statusFilter,
    tagFilter
) {
    const search = (searchTerm || "").trim().toLowerCase();

    return tasks.filter((task) => {
        const title = task.title?.toLowerCase() || "";
        const description = task.description?.toLowerCase() || "";
        const tagNames =
            task.tags?.map((tag) => tag.tag_name.toLowerCase()) || [];

        if (
            search &&
            !title.includes(search) &&
            !description.includes(search) &&
            !tagNames.some((name) => name.includes(search))
        ) {
            return false;
        }

        if (
            priorityFilter.length > 0 &&
            !priorityFilter.includes(task.priority)
        ) {
            return false;
        }

        if (
            statusFilter.length > 0 &&
            !statusFilter.includes(task.status)
        ) {
            return false;
        }

        if (
            tagFilter.length > 0 &&
            !task.tags?.some((tag) => tagFilter.includes(tag.tag_id))
        ) {
            return false;
        }

        if (filter === "completed") {
            return task.status === STATUS.COMPLETED;
        }

        if (task.status === STATUS.COMPLETED) {
            return false;
        }

        if (filter === "all") {
            return true;
        }

        return getTaskCategory(task.dueDate) === filter;
    });
}