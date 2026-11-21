import { useEffect, useRef, useState } from "react";
import { openDropdown, subscribeToDropdown } from "../utils/dropdownState";

// Manage dropdown visibility, selection, and dismissal.
export function useDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const dropdownId = useRef(`dropdown-${Math.random().toString(36).slice(2)}`).current;

    useEffect(() => {
        if (!open) return;
        openDropdown(dropdownId);

        const handleOutside = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
        const handleEscape = (event) => { if (event.key === "Escape") setOpen(false); };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    useEffect(() => subscribeToDropdown(dropdownId, () => setOpen(false)), [dropdownId]);

    const close = () => setOpen(false);
    const toggle = () => setOpen((current) => !current);
    const select = (callback) => { callback(); close(); };

    return { open, ref, close, toggle, select };
}