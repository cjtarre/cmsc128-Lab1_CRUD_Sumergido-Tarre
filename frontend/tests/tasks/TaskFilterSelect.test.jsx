import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TaskFilterSelect from "../../src/features/tasks/components/filters/TaskFilterSelect";

afterEach(cleanup);

describe("TaskFilterSelect", () => {
    it("opens a custom menu and retains the native onChange event shape", () => {
        const onChange = vi.fn();
        render(
            <TaskFilterSelect value="" onChange={onChange}>
                <option value="">Status</option>
                <option value="in_progress">In Progress</option>
            </TaskFilterSelect>
        );
        expect(screen.queryByRole("combobox")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Filter by Status" }));
        expect(screen.getByRole("listbox", { name: "Choose Status" })).toBeTruthy();
        fireEvent.click(screen.getByRole("option", { name: "In Progress" }));
        expect(onChange).toHaveBeenCalledWith({ target: { value: "in_progress" } });
        expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("supports Escape and keyboard navigation", () => {
        render(
            <TaskFilterSelect value="" onChange={vi.fn()}>
                <option value="">Priority</option>
                <option value="high">High</option>
            </TaskFilterSelect>
        );
        const trigger = screen.getByRole("button", { name: "Filter by Priority" });
        fireEvent.click(trigger);
        const list = screen.getByRole("listbox", { name: "Choose Priority" });
        fireEvent.keyDown(list, { key: "ArrowDown" });
        expect(document.activeElement).toBe(screen.getByRole("option", { name: "High" }));
        fireEvent.keyDown(list, { key: "Escape" });
        expect(screen.queryByRole("listbox")).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });
});
