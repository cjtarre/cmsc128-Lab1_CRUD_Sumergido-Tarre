import { useEffect, useRef, useState } from "react";

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
        <div
            ref={containerRef}
            className="relative flex w-full items-center gap-5 overflow-x-auto rounded-xl border border-slate-200 bg-white px-4 pt-2.5 shadow-sm"
        >
            {filters.map((filter, index) => (
                <button
                    key={filter.value}
                    ref={(element) => (buttonRefs.current[index] = element)}
                    type="button"
                    onClick={() => onChange(filter.value)}
                    className={`relative shrink-0 pb-2.5 font-medium transition-colors ${
                        value === filter.value ? "text-green-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                    style={{ fontSize: "0.875rem", lineHeight: "1" }}
                >
                    {filter.label}
                </button>
            ))}

            <span
                className="absolute bottom-0 h-0.5 rounded-full bg-green-500 transition-all duration-300"
                style={indicator}
            />
        </div>
    );
}

export default TaskFilter;