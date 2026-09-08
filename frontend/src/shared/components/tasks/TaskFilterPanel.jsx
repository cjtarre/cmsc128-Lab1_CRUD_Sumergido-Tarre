import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { PRIORITY, priorityLabels, STATUS, statusLabels } from "../../constants/taskOptions";
import { useTaskData } from "../../context/TaskContext";

function TaskFilterPanel({
    priorityFilter,
    onPriorityFilterChange,
    statusFilter,
    onStatusFilterChange,
    tagFilter,
    onTagFilterChange,
}) {
    const { availableTags, searchTerm, setSearchTerm } = useTaskData();
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleValue = (list, value, onChange) => {
        onChange(
            list.includes(value)
                ? list.filter((item) => item !== value)
                : [...list, value]
        );
    };

    const activeFilterCount =
        priorityFilter.length + statusFilter.length + tagFilter.length;

    const clearAll = () => {
        onPriorityFilterChange([]);
        onStatusFilterChange([]);
        onTagFilterChange([]);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex w-full items-center justify-between px-5 py-3">
                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="flex flex-1 items-center gap-2"
                >
                    <span className="text-sm font-medium text-slate-700">Search & Filter</span>
                    {activeFilterCount > 0 && (
                        <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-3">
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-[11px] font-medium text-slate-400 hover:text-slate-600"
                        >
                            Clear all
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                    >
                        <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-5 border-t border-slate-100 px-5 py-5">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={searchTerm || ""}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search tasks..."
                            aria-label="Search tasks"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-green-300 focus:ring-2 focus:ring-green-50"
                        />
                    </div>

                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Priority
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {Object.values(PRIORITY).map((level) => (
                                <label
                                    key={level}
                                    className="flex items-center gap-2 text-sm text-slate-600"
                                >
                                    <input
                                        type="checkbox"
                                        checked={priorityFilter.includes(level)}
                                        onChange={() =>
                                            toggleValue(priorityFilter, level, onPriorityFilterChange)
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-green-500 focus:ring-green-400"
                                    />
                                    {priorityLabels[level]}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Status
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {Object.values(STATUS).map((value) => (
                                <label
                                    key={value}
                                    className="flex items-center gap-2 text-sm text-slate-600"
                                >
                                    <input
                                        type="checkbox"
                                        checked={statusFilter.includes(value)}
                                        onChange={() =>
                                            toggleValue(statusFilter, value, onStatusFilterChange)
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-green-500 focus:ring-green-400"
                                    />
                                    {statusLabels[value]}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => {
                                const isSelected = tagFilter.includes(tag.tag_id);
                                return (
                                    <button
                                        key={tag.tag_id}
                                        type="button"
                                        onClick={() =>
                                            toggleValue(tagFilter, tag.tag_id, onTagFilterChange)
                                        }
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
            )}
        </div>
    );
}

export default TaskFilterPanel;