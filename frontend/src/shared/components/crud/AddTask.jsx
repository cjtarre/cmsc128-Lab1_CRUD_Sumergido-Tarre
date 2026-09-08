import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { PRIORITY } from "../../constants/taskOptions";
import { validateTask, INFO_MAX_LENGTH, NAME_MAX_LENGTH } from "../../utils/validation";
import { useTaskData } from "../../context/taskContext";

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

    // Uncomment the following useEffect to prevent background scrolling when the modal is open
    // useEffect(() => {
    //     if (!task) return;

    //     const originalOverflow = document.body.style.overflow;
    //     document.body.style.overflow = "hidden";

    //     return () => {
    //         document.body.style.overflow = originalOverflow;
    //     };
    // }, [task]);
    if (!isOpen) return null;

    const handleChange = ({ target }) => {
        const value =
            target.name === "priority"
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
        setFormData((previous) => {
            const exists = previous.tags.includes(tagId);
            return {
                ...previous,
                tags: exists
                    ? previous.tags.filter((id) => id !== tagId)
                    : [...previous.tags, tagId],
            };
        });
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

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/25 px-4">
            <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="shrink-0 flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Add Task
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                            Create a new task.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 overflow-y-auto space-y-5 px-6 py-6">
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
                                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                                    errors.title
                                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                        : "border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                }`}
                            />
                            <div className="mt-1.5 flex items-center justify-between">
                                {errors.title ? (
                                    <p className="text-xs text-red-500">{errors.title}</p>
                                ) : (
                                    <span />
                                )}
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
                                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
                            />
                            <div className="mt-1.5 flex items-center justify-between">
                                {errors.description ? (
                                    <p className="mt-1.5 text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                ): (
                                    <span />
                                )}
                                <span className="text-[10px] text-slate-400">
                                    {formData.description.length}/{INFO_MAX_LENGTH}
                                </span>
                            </div>
                        </div>
                        
                        {/* Due Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Due Date {/*<span className="text-red-400">*</span>*/}
                                </label> 
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                />
                                {errors.dueDate && (
                                    <p className="mt-1.5 text-xs text-red-500">
                                        {errors.dueDate}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Due Time {/*<span className="text-red-400">*</span>*/}
                                </label>
                                <input
                                    type="time"
                                    name="dueTime"
                                    value={formData.dueTime}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                />
                                {errors.dueTime && (
                                    <p className="mt-1.5 text-xs text-red-500">
                                        {errors.dueTime}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                >
                                    <option value={PRIORITY.NONE}>None</option>
                                    <option value={PRIORITY.LOW}>Low</option>
                                    <option value={PRIORITY.MEDIUM}>Medium</option>
                                    <option value={PRIORITY.HIGH}>High</option>
                                </select>
                            </div>
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
                                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
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

                    <div className="shrink-0 flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600"
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