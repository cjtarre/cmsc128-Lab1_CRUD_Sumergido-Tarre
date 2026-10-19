import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { PRIORITY, STATUS, DATE_TIME_FIELDS, EDIT_SELECT_FIELDS } from "../constants/taskOptions";
import { convertToInputDate, convertToInputTime } from "../../../shared/utils/dateUtils";
import { validateTask, INFO_MAX_LENGTH, NAME_MAX_LENGTH } from "../../../shared/utils/validation";
import { useTaskData } from "../context/TaskContext";

const emptyFormData = {
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: PRIORITY.NONE,
    status: STATUS.NOT_STARTED,
    tags: [],
};

function EditTask({ task, isOpen, onClose, onSave }) {
    const { availableTags } = useTaskData();
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!task) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            title: task.title || "",
            description: task.description || "",
            dueDate: convertToInputDate(task.dueDate),
            dueTime: convertToInputTime(task.dueTime),
            priority: task.priority ?? PRIORITY.NONE,
            status: task.status ?? STATUS.NOT_STARTED,
            tags: task.tags?.map((tag) => tag.tag_id) ?? [],
        });

        setErrors({});
    }, [task]);

    useEffect(() => {
        if (!isOpen) return;

        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = overflow;
        };
    }, [isOpen]);

    if (!isOpen || !task) return null;

    const handleChange = ({ target }) => {
        setFormData((previous) => ({ ...previous, [target.name]: target.value }));
        if (target.value.trim?.()) setErrors((previous) => ({ ...previous, [target.name]: "" }));
    };

    const handleTagToggle = (tagId) => {
        setFormData((previous) => ({
            ...previous,
            tags: previous.tags.includes(tagId)
                ? previous.tags.filter((id) => id !== tagId)
                : [...previous.tags, tagId],
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const validationErrors = validateTask(formData);

        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        onSave({
            ...task,
            ...formData,
            title: formData.title.trim(),
            description: formData.description.trim(),
        });
    };

    const inputClass = (field) =>
        `w-full rounded-xl border bg-white/65 px-3 py-2 text-sm text-slate-600 shadow-sm backdrop-blur-md placeholder:text-slate-400 outline-none transition dark:bg-white/[0.05] dark:text-slate-200 dark:placeholder:text-slate-500 ${
            errors[field]
                ? "border-red-300/80 focus:border-red-400 focus:ring-2 focus:ring-red-100/70 dark:border-red-800 dark:focus:border-red-600 dark:focus:ring-red-950"
                : "border-white/80 focus:border-green-400 focus:ring-2 focus:ring-green-100/70 dark:border-white/10 dark:focus:border-green-600 dark:focus:ring-green-950"
        }`;

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-900/20 px-3 pb-4 pt-20 backdrop-blur-sm dark:bg-black/55 sm:px-4 sm:pb-5 sm:pt-20" role="dialog" aria-modal="true" aria-labelledby="edit-task-title">
            <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40">
                <div className="flex items-start justify-between border-b border-white/60 bg-white/25 px-5 py-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                    <div>
                        <h2 id="edit-task-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100">Edit Task</h2>
                        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">Update your task details.</p>
                    </div>

                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/70 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200/60 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-slate-300">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-3.5 px-5 py-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                Title <span className="text-red-400">*</span>
                            </label>

                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter task title" className={`${inputClass("title")} placeholder:text-sm`} />

                            <div className="mt-1 flex justify-between">
                                {errors.title ? <p className="text-xs text-red-500 dark:text-red-400">{errors.title}</p> : <span />}
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{formData.title.length}/{NAME_MAX_LENGTH}</span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Description</label>

                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Add a description..." rows={2} className={`${inputClass("description")} resize-none placeholder:text-sm`} />

                            <div className="mt-1 flex justify-between">
                                {errors.description ? <p className="text-xs text-red-500 dark:text-red-400">{errors.description}</p> : <span />}
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{formData.description.length}/{INFO_MAX_LENGTH}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {DATE_TIME_FIELDS.map(([field, label, type]) => (
                                <div key={field} className="min-w-0">
                                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                        {label} <span className="text-red-400">*</span>
                                    </label>

                                    <input type={type} name={field} value={formData[field]} onChange={handleChange} className={inputClass(field)} />
                                    {errors[field] && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors[field]}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {EDIT_SELECT_FIELDS.map(([field, label, options]) => (
                                <div key={field} className="min-w-0">
                                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>

                                    <div className="relative">
                                        <select name={field} value={formData[field]} onChange={handleChange} className={`${inputClass(field)} min-w-0 appearance-none pr-8 text-xs sm:text-sm`}>
                                            {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                                        </select>

                                        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Tags</label>

                            <div className="flex min-h-[36px] flex-wrap content-start gap-1.5">
                                {availableTags.map((tag) => {
                                    const isSelected = formData.tags.includes(tag.tag_id);

                                    return (
                                        <button
                                            key={tag.tag_id}
                                            type="button"
                                            onClick={() => handleTagToggle(tag.tag_id)}
                                            className={`rounded-full border px-2.5 py-1.5 text-[11px] font-medium leading-none transition ${
                                                isSelected
                                                    ? "border-green-400 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/50 dark:text-green-400"
                                                    : "border-white/80 bg-white/50 text-slate-500 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08]"
                                            }`}
                                        >
                                            {tag.tag_name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-white/60 bg-white/30 px-5 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.025] sm:flex-row sm:justify-end">
                        <button type="button" onClick={onClose} className="w-full rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-white/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-200 sm:w-auto">
                            Cancel
                        </button>

                        <button type="submit" className="w-full rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(34,197,94,0.18)] transition hover:bg-green-600 hover:shadow-[0_8px_22px_rgba(34,197,94,0.24)] focus:outline-none focus:ring-2 focus:ring-green-300/60 dark:hover:bg-green-400 sm:w-auto">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTask;