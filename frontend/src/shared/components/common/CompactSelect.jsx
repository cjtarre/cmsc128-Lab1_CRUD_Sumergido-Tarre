import { Children, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useExclusiveDropdown } from "../../hooks/useExclusiveDropdown";
import { Check } from "lucide-react";

// CompactSelect takes <option> children and preserves the event shape of a native select.
// The task forms already render a dropdown arrow inside the surrounding field wrapper.
function CompactSelect({
    id, name, value, children, onChange, disabled = false, className = "", style,
    ariaLabel, "aria-invalid": invalid, "aria-describedby": describedBy, inlineMenu = false, fontSize = "10px",
}) {
    const options = Children.toArray(children)
        .filter((child) => isValidElement(child) && child.type === "option")
        .map((child) => ({
            value: String(child.props.value ?? ""),
            label: child.props.children,
            disabled: Boolean(child.props.disabled),
        }));
    const selectedValue = String(value ?? "");
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
    const selected = options[selectedIndex];
    const selectedOptionValue = selected?.value;
    const [open, setOpen] = useState(false);
    useExclusiveDropdown(open, setOpen);
    const [position, setPosition] = useState(null);
    const menuPositioned = position !== null;
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const optionRefs = useRef([]);
    const listId = useId();

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const height = Math.min(options.length * 34 + 12, 216);
        if (inlineMenu) {
            const bounds = trigger.closest("dialog")?.getBoundingClientRect();
            const aboveSpace = rect.top - Math.max(0, bounds?.top ?? 0);
            const belowSpace = Math.min(window.innerHeight, bounds?.bottom ?? window.innerHeight) - rect.bottom;
            const above = belowSpace < height + 14 && aboveSpace > belowSpace;

            setPosition({
                position: "absolute",
                left: 0,
                right: 0,
                [above ? "bottom" : "top"]: "calc(100% + 6px)",
                maxHeight: Math.min(216, Math.max(64, (above ? aboveSpace : belowSpace) - 14)),
            });
            return;
        }

        const above = window.innerHeight - rect.bottom < height + 8 && rect.top > height + 8;
        const top = above ? Math.max(8, rect.top - height - 6) : rect.bottom + 6;
        const width = Math.max(90, Math.min(rect.width, window.innerWidth - 16));
        setPosition({
            position: "fixed",
            top,
            left: Math.min(Math.max(8, rect.left), window.innerWidth - width - 8),
            width,
            maxHeight: Math.max(64, above ? rect.top - 14 : window.innerHeight - top - 8),
        });
    }, [inlineMenu, options.length]);

    useLayoutEffect(() => {
        if (!open) return;
        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;
        const closeOutside = (event) => {
            if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
        };
        const handleKey = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
            if (event.key === "Tab") setOpen(false);
        };
        document.addEventListener("mousedown", closeOutside);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", closeOutside);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    useEffect(() => {
        if (!open || !menuPositioned || selectedOptionValue === undefined) return;
        optionRefs.current[selectedIndex]?.focus();
    }, [open, menuPositioned, selectedIndex, selectedOptionValue]);

    const choose = (newValue) => {
        onChange?.({ target: { name, value: newValue } });
        setOpen(false);
        triggerRef.current?.focus();
    };

    const handleOptionKey = (event) => {
        const current = optionRefs.current.indexOf(document.activeElement);
        const target = event.key === "Home" ? 0
            : event.key === "End" ? options.length - 1
            : event.key === "ArrowDown" ? Math.min(current + 1, options.length - 1)
            : event.key === "ArrowUp" ? Math.max(current - 1, 0)
            : -1;
        if (target >= 0) {
            event.preventDefault();
            optionRefs.current[target]?.focus();
        }
    };

    const menu = open && position && (
        <div
            ref={menuRef}
            role="listbox"
            id={listId}
            aria-label={ariaLabel || name || "Options"}
            onKeyDown={handleOptionKey}
            style={position}
            className="z-[10001] overflow-y-auto overscroll-contain rounded-xl border border-white/85 bg-white/95 p-1.5 shadow-[0_16px_42px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/40"
        >
            {options.map((option, index) => (
                <button
                    key={`${option.value}-${index}`}
                    ref={(element) => { optionRefs.current[index] = element; }}
                    type="button"
                    role="option"
                    aria-selected={option.value === selectedValue}
                    disabled={option.disabled}
                    onClick={() => choose(option.value)}
                    className={`flex min-h-8 w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200 disabled:opacity-40 dark:focus-visible:ring-green-900 ${option.value === selectedValue ? "bg-green-50/90 text-green-700 dark:bg-green-950/45 dark:text-green-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.06]"}`}
                    style={{ appearance: "none", fontFamily: "inherit", fontSize, lineHeight: "1.2" }}
                >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {option.value === selectedValue && <Check aria-hidden="true" size={12} className="shrink-0 text-green-500" />}
                </button>
            ))}
        </div>
    );

    return (
        <>
            <button
                type="button"
                id={id}
                ref={triggerRef}
                name={name}
                role="combobox"
                aria-label={ariaLabel || name || "Choose an option"}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={open ? listId : undefined}
                disabled={disabled}
                onClick={() => !disabled && setOpen((current) => !current)}
                onKeyDown={(event) => {
                    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !open) {
                        event.preventDefault();
                        setOpen(true);
                    }
                }}
                className={`flex min-w-0 items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
                style={{ appearance: "none", WebkitAppearance: "none", fontFamily: "inherit", ...style, fontSize, lineHeight: "1.2" }}
            >
                <span className="min-w-0 flex-1 truncate">{selected?.label ?? "Select"}</span>
            </button>
            {menu && (inlineMenu ? menu : createPortal(menu, document.body))}
        </>
    );
}

export default CompactSelect;
