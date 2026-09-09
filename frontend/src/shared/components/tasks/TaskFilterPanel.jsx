import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import {
    PRIORITY,
    priorityLabels,
    STATUS,
    statusLabels,
} from "../../constants/taskOptions";
import { useTaskData } from "../../context/TaskContext";

const FilterGroup = ({ label, items, selected, onChange }) => (
    <div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
        </p>

        <div className="flex flex-wrap gap-2">
            {items.map(([value, text]) => {
                const active = selected.includes(value);

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() =>
                            onChange(
                                active
                                    ? selected.filter((item) => item !== value)
                                    : [...selected, value]
                            )
                        }
                        className={`flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium transition ${
                            active
                                ? "border-green-200 bg-green-50 text-green-600"
                                : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        }`}
                        style={{ fontSize: "10px", lineHeight: "1" }}
                    >
                        <span
                            className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border transition ${
                                active
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border-slate-300 bg-white"
                            }`}
                        >
                            {active && <Check size={8} strokeWidth={3} />}
                        </span>
                        {text}
                    </button>
                );
            })}
        </div>
    </div>
);

function TaskFilterPanel({
    priorityFilter, onPriorityFilterChange, statusFilter,
    onStatusFilterChange, tagFilter, onTagFilterChange,
}) {
    const { availableTags, searchTerm, setSearchTerm } = useTaskData();
    const [isExpanded, setIsExpanded] = useState(false);

    const filterCount = priorityFilter.length + statusFilter.length + tagFilter.length;

    const clearAll = () => {
        onPriorityFilterChange([]);
        onStatusFilterChange([]);
        onTagFilterChange([]);
    };

    return (
        <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5">
                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="flex flex-1 items-center gap-1.5 text-left"
                >
                    <span className="text-xs font-semibold text-slate-400">
                        Search & Filter
                    </span>

                    {filterCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[9px] font-semibold text-white">
                            {filterCount}
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-2.5">
                    {filterCount > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-[10px] font-medium text-slate-400 transition hover:text-green-600"
                        >
                            Clear all
                        </button>
                    )}

                    <div className="group relative">
                        <button
                            type="button"
                            onClick={() => setIsExpanded((prev) => !prev)}
                            aria-label={ isExpanded ? "Collapse filters" : "Expand filters" }
                            className="rounded p-0.5 transition hover:bg-slate-50"
                        >
                            <ChevronDown
                                size={14}
                                className={`text-slate-400 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        <span className="pointer-events-none absolute right-0 top-full z-[9999] mt-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                            {isExpanded ? "Collapse filters" : "Expand filters"}
                        </span>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-4 border-t border-slate-100 bg-slate-50/30 px-4 py-4">
                    <div className="relative">
                        <Search size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={searchTerm || ""}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search tasks..."
                            aria-label="Search tasks"
                            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-[10px] text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-green-300 focus:ring-2 focus:ring-green-50"
                        />
                    </div>

                    <FilterGroup
                        label="Priority"
                        items={Object.values(PRIORITY).map((value) => [ value, priorityLabels[value],])}
                        selected={priorityFilter}
                        onChange={onPriorityFilterChange}
                    />

                    <FilterGroup
                        label="Status"
                        items={Object.values(STATUS).map((value) => [ value, statusLabels[value], ])}
                        selected={statusFilter}
                        onChange={onStatusFilterChange}
                    />

                    <FilterGroup
                        label="Tags"
                        items={availableTags.map((tag) => [ tag.tag_id, tag.tag_name, ])}
                        selected={tagFilter}
                        onChange={onTagFilterChange}
                    />
                </div>
            )}
        </div>
    );
}

export default TaskFilterPanel;