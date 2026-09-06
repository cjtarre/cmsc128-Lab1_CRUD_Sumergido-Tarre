import { STATUS } from "../shared/constants/taskOptions";

function useTasks(tasks, setTasks) {
    const getTask = (id) => {
        return tasks.find((task) => task.id === id);
    };

    const addTask = (task) => {
        setTasks((previous) => [
            ...previous,
            {
                ...task,
                id: Date.now(),
            },
        ]);
    };

    const updateTask = (updatedTask) => {
        setTasks((previous) =>
            previous.map((task) =>
                task.id === updatedTask.id
                    ? {
                        ...task,
                        ...updatedTask,
                    }
                    : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks((previous) =>
            previous.filter(
                (task) => task.id !== id
            )
        );
    };

    const updateTaskStatus = (id, status) => {
        setTasks((previous) =>
            previous.map((task) =>
                task.id === id
                    ? {
                        ...task,
                        status,
                    }
                    : task
            )
        );
    };

    const toggleTaskComplete = (id) => {
        setTasks((previous) =>
            previous.map((task) =>
                task.id === id
                    ? {
                        ...task,
                        status:
                            task.status === STATUS.COMPLETED
                                ? STATUS.NOT_STARTED
                                : STATUS.COMPLETED,
                    }
                    : task
            )
        );
    };

    return {
        getTask,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        toggleTaskComplete,
    };
}

export default useTasks;