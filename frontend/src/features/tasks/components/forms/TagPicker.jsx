import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { useTaskData } from "../../context/TaskContext";
import { tagService } from "../../services/tagService";
import { DEFAULT_TAG_COLOR, getTagColor, getTagInlineStyle } from "../../styles/taskStyles";

const TAG_COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#14b8a6", "#64748b"];
const VISIBLE_TAG_COUNT = 4;
const MAX_SELECTED_TAGS = 3;

function TagPicker({ selectedIds = [], onToggle, projectId = null, canManage = true }) {
    const { availableTags, setAvailableTags } = useTaskData();
    const [tags, setTags] = useState(availableTags);
    const [showAll, setShowAll] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [tagName, setTagName] = useState("");
    const [color, setColor] = useState(DEFAULT_TAG_COLOR);
    const [saving, setSaving] = useState(false);

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
                toast.success("Tag created.");
            }

            resetEditor();
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
        setManageOpen(true);
    };

    const handleDelete = async (tag) => {
        if (!window.confirm(`Delete "${tag.tag_name}"?`)) return;

        try {
            await tagService.deleteTag(tag.tag_id);
            syncTags(tags.filter((item) => item.tag_id !== tag.tag_id));
            if (selectedIds.includes(tag.tag_id)) onToggle(tag.tag_id);
            if (editingId === tag.tag_id) resetEditor();
            toast.success("Tag deleted.");
        } catch (error) {
            console.error("Error deleting tag:", error);
            toast.error(error.response?.data?.error || "Unable to delete tag.");
        }
    };

    // Keep selected tags visible even when the list is collapsed.
    const selectedTags = tags.filter((tag) => selectedIds.includes(tag.tag_id));
    const remainingTags = tags.filter((tag) => !selectedIds.includes(tag.tag_id));
    const collapsedTags = [...selectedTags, ...remainingTags.slice(0, Math.max(VISIBLE_TAG_COUNT - selectedTags.length, 0))];
    const visibleTags = showAll ? tags : collapsedTags;
    const hiddenTagCount = Math.max(tags.length - visibleTags.length, 0);

    return (
        <div className="space-y-2">
            <div className={`flex flex-wrap items-center gap-1 sm:gap-1.5 ${showAll ? "max-h-24 overflow-y-auto pr-1" : ""}`}>
                {visibleTags.map((tag) => {
                    const selected = selectedIds.includes(tag.tag_id);
                    const tagColor = getTagColor(tag);

                    return (
                        <button
                            key={tag.tag_id}
                            type="button"
                            onClick={() => handleTagClick(tag.tag_id)}
                            aria-pressed={selected}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-medium transition sm:px-2.5 sm:text-[11px] ${
                                selected
                                    ? "text-slate-700 shadow-sm dark:text-slate-100"
                                    : "bg-white/45 text-slate-500 hover:bg-white/75 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:bg-white/[0.07]"
                            }`}
                            style={getTagInlineStyle(tag, selected)}
                        >
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tagColor }} />
                            {tag.tag_name}
                            {selected && <Check size={10} strokeWidth={2.5} style={{ color: tagColor }} />}
                        </button>
                    );
                })}

                {(hiddenTagCount > 0 || showAll) && tags.length > VISIBLE_TAG_COUNT && (
                    <button
                        type="button"
                        onClick={() => setShowAll((current) => !current)}
                        className="rounded-full border border-white/80 bg-white/40 px-2 py-1 text-[9px] font-medium text-slate-400 transition hover:bg-white/70 hover:text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500 dark:hover:bg-white/[0.07] dark:hover:text-slate-300 sm:px-2.5 sm:text-[11px]"
                    >
                        {showAll ? "Show less" : `+${hiddenTagCount} more`}
                    </button>
                )}

                {canManage && (
                    <button
                        type="button"
                        onClick={() => setManageOpen((current) => !current)}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300/80 px-2 py-1 text-[9px] font-medium text-slate-400 transition hover:border-green-300 hover:text-green-600 dark:border-slate-700 dark:text-slate-500 dark:hover:border-green-800 dark:hover:text-green-400 sm:px-2.5 sm:text-[11px]"
                    >
                        <Plus size={10} />Tag
                    </button>
                )}
            </div>

            {manageOpen && canManage && (
                <div className="rounded-xl border border-white/80 bg-white/55 p-2.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.035]">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{editingId ? "Edit tag" : "Create tag"}</p>

                        <button type="button" onClick={() => { setManageOpen(false); resetEditor(); }} aria-label="Close tag manager"
                            className="text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                            <X size={13} />
                        </button>
                    </div>

                    <input
                        type="text"
                        value={tagName}
                        onChange={(event) => setTagName(event.target.value)}
                        maxLength={50}
                        placeholder="Tag name"
                        className="mt-2 h-8 w-full rounded-lg border border-white/80 bg-white/70 px-2.5 text-[11px] text-slate-700 outline-none transition focus:border-green-300 focus:ring-2 focus:ring-green-100/60 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:focus:border-green-800 dark:focus:ring-green-950/40"
                    />

                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {TAG_COLORS.map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setColor(value)}
                                aria-label={`Select ${value}`}
                                className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                                    color === value
                                        ? "ring-2 ring-slate-400 ring-offset-2 dark:ring-slate-500 dark:ring-offset-slate-900"
                                        : "hover:scale-110"
                                }`}
                                style={{ backgroundColor: value }}
                            >
                                {color === value && <Check size={12} className="text-white" />}
                            </button>
                        ))}
                    </div>

                    <div className="mt-2 flex justify-end">
                        <button type="button" disabled={!tagName.trim() || saving} onClick={handleSave}
                            className="rounded-lg bg-green-500 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-400">
                            {saving ? "Saving..." : editingId ? "Save" : "Create"}
                        </button>
                    </div>

                    {tags.some((tag) => tag.project_id !== null) && (
                        <div className="mt-2 border-t border-white/70 pt-2 dark:border-white/10">
                            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Custom tags</p>

                            <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                                {tags.filter((tag) => tag.project_id !== null).map((tag) => (
                                    <div key={tag.tag_id} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/60 dark:hover:bg-white/[0.04]">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getTagColor(tag) }} />
                                        <span className="min-w-0 flex-1 truncate text-[10px] text-slate-600 dark:text-slate-300">{tag.tag_name}</span>

                                        <button type="button" onClick={() => handleEdit(tag)} aria-label={`Edit ${tag.tag_name}`}
                                            className="text-slate-400 transition hover:text-green-600 dark:text-slate-500 dark:hover:text-green-400">
                                            <Pencil size={11} />
                                        </button>

                                        <button type="button" onClick={() => handleDelete(tag)} aria-label={`Delete ${tag.tag_name}`}
                                            className="text-slate-400 transition hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400">
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TagPicker;