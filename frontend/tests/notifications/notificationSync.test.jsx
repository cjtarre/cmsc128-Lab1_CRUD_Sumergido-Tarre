// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { NotificationProvider, useNotifications } from "../../src/features/notifications/context/NotificationContext";
import { useAuth } from "../../src/features/auth/hooks/useAuth";
import { notificationService } from "../../src/features/notifications/services/notificationService";
import { queryKeys } from "../../src/shared/utils/queryKeys";
import { INVITATION_SYNC_INTERVAL_MS } from "../../src/shared/constants/notificationSync";

vi.mock("../../src/features/auth/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../src/features/notifications/services/notificationService", () => ({
    notificationService: {
        getNotifications: vi.fn(),
        markRead: vi.fn(),
        markAllRead: vi.fn(),
        markUnread: vi.fn(),
        deleteNotification: vi.fn(),
    },
}));

function Badge() {
    const { unreadCount } = useNotifications();
    return <output aria-label="Unread notifications">{unreadCount}</output>;
}

function renderNotifications(client) {
    return render(
        <QueryClientProvider client={client}>
            <NotificationProvider><Badge /></NotificationProvider>
        </QueryClientProvider>
    );
}

describe("notification background synchronization", () => {
    let client;

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ user: { id: "account-a" } });
        notificationService.getNotifications.mockResolvedValue({ notifications: [], unread_count: 0 });
        client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    afterEach(() => {
        cleanup();
        client.clear();
    });

    it("refreshes authenticated notifications on an interval and when the tab regains focus", async () => {
        const notificationKey = queryKeys.notifications("account-a");
        renderNotifications(client);
        // Wait for the first request to finish before simulating a newer server response.
        await waitFor(() => expect(client.getQueryState(notificationKey)?.status).toBe("success"));
        expect(screen.getByLabelText("Unread notifications").textContent).toBe("0");

        const query = client.getQueryCache().find({ queryKey: notificationKey });
        expect(query.options.refetchInterval).toBe(INVITATION_SYNC_INTERVAL_MS);
        expect(query.options.refetchOnWindowFocus).toBe("always");
        expect(query.options.refetchOnReconnect).toBe("always");

        notificationService.getNotifications.mockResolvedValue({
            notifications: [{ id: 7, type: "project_invite", read_at: null }],
            unread_count: 1,
        });
        await act(async () => {
            await client.refetchQueries({ queryKey: notificationKey });
        });
        // The query cache can update before React commits the new badge text.
        expect(client.getQueryData(notificationKey)?.unread_count).toBe(1);
        await waitFor(() => expect(screen.getByLabelText("Unread notifications").textContent).toBe("1"));
    });

    it("does not fetch notifications when signed out", async () => {
        useAuth.mockReturnValue({ user: null });
        renderNotifications(client);

        const query = client.getQueryCache().find({ queryKey: queryKeys.notifications(undefined) });
        expect(query.options.enabled).toBe(false);
        expect(notificationService.getNotifications).not.toHaveBeenCalled();
    });
});
