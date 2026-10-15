import { Bell, CalendarClock, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../features/auth/hooks/useAuth";
import { getTaskNotifications } from "../../../features/notifications/utils/notificationUtils";
import { useTaskData } from "../../../features/tasks/context/TaskContext";

function NotificationMenu() {
    const { user } = useAuth();
    const { tasks, loading } = useTaskData();
    const [open, setOpen] = useState(false);

    const storageKey = user?.id ? `seenNotifications:${user.id}` : null;

    const notifications = useMemo(() => getTaskNotifications(tasks), [tasks]);
    const preview = notifications.slice(0, 4);

    const notificationIds = useMemo(
        () => notifications.map((notification) => `${notification.type}-${notification.id}`),
        [notifications]
    );

    const [seenNotifications, setSeenNotifications] = useState(() => {
        if (!storageKey) return [];

        try {
            return JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch {
            return [];
        }
    });

    const unreadCount = notificationIds.filter(
        (id) => !seenNotifications.includes(id)
    ).length;

    const handleOpen = () => {
        const nextOpen = !open;
        setOpen(nextOpen);

        if (!nextOpen || !storageKey || unreadCount === 0) return;

        const updated = [...new Set([...seenNotifications, ...notificationIds])];

        setSeenNotifications(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleOpen}
                aria-label="Open notifications"
                aria-expanded={open}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-green-400"
            >
                <Bell size={19} />

                {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/70 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
                        <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-3 dark:border-white/10">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                Notifications
                            </p>

                            {notifications.length > 0 && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {notifications.length}{" "}
                                    {notifications.length === 1 ? "alert" : "alerts"}
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex h-28 items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                                Loading notifications...
                            </div>
                        ) : preview.length > 0 ? (
                            <div className="divide-y divide-slate-100/80 dark:divide-white/[0.07]">
                                {preview.map((notification) => {
                                    const isOverdue =
                                        notification.type === "overdue";

                                    return (
                                        <Link
                                            key={`${notification.type}-${notification.id}`}
                                            to={`/my-tasks?task=${notification.id}`}
                                            onClick={() => setOpen(false)}
                                            className="flex gap-3 px-4 py-3 transition hover:bg-green-50/30 dark:hover:bg-white/[0.025]"
                                        >
                                            <div
                                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
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
                                                <p
                                                    className={`text-xs font-semibold ${
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
                        ) : (
                            <div className="flex h-28 flex-col items-center justify-center px-4 text-center">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    You're all caught up
                                </p>

                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    No task reminders right now.
                                </p>
                            </div>
                        )}

                        <Link
                            to="/notifications"
                            onClick={() => setOpen(false)}
                            className="block border-t border-slate-100/80 px-4 py-3 text-center text-xs font-semibold text-green-600 transition hover:bg-green-50/50 dark:border-white/10 dark:text-green-400 dark:hover:bg-white/[0.03]"
                        >
                            View all notifications
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default NotificationMenu;