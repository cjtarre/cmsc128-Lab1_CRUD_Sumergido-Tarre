import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import { PRIORITY } from "../constants/taskOptions";
import {
    validateTask,
    INFO_MAX_LENGTH,
    NAME_MAX_LENGTH,
} from "../../../shared/utils/validation";
import { useTaskData } from "../context/TaskContext";

const initialFormData = {
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: PRIORITY.NONE,
    tags: [],
};

function AddTask({ isOpen, onClose, onSubmit }) {
    const { availableTags } = useTaskData();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = overflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = ({ target }) => {
        const value =
            target.name === "priority" ? Number(target.value) : target.value;

        setFormData((prev) => ({ ...prev, [target.name]: value }));

        if (target.value.trim?.()) {
            setErrors((prev) => ({ ...prev, [target.name]: "" }));
        }
    };

    const handleTagToggle = (tagId) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter((id) => id !== tagId)
                : [...prev.tags, tagId],
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const validationErrors = validateTask(formData);

        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            document
                .querySelector(`[name="${Object.keys(validationErrors)[0]}"]`)
                ?.focus();
            return;
        }

        onSubmit(event, formData);
        setFormData(initialFormData);
        setErrors({});
    };

    const handleClose = () => {
        setFormData(initialFormData);
        setErrors({});
        onClose();
    };

    const inputClass = (field) =>
        `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 ${
            errors[field]
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-red-700 dark:focus:border-red-500 dark:focus:ring-red-950/50"
                : "border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:focus:border-green-600 dark:focus:ring-green-950/50"
        }`;

    const dateTimeFields = [
        ["dueDate", "Due Date", "date"],
        ["dueTime", "Due Time", "time"],
    ];

    const priorityOptions = [
        [PRIORITY.NONE, "None"],
        [PRIORITY.LOW, "Low"],
        [PRIORITY.MEDIUM, "Medium"],
        [PRIORITY.HIGH, "High"],
    ];

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/25 p-3 pt-7 dark:bg-slate-950/60 sm:flex sm:items-center sm:justify-center sm:p-4">
            <div className="mx-auto flex max-h-[calc(100dvh-2.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:max-h-[85vh] sm:rounded-2xl">
                <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-700 sm:px-6 sm:py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            Add Task
                        </h2>
                        <p className="mt-1 text-[10px] leading-none text-slate-400 dark:text-slate-500">
                            Create a new task.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                            <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                Title <span className="text-red-400">*</span>
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter task title"
                                className={inputClass("title")}
                            />

                            <div className="mt-1.5 flex justify-between">
                                {errors.title ? (
                                    <p className="text-xs text-red-500 dark:text-red-400">
                                        {errors.title}
                                    </p>
                                ) : (
                                    <span />
                                )}

                                <span className="text-[10px] leading-none text-slate-400 dark:text-slate-500">
                                    {formData.title.length}/{NAME_MAX_LENGTH}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Add a description..."
                                rows={3}
                                className={inputClass("description")}
                            />

                            <div className="mt-1.5 flex justify-between">
                                {errors.description ? (
                                    <p className="text-xs text-red-500 dark:text-red-400">
                                        {errors.description}
                                    </p>
                                ) : (
                                    <span />
                                )}

                                <span className="text-[10px] leading-none text-slate-400 dark:text-slate-500">
                                    {formData.description.length}/{INFO_MAX_LENGTH}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {dateTimeFields.map(([field, label, type]) => (
                                <div key={field} className="min-w-0">
                                    <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">
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
                                        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                                            {errors[field]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-[minmax(90px,1fr)_minmax(0,2fr)] gap-3 sm:gap-4">
                            <div className="min-w-0">
                                <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Priority
                                </label>

                                <div className="relative">
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className={`${inputClass("priority")} min-w-0 appearance-none pr-8 text-xs sm:text-sm`}
                                    >
                                        {priorityOptions.map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>

                                    <ChevronDown
                                        size={14}
                                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                    />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Tags
                                </label>

                                <div className="flex min-h-[42px] flex-wrap content-start gap-1.5">
                                    {availableTags.map((tag) => {
                                        const selected = formData.tags.includes(
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
                                                    selected
                                                        ? "border-green-400 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/50 dark:text-green-400"
                                                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                                }`}
                                            >
                                                {tag.tag_name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:w-auto"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 sm:w-auto"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddTask;