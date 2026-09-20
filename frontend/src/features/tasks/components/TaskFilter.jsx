import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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

    useEffect(() => {
        const updateIndicator = () => {
            const index = filters.findIndex((filter) => filter.value === value);
            const button = buttonRefs.current[index];
            const container = containerRef.current;
            if (!button || !container) return;

            const buttonRect = button.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            setIndicator({
                left: buttonRect.left - containerRect.left,
                width: buttonRect.width,
            });
        };

        updateIndicator();
        window.addEventListener("resize", updateIndicator);
        return () => window.removeEventListener("resize", updateIndicator);
    }, [value]);

    return (
        <>
            <div className="relative xl:hidden">
                <label htmlFor="task-filter" className="sr-only">
                    Task filter
                </label>

                <select
                    id="task-filter"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-9 text-sm font-medium text-slate-600 shadow-sm outline-none focus:border-green-300 focus:ring-2 focus:ring-green-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:focus:border-green-700 dark:focus:ring-green-950"
                >
                    {filters.map((filter) => (
                        <option key={filter.value} value={filter.value}>
                            {filter.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
            </div>

            <div
                ref={containerRef}
                className="relative hidden w-full items-center gap-5 overflow-x-auto rounded-xl border border-slate-200 bg-white px-4 pt-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:flex"
            >
                {filters.map((filter, index) => (
                    <button
                        key={filter.value}
                        ref={(el) => (buttonRefs.current[index] = el)}
                        type="button"
                        onClick={() => onChange(filter.value)}
                        className={`relative shrink-0 pb-2.5 text-sm font-medium transition-colors ${
                            value === filter.value
                                ? "text-green-600 dark:text-green-400"
                                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}

                <span
                    className="absolute bottom-0 h-0.5 rounded-full bg-green-500 transition-all duration-300"
                    style={indicator}
                />
            </div>
        </>
    );
}

export default TaskFilter;