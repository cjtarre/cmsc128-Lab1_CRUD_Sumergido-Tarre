import { createContext, useContext, useEffect, useState } from "react";

import { taskService } from "../../services/taskService";
import { tagService } from "../../services/tagService";

const TaskContext = createContext(null);

function convertTask(task) {
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

    const tags =
        task.task_tag
            ?.map((item) => item.tags)
            .filter(Boolean) || [];

    return {
        id: task.task_id,
        title: task.task_name,
        description: task.task_info || "",
        status: task.status,
        priority: task.priority_level,

        dueDate: due
            ? due.toLocaleDateString("en-GB")
            : "",

        dueTime: due
            ? due.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "",

        tags,
        createdAt: task.created_at,
        category,
    };
}

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [availableTags, setAvailableTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [fetchedTasks, fetchedTags] = await Promise.all([
                taskService.getTasks(),
                tagService.getTags(),
            ]);

            const convertedTasks = fetchedTasks.map(convertTask);

            setTasks(convertedTasks);
            setAvailableTags(fetchedTags);
        } catch (error) {
            console.error("Error loading tasks:", error);
            setError("Unable to load tasks.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadInitialData();
    }, []);

    return (
        <TaskContext.Provider
            value={{
                tasks,
                setTasks,

                searchTerm,
                setSearchTerm,

                availableTags,

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