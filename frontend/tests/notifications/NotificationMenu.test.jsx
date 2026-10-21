// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import NotificationMenu from "../../src/shared/components/header/NotificationMenu";
import { useNotifications } from "../../src/features/notifications/context/NotificationContext";
import { useTaskData } from "../../src/features/tasks/context/TaskContext";

vi.mock("../../src/features/notifications/context/NotificationContext", () => ({
    useNotifications: vi.fn(),
}));

vi.mock("../../src/features/tasks/context/TaskContext", () => ({
    useTaskData: vi.fn(),
}));

function formatDate(date) {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function getRelativeDate(days) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

describe("NotificationMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useNotifications.mockReturnValue({
            notifications: [],
            unreadCount: 0,
            loading: false,
            markRead: vi.fn(),
            markAllRead: vi.fn(),
            refresh: vi.fn(),
        });

        useTaskData.mockReturnValue({
            loading: false,
            tasks: [],
        });
    });

    afterEach(cleanup);

    it("shows the persistent unread notification count", () => {
        useNotifications.mockReturnValue({
            notifications: [
                {
                    id: 10,
                    type: "task_assigned",
                    read_at: null,
                    data: {
                        task_id: 5,
                        project_id: 2,
                        task_name: "CMSC 128 task",
                    },
                    actor: {
                        username: "gabrielle",
                        display_name: "Gabrielle",
                    },
                },
                {
                    id: 11,
                    type: "project_invite",
                    read_at: null,
                    invite_status: "pending",
                    data: {
                        invite_id: 4,
                        project_id: 3,
                        project_name: "Takda",
                        role: "editor",
                    },
                    actor: {
                        username: "gabrielle",
                        display_name: "Gabrielle",
                    },
                },
            ],
            unreadCount: 2,
            loading: false,
            markRead: vi.fn(),
            markAllRead: vi.fn(),
            refresh: vi.fn(),
        });

        render(
            <MemoryRouter>
                <NotificationMenu />
            </MemoryRouter>
        );

        expect(screen.getByText("2")).toBeTruthy();
    });

    it("does not mark notifications as read just by opening the menu", () => {
        const markRead = vi.fn();
        const markAllRead = vi.fn();

        useNotifications.mockReturnValue({
            notifications: [
                {
                    id: 10,
                    type: "task_assigned",
                    read_at: null,
                    data: {
                        task_id: 5,
                        project_id: 2,
                        task_name: "CMSC 128 task",
                    },
                    actor: {
                        username: "gabrielle",
                        display_name: "Gabrielle",
                    },
                },
            ],
            unreadCount: 1,
            loading: false,
            markRead,
            markAllRead,
            refresh: vi.fn(),
        });

        render(
            <MemoryRouter>
                <NotificationMenu />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText("Open notifications"));

        expect(markRead).not.toHaveBeenCalled();
        expect(markAllRead).not.toHaveBeenCalled();
    });

    it("keeps local task reminders linked to their exact task", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [
                {
                    id: 42,
                    title: "Important task",
                    status: "Not Started",
                    dueDate: getRelativeDate(-1),
                },
            ],
        });

        render(
            <MemoryRouter>
                <NotificationMenu />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText("Open notifications"));

        expect(screen.getByText("Important task").closest("a")?.getAttribute("href"))
            .toBe("/my-tasks?task=42");
    });

    it("shows a task assignment notification", () => {
        useNotifications.mockReturnValue({
            notifications: [
                {
                    id: 20,
                    type: "task_assigned",
                    read_at: null,
                    data: {
                        task_id: 7,
                        project_id: 9,
                        task_name: "Prepare documentation",
                    },
                    actor: {
                        username: "gabrielle",
                        display_name: "Gabrielle",
                    },
                },
            ],
            unreadCount: 1,
            loading: false,
            markRead: vi.fn(),
            markAllRead: vi.fn(),
            refresh: vi.fn(),
        });

        render(
            <MemoryRouter>
                <NotificationMenu />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText("Open notifications"));

        expect(screen.getByText("Prepare documentation")).toBeTruthy();
    });

    it("shows the empty state when there are no notifications", () => {
        render(
            <MemoryRouter>
                <NotificationMenu />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText("Open notifications"));

        expect(screen.getByText("You're all caught up")).toBeTruthy();
    });
});
