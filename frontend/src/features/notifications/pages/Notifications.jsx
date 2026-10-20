import { CalendarClock, CheckCheck, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import InviteNotification from "../components/InviteNotification";
import NotificationItem from "../components/NotificationItem";
import { useNotifications } from "../context/NotificationContext";
import { getTaskNotifications } from "../utils/notificationUtils";
import { useTaskData } from "../../tasks/context/TaskContext";

function Notifications() {
    const { tasks, loading: tasksLoading } = useTaskData();
    const {
        notifications,
        unreadCount,
        loading: notificationsLoading,
        refreshNotifications,
        markRead,
        markAllRead,
    } = useNotifications();

    const reminders = getTaskNotifications(tasks);
    const loading = tasksLoading || notificationsLoading;
    const hasNotifications = notifications.length > 0 || reminders.length > 0;

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-white sm:text-2xl">
                        Notifications
                    </h1>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 sm:text-sm">
                        Stay updated on your tasks and projects.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={markAllRead}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 font-medium text-green-600 transition hover:bg-green-50 dark:text-green-400 dark:hover:bg-white/[0.05]"
                        style={{ fontSize: "11px", lineHeight: "1" }}
                    >
                        <CheckCheck size={14} />
                        <span className="hidden min-[380px]:inline">Mark all read</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:rounded-2xl">
                    <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                        Loading notifications...
                    </div>
                </div>
            ) : hasNotifications ? (
                <div className="overflow-hidden rounded-xl border border-white/70 bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 sm:rounded-2xl">
                    <div className="max-h-[60vh] divide-y divide-slate-100/80 overflow-y-auto overscroll-contain dark:divide-white/[0.07]">
                        {notifications.map((notification) =>
                            notification.type === "project_invite" ? (
                                <InviteNotification
                                    key={`persistent-${notification.id}`}
                                    notification={notification}
                                    onRead={markRead}
                                    onRefresh={refreshNotifications}
                                />
                            ) : (
                                <NotificationItem
                                    key={`persistent-${notification.id}`}
                                    notification={notification}
                                    onRead={markRead}
                                />
                            )
                        )}

                        {reminders.map((notification) => {
                            const isOverdue = notification.type === "overdue";

                            return (
                                <Link
                                    key={`reminder-${notification.type}-${notification.id}`}
                                    to={`/my-tasks?task=${notification.id}`}
                                    className="flex items-start gap-3 px-4 py-4 transition hover:bg-green-50/50 dark:hover:bg-white/[0.04] sm:px-5"
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
                                        <p className={`text-sm font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}>
                                            {notification.notificationTitle}
                                        </p>

                                        <p className="mt-0.5 break-words text-xs text-slate-500 dark:text-slate-400">
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
                <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white/80 px-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:rounded-2xl">
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-green-200/20 blur-3xl dark:bg-green-500/[0.05]" />

                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400">
                        <CheckCircle2 size={19} />
                    </div>

                    <p className="relative mt-3 text-sm font-medium text-slate-600 dark:text-slate-200">
                        You're all caught up
                    </p>

                    <p className="relative mt-1 text-xs text-slate-400 dark:text-slate-500">
                        No notifications or task reminders right now.
                    </p>
                </div>
            )}
        </div>
    );
}

export default Notifications;