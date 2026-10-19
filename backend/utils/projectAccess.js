const supabase = require("../config/supabaseAdmin");
const { parseId } = require("./validation");

// Higher number = more permissions. Must match the Postgres enum `project_role`.
const ROLE_RANK = { viewer: 1, editor: 2, owner: 3 };

// Returns the user's role in a project, or null if they are not a member.
// Soft-deleted projects are treated as nonexistent unless includeDeleted is set
// (needed so an owner can still restore a deleted project).
const getRole = async (projectId, userId, { includeDeleted = false } = {}) => {
    let query = supabase
        .from("project_user")
        .select("role, projects!inner(deleted_at)")
        .eq("project_id", projectId)
        .eq("user_id", userId);

    if (!includeDeleted) { query = query.is("projects.deleted_at", null); }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data?.role ?? null;
};

// IDs of every non-deleted project the user is a member of (any role).
const getMemberProjectIds = async (userId) => {
    const { data, error } = await supabase
        .from("project_user")
        .select("project_id, projects!inner(deleted_at)")
        .eq("user_id", userId)
        .is("projects.deleted_at", null);

    if (error) throw error;
    return data.map((row) => row.project_id);
};

// The user's default project id, or null if they somehow don't have one.
const getDefaultProjectId = async (userId) => {
    const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("owner", userId)
        .eq("is_default", true)
        .is("deleted_at", null)
        .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
};

// Tags attached to a task must be global presets (project_id null) or belong to
// the task's own project. Returns an error message, or null if all tags are valid.
// note: tag creation right now is not implemented
const validateTagIdsForProject = async (tagIds, projectId) => {
    if (!Array.isArray(tagIds) || tagIds.some((id) => parseId(id) === null)) {
        return "tag_ids must be an array of tag ids";
    }

    const uniqueIds = [...new Set(tagIds.map(Number))];
    if (uniqueIds.length === 0) return null;

    const { data, error } = await supabase
        .from("tags")
        .select("tag_id, project_id")
        .in("tag_id", uniqueIds);
    if (error) throw error;

    const allowed = data.filter((tag) => tag.project_id === null || tag.project_id === projectId);
    if (allowed.length !== uniqueIds.length) {
        return "One or more tags do not exist or do not belong to this project";
    }
    return null;
};

// Route middleware. Must run AFTER requireAuth (needs req.user).
// On success it sets req.projectId (number) and req.projectRole for the controller.
// Non-members get 404 (not 403) so project ids can't be probed for existence.
const requireProjectRole = (minRole, { includeDeleted = false } = {}) =>
    async (req, res, next) => {
        try {
            const projectId = parseId(req.params.project_id);

            if (projectId === null) {
                return res.status(400).json({ error: "Invalid project id" });
            }

            const role = await getRole(projectId, req.user.id, { includeDeleted });

            if (!role) {
                return res.status(404).json({ error: "Project not found" });
            }

            if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
                return res.status(403).json({ error: "Insufficient permissions" });
            }

            req.projectId = projectId;
            req.projectRole = role;
            next();
        } catch (error) {
            console.error("Error checking project access:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

module.exports = {
    ROLE_RANK,
    getRole,
    getMemberProjectIds,
    getDefaultProjectId,
    validateTagIdsForProject,
    requireProjectRole,
};