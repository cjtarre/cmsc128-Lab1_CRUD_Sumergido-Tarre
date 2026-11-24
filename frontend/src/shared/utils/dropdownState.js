const DROPDOWN_OPEN_EVENT = "takda:dropdown-open";
const DROPDOWN_CLOSE_EVENT = "takda:dropdown-close";

export function openDropdown(id) {
    if (!id) return;
    window.dispatchEvent(new CustomEvent(DROPDOWN_OPEN_EVENT, {
        detail: { id },
    }));
}

export function subscribeToDropdown(id, close) {
    const handleOpen = (event) => {
        if (event.detail?.id !== id) close();
    };

    const handleClose = () => close();
    window.addEventListener(DROPDOWN_OPEN_EVENT, handleOpen);
    window.addEventListener(DROPDOWN_CLOSE_EVENT, handleClose);
    return () => {
        window.removeEventListener(DROPDOWN_OPEN_EVENT, handleOpen);
        window.removeEventListener(DROPDOWN_CLOSE_EVENT, handleClose);
    };
}

export function closeAllDropdowns() {
    window.dispatchEvent(new CustomEvent(DROPDOWN_CLOSE_EVENT));
}

export function isDropdownInteraction(target) {
    return Boolean(target?.closest(
        '[aria-expanded="true"], [aria-haspopup="listbox"], [role="listbox"], [role="menu"], [data-dropdown-popup="true"]'
    ));
}
