// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import NotificationMenu from "../src/shared/components/header/NotificationMenu";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import { useTaskData } from "../src/features/tasks/context/TaskContext";

vi.mock("../src/features/auth/hooks/useAuth", () => ({
    useAuth: vi.fn(),
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

describe("NotificationMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        useAuth.mockReturnValue({ user: { id: "user-1" } });
    });

    afterEach(cleanup);

    it("shows the unread notification count", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [
                { id: 1, title: "Overdue", status: "Not Started", dueDate: getRelativeDate(-1) },
                { id: 2, title: "Today", status: "Not Started", dueDate: getRelativeDate(0) },
            ],
        });

        render(<MemoryRouter><NotificationMenu /></MemoryRouter>);

        expect(screen.getByText("2")).toBeTruthy();
    });

    it("marks current notifications as seen when opened", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [
                { id: 1, title: "Overdue", status: "Not Started", dueDate: getRelativeDate(-1) },
            ],
        });

        render(<MemoryRouter><NotificationMenu /></MemoryRouter>);

        fireEvent.click(screen.getByLabelText("Open notifications"));

        expect(JSON.parse(localStorage.getItem("seenNotifications:user-1")))
            .toEqual(["overdue-1"]);
    });

    it("removes the unread badge after opening", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [
                { id: 1, title: "Overdue", status: "Not Started", dueDate: getRelativeDate(-1) },
            ],
        });

        render(<MemoryRouter><NotificationMenu /></MemoryRouter>);

        expect(screen.getByText("1")).toBeTruthy();

        fireEvent.click(screen.getByLabelText("Open notifications"));

        expect(screen.queryByText("1")).toBeNull();
    });

    it("links a notification to its exact task", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [
                { id: 42, title: "Important task", status: "Not Started", dueDate: getRelativeDate(-1) },
            ],
        });

        render(<MemoryRouter><NotificationMenu /></MemoryRouter>);

        fireEvent.click(screen.getByLabelText("Open notifications"));

        expect(screen.getByText("Important task").closest("a")?.getAttribute("href"))
            .toBe("/my-tasks?task=42");
    });

    it("shows the empty state when there are no notifications", () => {
        useTaskData.mockReturnValue({ loading: false, tasks: [] });

        render(<MemoryRouter><NotificationMenu /></MemoryRouter>);

        fireEvent.click(screen.getByLabelText("Open notifications"));

        expect(screen.getByText("You're all caught up")).toBeTruthy();
        expect(screen.getByText("No task reminders right now.")).toBeTruthy();
    });
});