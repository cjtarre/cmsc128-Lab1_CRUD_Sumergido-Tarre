import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTaskFormFields } from "../../src/features/tasks/hooks/useTaskFormFields";

const initial = { title: "", description: "", dueDate: "", dueTime: "", tags: [] };

describe("useTaskFormFields", () => {
    it("updates fields and clears their validation errors after typing", () => {
        const { result } = renderHook(() => useTaskFormFields(initial, false));
        act(() => result.current.setErrors({ title: "Required" }));
        act(() => result.current.handleChange({ target: { name: "title", value: "Study" } }));
        expect(result.current.formData.title).toBe("Study");
        expect(result.current.errors.title).toBe("");
    });

    it("toggles tags without duplicates", () => {
        const { result } = renderHook(() => useTaskFormFields(initial, false));
        act(() => result.current.handleTagToggle(3));
        expect(result.current.formData.tags).toEqual([3]);
        act(() => result.current.handleTagToggle(3));
        expect(result.current.formData.tags).toEqual([]);
    });

    it("clears a collaborative task's time when its date is removed", () => {
        const { result } = renderHook(() => useTaskFormFields({ ...initial, dueDate: "2026-11-09", dueTime: "10:00" }, true));
        act(() => result.current.handleChange({ target: { name: "dueDate", value: "" } }));
        expect(result.current.formData.dueTime).toBe("");
    });

    it("focuses the invalid field in its own form", () => {
        const { result } = renderHook(() => useTaskFormFields(initial, false));
        const form = document.createElement("form");
        const title = document.createElement("input");
        title.name = "title";
        form.appendChild(title);
        document.body.appendChild(form);
        act(() => { result.current.formRef.current = form; });
        act(() => expect(result.current.validateAndFocus()).toBe(false));
        expect(document.activeElement).toBe(title);
        expect(result.current.errors.title).toBeTruthy();
        form.remove();
    });
});
