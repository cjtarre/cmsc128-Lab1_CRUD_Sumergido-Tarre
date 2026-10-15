import { CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import { useTaskData } from "../../tasks/context/TaskContext";
import { getTaskNotifications } from "../utils/notificationUtils";

function Notifications() {
    const { tasks, loading } = useTaskData();
    const notifications = getTaskNotifications(tasks);

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-white sm:text-2xl">
                        Notifications
                    </h1>
                </div>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">
                    Stay updated on your tasks.
                </p>
            </div>

            {loading ? (
                /* Loading */
                <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20 sm:rounded-2xl">
                    <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                        Loading notifications...
                    </div>
                </div>
            ) : notifications.length > 0 ? (
                /* Notifications */
                <div className="overflow-hidden rounded-xl border border-white/70 bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 dark:shadow-black/20 sm:rounded-2xl">
                    <div className="divide-y divide-slate-100/80 dark:divide-white/[0.07]">
                        {notifications.map((notification) => {
                            const isOverdue = notification.type === "overdue";

                            return (
                                <Link
                                    key={`${notification.type}-${notification.id}`}
                                    to={`/my-tasks?task=${notification.id}`}
                                    className="flex gap-3 px-4 py-4 transition hover:bg-green-50/50 dark:hover:bg-white/[0.04] sm:px-5"
                                >
                                    <div
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                            isOverdue
                                                ? "bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400"
                                                : "bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400"
                                        }`}
                                    >
                                        {isOverdue ? <Clock size={15} /> : <CalendarClock size={15} />}
                                    </div>

                                    <div className="min-w-0">
                                        <p
                                            className={`text-sm font-semibold ${
                                                isOverdue
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-slate-700 dark:text-slate-200"
                                            }`}
                                        >
                                            {notification.notificationTitle}
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                            {notification.title}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                                            {notification.description}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Empty state */
                <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white/80 px-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20 sm:rounded-2xl">
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-green-200/20 blur-3xl dark:bg-green-500/[0.05]" />

                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400">
                        <CheckCircle2 size={19} />
                    </div>

                    <p className="relative mt-3 text-sm font-medium text-slate-600 dark:text-slate-200">
                        You're all caught up
                    </p>

                    <p className="relative mt-1 text-xs text-slate-400 dark:text-slate-500">
                        No task reminders or overdue tasks right now.
                    </p>
                </div>
            )}
        </div>
    );
}

export default Notifications;