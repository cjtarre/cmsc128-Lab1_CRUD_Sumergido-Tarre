import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DEFAULT_TAG_COLOR, MAX_SELECTED_TAGS } from "../constants/tagOptions";
import { useTaskData } from "../context/TaskContext";
import { tagService } from "../services/tagService";
import { getTagColor } from "../styles/taskStyles";

const EMPTY_TAG_ROW = { firstRowCount: 0, rowHeight: 36 };

export function useTagPicker({ selectedIds, onToggle, projectId }) {
    const { availableTags, setAvailableTags } = useTaskData();
    const [tags, setTags] = useState(availableTags);
    const [view, setView] = useState("select"); // select | new | manage
    const [editingId, setEditingId] = useState(null);
    const [tagName, setTagName] = useState("");
    const [color, setColor] = useState(DEFAULT_TAG_COLOR);
    const [saving, setSaving] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [expandedTags, setExpandedTags] = useState(false);
    const tagListRef = useRef(null);
    const [tagRows, setTagRows] = useState(EMPTY_TAG_ROW);

    // Count chips that fit in the first row at the current viewport width.
    useEffect(() => {
        if (view !== "select") return;

        const list = tagListRef.current;
        if (!list) return;

        const measure = () => {
            const chips = Array.from(list.querySelectorAll("[data-tag-chip]"));
            if (!chips.length) {
                setTagRows((previous) => previous.firstRowCount === 0 && previous.rowHeight === EMPTY_TAG_ROW.rowHeight
                    ? previous : EMPTY_TAG_ROW);
                return;
            }

            const firstTop = chips[0].offsetTop;
            const firstRowCount = chips.filter((chip) => Math.abs(chip.offsetTop - firstTop) <= 1).length;
            const rowHeight = Math.ceil(chips[0].offsetHeight) + 8; // Include vertical padding.
            setTagRows((previous) => previous.firstRowCount === firstRowCount && previous.rowHeight === rowHeight
                ? previous : { firstRowCount, rowHeight });
        };

        measure();
        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
        if (observer) observer.observe(list);
        window.addEventListener("resize", measure);
        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [view, tags, selectedIds]);

    // Personal tags use shared context; collaborative tags are loaded per project.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!projectId) setTags(availableTags);
    }, [availableTags, projectId]);

    useEffect(() => {
        if (!projectId) return;
        let active = true;

        tagService.getTags({ projectId })
            .then((data) => { if (active) setTags(data || []); })
            .catch((error) => {
                console.error("Error loading project tags:", error);
                toast.error("Unable to load project tags.");
            });

        return () => { active = false; };
    }, [projectId]);

    const syncTags = (nextTags) => {
        setTags(nextTags);
        if (!projectId) setAvailableTags(nextTags);
    };

    const resetEditor = () => {
        setEditingId(null);
        setTagName("");
        setColor(DEFAULT_TAG_COLOR);
    };

    const handleTagClick = (tagId) => {
        const selected = selectedIds.includes(tagId);

        if (!selected && selectedIds.length >= MAX_SELECTED_TAGS) {
            toast.error(`You can select up to ${MAX_SELECTED_TAGS} tags.`);
            return;
        }

        onToggle(tagId);
    };

    const handleSave = async () => {
        const name = tagName.trim();
        if (!name || saving) return;

        try {
            setSaving(true);

            if (editingId) {
                const updated = await tagService.updateTag(editingId, { tagName: name, color });
                syncTags(tags.map((tag) => tag.tag_id === editingId ? updated : tag).sort((a, b) => a.tag_name.localeCompare(b.tag_name)));
                toast.success("Tag updated.");
            } else {
                const created = await tagService.createTag({ tagName: name, color, projectId });
                syncTags([...tags, created].sort((a, b) => a.tag_name.localeCompare(b.tag_name)));
                if (selectedIds.length < MAX_SELECTED_TAGS) {
                    onToggle(created.tag_id);
                    toast.success("Tag created and selected.");
                } else {
                    toast.success("Tag created. Select it after removing another tag.");
                }
            }

            resetEditor();
            setView(editingId ? "manage" : "select");
            setExpandedTags(false);
        } catch (error) {
            console.error("Error saving tag:", error);
            toast.error(error.response?.data?.error || "Unable to save tag.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (tag) => {
        setEditingId(tag.tag_id);
        setTagName(tag.tag_name);
        setColor(getTagColor(tag));
        setView("new");
    };

    const handleConfirmDelete = async () => {
        if (!tagToDelete || deleting) return;

        try {
            setDeleting(true);
            await tagService.deleteTag(tagToDelete.tag_id);
            syncTags(tags.filter((tag) => tag.tag_id !== tagToDelete.tag_id));
            if (selectedIds.includes(tagToDelete.tag_id)) onToggle(tagToDelete.tag_id);
            if (editingId === tagToDelete.tag_id) resetEditor();
            toast.success("Tag deleted.");
            setTagToDelete(null);
        } catch (error) {
            console.error("Error deleting tag:", error);
            toast.error(error.response?.data?.error || "Unable to delete tag.");
        } finally {
            setDeleting(false);
        }
    };

    const manageableTags = tags.filter((tag) => tag.project_id !== null);

    const openNew = () => {
        resetEditor();
        setView("new");
    };

    const showSelect = () => {
        resetEditor();
        setView("select");
        setExpandedTags(false);
    };

    const toggleManage = () => {
        if (view === "manage") {
            showSelect();
        } else {
            resetEditor();
            setView("manage");
        }
    };

    const toggleExpandedTags = () => setExpandedTags((previous) => !previous);
    const cancelDelete = () => { if (!deleting) setTagToDelete(null); };

    return {
        tags, manageableTags, view, editingId, tagName, setTagName, color, setColor, saving,
        tagToDelete, deleting, expandedTags, tagListRef, tagRows,
        handleTagClick, handleSave, handleEdit, requestDelete: setTagToDelete, handleConfirmDelete,
        openNew, showSelect, toggleManage, toggleExpandedTags, cancelDelete,
    };
}
