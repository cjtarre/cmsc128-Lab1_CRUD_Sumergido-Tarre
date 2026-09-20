import { Bell, CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { useTaskData } from "../../tasks/context/TaskContext";
import { STATUS } from "../../tasks/constants/taskOptions";

function Notifications() {
    const { tasks, loading } = useTaskData();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notifications = tasks
        .filter((task) => task.status !== STATUS.COMPLETED && task.dueDate)
        .map((task) => {
            const [day, month, year] = task.dueDate.split("/");
            const dueDate = new Date(year, month - 1, day);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                return {
                    ...task,
                    type: "overdue",
                    notificationTitle: "Task overdue",
                    description: `Was due ${task.dueDate}`,
                };
            }

            if (dueDate.getTime() === today.getTime()) {
                return {
                    ...task,
                    type: "today",
                    notificationTitle: "Task due today",
                    description: "Due today",
                };
            }

            return null;
        })
        .filter(Boolean);

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <Bell size={20} className="text-green-500 dark:text-green-400" />
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-white sm:text-2xl">
                        Notifications
                    </h1>
                </div>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">
                    Stay updated on your tasks.
                </p>
            </div>

            {loading ? (
                <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                        Loading notifications...
                    </div>
                </div>
            ) : notifications.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl">
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {notifications.map((notification) => {
                            const isOverdue = notification.type === "overdue";

                            return (
                                <div
                                    key={`${notification.type}-${notification.id}`}
                                    className="flex gap-3 px-4 py-4 sm:px-5"
                                >
                                    <div
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                            isOverdue
                                                ? "bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400"
                                                : "bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400"
                                        }`}
                                    >
                                        {isOverdue ? (
                                            <Clock size={15} />
                                        ) : (
                                            <CalendarClock size={15} />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {notification.notificationTitle}
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                            {notification.title}
                                        </p>

                                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                                            {notification.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400">
                        <CheckCircle2 size={19} />
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-200">
                        You're all caught up
                    </p>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        No task reminders or overdue tasks right now.
                    </p>
                </div>
            )}
        </div>
    );
}

export default Notifications;