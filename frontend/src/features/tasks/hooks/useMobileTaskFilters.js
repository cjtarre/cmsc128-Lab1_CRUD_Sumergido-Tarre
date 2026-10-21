import { useEffect, useRef, useState } from "react";

// Manage the mobile task-filter popup.
export function useMobileTaskFilters() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutside = (event) => { if (!ref.current?.contains(event.target)) setIsOpen(false); };
        const handleEscape = (event) => { if (event.key === "Escape") setIsOpen(false); };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEscape);
        return () => { document.removeEventListener("mousedown", handleOutside); document.removeEventListener("keydown", handleEscape); };
    }, [isOpen]);

    return { isOpen, setIsOpen, ref };
}