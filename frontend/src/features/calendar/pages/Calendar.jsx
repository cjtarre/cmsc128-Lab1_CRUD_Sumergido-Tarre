import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { formatDueTime } from "../../../shared/utils/dateUtils";
import { useTaskData } from "../../tasks/context/TaskContext";
import useTasks from "../../tasks/hooks/useTasks";
import { createTaskHandlers } from "../../tasks/handlers/taskHandlers";
import { STATUS } from "../../tasks/constants/taskOptions";
import taskStyles from "../../tasks/styles/taskStyles";
import TaskDetails from "../../tasks/components/TaskDetails";
import EditTask from "../../tasks/components/EditTask";
import DeleteTask from "../../tasks/components/DeleteTask";
import SelectedDayPanel from "../components/SelectedDayPanel";
import AddTask from "../../tasks/components/AddTask";

function Calendar() {
    const { tasks, setTasks } = useTaskData();
    const [searchParams] = useSearchParams();

    const getInitialDate = () => {
        const param = searchParams.get("date");
        if (!param) return new Date();

        const [year, month, day] = param.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const isValid = year && month && day && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

        return isValid ? date : new Date();
    };

    const initialDate = getInitialDate();

    const [currentDate, setCurrentDate] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    const taskActions = useTasks(tasks, setTasks);
    const handlers = createTaskHandlers({ ...taskActions, setSelectedTask, setTaskToEdit, setTaskToDelete, setIsAddTaskOpen });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const days = Array(firstDay).fill(null);
        for (let day = 1; day <= daysInMonth; day++) days.push(day);
        return days;
        // eslint-disable-next-line react-hooks/preserve-manual-memoization
    }, [firstDay, daysInMonth]);

    const changeMonth = (offset) => {
        const date = new Date(year, month + offset, 1);
        setCurrentDate(date);
        setSelectedDate(date);
    };

    const goToToday = () => {
        const date = new Date();
        setCurrentDate(date);
        setSelectedDate(date);
    };

    const getTasksForDate = (date) => {
        const value = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        return tasks.filter((task) => task.dueDate === value);
    };

    const getTasksForDay = (day) => day ? getTasksForDate(new Date(year, month, day)) : [];

    const today = new Date();
    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
    const selectedDayTasks = getTasksForDate(selectedDate);
    const selectedDateValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    return (
        <div className="space-y-6 text-slate-800 dark:text-slate-100 sm:space-y-7">
            {/* Calendar header */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold leading-tight tracking-tight text-slate-800 dark:text-white sm:text-2xl">Calendar</h1>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">View and manage your tasks by date.</p>
                </div>

                <div className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/55 p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55 dark:shadow-black/20">
                    <button type="button" onClick={goToToday} className="h-9 rounded-xl px-3 text-xs font-medium text-slate-500 transition hover:bg-white/70 hover:text-green-600 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-green-400">Today</button>

                    <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/70 hover:text-green-600 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-green-400">
                        <ChevronLeft size={16} />
                    </button>

                    <h2 className="min-w-32 px-1 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{monthName} {year}</h2>

                    <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/70 hover:text-green-600 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-green-400">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </header>

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
                {/* Main calendar */}
                <div className="min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_10px_35px_rgba(15,23,42,0.055)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20">
                    {/* Weekday labels */}
                    <div className="grid grid-cols-7 border-b border-slate-100/80 bg-white/35 dark:border-white/[0.07] dark:bg-white/[0.02]">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                            <div key={day} className={`px-1 py-2.5 text-center text-[9px] font-semibold uppercase tracking-wide sm:px-3 sm:py-3 sm:text-xs ${index === 0 || index === 6 ? "text-slate-300 dark:text-slate-600" : "text-slate-400 dark:text-slate-500"}`}>
                                <span className="sm:hidden">{day[0]}</span>
                                <span className="hidden sm:inline">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, index) => {
                            const dayTasks = getTasksForDay(day);
                            const isToday = isCurrentMonth && day === today.getDate();
                            const isSelected = day && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                            const isLastColumn = (index + 1) % 7 === 0;

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!day}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={`flex min-h-20 flex-col items-stretch justify-start border-b border-slate-100/80 p-1.5 text-left transition dark:border-white/[0.07] sm:min-h-32 sm:p-3 ${!isLastColumn ? "border-r dark:border-white/[0.07]" : ""} ${isToday ? "bg-green-50/45 dark:bg-green-950/20" : "bg-white/25 dark:bg-transparent"} ${isSelected ? "relative z-10 ring-2 ring-inset ring-green-300/80 dark:ring-green-600/70" : day ? "hover:bg-green-50/25 dark:hover:bg-white/[0.025]" : ""}`}
                                >
                                    {day && (
                                        <>
                                            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-medium sm:text-sm ${isToday ? "bg-green-500 font-semibold text-white shadow-sm" : isSelected ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>{day}</span>

                                            <div className="mt-1 space-y-1 sm:mt-2 sm:space-y-1.5">
                                                {dayTasks.slice(0, dayTasks.length > 3 ? 2 : 3).map((task) => (
                                                    <div key={task.id} className={`overflow-hidden rounded-md px-1 py-1 text-[8px] sm:px-2 sm:py-1.5 sm:text-[10px] ${taskStyles.priority[task.priority] || "bg-slate-100/80 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500"}`}>
                                                        <p className={`truncate font-semibold ${task.status === STATUS.COMPLETED ? "line-through opacity-60" : ""}`}>{task.title}</p>
                                                        <p className="mt-0.5 hidden truncate opacity-70 sm:block">{formatDueTime(task.dueTime)}</p>
                                                    </div>
                                                ))}

                                                {dayTasks.length > 3 && <div className="overflow-hidden rounded-md bg-slate-100/70 px-1 py-1 text-[8px] font-semibold text-slate-500 dark:bg-white/[0.05] dark:text-slate-400 sm:px-2 sm:py-1.5 sm:text-[10px]">+{dayTasks.length - 2} more</div>}
                                            </div>
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected date tasks */}
                <SelectedDayPanel date={selectedDate} tasks={selectedDayTasks} onTaskClick={setSelectedTask} onToggleComplete={handlers.handleToggleComplete} onAddTask={() => setIsAddTaskOpen(true)} />
            </div>

            {/* Task modals */}
            {selectedTask && <TaskDetails task={selectedTask} onClose={handlers.handleCloseTaskDetails} onEdit={() => handlers.handleEditTask(selectedTask.id)} onDelete={() => handlers.handleDeleteTask(selectedTask.id)} />}

            <AddTask isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} onSubmit={handlers.handleAddTaskSubmit} initialDueDate={selectedDateValue} />
            <EditTask task={taskToEdit} isOpen={Boolean(taskToEdit)} onClose={handlers.handleCloseEditTask} onSave={handlers.handleUpdateTask} />
            <DeleteTask task={taskToDelete} onConfirm={() => handlers.handleConfirmDelete(taskToDelete)} onCancel={handlers.handleCancelDelete} />
        </div>
    );
}

export default Calendar;