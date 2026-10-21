import { describe, expect, it, vi } from "vitest";
import { handleOpenNotification } from "../../src/features/notifications/handlers/notificationHandlers";

describe("handleOpenNotification", () => {
    it("marks a notification as read before opening its project", async () => {
        const onRead = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();
        const navigate = vi.fn();

        await handleOpenNotification({
            notification: { id: 7 },
            canOpen: true,
            projectId: 12,
            onRead,
            onClose,
            navigate,
        });

        expect(onRead).toHaveBeenCalledWith(7);
        expect(onClose).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith("/projects/12");
    });

    it("opens My Tasks when no project id is available", async () => {
        const navigate = vi.fn();

        await handleOpenNotification({
            notification: { id: 1 },
            canOpen: true,
            projectId: null,
            onRead: vi.fn(),
            navigate,
        });

        expect(navigate).toHaveBeenCalledWith("/my-tasks");
    });

    it("only marks non-openable notifications as read", async () => {
        const onRead = vi.fn();
        const onClose = vi.fn();
        const navigate = vi.fn();

        await handleOpenNotification({
            notification: { id: 3 },
            canOpen: false,
            projectId: 2,
            onRead,
            onClose,
            navigate,
        });

        expect(onRead).toHaveBeenCalledWith(3);
        expect(onClose).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
    });

    it("supports optional read and close callbacks", async () => {
        const navigate = vi.fn();

        await expect(handleOpenNotification({
            notification: { id: 1 },
            canOpen: true,
            projectId: 4,
            navigate,
        })).resolves.toBeUndefined();

        expect(navigate).toHaveBeenCalledWith("/projects/4");
    });
});
