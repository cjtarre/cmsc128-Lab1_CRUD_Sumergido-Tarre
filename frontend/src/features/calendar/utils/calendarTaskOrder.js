import { formatDueTime } from "../../../shared/utils/dateUtils";

// Sort the day agenda chronologically without changing the original task array.
// Tasks without a valid time appear last; equal times keep their existing order.
function dueTimeMinutes(value) {
    const formatted = formatDueTime(value);
    const parts = formatted.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
    if (!parts) return null;

    const hours = Number(parts[1]) % 12 + (parts[3].toUpperCase() === "PM" ? 12 : 0);
    return hours * 60 + Number(parts[2]);
}

export function compareTasksByDueTime(a, b) {
    const first = dueTimeMinutes(a.dueTime);
    const second = dueTimeMinutes(b.dueTime);
    if (first === null) return second === null ? 0 : 1;
    if (second === null) return -1;
    return first - second;
}
