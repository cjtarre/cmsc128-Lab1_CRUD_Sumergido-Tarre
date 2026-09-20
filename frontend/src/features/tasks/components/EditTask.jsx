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

        return () => {document.body.style.overflow = overflow;};
    }, [isOpen]);

    if (!isOpen || !task) return null;

    const handleChange = ({ target }) => {
        const value = ["priority", "status"].includes(target.name)
            ? Number(target.value)
            : target.value;

        setFormData((previous) => ({
            ...previous,
            [target.name]: value,
        }));

        if (target.value.trim?.()) {
            setErrors((previous) => ({
                ...previous,
                [target.name]: "",
            }));
        }
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
        `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-500 placeholder:text-slate-400 outline-none transition ${
            errors[field]
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"
        }`;

    return (
        <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/25 p-3 pt-7 sm:flex sm:items-center sm:justify-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-title"
        >
            <div className="mx-auto flex max-h-[calc(100dvh-2.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:max-h-[85vh] sm:rounded-2xl">
                <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                    <div>
                        <h2
                            id="edit-task-title"
                            className="text-lg font-semibold text-slate-800"
                        >
                            Edit Task
                        </h2>

                        <p className="mt-1 text-[10px] leading-none text-slate-400">
                            Update your task details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
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
                                    <p className="text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                ) : (
                                    <span />
                                )}

                                <span className="text-[10px] leading-none text-slate-400">
                                    {formData.title.length}/{NAME_MAX_LENGTH}
                                </span>
                            </div>
                        </div>

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
                                    <p className="text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                ) : (
                                    <span />
                                )}

                                <span className="text-[10px] leading-none text-slate-400">
                                    {formData.description.length}/{INFO_MAX_LENGTH}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {DATE_TIME_FIELDS.map(([field, label, type]) => (
                                <div key={field} className="min-w-0">
                                    <label className="mb-2 block text-xs font-medium text-slate-600">
                                        {label}{" "}
                                        <span className="text-red-400">*</span>
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

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {EDIT_SELECT_FIELDS.map(
                                ([field, label, options]) => (
                                    <div key={field} className="min-w-0">
                                        <label className="mb-2 block text-xs font-medium text-slate-600">
                                            {label}
                                        </label>

                                        <div className="relative">
                                            <select
                                                name={field}
                                                value={formData[field]}
                                                onChange={handleChange}
                                                className={`${inputClass(
                                                    field
                                                )} min-w-0 appearance-none pr-8 text-xs sm:text-sm`}
                                            >
                                                {options.map(
                                                    ([value, text]) => (
                                                        <option
                                                            key={value}
                                                            value={value}
                                                        >
                                                            {text}
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            <ChevronDown
                                                size={14}
                                                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-600">
                                Tags
                            </label>

                            <div className="flex min-h-[42px] flex-wrap content-start gap-1.5">
                                {availableTags.map((tag) => {
                                    const isSelected = formData.tags.includes(
                                        tag.tag_id
                                    );

                                    return (
                                        <button
                                            key={tag.tag_id}
                                            type="button"
                                            onClick={() =>
                                                handleTagToggle(tag.tag_id)
                                            }
                                            className={`rounded-full border px-2.5 py-1.5 text-[11px] font-medium leading-none transition ${
                                                isSelected
                                                    ? "border-green-400 bg-green-50 text-green-700"
                                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                            }`}
                                        >
                                            {tag.tag_name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 sm:w-auto"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 sm:w-auto"
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