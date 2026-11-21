import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../auth/hooks/useAuth";
import { notificationService } from "../services/notificationService";
import { queryKeys } from "../../../shared/utils/queryKeys";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const notificationsQuery = useQuery({
        queryKey: queryKeys.notifications(user?.id),
        queryFn: notificationService.getNotifications,
        enabled: Boolean(user?.id),
        staleTime: 15 * 1000,
    });
    const data = notificationsQuery.data;
    const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
    const unreadCount = Number(data?.unread_count) || 0;
    const loading = notificationsQuery.isLoading;

    const refreshNotifications = () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user?.id) });

    // Mark one notification as read immediately, then sync with the server.
    const markRead = async (notificationId) => {
        const notification = notifications.find((item) => item.id === notificationId);
        if (!notification || notification.read_at) return;

        const readAt = new Date().toISOString();
        queryClient.setQueryData(queryKeys.notifications(user?.id), (current) => current ? {
            ...current,
            notifications: current.notifications.map((item) =>
                item.id === notificationId ? { ...item, read_at: readAt } : item
            ),
            unread_count: Math.max(0, Number(current.unread_count) - 1),
        } : current);

        try {
            await notificationService.markRead(notificationId);
        } catch (error) {
            console.error("Error marking notification as read:", error);
            refreshNotifications();
        }
    };

    // Mark all notifications as read immediately, then sync with the server.
    const markAllRead = async () => {
        if (!unreadCount) return;

        const readAt = new Date().toISOString();
        queryClient.setQueryData(queryKeys.notifications(user?.id), (current) => current ? {
            ...current,
            notifications: current.notifications.map((item) => ({ ...item, read_at: item.read_at || readAt })),
            unread_count: 0,
        } : current);

        try {
            await notificationService.markAllRead();
        } catch (error) {
            console.error("Error marking notifications as read:", error);
            refreshNotifications();
        }
    };

    // Remove a notification immediately, then sync the deletion with the server.
    const removeNotification = async (notificationId) => {
        const notification = notifications.find((item) => item.id === notificationId);
        if (!notification) return;

        queryClient.setQueryData(queryKeys.notifications(user?.id), (current) => current ? {
            ...current,
            notifications: current.notifications.filter((item) => item.id !== notificationId),
            unread_count: notification.read_at
                ? Number(current.unread_count)
                : Math.max(0, Number(current.unread_count) - 1),
        } : current);

        try {
            await notificationService.deleteNotification(notificationId);
        } catch (error) {
            console.error("Error deleting notification:", error);
            await refreshNotifications();
            throw error;
        }
    };

    const value = {
        notifications, unreadCount, loading,
        refreshNotifications, markRead, markAllRead, removeNotification,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
    return context;
}