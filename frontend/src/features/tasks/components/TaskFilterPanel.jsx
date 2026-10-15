import { useState } from "react";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";

import { PRIORITY, priorityLabels, STATUS, statusLabels } from "../constants/taskOptions";
import { useTaskData } from "../context/TaskContext";

function FilterGroup({ label, items, selected, onChange }) {
    return (
        <div>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>

            <div className="flex flex-wrap gap-1.5">
                {items.map(([value, text]) => {
                    const active = selected.includes(value);

                    return (
                        <button key={value} type="button" aria-pressed={active} onClick={() => onChange(active ? selected.filter((item) => item !== value) : [...selected, value])} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition ${active ? "border-green-200 bg-green-50/90 text-green-600 shadow-sm dark:border-green-800/70 dark:bg-green-950/50 dark:text-green-400" : "border-white/80 bg-white/55 text-slate-500 hover:border-green-100 hover:bg-green-50/50 hover:text-green-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:border-green-900/60 dark:hover:bg-green-950/20 dark:hover:text-green-400"}`}>
                            {active && <Check size={10} strokeWidth={2.5} />}
                            {text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FilterGroups({ availableTags, priorityFilter, statusFilter, tagFilter, onPriorityFilterChange, onStatusFilterChange, onTagFilterChange }) {
    return (
        <div className="space-y-4">
            <FilterGroup label="Priority" items={Object.values(PRIORITY).map((value) => [value, priorityLabels[value]])} selected={priorityFilter} onChange={onPriorityFilterChange} />
            <FilterGroup label="Status" items={Object.values(STATUS).map((value) => [value, statusLabels[value]])} selected={statusFilter} onChange={onStatusFilterChange} />
            <FilterGroup label="Tags" items={availableTags.map((tag) => [tag.tag_id, tag.tag_name])} selected={tagFilter} onChange={onTagFilterChange} />
        </div>
    );
}

function TaskFilterPanel({ priorityFilter, onPriorityFilterChange, statusFilter, onStatusFilterChange, tagFilter, onTagFilterChange }) {
    const { availableTags, searchTerm, setSearchTerm } = useTaskData();
    const [filterOpen, setFilterOpen] = useState(false);

    const filterCount = priorityFilter.length + statusFilter.length + tagFilter.length;

    const clearAll = () => {
        onPriorityFilterChange([]);
        onStatusFilterChange([]);
        onTagFilterChange([]);
    };

    const groups = { availableTags, priorityFilter, statusFilter, tagFilter, onPriorityFilterChange, onStatusFilterChange, onTagFilterChange };

    return (
        <div className={`relative flex h-[52px] min-w-0 items-center gap-1.5 rounded-2xl border border-white/70 bg-white/55 p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55 dark:shadow-black/20 ${filterOpen ? "z-[100]" : "z-10"}`}>
            <div className="relative min-w-0 flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input type="search" value={searchTerm || ""} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" className="h-10 w-full rounded-xl border border-transparent bg-white/45 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:bg-white/65 focus:border-green-200 focus:bg-white/80 focus:ring-2 focus:ring-green-100/50 dark:bg-white/[0.035] dark:text-slate-200 dark:placeholder:text-slate-500 dark:hover:bg-white/[0.055] dark:focus:border-green-800 dark:focus:bg-white/[0.06] dark:focus:ring-green-900/30" />
            </div>

            <button type="button" onClick={() => setFilterOpen((prev) => !prev)} aria-expanded={filterOpen} aria-label="Filter tasks" className={`relative flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition ${filterOpen || filterCount > 0 ? "bg-green-50/90 text-green-600 dark:bg-green-950/50 dark:text-green-400" : "bg-white/45 text-slate-500 hover:bg-white/75 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:bg-white/[0.06]"}`}>
                <SlidersHorizontal size={14} />
                <span className="hidden 2xl:inline">Filters</span>
                {filterCount > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[9px] font-semibold text-white">{filterCount}</span>}
            </button>

            {filterOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[110] w-[320px] overflow-hidden rounded-xl border border-white/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/40">
                    <div className="flex items-center justify-between border-b border-slate-100/70 px-4 py-3 dark:border-white/10">
                        <div>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-200">Filters</p>
                            {filterCount > 0 && <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500">{filterCount} active filter{filterCount !== 1 ? "s" : ""}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            {filterCount > 0 && <button type="button" onClick={clearAll} className="text-[10px] font-medium text-green-600 transition hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">Clear all</button>}
                            <button type="button" onClick={() => setFilterOpen(false)} aria-label="Close filters" className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100/70 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-slate-300"><X size={14} /></button>
                        </div>
                    </div>

                    <div className="px-4 py-4"><FilterGroups {...groups} /></div>
                </div>
            )}
        </div>
    );
}

export default TaskFilterPanel;