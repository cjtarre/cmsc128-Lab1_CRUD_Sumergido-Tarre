export function formatDueDate(date) {
    if (!date) return "";

    const parts = date.split("/");
    if (parts.length !== 3) return "Invalid date";

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    const taskDate = new Date(year, month - 1, day);

    if (isNaN(taskDate.getTime())) return "Invalid date";

    const today = new Date();
    const isToday =
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear();

    if (isToday) return "Today";

    return taskDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
    });
}

export function convertToInputDate(date) {
    if (!date) return "";

    const [day, month, year] = date.split("/");
    if (!day || !month || !year) return "";

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

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

export function formatDueTime(time) {
    if (!time) return "";

    if (/^\d{1,2}:\d{2} (AM|PM)$/i.test(time)) return time;

    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function getTaskCategory(date) {
    if (!date) return "upcoming";

    const [day, month, year] = date.split("/").map(Number);
    if (!day || !month || !year) return "upcoming";

    const taskDate = new Date(year, month - 1, day);
    const today = new Date();

    taskDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (taskDate < today) return "overdue";
    if (taskDate.getTime() === today.getTime()) return "today";

    return "upcoming";
}