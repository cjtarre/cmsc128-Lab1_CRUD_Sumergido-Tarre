import { Bell, CalendarClock, CheckCheck, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import InviteNotification from "../../../features/notifications/components/InviteNotification";
import NotificationItem from "../../../features/notifications/components/NotificationItem";
import { useNotifications } from "../../../features/notifications/context/NotificationContext";
import { getTaskNotifications } from "../../../features/notifications/utils/notificationUtils";
import { useTaskData } from "../../../features/tasks/context/TaskContext";

function NotificationMenu() {
    const { tasks, loading: tasksLoading } = useTaskData();
    const {
        notifications,
        unreadCount,
        loading: notificationsLoading,
        refreshNotifications,
        markRead,
        markAllRead,
    } = useNotifications();

    const [open, setOpen] = useState(false);
    const [markingAllRead, setMarkingAllRead] = useState(false);

    const reminders = useMemo(() => getTaskNotifications(tasks), [tasks]);
    const persistentPreview = notifications.slice(0, 4);
    const remainingSlots = Math.max(0, 4 - persistentPreview.length);
    const reminderPreview = reminders.slice(0, remainingSlots);
    const loading = tasksLoading || notificationsLoading;

    const handleMarkAllRead = async () => {
        if (unreadCount === 0 || markingAllRead) return;

        try {
            setMarkingAllRead(true);
            await markAllRead();
        } finally {
            setMarkingAllRead(false);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
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
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/70 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 px-4 py-3 dark:border-white/10">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                Notifications
                            </p>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    disabled={markingAllRead}
                                    onClick={handleMarkAllRead}
                                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 font-medium text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-400 dark:hover:bg-white/[0.05]"
                                    style={{ fontSize: "10px", lineHeight: "1" }}
                                >
                                    <CheckCheck size={13} />
                                    <span>{markingAllRead ? "Marking..." : "Mark all read"}</span>
                                </button>
                            )}
                        </div>

                        <div className="max-h-[min(60vh,24rem)] overflow-y-auto overscroll-contain">
                            {loading ? (
                                <div className="flex h-28 items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                                    Loading notifications...
                                </div>
                            ) : persistentPreview.length > 0 || reminderPreview.length > 0 ? (
                                <div className="divide-y divide-slate-100/80 dark:divide-white/[0.07]">
                                    {persistentPreview.map((notification) =>
                                        notification.type === "project_invite" ? (
                                            <InviteNotification
                                                key={`persistent-${notification.id}`}
                                                notification={notification}
                                                onRead={markRead}
                                                onRefresh={refreshNotifications}
                                                onClose={() => setOpen(false)}
                                            />
                                        ) : (
                                            <NotificationItem
                                                key={`persistent-${notification.id}`}
                                                notification={notification}
                                                onRead={markRead}
                                                onClose={() => setOpen(false)}
                                            />
                                        )
                                    )}

                                    {reminderPreview.map((notification) => {
                                        const isOverdue = notification.type === "overdue";

                                        return (
                                            <Link
                                                key={`reminder-${notification.type}-${notification.id}`}
                                                to={`/my-tasks?task=${notification.id}`}
                                                onClick={() => setOpen(false)}
                                                className="flex items-start gap-3 px-4 py-3 transition hover:bg-green-50/30 dark:hover:bg-white/[0.025]"
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

                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-xs font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}>
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
                                        No notifications right now.
                                    </p>
                                </div>
                            )}
                        </div>

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