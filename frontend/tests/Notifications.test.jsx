// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Notifications from "../src/features/notifications/pages/Notifications";
import { useNotifications } from "../src/features/notifications/context/NotificationContext";
import { useTaskData } from "../src/features/tasks/context/TaskContext";

vi.mock("../src/features/notifications/context/NotificationContext", () => ({
    useNotifications: vi.fn(),
}));

vi.mock("../src/features/tasks/context/TaskContext", () => ({
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

describe("Notifications", () => {
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
            tasks: [],
            loading: false,
        });
    });

    afterEach(cleanup);

    it("shows the loading state while notifications are loading", () => {
        useNotifications.mockReturnValue({
            notifications: [],
            unreadCount: 0,
            loading: true,
            markRead: vi.fn(),
            markAllRead: vi.fn(),
            refresh: vi.fn(),
        });

        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("Loading notifications...")).toBeTruthy();
    });

    it("shows the loading state while tasks are loading", () => {
        useTaskData.mockReturnValue({
            tasks: [],
            loading: true,
        });

        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("Loading notifications...")).toBeTruthy();
    });

    it("shows the empty state when there are no notifications", () => {
        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("You're all caught up")).toBeTruthy();
    });

    it("renders overdue and due-today task reminders", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [
                {
                    id: 1,
                    title: "Submit report",
                    status: "Not Started",
                    dueDate: getRelativeDate(-1),
                },
                {
                    id: 2,
                    title: "Study CMSC 128",
                    status: "Not Started",
                    dueDate: getRelativeDate(0),
                },
            ],
        });

        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("Task overdue")).toBeTruthy();
        expect(screen.getByText("Submit report")).toBeTruthy();
        expect(screen.getByText("Task due today")).toBeTruthy();
        expect(screen.getByText("Study CMSC 128")).toBeTruthy();
    });

    it("links an overdue task reminder to its exact task", () => {
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
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("Important task").closest("a")?.getAttribute("href"))
            .toBe("/my-tasks?task=42");
    });

    it("renders a task assignment notification", () => {
        useNotifications.mockReturnValue({
            notifications: [
                {
                    id: 50,
                    type: "task_assigned",
                    read_at: null,
                    created_at: new Date().toISOString(),
                    data: {
                        task_id: 8,
                        project_id: 3,
                        task_name: "Implement notifications",
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
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("Implement notifications")).toBeTruthy();
    });

    it("does not display future tasks as reminders", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [
                {
                    id: 3,
                    title: "Future task",
                    status: "Not Started",
                    dueDate: getRelativeDate(3),
                },
            ],
        });

        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.queryByText("Future task")).toBeNull();
        expect(screen.getByText("You're all caught up")).toBeTruthy();
    });
});