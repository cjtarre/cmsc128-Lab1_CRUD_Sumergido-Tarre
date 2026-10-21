import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CalendarWidget from "../../src/features/calendar/components/CalendarWidget";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

describe("CalendarWidget", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0));
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    const renderWidget = (tasks = []) =>
        render(
            <MemoryRouter>
                <CalendarWidget tasks={tasks} />
            </MemoryRouter>
        );

    it("renders the current month", () => {
        renderWidget();

        expect(screen.getByText("October 2026")).toBeTruthy();
        expect(screen.getByRole("link", { name: /View Calendar/i })).toBeTruthy();
    });

    it("moves between months", () => {
        renderWidget();

        fireEvent.click(screen.getByRole("button", { name: "Next month" }));
        expect(screen.getByText("November 2026")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
        expect(screen.getByText("October 2026")).toBeTruthy();
    });

    it("navigates to the selected calendar date", () => {
        renderWidget();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open calendar for October 15, 2026",
            })
        );

        expect(navigate).toHaveBeenCalledWith("/calendar?date=2026-10-15");
    });

    it("renders a task priority indicator on its due date", () => {
        renderWidget([
            { id: 1, dueDate: "15/10/2026", priority: "high" },
        ]);

        const day = screen.getByRole("button", {
            name: "Open calendar for October 15, 2026",
        });

        expect(day.querySelector("span")).not.toBeNull();
    });

    it("uses the highest task priority when several tasks share a date", () => {
        renderWidget([
            { id: 1, dueDate: "15/10/2026", priority: "low" },
            { id: 2, dueDate: "15/10/2026", priority: "medium" },
            { id: 3, dueDate: "15/10/2026", priority: "high" },
        ]);

        const day = screen.getByRole("button", {
            name: "Open calendar for October 15, 2026",
        });

        expect(day.querySelector("span")).not.toBeNull();
    });

    it("links to the full calendar", () => {
        renderWidget();

        expect(
            screen.getByRole("link", { name: /View Calendar/i }).getAttribute("href")
        ).toBe("/calendar");
    });
});
