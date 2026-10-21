import { useEffect, useRef, useState } from "react";

// Manage dropdown visibility, selection, and dismissal.
export function useDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;

        const handleOutside = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
        const handleEscape = (event) => { if (event.key === "Escape") setOpen(false); };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    const close = () => setOpen(false);
    const toggle = () => setOpen((current) => !current);
    const select = (callback) => { callback(); close(); };

    return { open, ref, close, toggle, select };
}