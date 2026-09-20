import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDueTime } from "../../../shared/utils/dateUtils";
import { useTaskData } from "../../tasks/context/TaskContext";
import useTasks from "../../tasks/hooks/useTasks";
import { createTaskHandlers } from "../../tasks/handlers/taskHandlers";
import { STATUS } from "../../tasks/constants/taskOptions";
import taskStyles from "../../tasks/styles/taskStyles";
import TaskDetails from "../../tasks/components/TaskDetails";
import SelectedDayPanel from "../components/SelectedDayPanel";

function Calendar() {
    const { tasks, setTasks } = useTaskData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState(null);

    const taskActions = useTasks(tasks, setTasks);
    const handlers = createTaskHandlers({ ...taskActions, setSelectedTask });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const days = Array(firstDayOfMonth).fill(null);
        for (let day = 1; day <= daysInMonth; day++) days.push(day);
        return days;
    }, [firstDayOfMonth, daysInMonth]);

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const previousMonth = () => {
        const date = new Date(year, month - 1, 1);
        setCurrentDate(date);
        setSelectedDate(date);
    };

    const nextMonth = () => {
        const date = new Date(year, month + 1, 1);
        setCurrentDate(date);
        setSelectedDate(date);
    };

    const getTasksForDay = (day) => {
        if (!day) return [];

        const date = `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
        return tasks.filter((task) => task.dueDate === date);
    };

    const getTasksForDate = (date) => {
        const dateString = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        return tasks.filter((task) => task.dueDate === dateString);
    };

    const today = new Date();
    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
    const selectedDayTasks = getTasksForDate(selectedDate);

    return (
        <div className="px-3 py-5 text-slate-800 dark:text-slate-100 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mb-4 space-y-4 sm:mb-6 sm:flex sm:items-center sm:justify-between sm:space-y-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white sm:text-2xl">
                        Calendar
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                        View your tasks by date.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-1.5 sm:justify-end sm:gap-2">
                    <button
                        type="button"
                        onClick={goToToday}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:px-4 sm:text-sm"
                    >
                        Today
                    </button>

                    <button
                        type="button"
                        onClick={previousMonth}
                        aria-label="Previous month"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <h2 className="min-w-0 flex-1 text-center text-sm font-semibold text-slate-800 dark:text-slate-100 sm:min-w-40 sm:flex-none sm:text-lg">
                        {monthName} {year}
                    </h2>

                    <button
                        type="button"
                        onClick={nextMonth}
                        aria-label="Next month"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
                <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl">
                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="border-r border-slate-200 px-1 py-2 text-center text-[9px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-500 sm:px-3 sm:py-3 sm:text-xs"
                            >
                                <span className="sm:hidden">{day.charAt(0)}</span>
                                <span className="hidden sm:inline">{day}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, index) => {
                            const dayTasks = getTasksForDay(day);
                            const isToday = isCurrentMonth && day === today.getDate();
                            const isSelected =
                                day &&
                                selectedDate.getDate() === day &&
                                selectedDate.getMonth() === month &&
                                selectedDate.getFullYear() === year;

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!day}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={`min-h-20 border-b border-r border-slate-200 p-1.5 text-left transition dark:border-slate-700 sm:min-h-32 sm:p-3 ${
                                        isToday
                                            ? "bg-green-50/50 dark:bg-green-950/30"
                                            : "bg-white dark:bg-slate-900"
                                    } ${
                                        isSelected
                                            ? "ring-2 ring-inset ring-green-300 dark:ring-green-600"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {day && (
                                        <>
                                            <span
                                                className={`text-[10px] font-medium sm:text-sm ${
                                                    isToday
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-slate-600 dark:text-slate-300"
                                                }`}
                                            >
                                                {day}
                                            </span>

                                            <div className="mt-1 space-y-1 sm:mt-2 sm:space-y-1.5">
                                                {dayTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className={`overflow-hidden rounded-md px-1 py-1 text-[8px] sm:px-2 sm:py-1.5 sm:text-[10px] ${
                                                            taskStyles.priority[task.priority] ||
                                                            "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                                        }`}
                                                    >
                                                        <p
                                                            className={`truncate font-semibold ${
                                                                task.status === STATUS.COMPLETED
                                                                    ? "line-through opacity-60"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {task.title}
                                                        </p>

                                                        <p className="mt-0.5 hidden truncate opacity-70 sm:block">
                                                            {formatDueTime(task.dueTime)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <SelectedDayPanel
                    date={selectedDate}
                    tasks={selectedDayTasks}
                    onTaskClick={setSelectedTask}
                />
            </div>

            {selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    onClose={handlers.handleCloseTaskDetails}
                    onEdit={() => handlers.handleEditTask(selectedTask.id)}
                    onDelete={() => handlers.handleDeleteTask(selectedTask.id)}
                />
            )}
        </div>
    );
}

export default Calendar;