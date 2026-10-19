import { useSearchParams } from "react-router-dom";

import { useTaskData } from "../../tasks/context/TaskContext";
import useTasks from "../../tasks/hooks/useTasks";
import { createTaskHandlers } from "../../tasks/handlers/taskHandlers";
import CalendarView from "../components/CalendarView";

function Calendar() {
    const { tasks, setTasks } = useTaskData();
    const [searchParams] = useSearchParams();
    const taskActions = useTasks(tasks, setTasks);

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

    return <CalendarView tasks={tasks} handlers={handlers} initialDate={getInitialDate()} />;
}

export default Calendar;