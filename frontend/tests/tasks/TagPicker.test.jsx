import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import TagPicker from "../../src/features/tasks/components/forms/TagPicker";
import { useTaskData } from "../../src/features/tasks/context/TaskContext";
import { tagService } from "../../src/features/tasks/services/tagService";

vi.mock("../../src/features/tasks/context/TaskContext", () => ({ useTaskData: vi.fn() }));
vi.mock("../../src/features/tasks/services/tagService", () => ({
    tagService: { getTags: vi.fn(), createTag: vi.fn(), updateTag: vi.fn(), deleteTag: vi.fn() },
}));

afterEach(() => {
    cleanup();
    vi.resetAllMocks();
});

describe("TagPicker", () => {
    it("creates and selects a personal tag and updates the shared tag list", async () => {
        const setAvailableTags = vi.fn();
        const onToggle = vi.fn();
        const created = { tag_id: 3, tag_name: "Research", color: "#64748b", project_id: 1 };
        useTaskData.mockReturnValue({ availableTags: [], setAvailableTags });
        tagService.createTag.mockResolvedValue(created);

        render(<TagPicker onToggle={onToggle} />);
        fireEvent.click(screen.getByRole("button", { name: "New tag" }));
        fireEvent.change(screen.getByLabelText("New tag name"), { target: { value: " Research " } });
        fireEvent.click(screen.getByRole("button", { name: "Create", exact: true }));

        await screen.findByRole("button", { name: "Research" });
        expect(tagService.createTag).toHaveBeenCalledWith({ tagName: "Research", color: "#64748b", projectId: null });
        expect(setAvailableTags).toHaveBeenCalledWith([created]);
        expect(onToggle).toHaveBeenCalledWith(created.tag_id);
    });

    it("edits and deletes project tags without modifying the personal tag list", async () => {
        const setAvailableTags = vi.fn();
        const onToggle = vi.fn();
        const tag = { tag_id: 4, tag_name: "Draft", color: "#3b82f6", project_id: 7 };
        useTaskData.mockReturnValue({ availableTags: [], setAvailableTags });
        tagService.getTags.mockResolvedValue([tag]);
        tagService.updateTag.mockResolvedValue({ ...tag, tag_name: "Review" });
        tagService.deleteTag.mockResolvedValue(undefined);

        render(<TagPicker projectId={7} selectedIds={[tag.tag_id]} onToggle={onToggle} />);
        await screen.findByRole("button", { name: "Draft" });
        expect(tagService.getTags).toHaveBeenCalledWith({ projectId: 7 });

        fireEvent.click(screen.getByRole("button", { name: "Manage", exact: true }));
        fireEvent.click(screen.getByRole("button", { name: "Edit Draft tag" }));
        fireEvent.change(screen.getByLabelText("Edit tag name"), { target: { value: "Review" } });
        fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));

        fireEvent.click(await screen.findByRole("button", { name: "Delete Review tag" }));
        const dialog = screen.getByRole("dialog", { name: "Delete tag?" });
        fireEvent.click(within(dialog).getByRole("button", { name: "Delete Tag" }));

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(screen.queryByRole("button", { name: "Delete Review tag" })).toBeNull();
        expect(tagService.updateTag).toHaveBeenCalledWith(tag.tag_id, { tagName: "Review", color: tag.color });
        expect(tagService.deleteTag).toHaveBeenCalledWith(tag.tag_id);
        expect(onToggle).toHaveBeenCalledWith(tag.tag_id);
        expect(setAvailableTags).not.toHaveBeenCalled();
    });
});
