const supabase = require("../config/supabaseAdmin");
const { validateListName } = require("../utils/validation");

const LIST_COLUMNS = "id, list_name, owner, is_default, created_at, deleted_at";

// Role-checking is done by requireListRole in listRoutes.js, which sets
// req.listId and req.listRole. Handlers below can rely on both.

// retrieve all lists the authenticated user is a MEMBER of (not just owns),
// each with the user's role. Default list first, then oldest first.
// GET /api/lists?deleted=true returns the user's soft-deleted lists instead
// (owner only), so the UI has something to offer for restoring.
const getAllLists = async (req, res) => {
    try {
        const onlyDeleted = req.query.deleted === "true";

        let query = supabase
            .from("list_user")
            .select(`role, list!inner(${LIST_COLUMNS})`)
            .eq("user_id", req.user.id);

        query = onlyDeleted
            ? query.eq("role", "owner").not("list.deleted_at", "is", null)
            : query.is("list.deleted_at", null);

        const { data, error } = await query;

        if (error) throw error;

        const lists = data
            .map(({ role, list }) => ({ ...list, role }))
            .sort((a, b) => {
                if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
                return new Date(a.created_at) - new Date(b.created_at);
            });

        res.status(200).json(lists);
    } catch (error) {
        console.error("Error fetching lists:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// create a new list for the authenticated user
// The list row and the owner's list_user row are created together inside the
// create_list Postgres function, so one can never exist without the other.
const createList = async (req, res) => {
    try {
        const { list_name } = req.body;

        const nameError = validateListName(list_name);
        if (nameError) {
            return res.status(400).json({ error: nameError });
        }

        const { data, error } = await supabase.rpc("create_list", {
            p_owner: req.user.id,
            p_name: list_name.trim(),
            p_is_default: false,
        });

        if (error) throw error;

        res.status(201).json({ ...data, role: "owner" });
    } catch (error) {
        console.error("Error creating list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// delete (soft) a list for the authenticated user
// must be the owner of the list to delete it (enforced by the route)
// The default list can't be deleted. Its tasks stay in the DB; they are hidden
// because task queries only include lists where deleted_at is null.
const deleteList = async (req, res) => {
    try {
        const { data: list, error: fetchError } = await supabase
            .from("list")
            .select("id, is_default")
            .eq("id", req.listId)
            .is("deleted_at", null)
            .single();

        if (fetchError) throw fetchError;

        if (list.is_default) {
            return res.status(400).json({ error: "The default list cannot be deleted" });
        }

        const { data, error } = await supabase
            .from("list")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", req.listId)
            .is("deleted_at", null)
            .select(LIST_COLUMNS);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "List not found" });
        }

        res.status(200).json({
            message: `List with ID ${req.listId} deleted successfully`,
            data: data[0],
        });
    } catch (error) {
        console.error("Error deleting list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// update a list for the authenticated user
// must be the owner of the list (enforced by the route).
// Only list_name is editable here; ownership changes need their own endpoint.
const updateList = async (req, res) => {
    try {
        const { list_name } = req.body;

        const nameError = validateListName(list_name);
        if (nameError) {
            return res.status(400).json({ error: nameError });
        }

        const { data, error } = await supabase
            .from("list")
            .update({ list_name: list_name.trim() })
            .eq("id", req.listId)
            .is("deleted_at", null)
            .select(LIST_COLUMNS);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "List not found" });
        }

        res.status(200).json({ ...data[0], role: req.listRole });
    } catch (error) {
        console.error("Error updating list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// restore a deleted list for the authenticated user
// must be the owner of the list to restore it (route uses includeDeleted)
const restoreList = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("list")
            .update({ deleted_at: null })
            .eq("id", req.listId)
            .not("deleted_at", "is", null)
            .select(LIST_COLUMNS);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(409).json({ error: "List is not deleted" });
        }

        res.status(200).json({ ...data[0], role: req.listRole });
    } catch (error) {
        console.error("Error restoring list:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getAllLists,
    createList,
    deleteList,
    updateList,
    restoreList
};