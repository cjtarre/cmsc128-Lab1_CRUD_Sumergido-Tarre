import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {PRIORITY, STATUS, DATE_TIME_FIELDS, EDIT_SELECT_FIELDS,} from "../../constants/taskOptions";
import { convertToInputDate, convertToInputTime } from "../../utils/dateUtils";
import { validateTask, INFO_MAX_LENGTH, NAME_MAX_LENGTH,} from "../../utils/validation";
import { useTaskData } from "../../context/TaskContext";

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

        return () => {document.body.style.overflow = overflow;};
    }, [isOpen]);

    if (!isOpen || !task) return null;

    const handleChange = ({ target }) => {
        const value = ["priority", "status"].includes(target.name)
            ? Number(target.value) : target.value;

        setFormData((previous) => ({ ...previous, [target.name]: value }));

        if (target.value.trim?.()) { setErrors((previous) => ({ ...previous, [target.name]: "" }));}
    };

    const handleTagToggle = (tagId) => {
        setFormData((previous) => ({
            ...previous,
            tags: previous.tags.includes(tagId)
                ? previous.tags.filter((id) => id !== tagId) : [...previous.tags, tagId],
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
        `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-500 placeholder:text-xs placeholder:text-slate-400 outline-none transition ${
            errors[field]
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"
        }`;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/25 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-title"
        >
            <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2
                            id="edit-task-title"
                            className="text-lg font-semibold text-slate-800"
                        >
                            Edit Task
                        </h2>
                        <p
                            className="mt-1 text-slate-400"
                            style={{ fontSize: "10px", lineHeight: "1" }}
                        >
                            Update your task details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                        {/* Title */}
                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-600">
                                Title <span className="text-red-400">*</span>
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter task title"
                                className={`${inputClass("title")} placeholder:text-sm`}
                            />

                            <div className="mt-1.5 flex justify-between">
                                {errors.title ? (
                                    <p className="text-xs text-red-500">{errors.title}</p>
                                ) : <span />}

                                <span className="text-[10px] text-slate-400">
                                    {formData.title.length}/{NAME_MAX_LENGTH}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-600">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Add a description..."
                                rows={3}
                                className={`${inputClass("description")} placeholder:text-sm`}
                            />

                            <div className="mt-1.5 flex justify-between">
                                {errors.description ? (
                                    <p className="text-xs text-red-500">{errors.description}</p>
                                ) : <span />}

                                <span className="text-[10px] text-slate-400">
                                    {formData.description.length}/{INFO_MAX_LENGTH}
                                </span>
                            </div>
                        </div>

                        {/* Due Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            {DATE_TIME_FIELDS.map(([field, label, type]) => (
                                <div key={field}>
                                    <label className="mb-2 block text-xs font-medium text-slate-600">
                                        {label} <span className="text-red-400">*</span>
                                    </label>

                                    <input
                                        type={type}
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        className={inputClass(field)}
                                    />

                                    {errors[field] && (
                                        <p className="mt-1.5 text-xs text-red-500">
                                            {errors[field]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Priority & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            {EDIT_SELECT_FIELDS.map(([field, label, options]) => (
                                <div key={field}>
                                    <label className="mb-2 block text-xs font-medium text-slate-600">
                                        {label}
                                    </label>

                                    <select
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        className={inputClass(field)}
                                    >
                                        {options.map(([value, text]) => (
                                            <option key={value} value={value}>{text}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-600">
                                Tags
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => {
                                    const isSelected = formData.tags.includes(tag.tag_id);

                                    return (
                                        <button
                                            key={tag.tag_id}
                                            type="button"
                                            onClick={() => handleTagToggle(tag.tag_id)}
                                            className={`rounded-full border px-3 py-1.5 font-medium transition ${
                                                isSelected
                                                    ? "border-green-400 bg-green-50 text-green-700"
                                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                            }`}
                                            style={{ fontSize: "13px", lineHeight: "1" }}
                                        >
                                            {tag.tag_name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTask;