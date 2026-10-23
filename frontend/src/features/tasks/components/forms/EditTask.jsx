import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import { convertToInputDate, convertToInputTime } from "../../../../shared/utils/dateUtils";
import { INFO_MAX_LENGTH, NAME_MAX_LENGTH, validateTask } from "../../../../shared/utils/validation";
import { DATE_TIME_FIELDS, EDIT_SELECT_FIELDS, PRIORITY, STATUS } from "../../constants/taskOptions";
import TagPicker from "./TagPicker";

const emptyFormData = {
    title: "", description: "", dueDate: "", dueTime: "",
    priority: PRIORITY.NONE, status: STATUS.NOT_STARTED, tags: [], assigneeId: "",
};

function EditTask({ task, isOpen, onClose, onSave, collaborative = false, members = [], projectId = null }) {
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 639px)").matches);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 639px)");
        const update = () => setIsMobile(media.matches);
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        if (!task) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            title: task.title || "", description: task.description || "",
            dueDate: convertToInputDate(task.dueDate), dueTime: convertToInputTime(task.dueTime),
            priority: task.priority ?? PRIORITY.NONE, status: task.status ?? STATUS.NOT_STARTED,
            tags: task.tags?.map((tag) => tag.tag_id) ?? [], assigneeId: task.assigneeId || "",
        });
        setErrors({});
        setSubmitting(false);
    }, [task]);

    useEffect(() => {
        if (!isOpen) return;

        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = overflow; };
    }, [isOpen]);

    if (!isOpen || !task) return null;

    const handleChange = ({ target: { name, value } }) => {
        setFormData((prev) => ({
            ...prev, [name]: value,
            ...(collaborative && name === "dueDate" && !value ? { dueTime: "" } : {}),
        }));
        if (value.trim?.()) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleTagToggle = (tagId) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tagId) ? prev.tags.filter((id) => id !== tagId) : [...prev.tags, tagId],
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        const validationErrors = validateTask(formData, { deadlineRequired: !collaborative });

        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            document.querySelector(`[name="${Object.keys(validationErrors)[0]}"]`)?.focus();
            return;
        }

        try {
            setSubmitting(true);
            const success = await onSave({
                ...task, ...formData,
                title: formData.title.trim(),
                description: formData.description.trim(),
            });
            if (success) onClose();
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => { if (!submitting) onClose(); };

    const inputClass = (field) =>
        `h-8 w-full rounded-lg border bg-white/65 px-2.5 text-slate-600 shadow-sm backdrop-blur-md placeholder:text-slate-400 outline-none transition sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm dark:bg-white/[0.05] dark:text-slate-200 dark:placeholder:text-slate-500 ${
            errors[field]
                ? "border-red-300/80 focus:border-red-400 focus:ring-2 focus:ring-red-100/70 dark:border-red-800 dark:focus:border-red-600 dark:focus:ring-red-950"
                : "border-white/80 focus:border-green-400 focus:ring-2 focus:ring-green-100/70 dark:border-white/10 dark:focus:border-green-600 dark:focus:ring-green-950"
        }`;

    const mobileControlStyle = isMobile ? { fontSize: "11px", lineHeight: "1" } : undefined;
    const mobileDateStyle = isMobile ? { fontSize: "10px", lineHeight: "1" } : undefined;

    const tagButtons = (
        <TagPicker selectedIds={formData.tags} onToggle={handleTagToggle} projectId={projectId} />
    );

    const selectField = ([field, label, options]) => (
        <div key={field} className="min-w-0">
            <label className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">{label}</label>
            <div className="relative">
                <select name={field} value={formData[field]} onChange={handleChange} disabled={submitting}
                    className={`${inputClass(field)} min-w-0 appearance-none pr-6 disabled:cursor-not-allowed disabled:opacity-60 sm:pr-8`}
                    style={mobileControlStyle}>
                    {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                </select>
                <ChevronDown size={isMobile ? 11 : 14}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 sm:right-2.5" />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-x-0 bottom-[68px] top-[60px] z-[9999] flex items-start justify-center overflow-hidden bg-slate-900/40 px-2 py-2 dark:bg-black/65 sm:inset-0 sm:overflow-y-auto sm:px-4 sm:pb-4 sm:pt-20"
            role="dialog" aria-modal="true" aria-labelledby="edit-task-title">
            <div className="mx-auto flex max-h-full w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40 sm:max-h-[calc(100dvh-6.5rem)]">

                <div className="flex shrink-0 items-center justify-between border-b border-white/60 bg-white/25 px-3.5 py-2 dark:border-white/10 dark:bg-white/[0.02] sm:items-start sm:px-5 sm:py-3">
                    <div className="min-w-0">
                        <h2 id="edit-task-title" className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">Edit Task</h2>
                        <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500 sm:text-[10px]">
                            {collaborative ? "Update this project task." : "Update your task details."}
                        </p>
                    </div>

                    <button type="button" onClick={handleClose} disabled={submitting} aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/70 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-slate-300">
                        <X size={17} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
                    <div className="min-h-0 space-y-2 overflow-y-auto px-3.5 py-2.5 sm:space-y-3 sm:px-5 sm:py-4">
                        <div>
                            <label className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">
                                Title <span className="text-red-400">*</span>
                            </label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} disabled={submitting}
                                placeholder="Enter task title" className={`${inputClass("title")} disabled:cursor-not-allowed disabled:opacity-60`} style={mobileControlStyle} />
                            <div className="mt-0.5 flex justify-between">
                                {errors.title ? <p className="text-[9px] text-red-500 dark:text-red-400 sm:text-[10px]">{errors.title}</p> : <span />}
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 sm:text-[9px]">{formData.title.length}/{NAME_MAX_LENGTH}</span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} disabled={submitting}
                                placeholder="Add a description..."
                                className={`${inputClass("description")} h-10 resize-none py-2 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[62px]`}
                                style={mobileControlStyle} />
                            <div className="mt-0.5 flex justify-between">
                                {errors.description ? <p className="text-[9px] text-red-500 dark:text-red-400 sm:text-[10px]">{errors.description}</p> : <span />}
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 sm:text-[9px]">{formData.description.length}/{INFO_MAX_LENGTH}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            {DATE_TIME_FIELDS.map(([field, label, type]) => (
                                <div key={field} className="min-w-0">
                                    <label className="mb-1 block truncate text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">
                                        {label}{" "}
                                        {collaborative
                                            ? <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
                                            : <span className="text-red-400">*</span>}
                                    </label>

                                    <input type={type} name={field} value={formData[field]} onChange={handleChange}
                                        disabled={submitting || (collaborative && field === "dueTime" && !formData.dueDate)}
                                        className={`${inputClass(field)} min-w-0 px-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3`}
                                        style={mobileDateStyle} />
                                    {errors[field] && <p className="mt-0.5 text-[9px] text-red-500 dark:text-red-400 sm:text-[10px]">{errors[field]}</p>}
                                </div>
                            ))}
                        </div>

                        {collaborative ? (
                            <div className="grid grid-cols-2 items-start gap-2 sm:gap-3">
                                <div className="min-w-0 space-y-2 sm:space-y-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">Assign to</label>
                                        <div className="relative">
                                            <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} disabled={submitting}
                                                className={`${inputClass("assigneeId")} appearance-none pr-6 disabled:cursor-not-allowed disabled:opacity-60 sm:pr-8`}
                                                style={mobileControlStyle}>
                                                <option value="">Unassigned</option>
                                                {members.map((member) => (
                                                    <option key={member.user_id} value={member.user_id}>
                                                        {member.display_name || member.username || "Project member"}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={isMobile ? 11 : 14}
                                                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 sm:right-2.5" />
                                        </div>
                                    </div>

                                    {EDIT_SELECT_FIELDS.map(selectField)}
                                </div>

                                <div className="min-w-0">
                                    <label className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">Tags</label>
                                    {tagButtons}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">Tags</label>
                                    {tagButtons}
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    {EDIT_SELECT_FIELDS.map(selectField)}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex shrink-0 justify-end gap-1.5 border-t border-white/60 bg-white/30 px-3.5 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.025] sm:gap-2 sm:px-5 sm:py-2.5">
                        <button type="button" onClick={handleClose} disabled={submitting}
                            className="h-7 rounded-lg px-3 font-medium text-slate-500 transition hover:bg-white/70 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-200 sm:h-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                            style={isMobile ? { fontSize: "10px", lineHeight: "1" } : undefined}>
                            Cancel
                        </button>

                        <button type="submit" disabled={submitting}
                            className="h-7 rounded-lg bg-green-500 px-3 font-semibold text-white shadow-[0_6px_18px_rgba(34,197,94,0.18)] transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300/60 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-green-400 sm:h-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                            style={isMobile ? { fontSize: "10px", lineHeight: "1" } : undefined}>
                            {submitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTask;