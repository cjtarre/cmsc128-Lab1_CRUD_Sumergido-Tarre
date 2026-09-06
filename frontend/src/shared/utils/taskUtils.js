export function sortTasksByDueDate(tasks) {
    const getTimestamp = (task) => {
        if (!task.dueDate) return Infinity;

        const [day, month, year] = task.dueDate.split("/").map(Number);
        let [time, period] = (task.dueTime || "12:00 AM").split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        return new Date(year, month - 1, day, hours, minutes).getTime();
    };

    return [...tasks].sort(
        (a, b) => getTimestamp(a) - getTimestamp(b)
    );
}