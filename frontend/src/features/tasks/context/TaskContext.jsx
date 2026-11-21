import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { taskService } from "../services/taskService";
import { tagService } from "../services/tagService";
import { convertApiTask } from "../utils/convertApiTask";
import { queryKeys } from "../../../shared/utils/queryKeys";

const TaskContext = createContext(null);

function convertTask(task) {
    const converted = convertApiTask(task);
    const due = task.due_date ? new Date(task.due_date) : null;
    const now = new Date();

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const startOfTomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    );

    let category = "today";

    if (due) {
        if (due < startOfToday) {
            category = "overdue";
        } else if (due >= startOfTomorrow) {
            category = "upcoming";
        }
    }

    return {
        id: converted.id,
        title: converted.title,
        description: converted.description,
        status: converted.status,
        priority: converted.priority,
        dueDate: converted.dueDate,
        dueTime: converted.dueTime,
        tags: converted.tags,
        createdAt: task.created_at,
        category,
    };
}

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [availableTags, setAvailableTags] = useState([]);
    const queryClient = useQueryClient();
    const tasksQuery = useQuery({
        queryKey: queryKeys.defaultTasks,
        queryFn: () => taskService.getTasks(null, "default"),
    });
    const tagsQuery = useQuery({
        queryKey: queryKeys.tags("default"),
        queryFn: () => tagService.getTags({ defaultProject: true }),
    });
    const loading = tasksQuery.isLoading || tagsQuery.isLoading;
    const error = tasksQuery.isError || tagsQuery.isError ? "Unable to load tasks." : null;

    useEffect(() => {
        if (tasksQuery.data) setTasks(tasksQuery.data.map(convertTask));
    }, [tasksQuery.data]);

    useEffect(() => {
        if (tagsQuery.data) setAvailableTags(tagsQuery.data);
    }, [tagsQuery.data]);

    const loadInitialData = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.defaultTasks }),
            queryClient.invalidateQueries({ queryKey: queryKeys.tags("default") }),
        ]);
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                setTasks,

                searchTerm,
                setSearchTerm,

                availableTags,
                setAvailableTags,

                loading,
                error,

                loadInitialData,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTaskData() {
    const context = useContext(TaskContext);

    if (context === null) {
        throw new Error(
            "useTaskData must be used inside TaskProvider"
        );
    }

    return context;
}