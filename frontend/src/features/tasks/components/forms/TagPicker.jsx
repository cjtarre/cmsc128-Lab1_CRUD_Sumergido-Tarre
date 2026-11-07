import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "../../../../shared/components/common/ConfirmDialog";
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
    const [showManageList, setShowManageList] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [tagName, setTagName] = useState("");
    const [color, setColor] = useState(DEFAULT_TAG_COLOR);
    const [saving, setSaving] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

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
            setManageOpen(false);
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
        setShowManageList(false);
        setManageOpen(true);
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
                        <button key={tag.tag_id} type="button" onClick={() => handleTagClick(tag.tag_id)} aria-pressed={selected}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-medium transition sm:px-2.5 sm:text-[11px] ${
                                selected
                                    ? "text-slate-700 shadow-sm dark:text-slate-100"
                                    : "bg-white/45 text-slate-500 hover:bg-white/75 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:bg-white/[0.07]"
                            }`}
                            style={getTagInlineStyle(tag, selected)}>
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tagColor }} />
                            {tag.tag_name}
                            {selected && <Check size={10} strokeWidth={2.5} style={{ color: tagColor }} />}
                        </button>
                    );
                })}

                {(hiddenTagCount > 0 || showAll) && tags.length > VISIBLE_TAG_COUNT && (
                    <button type="button" onClick={() => setShowAll((current) => !current)}
                        className="rounded-full border border-white/80 bg-white/40 px-2 py-1 text-[9px] font-medium text-slate-400 transition hover:bg-white/70 hover:text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500 dark:hover:bg-white/[0.07] dark:hover:text-slate-300 sm:px-2.5 sm:text-[11px]">
                        {showAll ? "Show less" : `+${hiddenTagCount} more`}
                    </button>
                )}

            </div>

            {canManage && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-2 dark:border-white/10">
                    <button type="button" aria-expanded={manageOpen} onClick={() => {
                        if (manageOpen) { setManageOpen(false); resetEditor(); }
                        else { resetEditor(); setShowManageList(false); setManageOpen(true); }
                    }}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-green-300 hover:text-green-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-green-700 dark:hover:text-green-400">
                        {manageOpen ? <X size={13} aria-hidden="true" /> : <Plus size={13} aria-hidden="true" />} {manageOpen ? (editingId ? "Cancel edit" : "Cancel") : "New tag"}
                    </button>
                    {tags.some((tag) => tag.project_id !== null) && (
                        <button type="button" aria-expanded={showManageList} onClick={() => {
                            setShowManageList((current) => !current);
                            setManageOpen(false);
                            resetEditor();
                        }}
                            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-500 transition hover:bg-white/60 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-200">
                            <Settings2 size={13} aria-hidden="true" />
                            {showManageList ? "Done managing" : "Manage tags"}
                            {showManageList ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
                        </button>
                    )}
                </div>
            )}

            {manageOpen && canManage && (
                <div className="space-y-3 rounded-xl border border-white/70 bg-white/45 p-3 dark:border-white/10 dark:bg-white/[0.035]">
                    <div className="space-y-1.5">
                        <label htmlFor="task-tag-name" className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">{editingId ? "Edit tag name" : "New tag name"}</label>
                        <div className="flex items-center gap-1.5">
                            <input id="task-tag-name" type="text" value={tagName} onChange={(event) => setTagName(event.target.value)} maxLength={50}
                            aria-label={editingId ? "Edit tag name" : "New tag name"} placeholder="New tag name"
                            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleSave(); } }}
                            className="h-9 min-w-0 flex-1 rounded-lg border border-white/80 bg-white/70 px-2.5 text-xs text-slate-700 outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100/60 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200" />
                            <button type="button" disabled={!tagName.trim() || saving} onClick={handleSave}
                            className="h-9 shrink-0 rounded-lg bg-green-500 px-3 text-xs font-semibold text-white disabled:opacity-50">
                            {saving ? "Saving..." : editingId ? "Save" : "Create"}
                        </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400" id="task-tag-color-label">Tag color</p>
                        <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby="task-tag-color-label">
                            {TAG_COLORS.map((value) => (
                            <button key={value} type="button" onClick={() => setColor(value)}
                                aria-label={`Select color ${value}`} aria-pressed={color === value}
                                className={`flex h-6 w-6 items-center justify-center rounded-full ${color === value ? "ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900" : "hover:scale-110"}`}
                                style={{ backgroundColor: value }}>
                                {color === value && <Check size={12} className="text-white" />}
                            </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {canManage && showManageList && tags.some((tag) => tag.project_id !== null) && (
                        <div className="rounded-xl border border-white/70 bg-white/35 p-2.5 dark:border-white/10 dark:bg-white/[0.025]">
                            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Custom tags</p>

                            <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                                {tags.filter((tag) => tag.project_id !== null).map((tag) => (
                                    <div key={tag.tag_id} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/60 dark:hover:bg-white/[0.04]">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getTagColor(tag) }} />
                                        <span className="min-w-0 flex-1 truncate text-[10px] text-slate-600 dark:text-slate-300">{tag.tag_name}</span>

                                        <button type="button" onClick={() => handleEdit(tag)} aria-label={`Edit ${tag.tag_name}`}
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/70 hover:text-green-600 dark:text-slate-500 dark:hover:bg-white/[0.07] dark:hover:text-green-400">
                                            <Pencil size={13} />
                                        </button>

                                        <button type="button" onClick={() => handleDelete(tag)} aria-label={`Delete ${tag.tag_name}`}
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/70 hover:text-red-500 dark:text-slate-500 dark:hover:bg-white/[0.07] dark:hover:text-red-400">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
            )}

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