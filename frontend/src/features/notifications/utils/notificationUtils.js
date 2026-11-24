import { CheckSquare2, FolderOpen, RotateCcw, Trash2 } from "lucide-react";

import { getDisplayName } from "../../../shared/utils/userUtils";
import { STATUS } from "../../tasks/constants/taskOptions";
import { formatRelativeTime } from "./formatRelativeTime";

// Build reminders for incomplete tasks due today or overdue.
export function getTaskNotifications(tasks = []) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks
        .filter((task) => task.status !== STATUS.COMPLETED && task.dueDate)
        .map((task) => {
            const [day, month, year] = task.dueDate.split("/");
            const dueDate = new Date(year, month - 1, day);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                return { ...task, type: "overdue", notificationTitle: "Task overdue", description: `Was due ${task.dueDate}` };
            }

            if (dueDate.getTime() === today.getTime()) {
                return { ...task, type: "today", notificationTitle: "Task due today", description: "Due today" };
            }

            return null;
        })
        .filter(Boolean);
}

// Derive display and navigation data from a standard notification.
export function getNotificationDetails(notification) {
    const actor = getDisplayName(notification.actor, "A project member");
    const { task_name: taskName = "a task", project_id: projectId, project_name: projectName = "a project" } = notification.data || {};

    const config = {
        task_assigned: {
            title: "Task assigned to you",
            actor,
            subject: taskName,
            messageType: "assigned",
            action: projectId ? "Open project" : "Open task",
            icon: CheckSquare2,
            iconClass: "bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400",
            canOpen: true,
        },
        project_deleted: {
            title: "Project deleted",
            actor,
            subject: projectName,
            messageType: "deleted",
            action: null,
            icon: Trash2,
            iconClass: "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400",
            canOpen: false,
        },
        project_restored: {
            title: "Project restored",
            actor,
            subject: projectName,
            messageType: "restored",
            action: "Open project",
            icon: RotateCcw,
            iconClass: "bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400",
            canOpen: Boolean(projectId),
        },
    };

    return {
        ...(config[notification.type] || {
            title: "Project update",
            actor: null,
            subject: null,
            messageType: "default",
            action: projectId ? "Open project" : null,
            icon: FolderOpen,
            iconClass: "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400",
            canOpen: Boolean(projectId),
        }),
        projectId,
        time: formatRelativeTime(notification.created_at),
    };
}