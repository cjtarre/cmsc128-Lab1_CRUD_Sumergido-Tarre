import { CalendarDays, Check } from "lucide-react";

import { formatDueTime } from "../../../shared/utils/dateUtils";
import { STATUS } from "../../tasks/constants/taskOptions";
import taskStyles from "../../tasks/styles/taskStyles";

function SelectedDayPanel({ date, tasks, onTaskClick }) {
    const dateLabel = date.toLocaleDateString("default", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const dayLabel = date.toLocaleDateString("default", {
        weekday: "long",
    });

    return (
        <aside className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl">
            <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-700 sm:px-5">
                <div className="flex items-center gap-2">
                    <CalendarDays
                        size={16}
                        className="text-green-500 dark:text-green-400"
                    />

                    <div>
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {dateLabel}
                        </h2>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            {dayLabel}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {tasks.length}{" "}
                    {tasks.length === 1 ? "Activity" : "Activities"}
                </p>

                {tasks.length > 0 ? (
                    <div className="space-y-2">
                        {tasks.map((task) => {
                            const isCompleted =
                                task.status === STATUS.COMPLETED;

                            return (
                                <button
                                    key={task.id}
                                    type="button"
                                    onClick={() => onTaskClick(task)}
                                    className="w-full rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-left transition hover:border-green-200 hover:bg-green-50/40 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-green-800 dark:hover:bg-green-950/30"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <span
                                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                isCompleted
                                                    ? "border-green-500 bg-green-500 text-white"
                                                    : "border-slate-300 dark:border-slate-600"
                                            }`}
                                        >
                                            {isCompleted && (
                                                <Check
                                                    size={9}
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`truncate text-xs font-semibold ${
                                                    isCompleted
                                                        ? "text-slate-400 line-through dark:text-slate-500"
                                                        : "text-slate-700 dark:text-slate-200"
                                                }`}
                                            >
                                                {task.title}
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                {task.dueTime && (
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                                        {formatDueTime(
                                                            task.dueTime
                                                        )}
                                                    </span>
                                                )}

                                                {task.priority > 0 && (
                                                    <span
                                                        className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase ${
                                                            isCompleted
                                                                ? "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                                                                : taskStyles
                                                                      .priority[
                                                                      task
                                                                          .priority
                                                                  ]
                                                        }`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            No activities
                        </p>

                        <p className="mt-1 text-[10px] text-slate-300 dark:text-slate-600">
                            No tasks are scheduled for this day.
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default SelectedDayPanel;