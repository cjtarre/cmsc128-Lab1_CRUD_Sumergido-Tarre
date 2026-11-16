import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TaskDateTimePicker from "../../src/features/tasks/components/forms/TaskDateTimePicker";

afterEach(cleanup);

describe("TaskDateTimePicker", () => {
    it("keeps the form change-event contract for a date selection", () => {
        const onChange = vi.fn();
        render(<TaskDateTimePicker type="date" name="dueDate" value="" onChange={onChange} />);
        fireEvent.click(screen.getByRole("button", { name: "Due Date" }));
        fireEvent.click(within(screen.getByRole("dialog", { name: "Choose due date" })).getByRole("button", { name: "Today" }));
        expect(onChange).toHaveBeenCalledWith({ target: { name: "dueDate", value: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) } });
    });

    it("preserves minute precision in time values", () => {
        const onChange = vi.fn();
        render(<TaskDateTimePicker type="time" name="dueTime" value="19:07" onChange={onChange} />);
        fireEvent.click(screen.getByRole("button", { name: "Due Time" }));
        fireEvent.click(within(screen.getByRole("dialog", { name: "Choose due time" })).getByRole("button", { name: "Set time" }));
        expect(onChange).toHaveBeenCalledWith({ target: { name: "dueTime", value: "19:07" } });
    });

    it("does not open when disabled", () => {
        render(<TaskDateTimePicker type="time" name="dueTime" value="" disabled onChange={vi.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: "Due Time" }));
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("allows clearing optional dates", () => {
        const onChange = vi.fn();
        render(<TaskDateTimePicker type="date" name="dueDate" value="2026-11-08" onChange={onChange} />);
        fireEvent.click(screen.getByRole("button", { name: "Due Date" }));
        fireEvent.click(within(screen.getByRole("dialog", { name: "Choose due date" })).getByRole("button", { name: "Clear" }));
        expect(onChange).toHaveBeenCalledWith({ target: { name: "dueDate", value: "" } });
    });
});
