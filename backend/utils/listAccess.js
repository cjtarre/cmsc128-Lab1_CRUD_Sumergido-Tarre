const supabase = require("../config/supabaseAdmin");
const { parseId } = require("./validation");

// Higher number = more permissions. Must match the Postgres enum `list_role`.
const ROLE_RANK = { viewer: 1, editor: 2, owner: 3 };

// Returns the user's role in a list, or null if they are not a member.
// Soft-deleted lists are treated as nonexistent unless includeDeleted is set
// (needed so an owner can still restore a deleted list).
const getRole = async (listId, userId, { includeDeleted = false } = {}) => {
    let query = supabase
        .from("list_user")
        .select("role, list!inner(deleted_at)")
        .eq("list_id", listId)
        .eq("user_id", userId);

    if (!includeDeleted) { query = query.is("list.deleted_at", null); }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data?.role ?? null;
};

// IDs of every non-deleted list the user is a member of (any role).
const getMemberListIds = async (userId) => {
    const { data, error } = await supabase
        .from("list_user")
        .select("list_id, list!inner(deleted_at)")
        .eq("user_id", userId)
        .is("list.deleted_at", null);

    if (error) throw error;
    return data.map((row) => row.list_id);
};

// The user's default list id, or null if they somehow don't have one.
const getDefaultListId = async (userId) => {
    const { data, error } = await supabase
        .from("list")
        .select("id")
        .eq("owner", userId)
        .eq("is_default", true)
        .is("deleted_at", null)
        .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
};

// Tags attached to a task must be global presets (list_id null) or belong to
// the task's own list. Returns an error message, or null if all tags are valid.
// note: tag creation right now is not implemented
const validateTagIdsForList = async (tagIds, listId) => {
    if (!Array.isArray(tagIds) || tagIds.some((id) => parseId(id) === null)) {
        return "tag_ids must be an array of tag ids";
    }

    const uniqueIds = [...new Set(tagIds.map(Number))];
    if (uniqueIds.length === 0) return null;

    const { data, error } = await supabase
        .from("tags")
        .select("tag_id, list_id")
        .in("tag_id", uniqueIds);
    if (error) throw error;

    const allowed = data.filter((tag) => tag.list_id === null || tag.list_id === listId);
    if (allowed.length !== uniqueIds.length) {
        return "One or more tags do not exist or do not belong to this list";
    }
    return null;
};

// Route middleware. Must run AFTER requireAuth (needs req.user).
// On success it sets req.listId (number) and req.listRole for the controller.
// Non-members get 404 (not 403) so list ids can't be probed for existence.
const requireListRole = (minRole, { includeDeleted = false } = {}) =>
    async (req, res, next) => {
        try {
            const listId = parseId(req.params.list_id);

            if (listId === null) {
                return res.status(400).json({ error: "Invalid list id" });
            }

            const role = await getRole(listId, req.user.id, { includeDeleted });

            if (!role) {
                return res.status(404).json({ error: "List not found" });
            }

            if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
                return res.status(403).json({ error: "Insufficient permissions" });
            }

            req.listId = listId;
            req.listRole = role;
            next();
        } catch (error) {
            console.error("Error checking list access:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

module.exports = {
    ROLE_RANK,
    getRole,
    getMemberListIds,
    getDefaultListId,
    validateTagIdsForList,
    requireListRole,
};