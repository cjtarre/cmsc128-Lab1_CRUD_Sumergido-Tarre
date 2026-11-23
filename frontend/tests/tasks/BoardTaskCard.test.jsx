// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import BoardTaskCard from "../../src/features/tasks/components/board/BoardTaskCard";
import { PRIORITY, STATUS } from "../../src/features/tasks/constants/taskOptions";

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

const task = {
    id: 42, title: "Task 2", status: STATUS.IN_PROGRESS,
    priority: PRIORITY.NONE, description: "", tags: [], dueDate: "",
};

function renderCard(overrides = {}) {
    const onStatusChange = vi.fn();
    render(<BoardTaskCard task={task} canEdit isDragging={false} isUpdating={false}
        onDragStart={vi.fn()} onDragEnd={vi.fn()} onStatusChange={onStatusChange} {...overrides} />);
    return onStatusChange;
}

describe("Project Board task status dropdown", () => {
    it("uses a styled menu and changes status after a real pointer interaction", () => {
        const onStatusChange = renderCard();
        const control = screen.getByRole("combobox", { name: "Change status for Task 2" });
        expect(control.tagName).toBe("BUTTON");
        expect(control.style.appearance).toBe("none");

        fireEvent.click(control);
        const menu = screen.getByRole("listbox", { name: "Change status for Task 2" });
        const option = within(menu).getByRole("option", { name: "Done" });
        fireEvent.pointerDown(option);
        fireEvent.mouseDown(option);
        fireEvent.click(option);

        expect(onStatusChange).toHaveBeenCalledOnce();
        expect(onStatusChange).toHaveBeenCalledWith(42, STATUS.COMPLETED);
        expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("hides the status selector from Viewers", () => {
        renderCard({ canEdit: false });
        expect(screen.queryByRole("combobox")).toBeNull();
    });

    it("disables status changes while a task update is pending", () => {
        renderCard({ isUpdating: true });
        const control = screen.getByRole("combobox", { name: "Change status for Task 2" });
        expect(control.disabled).toBe(true);
        fireEvent.click(control);
        expect(screen.queryByRole("listbox")).toBeNull();
    });
});
