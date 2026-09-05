import { useMemo, useState } from "react";
import {ChevronLeft, ChevronRight,} from "lucide-react";

function Calendar() {
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

        // Empty cells before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Days of the current month
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

    return (
        <div className="px-8 py-8">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Calendar
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        View your tasks by date.
                    </p>
                </div>

                {/* Month Navigation */}
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

            {/* Calendar Container */}
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

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className="min-h-28 border-b border-r border-slate-200 p-3"
                        >
                            {day && (
                                <span className="text-sm font-medium text-slate-600">
                                    {day}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Calendar;