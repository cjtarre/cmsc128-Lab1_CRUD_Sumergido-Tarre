import { STATUS } from "../../tasks/constants/taskOptions";

export function getTaskNotifications(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks
        .filter((task) => task.status !== STATUS.COMPLETED && task.dueDate)
        .map((task) => {
            const [day, month, year] = task.dueDate.split("/");
            const dueDate = new Date(year, month - 1, day);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                return {
                    ...task,
                    type: "overdue",
                    notificationTitle: "Task overdue",
                    description: `Was due ${task.dueDate}`,
                };
            }

            if (dueDate.getTime() === today.getTime()) {
                return {
                    ...task,
                    type: "today",
                    notificationTitle: "Task due today",
                    description: "Due today",
                };
            }

            return null;
        })
        .filter(Boolean);
}