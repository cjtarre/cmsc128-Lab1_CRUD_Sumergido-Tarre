import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

// Small, accessible project dropdown with a consistently styled popup.
function ProjectSelect({ label, value, defaultValue, options, onChange, Icon, wide = false }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const optionRefs = useRef([]);
    const listId = useId();
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
    const selected = options[selectedIndex];
    const active = value !== defaultValue;

    useEffect(() => {
        if (!open) return;

        optionRefs.current[selectedIndex]?.focus();

        const onOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        const onEscape = (event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
        };

        document.addEventListener("pointerdown", onOutside);
        document.addEventListener("keydown", onEscape);
        return () => {
            document.removeEventListener("pointerdown", onOutside);
            document.removeEventListener("keydown", onEscape);
        };
    }, [open, selectedIndex]);

    const selectOption = (nextValue) => {
        onChange(nextValue);
        setOpen(false);
        triggerRef.current?.focus();
    };

    const onOptionsKeyDown = (event) => {
        if (event.key === "Tab") {
            setOpen(false);
            return;
        }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const focusedIndex = optionRefs.current.findIndex((element) => element === document.activeElement);
        let nextIndex = focusedIndex < 0 ? selectedIndex : focusedIndex;
        if (event.key === "ArrowDown") nextIndex = (nextIndex + 1) % options.length;
        if (event.key === "ArrowUp") nextIndex = (nextIndex - 1 + options.length) % options.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = options.length - 1;
        optionRefs.current[nextIndex]?.focus();
    };

    return (
        <div
            ref={rootRef}
            className="relative shrink-0"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                aria-label={label}
                aria-haspopup="listbox"
                aria-controls={open ? listId : undefined}
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                onKeyDown={(event) => {
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault();
                        setOpen(true);
                    }
                }}
                className={`flex h-8 items-center gap-1.5 rounded-xl border px-2.5 text-[10px] font-medium shadow-[0_2px_7px_rgba(15,23,42,0.035)] backdrop-blur-md transition-all duration-150 hover:-translate-y-px hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300/70 dark:hover:bg-white/[0.08] ${wide ? "w-[115px]" : "w-[100px]"} ${
                    active
                        ? "border-green-200/90 bg-green-50/75 text-green-700 dark:border-green-800/60 dark:bg-green-950/40 dark:text-green-300"
                        : "border-white/70 bg-white/55 text-slate-600 dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-300"
                }`}
                style={{ appearance: "none", WebkitAppearance: "none", fontFamily: "inherit", fontSize: "10px", lineHeight: "1.15" }}
            >
                <Icon size={13} strokeWidth={1.9} aria-hidden="true" className={active ? "shrink-0 text-green-600 dark:text-green-400" : "shrink-0 text-slate-500 dark:text-slate-400"} />
                <span className="min-w-0 flex-1 truncate text-left">{selected?.label}</span>
                <ChevronDown size={12} aria-hidden="true" className={`shrink-0 text-slate-400 transition-transform duration-150 dark:text-slate-500 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    id={listId}
                    role="listbox"
                    aria-label={label}
                    onKeyDown={onOptionsKeyDown}
                    className="absolute right-0 top-full z-[80] mt-2 min-w-[152px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/85 bg-white/95 p-1.5 shadow-[0_14px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/30"
                >
                    {options.map((option, index) => (
                        <button
                            key={option.value}
                            ref={(element) => { optionRefs.current[index] = element; }}
                            type="button"
                            role="option"
                            aria-selected={option.value === value}
                            tabIndex={-1}
                            onClick={() => selectOption(option.value)}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-300 ${
                                option.value === value
                                    ? "bg-green-50/90 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                                    : "text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/[0.07]"
                            }`}
                            style={{ appearance: "none", WebkitAppearance: "none", fontFamily: "inherit", fontSize: "10px", lineHeight: "1.15" }}
                        >
                            <span className="whitespace-nowrap">{option.label}</span>
                            {option.value === value && <Check size={13} aria-hidden="true" className="shrink-0 text-green-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProjectSelect;
