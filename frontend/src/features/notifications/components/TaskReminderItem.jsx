import { CalendarClock, Clock } from "lucide-react";
import { Link } from "react-router-dom";

function TaskReminderItem({ notification }) {
    const isOverdue = notification.type === "overdue";

    return (
        <Link to={`/my-tasks?task=${notification.id}`}
            className="flex min-w-0 items-start gap-2.5 px-3 py-3 transition hover:bg-green-50/50 dark:hover:bg-white/[0.04] sm:gap-3 sm:px-5 sm:py-4">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isOverdue ? "bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400" : "bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400"}`}>
                {isOverdue ? <Clock size={15} /> : <CalendarClock size={15} />}
            </div>

            <div className="min-w-0 flex-1">
                <p className={`break-words text-xs font-semibold sm:text-sm ${isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}>
                    {notification.notificationTitle}
                </p>

                <p className="mt-0.5 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {notification.title}
                </p>

                <p className="mt-1 break-words text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                    {notification.description}
                </p>
            </div>
        </Link>
    );
}

export default TaskReminderItem;