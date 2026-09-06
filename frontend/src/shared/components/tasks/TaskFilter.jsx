import { useEffect, useRef, useState } from "react";

function TaskFilter({ value, onChange }) {
    const filters = [
        { label: "All Tasks", value: "all" },
        { label: "Today", value: "today" },
        { label: "Upcoming", value: "upcoming" },
        { label: "Overdue", value: "overdue" },
        { label: "Completed", value: "completed" },
    ];

    const containerRef = useRef(null);
    const buttonRefs = useRef([]);

    const [indicator, setIndicator] = useState({
        left: 0,
        width: 0,
    });

    useEffect(() => {
        const updateIndicator = () => {
            const activeIndex = filters.findIndex(
                (filter) => filter.value === value
            );

            const activeButton = buttonRefs.current[activeIndex];
            const container = containerRef.current;

            if (!activeButton || !container) {
                return;
            }

            const buttonRect =
                activeButton.getBoundingClientRect();

            const containerRect =
                container.getBoundingClientRect();

            const nextIndicator = {
                left: buttonRect.left - containerRect.left,
                width: buttonRect.width,
            };

            setIndicator((current) => {
                if (
                    current.left === nextIndicator.left &&
                    current.width === nextIndicator.width
                ) {
                    return current;
                }

                return nextIndicator;
            });
        };

        updateIndicator();

        window.addEventListener("resize", updateIndicator);

        return () => {
            window.removeEventListener(
                "resize",
                updateIndicator
            );
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <div
            ref={containerRef}
            className="relative flex w-full items-center gap-6 overflow-x-auto rounded-xl border border-slate-200 bg-white px-5 pt-3 shadow-sm"
        >
            {filters.map((filter, index) => {
                const isActive = value === filter.value;

                return (
                    <button
                        key={filter.value}
                        ref={(element) => {
                            buttonRefs.current[index] = element;
                        }}
                        type="button"
                        onClick={() =>
                            onChange(filter.value)
                        }
                        className={`relative shrink-0 pb-3 text-xs font-medium transition-colors duration-200 ${
                            isActive
                                ? "text-green-600"
                                : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        {filter.label}
                    </button>
                );
            })}

            <span
                className="absolute bottom-0 h-0.5 rounded-full bg-green-500 transition-all duration-300 ease-in-out"
                style={{
                    left: `${indicator.left}px`,
                    width: `${indicator.width}px`,
                }}
            />
        </div>
    );
}

export default TaskFilter;