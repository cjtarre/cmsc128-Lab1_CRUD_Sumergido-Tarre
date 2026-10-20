// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TaskRow from "../src/features/tasks/components/TaskRow";
import { STATUS, PRIORITY } from "../src/features/tasks/constants/taskOptions";

describe("TaskRow notification highlight", () => {
    const props = {
        title: "Target task",
        description: "Test description",
        status: STATUS.NOT_STARTED,
        priority: PRIORITY.NONE,
        dueDate: "",
        dueTime: "",
        tags: [],
        onToggleComplete: vi.fn(),
        onStatusChange: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onView: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        Element.prototype.scrollIntoView = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        cleanup();
    });

    it("scrolls the task into view when highlighted", () => {
        render(<TaskRow {...props} highlighted />);

        expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "center",
        });
    });

    it("does not scroll when the task is not highlighted", () => {
        render(<TaskRow {...props} />);

        expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });

    it("shows the highlight when targeted", () => {
        const { container } = render(<TaskRow {...props} highlighted />);

        expect(container.firstChild.className).toContain("bg-green-50/80");
    });

    it("removes the highlight after five seconds", () => {
        vi.useFakeTimers();

        const { container } = render(<TaskRow {...props} highlighted />);

        expect(container.firstChild.className).toContain("bg-green-50/80");

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(container.firstChild.className).not.toContain("bg-green-50/80");
    });

    it("still renders the targeted task normally", () => {
        render(<TaskRow {...props} highlighted />);

        expect(screen.getByText("Target task")).toBeTruthy();
        expect(screen.getByText("Test description")).toBeTruthy();
        expect(screen.getAllByText("No due date").length).toBeGreaterThan(0);
    });
});