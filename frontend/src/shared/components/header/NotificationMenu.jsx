import { Bell, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import InviteNotification from "../../../features/notifications/components/InviteNotification";
import NotificationItem from "../../../features/notifications/components/NotificationItem";
import TaskReminderItem from "../../../features/notifications/components/TaskReminderItem";
import { useNotifications } from "../../../features/notifications/context/NotificationContext";
import { getTaskNotifications } from "../../../features/notifications/utils/notificationUtils";
import { useTaskData } from "../../../features/tasks/context/TaskContext";

function NotificationMenu() {
    const { tasks, loading: tasksLoading } = useTaskData();
    const { notifications, unreadCount, loading: notificationsLoading, refreshNotifications, markRead, markAllRead } = useNotifications();

    const [open, setOpen] = useState(false);
    const [markingAllRead, setMarkingAllRead] = useState(false);

    const reminders = useMemo(() => getTaskNotifications(tasks), [tasks]);
    const persistentPreview = notifications.slice(0, 4);
    const reminderPreview = reminders.slice(0, Math.max(0, 4 - persistentPreview.length));
    const loading = tasksLoading || notificationsLoading;

    const handleMarkAllRead = async () => {
        if (!unreadCount || markingAllRead) return;

        try {
            setMarkingAllRead(true);
            await markAllRead();
        } finally {
            setMarkingAllRead(false);
        }
    };

    return (
        <div className="relative">
            <button type="button" onClick={() => setOpen((current) => !current)}
                aria-label="Open notifications" aria-expanded={open}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-green-400">
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

                    {/* Viewport-bound on mobile; bell-anchored on larger screens. */}
                    <div className="fixed left-2 right-2 top-[58px] z-50 flex max-h-[calc(100dvh-70px)] flex-col overflow-hidden rounded-xl border border-white/70 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:h-auto sm:max-h-none sm:w-80">
                        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100/80 px-3 py-2.5 dark:border-white/10 sm:px-4 sm:py-3">
                            <p className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</p>

                            {unreadCount > 0 && (
                                <button type="button" disabled={markingAllRead} onClick={handleMarkAllRead}
                                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 font-medium text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-400 dark:hover:bg-white/[0.05] sm:gap-1.5 sm:px-2.5"
                                    style={{ fontSize: "10px", lineHeight: "1" }}>
                                    <CheckCheck size={13} />
                                    <span className="hidden min-[340px]:inline">{markingAllRead ? "Marking..." : "Mark all read"}</span>
                                </button>
                            )}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain sm:max-h-[min(60vh,24rem)]">
                            {loading ? (
                                <div className="flex h-28 items-center justify-center px-3 text-xs text-slate-400 dark:text-slate-500">Loading notifications...</div>
                            ) : persistentPreview.length || reminderPreview.length ? (
                                <div className="divide-y divide-slate-100/80 dark:divide-white/[0.07]">
                                    {persistentPreview.map((notification) =>
                                        notification.type === "project_invite" ? (
                                            <InviteNotification key={`persistent-${notification.id}`} notification={notification}
                                                onRead={markRead} onRefresh={refreshNotifications} onClose={() => setOpen(false)} />
                                        ) : (
                                            <NotificationItem key={`persistent-${notification.id}`} notification={notification}
                                                onRead={markRead} onClose={() => setOpen(false)} />
                                        )
                                    )}

                                    {reminderPreview.map((notification) => (
                                        <TaskReminderItem key={`reminder-${notification.type}-${notification.id}`}
                                            notification={notification} onClose={() => setOpen(false)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-28 flex-col items-center justify-center px-4 text-center">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">You're all caught up</p>
                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">No notifications right now.</p>
                                </div>
                            )}
                        </div>

                        <Link to="/notifications" onClick={() => setOpen(false)}
                            className="block shrink-0 border-t border-slate-100/80 px-4 py-3 text-center text-xs font-semibold text-green-600 transition hover:bg-green-50/50 dark:border-white/10 dark:text-green-400 dark:hover:bg-white/[0.03]">
                            View all notifications
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default NotificationMenu;