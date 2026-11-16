import { getDisplayName } from "../../../shared/utils/userUtils";
import { PROJECT_ROLE } from "../constants/projectOptions";

// Check whether a project role can modify project content.
export function canEditProject(role) {
    return role === PROJECT_ROLE.OWNER || role === PROJECT_ROLE.EDITOR;
}

// Check whether a project role owns the project.
export function isProjectOwner(role) {
    return role === PROJECT_ROLE.OWNER;
}

// Filter collaborative projects by project name.
export function filterCollaborativeProjects(projects, searchTerm) {
    const query = searchTerm.trim().toLowerCase();

    return projects.filter(
        (project) =>
            !project.is_default &&
            project.project_name?.toLowerCase().includes(query)
    );
}

// Apply Projects page membership filters and sort without mutating the source data.
export function filterAndSortCollaborativeProjects(
    projects,
    { searchTerm = "", membership = "all", sortBy = "default" } = {}
) {
    const visible = filterCollaborativeProjects(projects, searchTerm).filter((project) => {
        if (membership === "owned") return project.role === PROJECT_ROLE.OWNER;
        if (membership === "shared") {
            return project.role === PROJECT_ROLE.EDITOR || project.role === PROJECT_ROLE.VIEWER;
        }
        return true;
    });

    if (sortBy === "name-asc") {
        return visible.sort((a, b) => (a.project_name || "").localeCompare(b.project_name || ""));
    }
    if (sortBy === "name-desc") {
        return visible.sort((a, b) => (b.project_name || "").localeCompare(a.project_name || ""));
    }
    if (sortBy === "tasks-desc") {
        return visible.sort((a, b) => (Number(b.task_count) || 0) - (Number(a.task_count) || 0));
    }
    return visible;
}

// Search invitations by project name, inviter name, or offered role.
export function filterProjectInvitations(invites, searchTerm = "") {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return invites;

    return invites.filter((invite) => [
        invite.project?.project_name,
        getDisplayName(invite.inviter, ""),
        invite.inviter?.username,
        invite.role,
    ].some((value) => typeof value === "string" && value.toLowerCase().includes(query)));
}

// Derive the placeholder from records, not from the current search results.
export function getProjectsSearchPlaceholder(projects, invites) {
    const hasProjects = projects.some((project) => project && !project.is_default);
    const hasInvites = invites.length > 0;

    if (hasProjects && hasInvites) return "Search projects and invitations...";
    if (hasInvites) return "Search invitations...";
    return "Search projects...";
}

// Format when a deleted project was removed.
export function formatDeletedProjectDate(deletedAt) {
    if (!deletedAt) return "Recently deleted";

    return `Deleted ${new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(deletedAt))}`;
}