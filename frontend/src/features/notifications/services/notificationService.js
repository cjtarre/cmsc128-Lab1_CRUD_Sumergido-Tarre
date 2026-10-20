import api from "../../../shared/services/api";

export const notificationService = {
    getNotifications: async ({ unread = false, limit = 50 } = {}) => {
        const response = await api.get("/api/notifications", { params: { ...(unread ? { unread: true } : {}), limit } });
        return response.data;
    },

    markRead: async (notificationId) => {
        const response = await api.patch(`/api/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllRead: async () => {
        const response = await api.patch("/api/notifications/read-all");
        return response.data;
    },

    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/api/notifications/${notificationId}`);
        return response.data;
    },
};