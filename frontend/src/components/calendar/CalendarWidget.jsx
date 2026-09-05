import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CalendarWidget() {
    const today = new Date();
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1));

    const [selectedDate, setSelectedDate] = useState(null);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",});

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const taskDates = {
        2: "high",
        4: "high",
        7: "low",
    };

    const previousMonth = () => {
        setCurrentDate(
            new Date(year, month - 1, 1)
        );
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(
            new Date(year, month + 1, 1)
        );
        setSelectedDate(null);
    };

    const isToday = (day) => {
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const isSelected = (day) => {
        return selectedDate === day;
    };

    const priorityStyles = {
        low: "bg-green-400",
        medium: "bg-yellow-400",
        high: "bg-red-400",
    };

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                    {monthName} {year}
                </h2>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={previousMonth}
                        aria-label="Previous month"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={nextMonth}
                        aria-label="Next month"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty spaces before first day */}
                {Array.from(
                    { length: firstDayOfMonth },
                    (_, index) => (
                        <div key={`empty-${index}`} />
                    )
                )}

                {/* Days */}
                {Array.from(
                    { length: daysInMonth },
                    (_, index) => {
                        const day = index + 1;

                        const taskPriority =
                            taskDates[day];

                        const todayDate = isToday(day);
                        const selected = isSelected(day);

                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={() => navigate("/calendar")}
                                className={`relative flex h-9 w-full items-center justify-center rounded-lg text-xs transition ${
                                    todayDate
                                        ? "bg-green-500 font-semibold text-white"
                                        : selected
                                        ? "bg-green-50 font-semibold text-green-600 ring-1 ring-green-200"
                                        : "text-slate-600 hover:bg-green-50 hover:text-green-600"
                                }`}
                            >
                                {day}

                                {taskPriority && (
                                    <span
                                        className={`absolute bottom-1 h-1 w-1 rounded-full ${
                                            todayDate
                                                ? "bg-white"
                                                : priorityStyles[
                                                      taskPriority
                                                  ]
                                        }`}
                                    />
                                )}
                            </button>
                        );
                    }
                )}
            </div>

            {/* Legend */}
            <div className="mt-5 flex items-center justify-center gap-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-[10px] text-slate-500">
                        Low
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="text-[10px] text-slate-500">
                        Medium
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-[10px] text-slate-500">
                        High
                    </span>
                </div>
            </div>

            {/* Full Calendar */}
            <Link
                to="/calendar"
                className="mt-4 block w-full text-center text-xs font-medium text-green-600 transition hover:text-green-700"
            >
                View Calendar →
            </Link>
        </div>
    );
}

export default CalendarWidget;