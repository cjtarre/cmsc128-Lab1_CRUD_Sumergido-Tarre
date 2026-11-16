import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import TaskFilter from "../../src/features/tasks/components/filters/TaskFilter";

afterEach(cleanup);

describe("TaskFilter mobile/tablet menu", () => {
    it("shows a styled list rather than a native select and updates the filter", () => {
        const onChange = vi.fn();
        render(<TaskFilter value="all" onChange={onChange} />);

        expect(screen.queryByRole("combobox")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Task view filter" }));
        expect(screen.getByRole("listbox", { name: "Task views" })).toBeTruthy();

        fireEvent.click(screen.getByRole("option", { name: "Upcoming" }));
        expect(onChange).toHaveBeenCalledWith("upcoming");
        expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("supports arrow keys, Escape and focus restoration", () => {
        render(<TaskFilter value="today" onChange={vi.fn()} />);
        const trigger = screen.getByRole("button", { name: "Task view filter" });
        fireEvent.click(trigger);
        const listbox = screen.getByRole("listbox", { name: "Task views" });
        expect(document.activeElement).toBe(screen.getByRole("option", { name: "Today" }));

        fireEvent.keyDown(listbox, { key: "ArrowDown" });
        expect(document.activeElement).toBe(screen.getByRole("option", { name: "Upcoming" }));

        fireEvent.keyDown(listbox, { key: "Escape" });
        expect(screen.queryByRole("listbox")).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });
});
