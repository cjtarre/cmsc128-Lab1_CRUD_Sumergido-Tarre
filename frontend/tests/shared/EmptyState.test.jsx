import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import EmptyState from "../../src/shared/components/common/EmptyState";

afterEach(cleanup);

describe("EmptyState", () => {
    it("shows a compact search empty state with an available clear action", () => {
        const onAction = vi.fn();
        render(
            <EmptyState
                compact
                title="No matching results"
                description="Try another project name."
                actionLabel="Clear search and filters"
                onAction={onAction}
            />
        );

        expect(screen.getByRole("status")).toBeTruthy();
        expect(screen.getByText("No matching results")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Clear search and filters" }));
        expect(onAction).toHaveBeenCalledTimes(1);
    });

    it("keeps the original task empty state for existing callers", () => {
        render(<EmptyState title="No tasks yet" description="Create your first task." />);
        expect(screen.getByText("No tasks yet")).toBeTruthy();
        expect(screen.getByText("Create your first task.")).toBeTruthy();
        expect(screen.queryByRole("status")).toBeNull();
    });
});
