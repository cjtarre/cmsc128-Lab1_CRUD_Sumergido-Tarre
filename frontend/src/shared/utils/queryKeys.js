export const queryKeys = {
    projects: ["projects"],
    deletedProjects: ["projects", "deleted"],
    project: (projectId) => ["projects", "detail", String(projectId)],
    projectTasks: (projectId) => ["tasks", "project", String(projectId)],
    defaultTasks: ["tasks", "default"],
    tags: (scope) => ["tags", scope],
    members: (projectId) => ["projects", "members", String(projectId)],
    projectInvites: (projectId) => ["projects", "invites", String(projectId)],
    myInvites: ["invites", "my"],
    activities: (projectId) => ["projects", "activities", String(projectId)],
    notifications: (userId) => ["notifications", String(userId || "anonymous")],
};
