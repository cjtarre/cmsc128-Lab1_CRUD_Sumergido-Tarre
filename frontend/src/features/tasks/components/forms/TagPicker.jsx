import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "../../../../shared/components/common/ConfirmDialog";
import { useTaskData } from "../../context/TaskContext";
import { tagService } from "../../services/tagService";
import { DEFAULT_TAG_COLOR, getTagColor, getTagInlineStyle, getTagSwatchStyle } from "../../styles/taskStyles";
import { TAG_COLORS, TAG_COLOR_NAMES, MAX_SELECTED_TAGS } from "../../constants/tagOptions";


function TagPicker({ selectedIds = [], onToggle, projectId = null, canManage = true }) {
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
    const [tagRows, setTagRows] = useState({ firstRowCount: 0, rowHeight: 36 });

    // Count chips that fit in the first row at the current viewport width.
    useEffect(() => {
        if (view !== "select") return;

        const list = tagListRef.current;
        if (!list) return;

        const measure = () => {
            const chips = Array.from(list.querySelectorAll("[data-tag-chip]"));
            if (!chips.length) {
                setTagRows((previous) => previous.firstRowCount === 0 && previous.rowHeight === 36
                    ? previous : { firstRowCount: 0, rowHeight: 36 });
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

    const handleDelete = (tag) => setTagToDelete(tag);

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

    return (
        <div className="space-y-2">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    {view !== "select" && (
                        <button type="button" aria-label="Back to tag selection" onClick={showSelect}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600 dark:text-slate-300 dark:hover:bg-white/10">
                            <ArrowLeft size={15} aria-hidden="true" />
                        </button>
                    )}
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 sm:text-xs">Tags</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500" aria-live="polite">
                            {view === "select" ? `${selectedIds.length}/${MAX_SELECTED_TAGS} selected` : view === "manage" ? "Manage custom tags" : editingId ? "Edit tag" : "Create a tag"}
                        </p>
                    </div>
                </div>
                {canManage && (
                    <div className="flex items-center gap-1" role="group" aria-label="Tag views">
                        <button type="button" onClick={view === "new" ? showSelect : openNew} aria-pressed={view === "new"}
                            className={`inline-flex min-h-8 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600 sm:text-[11px] ${view === "new" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "text-slate-500 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/10"}`}>
                            <Plus size={13} aria-hidden="true" /> New tag
                        </button>
                        <button type="button" onClick={() => { if (view === "manage") showSelect(); else { resetEditor(); setView("manage"); } }} aria-pressed={view === "manage"}
                            className={`inline-flex min-h-8 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600 sm:text-[11px] ${view === "manage" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "text-slate-500 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/10"}`}>
                            <Settings2 size={13} aria-hidden="true" /> Manage
                        </button>
                    </div>
                )}
            </div>
            <div className="border-t border-slate-200/60 dark:border-white/10" />
            <div className={view === "select" ? "min-h-0" : "max-h-[186px] min-h-0 overflow-y-auto overscroll-contain pr-1"} data-testid="tag-picker-view">
                {view === "select" && (
                    <>
                        <div className={`overscroll-contain ${expandedTags ? "overflow-y-auto" : "overflow-hidden"}`}
                            style={{ maxHeight: expandedTags ? 160 : tagRows.rowHeight }}>
                            <div ref={tagListRef} className="flex flex-wrap content-start items-start gap-1.5 py-1">
                                {tags.length === 0 && <p className="text-xs text-slate-500">No tags yet. Create your first tag.</p>}
                                {tags.map((tag, index) => {
                                    const selected = selectedIds.includes(tag.tag_id);
                                    const style = getTagInlineStyle(tag, selected);
                                    const hidden = !expandedTags && tagRows.firstRowCount > 0 && index >= tagRows.firstRowCount;
                                    return (
                                        <button key={tag.tag_id} data-tag-chip type="button" onClick={() => handleTagClick(tag.tag_id)}
                                            aria-pressed={selected} aria-hidden={hidden ? "true" : undefined} tabIndex={hidden ? -1 : 0}
                                            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600 sm:text-[11px]"
                                            style={style}>
                                            <span className="h-2 w-2 shrink-0 rounded-full border border-slate-400/60 dark:border-slate-300/70" style={{ backgroundColor: getTagColor(tag) }} aria-hidden="true" />
                                            {tag.tag_name}
                                            {selected && <Check size={11} strokeWidth={2.5} style={{ color: style.color }} aria-hidden="true" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {tags.length > tagRows.firstRowCount && (
                            <button type="button" onClick={() => setExpandedTags((previous) => !previous)}
                                aria-expanded={expandedTags}
                                className="mt-1 rounded-md px-1 py-1 text-[11px] font-medium text-slate-500 hover:text-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600 dark:text-slate-300">
                                {expandedTags ? "Show less" : `Show ${tags.length - tagRows.firstRowCount} more`}
                            </button>
                        )}
                    </>
                )}
                {view === "new" && canManage && (
                    <div className="space-y-3 py-1">
                        <div className="space-y-1">
                            <label htmlFor="task-tag-name" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {editingId ? "Edit tag name" : "New tag name"}
                            </label>
                            <div className="flex items-center gap-2">
                                <input id="task-tag-name" type="text" value={tagName} onChange={(event) => setTagName(event.target.value)} maxLength={50}
                                    placeholder="e.g. Research" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleSave(); } }}
                                    className="h-9 min-w-0 flex-1 rounded-lg border border-white/80 bg-white/70 px-2.5 text-xs text-slate-700 outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100/60 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200" />
                                <button type="button" disabled={!tagName.trim() || saving} onClick={handleSave}
                                    className="h-9 shrink-0 rounded-lg bg-green-500 px-3 text-xs font-semibold text-white disabled:opacity-50">
                                    {saving ? "Saving..." : editingId ? "Save" : "Create"}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <p id="task-tag-color-label" className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Tag color</p>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400" aria-live="polite">
                                    {TAG_COLOR_NAMES[color.toLowerCase()] || `Custom ${color.toUpperCase()}`}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby="task-tag-color-label">
                                {TAG_COLORS.map((value) => (
                                    <button key={value} type="button" onClick={() => setColor(value)}
                                        aria-label={`${TAG_COLOR_NAMES[value]} tag color`} aria-pressed={color.toLowerCase() === value}
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${color.toLowerCase() === value ? "ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900" : "hover:scale-110"}`}
                                        style={getTagSwatchStyle(value)}>
                                        {color.toLowerCase() === value && <Check size={12} aria-hidden="true" />}
                                    </button>
                                ))}
                                <div className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border shadow-sm focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 ${!TAG_COLORS.includes(color.toLowerCase()) ? "ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900" : ""}`}
                                    style={TAG_COLORS.includes(color.toLowerCase())
                                        ? { background: "conic-gradient(#ef4444, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)", borderColor: "#64748b" }
                                        : getTagSwatchStyle(color)}>
                                    {!TAG_COLORS.includes(color.toLowerCase()) && <Check size={12} aria-hidden="true" className="pointer-events-none" />}
                                    <input type="color" value={color} onChange={(event) => setColor(event.target.value)}
                                        aria-label="Choose custom tag color" title="Choose custom tag color"
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {view === "manage" && canManage && (
                    <div className="space-y-1 py-1">
                        {manageableTags.length === 0 ? (
                            <p className="text-xs text-slate-500">No custom tags to manage.</p>
                        ) : manageableTags.map((tag) => (
                            <div key={tag.tag_id} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/60 dark:hover:bg-white/[0.04]">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-slate-400/60" style={{ backgroundColor: getTagColor(tag) }} aria-hidden="true" />
                                <span className="min-w-0 flex-1 truncate text-[11px] text-slate-600 dark:text-slate-300">{tag.tag_name}</span>
                                <button type="button" onClick={() => handleEdit(tag)} aria-label={`Edit ${tag.tag_name} tag`}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white/70 hover:text-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600 dark:text-slate-400 dark:hover:bg-white/[0.07]">
                                    <Pencil size={14} aria-hidden="true" />
                                </button>
                                <button type="button" onClick={() => handleDelete(tag)} aria-label={`Delete ${tag.tag_name} tag`}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white/70 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 dark:text-slate-400 dark:hover:bg-white/[0.07]">
                                    <Trash2 size={14} aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={Boolean(tagToDelete)}
                title="Delete tag?"
                message={tagToDelete ? `Delete "${tagToDelete.tag_name}"? This custom tag will no longer be available in this project.` : ""}
                confirmText="Delete Tag"
                loading={deleting}
                loadingText="Deleting..."
                onConfirm={handleConfirmDelete}
                onCancel={() => { if (!deleting) setTagToDelete(null); }}
            />
        </div>
    );
}

export default TagPicker;