import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Filter } from "lucide-react";

import ProjectSelect from "../../src/features/projects/components/filters/ProjectSelect";

afterEach(cleanup);

const options = [
    { value: "all", label: "All" },
    { value: "owned", label: "Owned" },
    { value: "shared", label: "Shared" },
];

function renderSelect(props = {}) {
    const onChange = vi.fn();
    render(
        <ProjectSelect
            label="Filter projects by membership"
            Icon={Filter}
            value="all"
            defaultValue="all"
            options={options}
            onChange={onChange}
            {...props}
        />
    );
    return onChange;
}

describe("ProjectSelect", () => {
    it("opens a styled list and selects an option", () => {
        const onChange = renderSelect();
        const trigger = screen.getByRole("button", { name: "Filter projects by membership" });
        fireEvent.click(trigger);
        expect(trigger.getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByRole("listbox")).toBeTruthy();
        fireEvent.click(screen.getByRole("option", { name: "Owned" }));
        expect(onChange).toHaveBeenCalledWith("owned");
        expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("dismisses on Escape and restores trigger focus", () => {
        renderSelect();
        const trigger = screen.getByRole("button", { name: "Filter projects by membership" });
        fireEvent.click(trigger);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("listbox")).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    it("closes on outside pointer down", () => {
        renderSelect();
        fireEvent.click(screen.getByRole("button", { name: "Filter projects by membership" }));
        fireEvent.pointerDown(document.body);
        expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("supports arrow-key focus within the menu", () => {
        renderSelect();
        fireEvent.click(screen.getByRole("button", { name: "Filter projects by membership" }));
        const list = screen.getByRole("listbox");
        expect(document.activeElement).toBe(screen.getByRole("option", { name: "All" }));
        fireEvent.keyDown(list, { key: "ArrowDown" });
        expect(document.activeElement).toBe(screen.getByRole("option", { name: "Owned" }));
    });
});
