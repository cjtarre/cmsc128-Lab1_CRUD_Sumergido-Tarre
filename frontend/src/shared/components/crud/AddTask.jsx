import { useState } from "react";
import { X } from "lucide-react";

import { PRIORITY } from "../../constants/taskOptions";
import { validateTask } from "../../utils/validation";
import { useTaskData } from "../../context/taskContext";

const initialFormData = {
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: PRIORITY.NONE,
    tag: "",
};

function AddTask({ isOpen, onClose, onSubmit }) {
    const { availableTags } = useTaskData();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});

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
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
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

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 px-6 py-6">
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
                            {errors.title && (
                                <p className="mt-1.5 text-xs text-red-500">
                                    {errors.title}
                                </p>
                            )}
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
                                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Due Date <span className="text-red-400">*</span>
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
                                    Due Time <span className="text-red-400">*</span>
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

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Tag
                                </label>
                                <select
                                    name="tag"
                                    value={formData.tag}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                >
                                    <option value="">Select a tag</option>
                                    {availableTags.map((tag) => (
                                        <option
                                            key={tag.tag_id}
                                            value={tag.tag_id}
                                        >
                                            {tag.tag_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
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