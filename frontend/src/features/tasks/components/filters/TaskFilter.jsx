import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { useDropdown } from "../../../../shared/hooks/useDropdown";
import "./taskFilterLayer.css";

const filters = [
    { label: "All Tasks", value: "all" },
    { label: "Today", value: "today" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Overdue", value: "overdue" },
    { label: "Completed", value: "completed" },
];

function TaskFilter({ value, onChange }) {
    const containerRef = useRef(null);
    const buttonRefs = useRef([]);
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });
    const { open, ref: menuRef, toggle, close } = useDropdown();
    const triggerRef = useRef(null);
    const optionRefs = useRef([]);
    const activeFilter = filters.find((filter) => filter.value === value) || filters[0];

    useEffect(() => {
        if (!open) return;
        const index = filters.findIndex((filter) => filter.value === activeFilter.value);
        optionRefs.current[index]?.focus();
    }, [open, activeFilter.value]);

    const selectFilter = (nextValue) => {
        onChange(nextValue);
        close();
        triggerRef.current?.focus();
    };

    const handleMenuKeyDown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            close();
            triggerRef.current?.focus();
            return;
        }

        const index = optionRefs.current.indexOf(document.activeElement);
        const last = filters.length - 1;
        const next = {
            ArrowDown: Math.min(index + 1, last),
            ArrowUp: index < 0 ? last : Math.max(index - 1, 0),
            Home: 0,
            End: last,
        }[event.key];

        if (next !== undefined) {
            event.preventDefault();
            optionRefs.current[next]?.focus();
        }
    };

    useEffect(() => {
        const updateIndicator = () => {
            const index = filters.findIndex((filter) => filter.value === value);
            const button = buttonRefs.current[index];
            const container = containerRef.current;
            if (!button || !container) return;

            const buttonRect = button.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            setIndicator({ left: buttonRect.left - containerRect.left, width: buttonRect.width });
        };

        updateIndicator();
        window.addEventListener("resize", updateIndicator);
        return () => window.removeEventListener("resize", updateIndicator);
    }, [value]);

    const isOverdue = value === "overdue";

    return (
        <>
            {/* Mobile / Tablet: a custom menu avoids browser-styled option lists. */}
            <div ref={menuRef} data-takda-task-filter="true" className="relative z-[120] xl:hidden">
                <button
                    ref={triggerRef}
                    type="button"
                    aria-label="Task view filter"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={open ? "task-view-options" : undefined}
                    onClick={toggle}
                    className={`flex h-9 w-full items-center justify-between gap-2 rounded-xl border bg-white/70 px-3 text-left font-medium shadow-sm backdrop-blur-md transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 dark:bg-slate-900/65 ${isOverdue ? "border-red-200 text-red-500 focus-visible:ring-red-100/60 dark:border-red-900/50 dark:text-red-400" : "border-white/70 text-slate-600 focus-visible:ring-green-100/70 dark:border-white/10 dark:text-slate-300"}`}
                    style={{ appearance: "none", fontFamily: "inherit", fontSize: "11px", lineHeight: "1.2" }}
                >
                    <span>{activeFilter.label}</span>
                    <ChevronDown size={13} aria-hidden="true" className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                    <div
                        id="task-view-options"
                        role="listbox"
                        aria-label="Task views"
                        onKeyDown={handleMenuKeyDown}
                        className="absolute inset-x-0 top-full z-[130] mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-[0_14px_36px_rgba(15,23,42,0.13)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/30"
                    >
                        {filters.map((filter, index) => {
                            const selected = value === filter.value;
                            return (
                                <button
                                    key={filter.value}
                                    ref={(element) => (optionRefs.current[index] = element)}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    onClick={() => selectFilter(filter.value)}
                                    className={`flex min-h-9 w-full items-center justify-between rounded-lg px-3 py-2 text-left font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200 dark:focus-visible:ring-green-800 ${selected ? "bg-green-50/90 text-green-700 dark:bg-green-950/50 dark:text-green-300" : "text-slate-600 hover:bg-slate-50/90 dark:text-slate-300 dark:hover:bg-white/[0.07]"}`}
                                    style={{ appearance: "none", fontFamily: "inherit", fontSize: "11px", lineHeight: "1.2" }}
                                >
                                    {filter.label}
                                    {selected && <Check size={12} aria-hidden="true" className="text-green-500" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Desktop */}
            <div ref={containerRef} className="relative hidden w-full items-center gap-6 overflow-x-auto rounded-xl px-4 pt-2.5 xl:flex">
                {filters.map((filter, index) => {
                    const active = value === filter.value;
                    const overdue = filter.value === "overdue";

                    return (
                        <button
                            key={filter.value}
                            ref={(el) => (buttonRefs.current[index] = el)}
                            type="button"
                            onClick={() => onChange(filter.value)}
                            className={`relative shrink-0 pb-2.5 text-[11px] font-medium transition-colors ${
                                active
                                    ? overdue
                                        ? "text-red-500 dark:text-red-400"
                                        : "text-green-600 dark:text-green-400"
                                    : overdue
                                        ? "text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                                        : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            }`}
                        >
                            {filter.label}
                        </button>
                    );
                })}

                <span className={`absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ${isOverdue ? "bg-red-500" : "bg-green-500"}`} style={indicator} />
            </div>
        </>
    );
}

export default TaskFilter;
