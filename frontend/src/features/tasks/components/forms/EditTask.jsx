import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../../../../shared/hooks/useBodyScrollLock";
import { useIsMobile } from "../../../../shared/hooks/useIsMobile";
import { ChevronDown, X } from "lucide-react";

import { convertToInputDate, convertToInputTime } from "../../../../shared/utils/dateUtils";
import { INFO_MAX_LENGTH, NAME_MAX_LENGTH } from "../../../../shared/utils/validation";
import { DATE_TIME_FIELDS, EDIT_SELECT_FIELDS, PRIORITY, STATUS } from "../../constants/taskOptions";
import CompactSelect from "../../../../shared/components/common/CompactSelect";
import TagPicker from "./TagPicker";
import TaskDateTimePicker from "./TaskDateTimePicker";
import { taskSelectStyle } from "../../styles/taskStyles";
import { useTaskFormFields } from "../../hooks/useTaskFormFields";

const emptyFormData = {
    title: "", description: "", dueDate: "", dueTime: "",
    priority: PRIORITY.NONE, status: STATUS.NOT_STARTED, tags: [], assigneeId: "",
};

function EditTask({ task, isOpen, onClose, onSave, collaborative = false, members = [], projectId = null }) {
    const {
        formData, setFormData, errors, setErrors, submitting, setSubmitting,
        formRef, handleChange, handleTagToggle, validateAndFocus,
    } = useTaskFormFields(emptyFormData, collaborative);
    const isMobile = useIsMobile();
    useBodyScrollLock(isOpen && Boolean(task));

    useEffect(() => {
        if (!task) return;

        setFormData({
            title: task.title || "", description: task.description || "",
            dueDate: convertToInputDate(task.dueDate), dueTime: convertToInputTime(task.dueTime),
            priority: task.priority ?? PRIORITY.NONE, status: task.status ?? STATUS.NOT_STARTED,
            tags: task.tags?.map((tag) => tag.tag_id) ?? [], assigneeId: task.assigneeId || "",
        });
        setErrors({});
        setSubmitting(false);
    }, [task, setFormData, setErrors, setSubmitting]);


    if (!isOpen || !task) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        if (!validateAndFocus()) return;

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
        `${field === "description" ? "h-[88px]" : "h-8 sm:h-10"} w-full rounded-lg border bg-white/65 px-2.5 text-slate-600 shadow-sm backdrop-blur-md placeholder:text-slate-400 outline-none transition sm:rounded-xl sm:px-3 sm:text-sm dark:bg-white/[0.05] dark:text-slate-200 dark:placeholder:text-slate-500 ${
            errors[field]
                ? "border-red-300/80 focus:border-red-400 focus:ring-2 focus:ring-red-100/70 dark:border-red-800 dark:focus:border-red-600 dark:focus:ring-red-950"
                : "border-white/80 focus:border-green-400 focus:ring-2 focus:ring-green-100/70 dark:border-white/10 dark:focus:border-green-600 dark:focus:ring-green-950"
        }`;

    const mobileControlStyle = isMobile ? { fontSize: "11px", lineHeight: "1" } : undefined;
    const taskDateStyle = { fontFamily: "inherit", fontSize: "11px", lineHeight: "1.2" };

    const tagButtons = (
        <TagPicker selectedIds={formData.tags} onToggle={handleTagToggle} projectId={projectId} />
    );

    const selectField = ([field, label, options]) => (
        <div key={field} className="min-w-0">
            <label htmlFor={`edit-task-${field}`} className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">{label}</label>
            <div className="relative">
                <CompactSelect id={`edit-task-${field}`} name={field} ariaLabel={label} aria-invalid={Boolean(errors[field])} value={formData[field]} onChange={handleChange} disabled={submitting}
                    className={`${inputClass(field)} min-w-0 appearance-none pr-6 disabled:cursor-not-allowed disabled:opacity-60 sm:pr-8`}
                    style={taskSelectStyle}>
                    {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                </CompactSelect>
                <ChevronDown size={isMobile ? 11 : 14}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 sm:right-2.5" />
            </div>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-900/20 px-2 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 backdrop-blur-sm dark:bg-black/55 sm:px-4 sm:pb-4 sm:pt-20"
            role="dialog" aria-modal="true" aria-labelledby="edit-task-heading">
            <div className="mx-auto flex max-h-full w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40 sm:max-h-[calc(100dvh-6.5rem)]">

                <div className="flex shrink-0 items-center justify-between border-b border-white/60 bg-white/25 px-3.5 py-2 dark:border-white/10 dark:bg-white/[0.02] sm:items-start sm:px-5 sm:py-3">
                    <div className="min-w-0">
                        <h2 id="edit-task-heading" className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">Edit Task</h2>
                        <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500 sm:text-[10px]">
                            {collaborative ? "Update this project task." : "Update your task details."}
                        </p>
                    </div>

                    <button type="button" onClick={handleClose} disabled={submitting} aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/70 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-slate-300">
                        <X size={17} />
                    </button>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3.5 py-2.5 sm:space-y-3 sm:px-5 sm:py-4">
                        <div>
                            <div>
                                <label htmlFor="edit-task-title" className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <input type="text" id="edit-task-title" name="title" aria-invalid={Boolean(errors.title)} value={formData.title} onChange={handleChange} disabled={submitting}
                                    placeholder="Enter task title" className={`${inputClass("title")} disabled:cursor-not-allowed disabled:opacity-60`} style={mobileControlStyle} />
                                <div className="mt-0.5 flex justify-between">
                                    {errors.title ? <p className="text-[9px] text-red-500 dark:text-red-400 sm:text-[10px]">{errors.title}</p> : <span />}
                                    <span className="text-[8px] text-slate-400 dark:text-slate-500 sm:text-[9px]">{formData.title.length}/{NAME_MAX_LENGTH}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 items-start gap-2 sm:grid-cols-3 sm:gap-3">
                            {DATE_TIME_FIELDS.map(([field, label, type]) => (
                                <div key={field} className="min-w-0">
                                    <label htmlFor={`edit-task-${field}`} className="mb-1 block truncate text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">
                                        {label}{" "}
                                        {collaborative
                                            ? <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
                                            : <span className="text-red-400">*</span>}
                                    </label>

                                    <TaskDateTimePicker type={type} id={`edit-task-${field}`} name={field} aria-invalid={Boolean(errors[field])} ariaLabel={label} value={formData[field]} onChange={handleChange}
                                        disabled={submitting || (collaborative && field === "dueTime" && !formData.dueDate)}
                                        className={`${inputClass(field)} min-w-0 px-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3`}
                                        style={taskDateStyle} />
                                    {errors[field] && <p className="mt-0.5 text-[9px] text-red-500 dark:text-red-400 sm:text-[10px]">{errors[field]}</p>}
                                </div>
                            ))}
                            <div className="col-span-2 min-w-0 sm:col-span-1">
                                {selectField(EDIT_SELECT_FIELDS[0])}
                            </div>
                        </div>


                        <div>
                            <label htmlFor="edit-task-description" className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">Description</label>
                            <textarea id="edit-task-description" name="description" aria-invalid={Boolean(errors.description)} value={formData.description} onChange={handleChange} disabled={submitting}
                                placeholder="Add a description..."
                                rows={3} maxLength={INFO_MAX_LENGTH}
                                className={`${inputClass("description")} min-h-[82px] max-h-[240px] resize-y overflow-y-auto py-2 disabled:cursor-not-allowed disabled:opacity-60`}
                                style={mobileControlStyle} />
                            <div className="mt-0.5 flex justify-between">
                                {errors.description ? <p className="text-[9px] text-red-500 dark:text-red-400 sm:text-[10px]">{errors.description}</p> : <span />}
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 sm:text-[9px]">{formData.description.length}/{INFO_MAX_LENGTH}</span>
                            </div>
                        </div>


                        <div className="grid grid-cols-2 items-start gap-2 sm:gap-3">
                            {selectField(EDIT_SELECT_FIELDS[1])}
                            {collaborative && (
                                <div>
                                    <label htmlFor="edit-task-assigneeId" className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">Assign to</label>
                                    <div className="relative">
                                            <CompactSelect id="edit-task-assigneeId" name="assigneeId" ariaLabel="Assign to" value={formData.assigneeId} onChange={handleChange} disabled={submitting}
                                            className={`${inputClass("assigneeId")} appearance-none pr-6 disabled:cursor-not-allowed disabled:opacity-60 sm:pr-8`}
                                                style={taskSelectStyle}>
                                            <option value="">Unassigned</option>
                                            {members.map((member) => (
                                                <option key={member.user_id} value={member.user_id}>
                                                    {member.display_name || member.username || "Project member"}
                                                </option>
                                            ))}
                                            </CompactSelect>
                                        <ChevronDown size={isMobile ? 11 : 14}
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 sm:right-2.5" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <section aria-label="Task tags" className="rounded-xl border border-white/70 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.035]">
                            {tagButtons}
                        </section>
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
        </div>,
        document.body
    );
}

export default EditTask;