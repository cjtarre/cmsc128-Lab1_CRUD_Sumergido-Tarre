import { useEffect, useRef } from "react";
import { closeAllDropdowns, isDropdownInteraction, openDropdown, subscribeToDropdown } from "../utils/dropdownState";

export function useExclusiveDropdown(open, setOpen) {
    const dropdownId = useRef(`dropdown-${Math.random().toString(36).slice(2)}`).current;

    useEffect(() => {
        if (open) openDropdown(dropdownId);
    }, [open, dropdownId]);

    useEffect(() => subscribeToDropdown(dropdownId, () => setOpen(false)), [dropdownId, setOpen]);

    useEffect(() => {
        if (!open) return;

        const closeOutside = (event) => {
            if (!isDropdownInteraction(event.target)) closeAllDropdowns();
        };
        document.addEventListener("pointerdown", closeOutside);
        return () => {
            document.removeEventListener("pointerdown", closeOutside);
        };
    }, [open, setOpen]);
}
