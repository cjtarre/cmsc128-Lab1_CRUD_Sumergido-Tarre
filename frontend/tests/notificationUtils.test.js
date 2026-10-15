import { describe, expect, it } from "vitest";

import { getTaskNotifications } from "../src/features/notifications/utils/notificationUtils";
import { STATUS } from "../src/features/tasks/constants/taskOptions";

function formatDate(date) {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function getRelativeDate(days) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

describe("getTaskNotifications", () => {
    it("creates an overdue notification for an unfinished overdue task", () => {
        const tasks = [{
            id: 1,
            title: "Overdue task",
            status: STATUS.NOT_STARTED,
            dueDate: getRelativeDate(-1),
        }];

        const notifications = getTaskNotifications(tasks);

        expect(notifications).toHaveLength(1);
        expect(notifications[0]).toMatchObject({
            id: 1,
            type: "overdue",
            notificationTitle: "Task overdue",
        });
    });

    it("creates a due-today notification for an unfinished task due today", () => {
        const tasks = [{
            id: 2,
            title: "Today's task",
            status: STATUS.IN_PROGRESS,
            dueDate: getRelativeDate(0),
        }];

        const notifications = getTaskNotifications(tasks);

        expect(notifications).toHaveLength(1);
        expect(notifications[0]).toMatchObject({
            id: 2,
            type: "today",
            notificationTitle: "Task due today",
            description: "Due today",
        });
    });

    it("does not create a notification for a future task", () => {
        const tasks = [{
            id: 3,
            title: "Future task",
            status: STATUS.NOT_STARTED,
            dueDate: getRelativeDate(1),
        }];

        expect(getTaskNotifications(tasks)).toHaveLength(0);
    });

    it("does not create a notification for a completed task", () => {
        const tasks = [{
            id: 4,
            title: "Completed task",
            status: STATUS.COMPLETED,
            dueDate: getRelativeDate(-1),
        }];

        expect(getTaskNotifications(tasks)).toHaveLength(0);
    });

    it("does not create a notification for a task without a due date", () => {
        const tasks = [{
            id: 5,
            title: "No due date",
            status: STATUS.NOT_STARTED,
            dueDate: "",
        }];

        expect(getTaskNotifications(tasks)).toHaveLength(0);
    });

    it("returns only tasks that currently require notifications", () => {
        const tasks = [
            { id: 1, title: "Overdue", status: STATUS.NOT_STARTED, dueDate: getRelativeDate(-2) },
            { id: 2, title: "Today", status: STATUS.IN_PROGRESS, dueDate: getRelativeDate(0) },
            { id: 3, title: "Future", status: STATUS.NOT_STARTED, dueDate: getRelativeDate(2) },
            { id: 4, title: "Completed", status: STATUS.COMPLETED, dueDate: getRelativeDate(-1) },
            { id: 5, title: "No date", status: STATUS.NOT_STARTED, dueDate: "" },
        ];

        const notifications = getTaskNotifications(tasks);

        expect(notifications).toHaveLength(2);
        expect(notifications.map((notification) => notification.id)).toEqual([1, 2]);
    });
});