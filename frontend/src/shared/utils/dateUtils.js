// Format a stored DD/MM/YYYY date for display.
export function formatDueDate(date) {
    if (!date) return "";

    const parts = date.split("/");
    if (parts.length !== 3) return "Invalid date";

    const day = Number(parts[0]), month = Number(parts[1]), year = Number(parts[2]);
    const taskDate = new Date(year, month - 1, day);
    if (isNaN(taskDate.getTime())) return "Invalid date";

    const today = new Date();
    const isToday = taskDate.getDate() === today.getDate() && taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();

    return isToday ? "Today" : taskDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

// Convert DD/MM/YYYY to YYYY-MM-DD for date inputs.
export function convertToInputDate(date) {
    if (!date) return "";

    const [day, month, year] = date.split("/");
    if (!day || !month || !year) return "";

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// Convert a stored 12-hour time to HH:MM for time inputs.
export function convertToInputTime(time) {
    if (!time) return "";
    if (/^\d{2}:\d{2}$/.test(time)) return time;

    const [timeValue, period] = time.split(" ");
    if (!timeValue || !period) return "";

    let [hours, minutes] = timeValue.split(":");
    hours = Number(hours);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
}

// Convert HH:MM to a user-friendly 12-hour time.
export function formatDueTime(time) {
    if (!time) return "";
    if (/^\d{1,2}:\d{2} (AM|PM)$/i.test(time)) return time;

    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";

    const period = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${period}`;
}

// Categorize a task date relative to today.
export function getTaskCategory(date) {
    if (!date) return "upcoming";

    const [day, month, year] = date.split("/").map(Number);
    if (!day || !month || !year) return "upcoming";

    const taskDate = new Date(year, month - 1, day), today = new Date();
    taskDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (taskDate < today) return "overdue";
    if (taskDate.getTime() === today.getTime()) return "today";
    return "upcoming";
}

// Format an activity timestamp as relative time or a short date.
export function formatActivityTime(value) {
    if (!value) return "";

    const date = new Date(value), seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}