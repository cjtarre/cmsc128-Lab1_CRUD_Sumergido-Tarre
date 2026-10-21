import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../src/shared/services/api";
import { notificationService } from "../../src/features/notifications/services/notificationService";

vi.mock("../../src/shared/services/api", () => ({
    default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe("notificationService", () => {
    beforeEach(() => vi.clearAllMocks());

    it("gets notifications with the default limit", async () => {
        api.get.mockResolvedValue({ data: [{ id: 1 }] });

        await expect(notificationService.getNotifications()).resolves.toEqual([{ id: 1 }]);
        expect(api.get).toHaveBeenCalledWith("/api/notifications", { params: { limit: 50 } });
    });

    it("requests unread notifications and a custom limit", async () => {
        api.get.mockResolvedValue({ data: [] });

        await notificationService.getNotifications({ unread: true, limit: 10 });

        expect(api.get).toHaveBeenCalledWith("/api/notifications", {
            params: { unread: true, limit: 10 },
        });
    });

    it("marks one notification as read", async () => {
        api.patch.mockResolvedValue({ data: { id: 4, is_read: true } });

        await expect(notificationService.markRead(4)).resolves.toEqual({ id: 4, is_read: true });
        expect(api.patch).toHaveBeenCalledWith("/api/notifications/4/read");
    });

    it("marks all notifications as read", async () => {
        api.patch.mockResolvedValue({ data: { success: true } });

        await notificationService.markAllRead();

        expect(api.patch).toHaveBeenCalledWith("/api/notifications/read-all");
    });

    it("deletes a notification", async () => {
        api.delete.mockResolvedValue({ data: { success: true } });

        await notificationService.deleteNotification(9);

        expect(api.delete).toHaveBeenCalledWith("/api/notifications/9");
    });
});
