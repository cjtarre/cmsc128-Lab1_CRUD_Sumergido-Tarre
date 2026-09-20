import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import calendarStyles from "../styles/calendarStyles";

function CalendarWidget({ tasks = [] }) {
    const today = new Date();

    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );

    const [selectedDate, setSelectedDate] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const changeMonth = (offset) => {
        setCurrentDate(new Date(year, month + offset, 1));
        setSelectedDate(null);
    };

    const isToday = (day) =>day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const getTaskPriority = (day) => {
        const date = `${String(day).padStart(2, "0")}/${String(  month + 1 ).padStart(2, "0")}/${year}`;

        const priorities = tasks
            .filter((task) => task.dueDate === date)
            .map((task) => task.priority);

        if (priorities.includes(3)) return "high";
        if (priorities.includes(2)) return "medium";
        if (priorities.includes(1)) return "low";

        return null;
    };

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {monthName} {year}
                </h2>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        aria-label="Previous month"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-100 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 dark:focus:ring-green-900"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        aria-label="Next month"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-100 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 dark:focus:ring-green-900"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                {weekdays.map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const priority = getTaskPriority(day);
                    const todayDate = isToday(day);
                    const selected = selectedDate === day;

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => {
                                setSelectedDate(day);
                            }}
                            className={`relative flex h-9 w-full items-center justify-center rounded-lg text-xs transition ${
                                todayDate
                                    ? `${calendarStyles.today} dark:bg-green-950/40`
                                    : selected
                                    ? `${calendarStyles.selected} dark:bg-slate-800`
                                    : `${calendarStyles.day} dark:text-slate-300 dark:hover:bg-slate-800`
                            }`}
                        >
                            {day}

                            {priority && (
                                <span
                                    className={`absolute bottom-1 h-1 w-1 rounded-full ${calendarStyles.priorityDot[priority]}`}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex items-center justify-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-700">
                {[
                    ["low", "Low"],
                    ["medium", "Medium"],
                    ["high", "High"],
                ].map(([priority, label]) => (
                    <div
                        key={priority}
                        className="flex items-center gap-1.5"
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${calendarStyles.priorityDot[priority]}`}
                        />

                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            <Link
                to="/calendar"
                className="mt-4 block w-full text-center text-xs font-medium text-green-600 transition hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
                View Calendar →
            </Link>
        </div>
    );
}

export default CalendarWidget;