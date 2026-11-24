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

    it("keeps the date popup open through pointerdown so day selection can complete", () => {
        const onChange = vi.fn();
        render(<TaskDateTimePicker type="date" name="dueDate" value="" onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: "Due Date" }));
        const today = within(screen.getByRole("dialog", { name: "Choose due date" })).getByRole("button", { name: "Today" });
        fireEvent.pointerDown(today);
        expect(screen.getByRole("dialog", { name: "Choose due date" })).toBeTruthy();
        fireEvent.click(today);

        expect(onChange).toHaveBeenCalledWith({
            target: { name: "dueDate", value: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
        });
    });

    it("allows selecting a time using a real pointerdown and click sequence", () => {
        const onChange = vi.fn();
        render(<TaskDateTimePicker type="time" name="dueTime" value="19:07" onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: "Due Time" }));
        const popup = screen.getByRole("dialog", { name: "Choose due time" });
        const setTime = within(popup).getByRole("button", { name: "Set time" });
        fireEvent.pointerDown(setTime);
        expect(screen.getByRole("dialog", { name: "Choose due time" })).toBeTruthy();
        fireEvent.click(setTime);

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
