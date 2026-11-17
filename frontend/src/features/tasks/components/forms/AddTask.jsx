import { useEffect } from "react";
import { useBodyScrollLock } from "../../../../shared/hooks/useBodyScrollLock";
import { useIsMobile } from "../../../../shared/hooks/useIsMobile";
import { ChevronDown, X } from "lucide-react";

import { INFO_MAX_LENGTH, NAME_MAX_LENGTH } from "../../../../shared/utils/validation";
import { PRIORITY, PRIORITY_OPTIONS } from "../../constants/taskOptions";
import CompactSelect from "../../../../shared/components/common/CompactSelect";
import TagPicker from "./TagPicker";
import TaskDateTimePicker from "./TaskDateTimePicker";
import { taskSelectStyle } from "../../styles/taskStyles";
import { useTaskFormFields } from "../../hooks/useTaskFormFields";

const initialFormData = {
    title: "", description: "", dueDate: "", dueTime: "",
    priority: PRIORITY.NONE, tags: [], assigneeId: "",
};

function AddTask({ isOpen, onClose, onSubmit, initialDueDate = "", collaborative = false, members = [], projectId = null }) {
    const {
        formData, setFormData, errors, setErrors, submitting, setSubmitting,
        formRef, handleChange, handleTagToggle, validateAndFocus,
    } = useTaskFormFields(initialFormData, collaborative);
    const isMobile = useIsMobile();
    useBodyScrollLock(isOpen);

    useEffect(() => {
        if (!isOpen) return;

        // Reset the form whenever the modal opens.
        setFormData({ ...initialFormData, dueDate: initialDueDate });
        setErrors({});
        setSubmitting(false);

    }, [isOpen, initialDueDate, setFormData, setErrors, setSubmitting]);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        if (!validateAndFocus()) return;

        try {
            setSubmitting(true);
            if (await onSubmit(formData)) {
                setFormData(initialFormData);
                setErrors({});
                onClose();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        setFormData(initialFormData);
        setErrors({});
        onClose();
    };

    const inputClass = (field) =>
        `${field === "description" ? "h-[88px]" : "h-8 sm:h-auto"} w-full rounded-lg border bg-white/65 px-2.5 text-slate-700 shadow-sm backdrop-blur-md placeholder:text-slate-400 outline-none transition sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm dark:bg-white/[0.05] dark:text-slate-200 dark:placeholder:text-slate-500 ${
            errors[field]
                ? "border-red-300/80 focus:border-red-400 focus:ring-2 focus:ring-red-100/70 dark:border-red-700 dark:focus:border-red-500 dark:focus:ring-red-950/50"
                : "border-white/80 focus:border-green-400 focus:ring-2 focus:ring-green-100/70 dark:border-white/10 dark:focus:border-green-600 dark:focus:ring-green-950/50"
        }`;

    const mobileControlStyle = isMobile ? { fontSize: "11px", lineHeight: "1" } : undefined;
    const taskDateStyle = { fontFamily: "inherit", fontSize: "11px", lineHeight: "1.2" };

    const tagButtons = (
        <TagPicker
            selectedIds={formData.tags}
            onToggle={handleTagToggle}
            projectId={projectId}
        />
    );

    const prioritySelect = (
        <div className="relative">
            <CompactSelect id="add-task-priority" name="priority" ariaLabel="Priority" value={formData.priority} onChange={handleChange} disabled={submitting}
                className={`${inputClass("priority")} appearance-none pr-6 disabled:cursor-not-allowed disabled:opacity-60 sm:pr-8`}
                style={taskSelectStyle}>
                {PRIORITY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </CompactSelect>
            <ChevronDown size={isMobile ? 11 : 14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 sm:right-2.5" />
        </div>
    );

    return (
        <div className="fixed inset-x-0 bottom-[68px] top-[60px] z-[9999] flex items-start justify-center overflow-hidden bg-slate-900/20 px-2 py-2 backdrop-blur-sm dark:bg-black/55 sm:inset-0 sm:overflow-y-auto sm:px-4 sm:pb-5 sm:pt-20"
            role="dialog" aria-modal="true" aria-labelledby="add-task-heading">
            <div className="mx-auto flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40 sm:max-h-[calc(100dvh-6.25rem)]">
                <div className="flex shrink-0 items-center justify-between border-b border-white/60 bg-white/25 px-3.5 py-2 dark:border-white/10 dark:bg-white/[0.02] sm:items-start sm:px-5 sm:py-3.5">
                    <div className="min-w-0">
                        <h2 id="add-task-heading" className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">Add Task</h2>
                        <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500 sm:text-[10px]">
                            {collaborative ? "Create a task for this project." : "Create a new task."}
                        </p>
                    </div>

                    <button type="button" onClick={handleClose} disabled={submitting} aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/70 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-slate-300">
                        <X size={17} />
                    </button>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3.5 py-2.5 sm:space-y-3.5 sm:px-5 sm:py-4">
                        <div>
                            <div>
                                <label htmlFor="add-task-title" className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-xs">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <input type="text" id="add-task-title" name="title" aria-invalid={Boolean(errors.title)} value={formData.title} onChange={handleChange} disabled={submitting}
                                    placeholder="Enter task title" className={`${inputClass("title")} disabled:cursor-not-allowed disabled:opacity-60`} style={mobileControlStyle} />
                                <div className="mt-0.5 flex justify-between">
                                    {errors.title ? <p className="text-[9px] text-red-500 dark:text-red-400 sm:text-xs">{errors.title}</p> : <span />}
                                    <span className="text-[8px] text-slate-400 dark:text-slate-500 sm:text-[10px]">{formData.title.length}/{NAME_MAX_LENGTH}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 items-start gap-2 sm:grid-cols-3 sm:gap-3">
                            {[
                                ["dueDate", "Due Date", "date"],
                                ["dueTime", "Due Time", "time"],
                            ].map(([field, label, type]) => (
                                <div key={field} className="min-w-0">
                                    <label htmlFor={`add-task-${field}`} className="mb-1 block truncate text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-xs">
                                        {label}{" "}
                                        {collaborative
                                            ? <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
                                            : <span className="text-red-400">*</span>}
                                    </label>
                                    <TaskDateTimePicker type={type} id={`add-task-${field}`} name={field} aria-invalid={Boolean(errors[field])} ariaLabel={label} value={formData[field]} onChange={handleChange}
                                        disabled={submitting || (collaborative && field === "dueTime" && !formData.dueDate)}
                                        className={`${inputClass(field)} min-w-0 px-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3`}
                                        style={taskDateStyle} />
                                    {errors[field] && <p className="mt-0.5 text-[9px] text-red-500 dark:text-red-400 sm:mt-1 sm:text-xs">{errors[field]}</p>}
                                </div>
                            ))}
                            <div className="col-span-2 min-w-0 sm:col-span-1">
                                <label htmlFor="add-task-priority" className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-xs">Priority</label>
                                {prioritySelect}
                            </div>
                        </div>


                        <div>
                            <label htmlFor="add-task-description" className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-xs">Description</label>
                            <textarea id="add-task-description" name="description" aria-invalid={Boolean(errors.description)} value={formData.description} onChange={handleChange} disabled={submitting}
                                placeholder="Add a description..."
                                rows={3} maxLength={INFO_MAX_LENGTH}
                                className={`${inputClass("description")} min-h-[82px] max-h-[240px] resize-y overflow-y-auto py-2 disabled:cursor-not-allowed disabled:opacity-60`}
                                style={mobileControlStyle} />
                            <div className="mt-0.5 flex justify-between">
                                {errors.description ? <p className="text-[9px] text-red-500 dark:text-red-400 sm:text-xs">{errors.description}</p> : <span />}
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 sm:text-[10px]">{formData.description.length}/{INFO_MAX_LENGTH}</span>
                            </div>
                        </div>


                        {collaborative && (
                            <div>
                                <div className="min-w-0">
                                    <label htmlFor="add-task-assigneeId" className="mb-1 block text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-xs">Assign to</label>
                                    <div className="relative">
                                            <CompactSelect id="add-task-assigneeId" name="assigneeId" ariaLabel="Assign to" value={formData.assigneeId} onChange={handleChange} disabled={submitting}
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
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 sm:right-2.5" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <section aria-label="Task tags" className="rounded-xl border border-white/70 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.035]">
                            {tagButtons}
                        </section>
                    </div>

                    <div className="flex shrink-0 justify-end gap-1.5 border-t border-white/60 bg-white/30 px-3.5 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.025] sm:gap-2 sm:px-5 sm:py-3">
                        <button type="button" onClick={handleClose} disabled={submitting}
                            className="h-7 rounded-lg px-3 font-medium text-slate-500 transition hover:bg-white/70 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-200 sm:h-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                            style={isMobile ? { fontSize: "10px", lineHeight: "1" } : undefined}>
                            Cancel
                        </button>

                        <button type="submit" disabled={submitting}
                            className="h-7 rounded-lg bg-green-500 px-3 font-semibold text-white shadow-[0_6px_18px_rgba(34,197,94,0.18)] transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300/60 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-green-400 sm:h-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                            style={isMobile ? { fontSize: "10px", lineHeight: "1" } : undefined}>
                            {submitting ? "Adding..." : "Add Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddTask;
