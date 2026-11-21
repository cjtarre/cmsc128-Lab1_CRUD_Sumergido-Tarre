import { Children, isValidElement, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useExclusiveDropdown } from "../../../../shared/hooks/useExclusiveDropdown";

// A compact custom filter menu. Its onChange matches the native select event
// shape so existing Project List filter handlers do not need to change.
function TaskFilterSelect({ value, onChange, children, className = "" }) {
    const options = Children.toArray(children)
        .filter((child) => isValidElement(child) && child.type === "option")
        .map((child) => ({ value: String(child.props.value ?? ""), label: child.props.children }));
    const currentValue = String(value ?? "");
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === currentValue));
    const selected = options[selectedIndex];
    const selectedOptionValue = selected?.value;
    const [open, setOpen] = useState(false);
    useExclusiveDropdown(open, setOpen);
    const [above, setAbove] = useState(false);
    const wrapperRef = useRef(null);
    const triggerRef = useRef(null);
    const optionRefs = useRef([]);
    const listId = useId();

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event) => {
            if (!wrapperRef.current?.contains(event.target)) setOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            } else if (event.key === "Tab") {
                setOpen(false);
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    useEffect(() => {
        if (!open || selectedOptionValue === undefined) return;
        optionRefs.current[selectedIndex]?.focus();
    }, [open, selectedIndex, selectedOptionValue]);

    const toggle = () => {
        if (!open) {
            const rect = triggerRef.current?.getBoundingClientRect();
            const menuHeight = Math.min(options.length * 32 + 12, 216);
            setAbove(Boolean(rect && window.innerHeight - rect.bottom < menuHeight + 12 && rect.top > menuHeight + 12));
        }
        setOpen((current) => !current);
    };

    const choose = (nextValue) => {
        onChange?.({ target: { value: nextValue } });
        setOpen(false);
        triggerRef.current?.focus();
    };

    const onOptionsKeyDown = (event) => {
        const activeIndex = optionRefs.current.indexOf(document.activeElement);
        const nextIndex = event.key === "Home" ? 0
            : event.key === "End" ? options.length - 1
            : event.key === "ArrowDown" ? Math.min(activeIndex + 1, options.length - 1)
            : event.key === "ArrowUp" ? Math.max(activeIndex - 1, 0) : -1;
        if (nextIndex >= 0) {
            event.preventDefault();
            optionRefs.current[nextIndex]?.focus();
        }
    };

    return (
        <div ref={wrapperRef} className={`relative min-w-0 shrink-0 ${open ? "z-[90]" : ""} ${className}`}>
            <button ref={triggerRef} type="button" aria-label={`Filter by ${options[0]?.label || "value"}`}
                aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
                onClick={toggle}
                className="flex h-8 w-full items-center justify-between gap-1.5 rounded-xl border border-white/80 bg-white/55 px-2.5 text-left font-medium text-slate-500 outline-none transition hover:bg-white/75 focus-visible:ring-2 focus-visible:ring-green-100/70 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:focus-visible:ring-green-900/30"
                style={{ appearance: "none", WebkitAppearance: "none", fontFamily: "inherit", fontSize: "10px", lineHeight: "1.2" }}>
                <span className="min-w-0 flex-1 truncate">{selected?.label || "Select"}</span>
                <ChevronDown size={12} aria-hidden="true" className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div id={listId} role="listbox" aria-label={`Choose ${options[0]?.label || "filter"}`}
                    onKeyDown={onOptionsKeyDown}
                    className={`absolute right-0 z-[100] max-h-56 w-max min-w-full max-w-[min(240px,85vw)] overflow-y-auto overscroll-contain rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-[0_14px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/30 ${above ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}>
                    {options.map((option, index) => {
                        const active = option.value === currentValue;
                        return (
                            <button key={`${option.value}-${index}`} ref={(el) => { optionRefs.current[index] = el; }}
                                type="button" role="option" aria-selected={active}
                                onClick={() => choose(option.value)}
                                className={`flex min-h-8 w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200 dark:focus-visible:ring-green-800 ${active ? "bg-green-50/90 text-green-700 dark:bg-green-950/50 dark:text-green-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.07]"}`}
                                style={{ appearance: "none", fontFamily: "inherit", fontSize: "10px", lineHeight: "1.2" }}>
                                <span className="truncate">{option.label}</span>
                                {active && <Check size={12} aria-hidden="true" className="shrink-0 text-green-500" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default TaskFilterSelect;
