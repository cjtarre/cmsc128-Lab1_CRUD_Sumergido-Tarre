import { getDisplayName } from "../../../shared/utils/userUtils";
import { formatRelativeTime } from "./formatRelativeTime";

// Derive display data from an invitation notification.
export function getInviteNotificationMeta(notification) {
    const { project_id: projectId, project_name: projectName = "a project", role } = notification.data || {};
    const status = notification.invite_status;

    return {
        actor: getDisplayName(notification.actor, "A Takda user"),
        projectId, projectName, role, status,
        pending: status === "pending",
        accepted: status === "accepted",
        time: formatRelativeTime(notification.created_at),
    };
}