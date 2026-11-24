export const getActorName = (activity) => activity.actor?.display_name || activity.actor?.username || "A project member";

export const getInitials = (activity) => {
    const name = getActorName(activity);
    return name === "A project member" ? "?" : name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
};

export const formatActivityTime = (value) => {
    if (!value) return "";
    const date = new Date(value), seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const getActivityContent = (activity) => {
    const actor = getActorName(activity), data = activity.data || {}, taskName = data.task_name || data.taskName || "a task";

    switch (activity.activity_type) {
        case "task_created": return { actor, action: "created", subject: taskName };
        case "task_status_changed": return { actor, action: "moved", subject: taskName, detail: `to ${String(data.status || data.new_status || "a new status").replaceAll("_", " ")}` };
        case "task_completed": return { actor, action: "completed", subject: taskName };
        case "task_assigned": return { actor, action: "assigned", subject: taskName, detail: `to ${data.assignee_name || data.assigneeName || "a project member"}` };
        case "task_reassigned": return { actor, action: "reassigned", subject: taskName, detail: `to ${data.assignee_name || data.assigneeName || "a project member"}` };
        case "task_unassigned": return { actor, action: "unassigned", subject: taskName };
        case "member_joined": return { actor: data.display_name || data.username || data.member_name || "A member", action: "joined", subject: "the project" };
        case "member_removed": return { actor, action: "removed", subject: data.display_name || data.username || data.member_name || "a member", detail: "from the project" };
        case "member_role_changed": return { actor, action: "changed", subject: data.display_name || data.username || data.member_name || "a member", detail: `to ${data.role || data.new_role || "a new role"}` };
        default: return { actor, action: "updated", subject: "the project" };
    }
};