import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SelectedDayPanel from "../../src/features/calendar/components/SelectedDayPanel";

afterEach(cleanup);

describe("SelectedDayPanel", () => {
    const date = new Date(2026, 9, 21);

    const task = {
        id: 1,
        title: "Finish report",
        description: "Complete the documentation.",
        status: "pending",
        priority: "high",
        dueTime: "10:00 AM",
        tags: [{ tag_id: 1, tag_name: "School" }],
    };

    it("renders the selected date and task count", () => {
        render(<SelectedDayPanel date={date} tasks={[task]} onTaskClick={vi.fn()} />);

        expect(screen.getByText("October 21, 2026")).toBeTruthy();
        expect(screen.getByText("Wednesday")).toBeTruthy();
        expect(screen.getByText("1 Activity")).toBeTruthy();
        expect(screen.getByText("Finish report")).toBeTruthy();
    });

    it("renders the empty state", () => {
        render(<SelectedDayPanel date={date} tasks={[]} onTaskClick={vi.fn()} />);

        expect(screen.getByText("0 Activities")).toBeTruthy();
        expect(screen.getByText("No activities")).toBeTruthy();
        expect(screen.getByText("No tasks are scheduled for this day.")).toBeTruthy();
    });

    it("opens task details when its title is clicked", () => {
        const onTaskClick = vi.fn();

        render(<SelectedDayPanel date={date} tasks={[task]} onTaskClick={onTaskClick} />);

        fireEvent.click(screen.getByRole("button", { name: "Finish report" }));
        expect(onTaskClick).toHaveBeenCalledWith(task);
    });

    it("expands and collapses task information", () => {
        render(<SelectedDayPanel date={date} tasks={[task]} onTaskClick={vi.fn()} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand Finish report" }));

        expect(screen.getByText("Complete the documentation.")).toBeTruthy();
        expect(screen.getByText("School")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Collapse Finish report" })).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Collapse Finish report" }));
        expect(screen.queryByText("Complete the documentation.")).toBeNull();
    });

    it("uses No description when an expanded task has no description", () => {
        render(
            <SelectedDayPanel
                date={date}
                tasks={[{ ...task, description: "   " }]}
                onTaskClick={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Expand Finish report" }));
        expect(screen.getByText("No description.")).toBeTruthy();
    });

    it("adds a task when editing is allowed", () => {
        const onAddTask = vi.fn();

        render(
            <SelectedDayPanel
                date={date}
                tasks={[]}
                onTaskClick={vi.fn()}
                onAddTask={onAddTask}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Add task" }));
        expect(onAddTask).toHaveBeenCalledOnce();
    });

    it("hides the add action in read-only mode", () => {
        render(
            <SelectedDayPanel
                date={date}
                tasks={[]}
                onTaskClick={vi.fn()}
                onAddTask={vi.fn()}
                readOnly
            />
        );

        expect(screen.queryByRole("button", { name: "Add task" })).toBeNull();
    });

    it("toggles completion for a personal task", () => {
        const onToggleComplete = vi.fn();

        render(
            <SelectedDayPanel
                date={date}
                tasks={[task]}
                onTaskClick={vi.fn()}
                onToggleComplete={onToggleComplete}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Mark Finish report as complete" })
        );

        expect(onToggleComplete).toHaveBeenCalledWith(1);
    });

    it("does not show a completion toggle for a project task", () => {
        render(
            <SelectedDayPanel
                date={date}
                tasks={[task]}
                onTaskClick={vi.fn()}
                onToggleComplete={vi.fn()}
                getTaskProject={() => ({ name: "CMSC 128" })}
            />
        );

        expect(
            screen.queryByRole("button", { name: "Mark Finish report as complete" })
        ).toBeNull();

        expect(screen.getByText("CMSC 128")).toBeTruthy();
        expect(screen.getByText("Project task")).toBeTruthy();
    });

    it("renders task metadata", () => {
        render(
            <SelectedDayPanel
                date={date}
                tasks={[task]}
                onTaskClick={vi.fn()}
                getTaskMeta={() => ({
                    initials: "CT",
                    name: "Christie Tarre",
                })}
            />
        );

        expect(screen.getByText("CT")).toBeTruthy();
        expect(screen.getByText("Created by Christie Tarre")).toBeTruthy();
    });

    it("supports unassigned task metadata", () => {
        render(
            <SelectedDayPanel
                date={date}
                tasks={[task]}
                onTaskClick={vi.fn()}
                getTaskMeta={() => ({
                    initials: "?",
                    name: "Unassigned",
                })}
            />
        );

        expect(screen.getByText("Unassigned")).toBeTruthy();
    });
});
