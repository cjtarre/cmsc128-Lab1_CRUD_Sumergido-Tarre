import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useTaskData } from "../../tasks/context/TaskContext";
import useTasks, { convertApiTask } from "../../tasks/hooks/useTasks";
import { createTaskHandlers } from "../../tasks/handlers/taskHandlers";
import { taskService } from "../../tasks/services/taskService";
import CalendarView from "../components/CalendarView";

function Calendar() {
    const { tasks, setTasks } = useTaskData();
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [searchParams] = useSearchParams();
    const taskActions = useTasks(tasks, setTasks);

    useEffect(() => {
        let active = true;

        const loadAssignedTasks = async () => {
            try {
                const data = await taskService.getTasks(null, "assigned");

                if (active) {
                    setAssignedTasks(data.map(convertApiTask));
                }
            } catch (error) {
                console.error("Error loading assigned project tasks:", error);

                if (active) {
                    setAssignedTasks([]);
                }
            }
        };

        loadAssignedTasks();

        return () => {
            active = false;
        };
    }, []);

    const calendarTasks = useMemo(() => {
        const personalTasks = tasks.map((task) => ({
            ...task,
            calendarSource: "personal",
        }));

        const projectTasks = assignedTasks.map((task) => ({
            ...task,
            calendarSource: "project",
        }));

        return [...personalTasks, ...projectTasks];
    }, [tasks, assignedTasks]);

    const getInitialDate = () => {
        const param = searchParams.get("date");
        if (!param) return new Date();

        const [year, month, day] = param.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const isValid = year && month && day && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

        return isValid ? date : new Date();
    };

    const handlers = createTaskHandlers({
        ...taskActions,
        setSelectedTask: () => {},
        setTaskToEdit: () => {},
        setTaskToDelete: () => {},
        setIsAddTaskOpen: () => {},
    });

    const getTaskProject = (task) => {
        if (task.calendarSource !== "project" || !task.project) return null;

        return {
            name: task.project.project_name,
            icon: task.project.icon,
            accent: task.project.accent,
        };
    };

    return (
        <CalendarView
            tasks={calendarTasks}
            handlers={handlers}
            initialDate={getInitialDate()}
            getTaskProject={getTaskProject}
        />
    );
}

export default Calendar;