import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import ProjectList from "../../src/features/projects/components/cards/ProjectList";

vi.mock("../../src/features/projects/hooks/useProjectMembersList", () => ({
    useProjectMembersList: () => [{ user_id: "member-a", display_name: "QA Member" }],
}));

vi.mock("../../src/features/tasks/components/table/TaskTable", () => ({
    default: ({ tasks }) => (
        <div data-testid="project-task-results">
            {tasks.map((task) => <span key={task.id}>{task.title}</span>)}
        </div>
    ),
}));

afterEach(cleanup);

const tasks = [
    { id: 1, title: "High priority task", status: "in_progress", priority: "high", assigneeId: "member-a", dueDate: "", tags: [] },
    { id: 2, title: "Low priority task", status: "not_started", priority: "low", assigneeId: null, dueDate: "", tags: [] },
];

function openMobileFilters() {
    const trigger = screen.getByRole("button", { name: "Task filters" });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    return trigger.parentElement;
}

describe("ProjectList compact filters", () => {
    it("keeps the outer filters panel open when a nested select opens and allows combining filters", () => {
        render(<ProjectList projectId={1} tasks={tasks} setTasks={vi.fn()} canEdit={false} />);
        const panel = openMobileFilters();

        fireEvent.click(within(panel).getByRole("button", { name: "Filter by Status" }));
        const statusOptions = within(panel).getByRole("listbox", { name: "Choose Status" });
        fireEvent.pointerDown(within(statusOptions).getByRole("option", { name: "In Progress" }));
        fireEvent.click(within(statusOptions).getByRole("option", { name: "In Progress" }));

        expect(screen.getByRole("button", { name: "Task filters" }).getAttribute("aria-expanded")).toBe("true");
        expect(within(screen.getByTestId("project-task-results")).getByText("High priority task")).toBeTruthy();
        expect(within(screen.getByTestId("project-task-results")).queryByText("Low priority task")).toBeNull();

        fireEvent.click(within(panel).getByRole("button", { name: "Filter by Priority" }));
        const priorityOptions = within(panel).getByRole("listbox", { name: "Choose Priority" });
        fireEvent.pointerDown(within(priorityOptions).getByRole("option", { name: "High" }));
        fireEvent.click(within(priorityOptions).getByRole("option", { name: "High" }));

        expect(screen.getByRole("button", { name: "Task filters" }).textContent).toContain("2");
        expect(screen.getByRole("button", { name: "Task filters" }).getAttribute("aria-expanded")).toBe("true");
    });

    it("sorts by tag using the compact filter panel without closing it", () => {
        const taggedTasks = [
            { ...tasks[0], tags: [{ tag_id: 11, tag_name: "Zebra" }] },
            { ...tasks[1], tags: [{ tag_id: 12, tag_name: "Alpha" }] },
        ];
        render(<ProjectList projectId={1} tasks={taggedTasks} setTasks={vi.fn()} canEdit={false} />);
        const panel = openMobileFilters();
        fireEvent.click(within(panel).getByRole("button", { name: "Sort tasks by tag" }));
        const options = within(panel).getByRole("listbox", { name: "Sort tasks by tag options" });
        fireEvent.pointerDown(within(options).getByRole("option", { name: "Tag A-Z" }));
        fireEvent.click(within(options).getByRole("option", { name: "Tag A-Z" }));

        const results = within(screen.getByTestId("project-task-results"));
        expect(results.getAllByText(/priority task/).map((node) => node.textContent)).toEqual([
            "Low priority task", "High priority task",
        ]);
        expect(screen.getByRole("button", { name: "Task filters" }).getAttribute("aria-expanded")).toBe("true");
    });

    it("dismisses the compact panel on an outside click", () => {
        render(<ProjectList projectId={1} tasks={tasks} setTasks={vi.fn()} canEdit={false} />);
        openMobileFilters();
        fireEvent.mouseDown(document.body);
        expect(screen.getByRole("button", { name: "Task filters" }).getAttribute("aria-expanded")).toBe("false");
    });
});
