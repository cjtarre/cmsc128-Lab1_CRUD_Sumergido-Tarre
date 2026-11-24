import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CompactSelect from "../../src/shared/components/common/CompactSelect";

afterEach(cleanup);

const items = [
    <option key="none" value="">None</option>,
    <option key="low" value="low">Low</option>,
    <option key="high" value="high">High</option>,
];

describe("CompactSelect", () => {
    it("shows a styled menu, preserves the field name and emits a select-shaped event", () => {
        const onChange = vi.fn();
        render(<CompactSelect id="add-task-priority" name="priority" ariaLabel="Priority" value="low" onChange={onChange}>{items}</CompactSelect>);
        const control = screen.getByRole("combobox", { name: "Priority" });
        expect(control.id).toBe("add-task-priority");
        fireEvent.click(control);
        fireEvent.click(screen.getByRole("option", { name: "High" }));
        expect(onChange).toHaveBeenCalledWith({ target: { name: "priority", value: "high" } });
        expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("keeps the error attribute and closes on Escape", () => {
        render(<CompactSelect name="status" value="high" aria-invalid={true}>{items}</CompactSelect>);
        const control = screen.getByRole("combobox", { name: "status" });
        expect(control.getAttribute("aria-invalid")).toBe("true");
        fireEvent.click(control);
        fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
        expect(screen.queryByRole("listbox")).toBeNull();
        expect(document.activeElement).toBe(control);
    });

    it("does not open when disabled", () => {
        render(<CompactSelect name="priority" value="high" disabled>{items}</CompactSelect>);
        const control = screen.getByRole("combobox", { name: "priority" });
        fireEvent.click(control);
        expect(screen.queryByRole("listbox")).toBeNull();
    });
});
