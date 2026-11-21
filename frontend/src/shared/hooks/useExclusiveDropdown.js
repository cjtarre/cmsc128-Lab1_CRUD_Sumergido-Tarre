import { useEffect } from "react";
import { useDropdown } from "./useDropdown";
import { closeAllDropdowns, isDropdownInteraction } from "../utils/dropdownState";

export function useExclusiveDropdown(open, setOpen) {
    useDropdown(open, setOpen);

    useEffect(() => {
        if (!open) return;

        const closeOutside = (event) => {
            if (!isDropdownInteraction(event.target)) closeAllDropdowns();
        };
        document.addEventListener("pointerdown", closeOutside);
        return () => document.removeEventListener("pointerdown", closeOutside);
    }, [open]);
}
