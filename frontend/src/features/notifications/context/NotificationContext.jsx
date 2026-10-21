import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { notificationService } from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Sync notifications with the server.
    const refreshNotifications = useCallback(async () => {
        if (!user?.id) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
            setUnreadCount(Number(data?.unread_count) || 0);
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshNotifications();
    }, [refreshNotifications]);

    // Mark one notification as read immediately, then sync with the server.
    const markRead = async (notificationId) => {
        const notification = notifications.find((item) => item.id === notificationId);
        if (!notification || notification.read_at) return;

        const readAt = new Date().toISOString();
        setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, read_at: readAt } : item));
        setUnreadCount((current) => Math.max(0, current - 1));

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
        setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })));
        setUnreadCount(0);

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

        setNotifications((current) => current.filter((item) => item.id !== notificationId));
        if (!notification.read_at) setUnreadCount((current) => Math.max(0, current - 1));

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