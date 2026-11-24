import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TaskFilterPanel from "../../src/features/tasks/components/filters/TaskFilterPanel";

vi.mock("../../src/features/tasks/context/TaskContext", () => ({
    useTaskData: () => ({ availableTags: [], searchTerm: "", setSearchTerm: vi.fn() }),
}));

afterEach(cleanup);

function FilterHarness() {
    const [priority, setPriority] = useState([]);
    const [status, setStatus] = useState([]);
    const [tags, setTags] = useState([]);
    const [sort, setSort] = useState({ column: "dueDate", mode: "due_asc" });
    return (
        <TaskFilterPanel
            priorityFilter={priority}
            onPriorityFilterChange={setPriority}
            statusFilter={status}
            onStatusFilterChange={setStatus}
            tagFilter={tags}
            onTagFilterChange={setTags}
            activeSort={sort}
            onSortChange={(mode) => setSort(mode ? { column: "tag", mode } : { column: "dueDate", mode: "due_asc" })}
        />
    );
}

describe("My Tasks filter sort menu", () => {
    it("keeps the parent panel open when Sort opens and a tag order is selected", () => {
        render(<FilterHarness />);
        const filters = screen.getByRole("button", { name: "Filter tasks" });
        fireEvent.click(filters);
        expect(filters.getAttribute("aria-expanded")).toBe("true");

        const sortTrigger = screen.getByRole("button", { name: "Sort tasks by tag" });
        fireEvent.pointerDown(sortTrigger);
        fireEvent.click(sortTrigger);
        expect(filters.getAttribute("aria-expanded")).toBe("true");
        expect(sortTrigger.getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByRole("listbox", { name: "Sort tasks by tag options" })).toBeTruthy();
        expect(filters.parentElement.querySelector("[data-dropdown-popup=true]").className).not.toContain("overflow-hidden");

        const descending = screen.getByRole("option", { name: "Tag Z-A" });
        fireEvent.pointerDown(descending);
        fireEvent.click(descending);
        expect(filters.getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByRole("button", { name: "Sort tasks by tag" }).textContent).toContain("Tag Z-A");
    });

    it("dismisses the entire panel when clicking outside", () => {
        render(<FilterHarness />);
        const filters = screen.getByRole("button", { name: "Filter tasks" });
        fireEvent.click(filters);
        fireEvent.click(screen.getByRole("button", { name: "Sort tasks by tag" }));
        fireEvent.pointerDown(document.body);
        expect(filters.getAttribute("aria-expanded")).toBe("false");
    });
});
