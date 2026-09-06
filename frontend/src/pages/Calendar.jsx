import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useTaskData } from "../shared/context/taskContext";
import { formatDueTime } from "../shared/utils/dateUtils";
import { STATUS } from "../shared/constants/taskOptions";

function Calendar() {
    const { tasks } = useTaskData();
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
    });

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        year,
        month,
        1
    ).getDay();

    const calendarDays = useMemo(() => {
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    }, [firstDayOfMonth, daysInMonth]);

    function previousMonth() {
        setCurrentDate(new Date(year, month - 1, 1));
    }

    function nextMonth() {
        setCurrentDate(new Date(year, month + 1, 1));
    }

    function goToToday() {
        setCurrentDate(new Date());
    }

    function getTasksForDay(day) {
        if (!day) return [];

        const date = `${String(day).padStart(2, "0")}/${String(
            month + 1
        ).padStart(2, "0")}/${year}`;

        return tasks.filter((task) => task.dueDate === date);
    }

    function getPriorityStyle(priority) {
        if (priority === 3) {
            return "bg-red-50 text-red-600";
        }

        if (priority === 2) {
            return "bg-yellow-50 text-yellow-600";
        }

        if (priority === 1) {
            return "bg-green-50 text-green-600";
        }

        return "bg-slate-100 text-slate-400";
    }

    return (
        <div className="px-8 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Calendar
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View your tasks by date.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goToToday}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        Today
                    </button>

                    <button
                        type="button"
                        onClick={previousMonth}
                        aria-label="Previous month"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <h2 className="min-w-40 text-center text-lg font-semibold text-slate-800">
                        {monthName} {year}
                    </h2>

                    <button
                        type="button"
                        onClick={nextMonth}
                        aria-label="Next month"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* Weekdays */}
                <div className="grid grid-cols-7 border-b border-slate-200">
                    {[
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                    ].map((day) => (
                        <div
                            key={day}
                            className="border-r border-slate-200 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => {
                        const dayTasks = getTasksForDay(day);

                        return (
                            <div
                                key={index}
                                className="min-h-32 border-b border-r border-slate-200 p-3"
                            >
                                {day && (
                                    <>
                                        <span className="text-sm font-medium text-slate-600">
                                            {day}
                                        </span>

                                        <div className="mt-2 space-y-1.5">
                                            {dayTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={`rounded-md px-2 py-1.5 text-[10px] ${getPriorityStyle(
                                                        task.priority
                                                    )}`}
                                                >
                                                    <p
                                                        className={`font-semibold ${
                                                            task.status ===
                                                            STATUS.COMPLETED
                                                                ? "line-through opacity-60"
                                                                : ""
                                                        }`}
                                                    >
                                                        {task.title}
                                                    </p>

                                                    <p className="mt-0.5 opacity-70">
                                                        {formatDueTime(task.dueTime)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Calendar;