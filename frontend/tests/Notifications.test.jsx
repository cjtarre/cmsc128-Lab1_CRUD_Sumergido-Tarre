// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Notifications from "../src/features/notifications/pages/Notifications";
import { useTaskData } from "../src/features/tasks/context/TaskContext";

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
    });

    afterEach(cleanup);

    it("shows the loading state while tasks are loading", () => {
        useTaskData.mockReturnValue({ tasks: [], loading: true });

        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("Loading notifications...")).toBeTruthy();
    });

    it("shows the empty state when there are no notifications", () => {
        useTaskData.mockReturnValue({ tasks: [], loading: false });

        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("You're all caught up")).toBeTruthy();
        expect(screen.getByText("No task reminders or overdue tasks right now.")).toBeTruthy();
    });

    it("renders overdue and due-today notifications", () => {
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

    it("links an overdue notification to its exact task", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [{
                id: 42,
                title: "Important task",
                status: "Not Started",
                dueDate: getRelativeDate(-1),
            }],
        });

        render(
            <MemoryRouter>
                <Notifications />
            </MemoryRouter>
        );

        expect(screen.getByText("Important task").closest("a")?.getAttribute("href"))
            .toBe("/my-tasks?task=42");
    });

    it("does not display future tasks as notifications", () => {
        useTaskData.mockReturnValue({
            loading: false,
            tasks: [{
                id: 3,
                title: "Future task",
                status: "Not Started",
                dueDate: getRelativeDate(3),
            }],
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