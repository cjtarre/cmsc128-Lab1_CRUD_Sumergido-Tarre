import { CheckSquare2, FolderOpen, RotateCcw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { formatRelativeTime } from "../utils/formatRelativeTime";

function NotificationItem({ notification, onRead, onClose }) {
    const navigate = useNavigate();

    const actor =
        notification.actor?.display_name ||
        notification.actor?.username ||
        "A project member";

    const taskName = notification.data?.task_name || "a task";
    const projectId = notification.data?.project_id;
    const projectName = notification.data?.project_name || "a project";
    const time = formatRelativeTime(notification.created_at);

    const config = {
        task_assigned: {
            title: "Task assigned to you",
            message: (
                <>
                    <span className="font-medium">{actor}</span> assigned you{" "}
                    <span className="font-medium text-slate-600 dark:text-slate-300">{taskName}</span>.
                </>
            ),
            action: projectId ? "Open project" : "Open task",
            icon: CheckSquare2,
            iconClass: "bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400",
            canOpen: true,
        },

        project_deleted: {
            title: "Project deleted",
            message: (
                <>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{projectName}</span>{" "}
                    was deleted by <span className="font-medium">{actor}</span>. You no longer have access to this project.
                </>
            ),
            action: null,
            icon: Trash2,
            iconClass: "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400",
            canOpen: false,
        },

        project_restored: {
            title: "Project restored",
            message: (
                <>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{projectName}</span>{" "}
                    was restored by <span className="font-medium">{actor}</span>.
                </>
            ),
            action: "Open project",
            icon: RotateCcw,
            iconClass: "bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-400",
            canOpen: Boolean(projectId),
        },
    };

    const fallback = {
        title: "Project update",
        message: "There is a new update in one of your projects.",
        action: projectId ? "Open project" : null,
        icon: FolderOpen,
        iconClass: "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400",
        canOpen: Boolean(projectId),
    };

    const details = config[notification.type] || fallback;
    const Icon = details.icon;

    const handleOpen = async () => {
        await onRead?.(notification.id);

        if (!details.canOpen) return;

        onClose?.();

        if (projectId) navigate(`/projects/${projectId}`);
        else navigate("/my-tasks");
    };

    return (
        <button
            type="button"
            onClick={handleOpen}
            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition dark:hover:bg-white/[0.03] sm:px-5 ${
                details.canOpen ? "hover:bg-green-50/40" : "cursor-default"
            } ${notification.read_at ? "" : "bg-green-50/25 dark:bg-green-950/10"}`}
        >
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${details.iconClass}`}>
                <Icon size={15} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {details.title}
                    </p>

                    <div className="flex shrink-0 items-center gap-2">
                        {time && (
                            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                                {time}
                            </span>
                        )}

                        {!notification.read_at && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                        )}
                    </div>
                </div>

                <p className="mt-0.5 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {details.message}
                </p>

                {details.action && (
                    <p className="mt-1 text-[10px] text-green-600 dark:text-green-400">
                        {details.action}
                    </p>
                )}
            </div>
        </button>
    );
}

export default NotificationItem;
