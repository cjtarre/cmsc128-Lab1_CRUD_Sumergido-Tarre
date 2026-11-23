import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AddTask from "../../src/features/tasks/components/forms/AddTask";
import EditTask from "../../src/features/tasks/components/forms/EditTask";

vi.mock("../../src/features/tasks/components/forms/TagPicker", () => ({
    default: () => null,
}));

// jsdom does not implement matchMedia; responsive behavior is tested separately.
vi.mock("../../src/shared/hooks/useIsMobile", () => ({
    useIsMobile: () => false,
}));

afterEach(cleanup);

const localToday = () => {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
};

function selectToday() {
    fireEvent.click(screen.getByRole("button", { name: "Due Date" }));
    const today = within(screen.getByRole("dialog", { name: "Choose due date" })).getByRole("button", { name: "Today" });
    fireEvent.pointerDown(today);
    fireEvent.click(today);
}

function confirmTime() {
    fireEvent.click(screen.getByRole("button", { name: "Due Time" }));
    const setTime = within(screen.getByRole("dialog", { name: "Choose due time" })).getByRole("button", { name: "Set time" });
    fireEvent.pointerDown(setTime);
    fireEvent.click(setTime);
}

describe("Task form date/time workflow", () => {
    it("submits a personal task after choosing a date and time", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);
        const onClose = vi.fn();
        render(<AddTask isOpen onClose={onClose} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByRole("textbox", { name: /Title/ }), { target: { value: "QA new task" } });
        selectToday();
        confirmTime();
        fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            title: "QA new task", dueDate: localToday(), dueTime: expect.stringMatching(/^\d{2}:\d{2}$/),
        })));
        expect(onClose).toHaveBeenCalled();
    });

    it("saves edits after changing the due date on an existing personal task", async () => {
        const onSave = vi.fn().mockResolvedValue(true);
        const onClose = vi.fn();
        const task = {
            id: 42, title: "Old QA task", description: "", dueDate: "08/11/2026", dueTime: "10:30 AM",
            priority: "none", status: "not_started", tags: [],
        };
        render(<EditTask task={task} isOpen onClose={onClose} onSave={onSave} />);

        fireEvent.change(screen.getByRole("textbox", { name: /Title/ }), { target: { value: "Updated QA task" } });
        selectToday();
        fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 42, title: "Updated QA task", dueDate: localToday(), dueTime: "10:30",
        })));
        expect(onClose).toHaveBeenCalled();
    });
});
