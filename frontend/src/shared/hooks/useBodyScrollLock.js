import { useEffect } from "react";

// Lock body scrolling while an overlay is open.
export function useBodyScrollLock(isOpen) {
    useEffect(() => {
        if (!isOpen) return;

        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = overflow; };
    }, [isOpen]);
}