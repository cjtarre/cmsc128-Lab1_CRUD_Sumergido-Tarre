import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { PRIORITY, STATUS } from "../../constants/taskOptions";
import { convertToInputDate, convertToInputTime } from "../../utils/dateUtils";
import { validateTask } from "../../utils/validation";
import { useTaskData } from "../../context/taskContext";

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
            tags: task.tags?.map((t) => t.tag_id) ?? [],
        });

        setErrors({});
    }, [task]);

    if (!isOpen || !task) return null;

    const handleChange = ({ target }) => {
        const value =
            target.name === "priority" || target.name === "status"
                ? Number(target.value)
                : target.value;

        setFormData((previous) => ({
            ...previous,
            [target.name]: value,
        }));

        if (target.name === "title" && target.value.trim()) {
            setErrors((previous) => ({
                ...previous,
                title: "",
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
            return;
        }

        onSave({
            ...task,
            ...formData,
            title: formData.title.trim(),
            description: formData.description.trim(),
        });
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/25 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-title"
        >
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2
                            id="edit-task-title"
                            className="text-lg font-semibold text-slate-800"
                        >
                            Edit Task
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
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

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 px-6 py-6">
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
                            {errors.title && (
                                <p className="mt-1.5 text-xs text-red-500">
                                    {errors.title}
                                </p>
                            )}
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
                                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                            />
                        </div>

                        {/* Due Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Due Time
                                </label>
                                <input
                                    type="time"
                                    name="dueTime"
                                    value={formData.dueTime}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                />
                            </div>
                        </div>

                        {/* Priority & Status*/}
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
                                Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                                >
                                    <option value={STATUS.NOT_STARTED}>
                                        Not Started
                                    </option>
                                    <option value={STATUS.IN_PROGRESS}>
                                        In Progress
                                    </option>
                                    <option value={STATUS.COMPLETED}>
                                        Completed
                                    </option>
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

                    <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
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