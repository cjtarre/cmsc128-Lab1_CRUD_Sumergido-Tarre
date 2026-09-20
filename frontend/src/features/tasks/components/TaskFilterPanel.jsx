import { useState } from "react";
import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import {
    PRIORITY, priorityLabels,
    STATUS, statusLabels,
} from "../constants/taskOptions";
import { useTaskData } from "../context/TaskContext";

function FilterGroup({ label, items, selected, onChange }) {
    return (
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
                            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition ${
                                active
                                    ? "border-green-200 bg-green-50 text-green-600"
                                    : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            }`}
                        >
                            <span
                                className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border ${
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
}

function FilterGroups({
    availableTags,
    priorityFilter,
    statusFilter,
    tagFilter,
    onPriorityFilterChange,
    onStatusFilterChange,
    onTagFilterChange,
    responsive = false,
}) {
    return (
        <div
            className={
                responsive
                    ? "space-y-5 md:grid md:grid-cols-2 md:gap-5 md:space-y-0"
                    : "space-y-4"
            }
        >
            <FilterGroup
                label="Priority"
                items={Object.values(PRIORITY).map((value) => [
                    value, priorityLabels[value],
                ])}
                selected={priorityFilter}
                onChange={onPriorityFilterChange}
            />

            <FilterGroup
                label="Status"
                items={Object.values(STATUS).map((value) => [
                    value, statusLabels[value],
                ])}
                selected={statusFilter}
                onChange={onStatusFilterChange}
            />

            <FilterGroup
                label="Tags"
                items={availableTags.map((tag) => [
                    tag.tag_id, tag.tag_name,
                ])}
                selected={tagFilter}
                onChange={onTagFilterChange}
            />
        </div>
    );
}

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
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const filterCount =
        priorityFilter.length + statusFilter.length + tagFilter.length;

    const clearAll = () => {
        onPriorityFilterChange([]);
        onStatusFilterChange([]);
        onTagFilterChange([]);
    };

    const groups = {
        availableTags,
        priorityFilter,
        statusFilter,
        tagFilter,
        onPriorityFilterChange,
        onStatusFilterChange,
        onTagFilterChange,
    };

    return (
        <>
            {/* Mobile / Tablet */}
            <div className="relative w-auto rounded-xl border border-slate-200 bg-white shadow-sm xl:hidden">
                <div className="flex h-10 items-center gap-1 px-1.5">
                    <div className="relative hidden min-w-0 flex-1 sm:block">
                        <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={searchTerm || ""}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search tasks..."
                            aria-label="Search tasks"
                            className="h-8 w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-[10px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-green-300 focus:ring-2 focus:ring-green-50"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileSearchOpen((prev) => !prev)}
                        aria-label="Search tasks"
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition sm:hidden ${
                            mobileSearchOpen || searchTerm
                                ? "bg-green-50 text-green-600"
                                : "text-slate-400 hover:bg-slate-50"
                        }`}
                    >
                        <Search size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileFilterOpen((prev) => !prev)}
                        aria-label="Filter tasks"
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                            mobileFilterOpen || filterCount
                                ? "bg-green-50 text-green-600"
                                : "text-slate-400 hover:bg-slate-50"
                        }`}
                    >
                        <SlidersHorizontal size={16} />

                        {filterCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[9px] font-semibold text-white">
                                {filterCount}
                            </span>
                        )}
                    </button>

                    {filterCount > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="px-1 text-[10px] font-medium text-slate-400 hover:text-green-600"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {mobileSearchOpen && (
                    <div className="border-t border-slate-100 px-3 py-3 sm:hidden">
                        <div className="relative">
                            <Search
                                size={13}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="search"
                                autoFocus
                                value={searchTerm || ""}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search tasks..."
                                aria-label="Search tasks"
                                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-[10px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-green-300 focus:ring-2 focus:ring-green-50"
                            />
                        </div>
                    </div>
                )}

                {mobileFilterOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                            <span className="text-xs font-semibold text-slate-500">
                                Filters
                            </span>

                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(false)}
                                aria-label="Close filters"
                                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto px-3 py-3">
                            <FilterGroups {...groups} responsive />
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop */}
            <div className="relative hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:block">
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
                                className="text-[10px] font-medium text-slate-400 hover:text-green-600"
                            >
                                Clear all
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsExpanded((prev) => !prev)}
                            aria-label={
                                isExpanded
                                    ? "Collapse filters"
                                    : "Expand filters"
                            }
                            className="rounded p-0.5 hover:bg-slate-50"
                        >
                            <ChevronDown
                                size={14}
                                className={`text-slate-400 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="space-y-4 border-t border-slate-100 bg-slate-50/30 px-4 py-4">
                        <div className="relative">
                            <Search
                                size={13}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="search"
                                value={searchTerm || ""}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search tasks..."
                                aria-label="Search tasks"
                                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-[10px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-green-300 focus:ring-2 focus:ring-green-50"
                            />
                        </div>

                        <FilterGroups {...groups} />
                    </div>
                )}
            </div>
        </>
    );
}

export default TaskFilterPanel;