import { createContext, useContext, useState } from "react";
import mockTasks from "../data/mockTasks";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState(mockTasks);
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <TaskContext.Provider
            value={{
                tasks,
                setTasks,
                searchTerm,
                setSearchTerm,
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
        throw new Error("useTaskData must be used inside TaskProvider");
    }

    return context;
}