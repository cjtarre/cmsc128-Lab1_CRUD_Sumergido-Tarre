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

// Format when a deleted project was removed.
export function formatDeletedProjectDate(deletedAt) {
    if (!deletedAt) return "Recently deleted";

    return `Deleted ${new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(deletedAt))}`;
}