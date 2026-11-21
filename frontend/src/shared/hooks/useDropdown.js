import { useEffect, useId, useRef, useState } from "react";
import { openDropdown, subscribeToDropdown } from "../utils/dropdownState";

// Manage dropdown visibility, selection, and dismissal.
export function useDropdown(controlledOpen, controlledSetOpen) {
    const [internalOpen, setInternalOpen] = useState(false);
    const controlled = typeof controlledSetOpen === "function";
    const open = controlled ? Boolean(controlledOpen) : internalOpen;
    const setOpen = controlled ? controlledSetOpen : setInternalOpen;
    const ref = useRef(null);
    const dropdownId = useId();

    useEffect(() => {
        if (!open) return;
        openDropdown(dropdownId);

        if (controlled) return;

        const handleOutside = (event) => {
            if (!ref.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        const handleEscape = (event) => { if (event.key === "Escape") setOpen(false); };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open, dropdownId, controlled, setOpen]);

    useEffect(() => subscribeToDropdown(dropdownId, () => setOpen(false)), [dropdownId, setOpen]);

    const close = () => setOpen(false);
    const toggle = () => setOpen((current) => !current);
    const select = (callback) => { callback(); close(); };

    return { open, ref, close, toggle, select };
}