import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { notificationService } from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

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

    const markRead = async (notificationId) => {
        const notification = notifications.find((item) => item.id === notificationId);
        if (!notification || notification.read_at) return;

        try {
            await notificationService.markRead(notificationId);
            setNotifications((current) =>
                current.map((item) =>
                    item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
                )
            );
            setUnreadCount((current) => Math.max(0, current - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllRead = async () => {
        if (unreadCount === 0) return;

        try {
            await notificationService.markAllRead();
            const readAt = new Date().toISOString();
            setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    const removeNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications((current) => {
                const removed = current.find((item) => item.id === notificationId);
                if (removed && !removed.read_at) setUnreadCount((count) => Math.max(0, count - 1));
                return current.filter((item) => item.id !== notificationId);
            });
        } catch (error) {
            console.error("Error deleting notification:", error);
            throw error;
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                refreshNotifications,
                markRead,
                markAllRead,
                removeNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }

    return context;
}