export function formatRelativeTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return "Just now";
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h`;

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const calendarDays = Math.round((startOfToday - startOfDate) / day);

    if (calendarDays === 1) return "Yesterday";
    if (calendarDays < 7) return `${calendarDays}d`;
    if (calendarDays < 35) return `${Math.floor(calendarDays / 7)}w`;

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
    }).format(date);
}
