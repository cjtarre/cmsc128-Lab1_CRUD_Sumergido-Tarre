import { CheckCheck, CheckCircle2 } from "lucide-react";

import { useTaskData } from "../../tasks/context/TaskContext";
import InviteNotification from "../components/InviteNotification";
import NotificationItem from "../components/NotificationItem";
import TaskReminderItem from "../components/TaskReminderItem";
import { useNotifications } from "../context/NotificationContext";
import { getTaskNotifications } from "../utils/notificationUtils";

function Notifications() {
    const { tasks, loading: tasksLoading } = useTaskData();
    const { notifications, unreadCount, loading: notificationsLoading, refreshNotifications, markRead, markAllRead } = useNotifications();

    const reminders = getTaskNotifications(tasks);
    const loading = tasksLoading || notificationsLoading;
    const hasNotifications = notifications.length > 0 || reminders.length > 0;

    return (
        <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6">
            <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold text-slate-800 dark:text-white sm:text-2xl">Notifications</h1>
                    <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500 sm:text-sm">Stay updated on your tasks and projects.</p>
                </div>

                {unreadCount > 0 && (
                    <button type="button" onClick={markAllRead} aria-label="Mark all notifications as read"
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 font-medium text-green-600 transition hover:bg-green-50 dark:text-green-400 dark:hover:bg-white/[0.05] sm:px-3"
                        style={{ fontSize: "11px", lineHeight: "1" }}>
                        <CheckCheck size={14} />
                        <span className="hidden min-[380px]:inline">Mark all read</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-white/70 bg-white/80 px-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:min-h-[250px] sm:rounded-2xl">
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500 sm:gap-3 sm:text-sm">
                        <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-green-500 dark:border-slate-700 dark:border-t-green-400" />
                        Loading notifications...
                    </div>
                </div>
            ) : hasNotifications ? (
                <div className="min-w-0 overflow-hidden rounded-xl border border-white/70 bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 sm:rounded-2xl">
                    <div className="divide-y divide-slate-100/80 dark:divide-white/[0.07] sm:max-h-[60vh] sm:overflow-y-auto sm:overscroll-contain">
                        {notifications.map((notification) =>
                            notification.type === "project_invite" ? (
                                <InviteNotification key={`persistent-${notification.id}`} notification={notification}
                                    onRead={markRead} onRefresh={refreshNotifications} />
                            ) : (
                                <NotificationItem key={`persistent-${notification.id}`} notification={notification} onRead={markRead} />
                            )
                        )}

                        {reminders.map((notification) => (
                            <TaskReminderItem key={`reminder-${notification.type}-${notification.id}`} notification={notification} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white/80 px-4 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:min-h-[250px] sm:rounded-2xl sm:px-6">
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-green-200/20 blur-3xl dark:bg-green-500/[0.05]" />

                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400">
                        <CheckCircle2 size={19} />
                    </div>

                    <p className="relative mt-3 text-sm font-medium text-slate-600 dark:text-slate-200">You're all caught up</p>
                    <p className="relative mt-1 max-w-xs text-xs leading-5 text-slate-400 dark:text-slate-500">No notifications or task reminders right now.</p>
                </div>
            )}
        </div>
    );
}

export default Notifications;