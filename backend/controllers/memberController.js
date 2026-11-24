const supabase = require("../config/supabaseAdmin");
const { isUuid, validateInviteRole } = require("../utils/validation");

// All handlers here run behind requireProjectRole (see projectRoutes.js), which sets
// req.projectId and req.projectRole.

// GET /api/projects/:project_id/members   (any member)
// Owner first, then by join date. Emails are never exposed to other members.
const getMembers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("project_user")
            .select("user_id, role, created_at, profiles(username, display_name)")
            .eq("project_id", req.projectId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        const members = data
            .map((row) => ({
                user_id: row.user_id,
                role: row.role,
                joined_at: row.created_at,
                username: row.profiles?.username ?? null,
                display_name: row.profiles?.display_name ?? null,
            }))
            .sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0));

        res.status(200).json(members);
    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// PATCH /api/projects/:project_id/members/:user_id   { role: 'editor' | 'viewer' }   (owner)
const changeMemberRole = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!isUuid(user_id)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        const roleError = validateInviteRole(req.body.role);
        if (roleError) {
            return res.status(400).json({ error: roleError });
        }

        if (user_id === req.user.id) {
            return res.status(400).json({ error: "You can't change your own role" });
        }

        // neq owner: the owner row can never be changed here.
        const { data, error } = await supabase
            .from("project_user")
            .update({ role: req.body.role })
            .eq("project_id", req.projectId)
            .eq("user_id", user_id)
            .neq("role", "owner")
            .select("user_id, role");

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Member not found" });
        }

        res.status(200).json(data[0]);
    } catch (error) {
        console.error("Error changing member role:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// DELETE /api/projects/:project_id/members/:user_id   (owner removes someone else)
// To leave a project yourself use POST /api/projects/:project_id/leave.
const removeMember = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!isUuid(user_id)) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        if (user_id === req.user.id) {
            return res.status(400).json({ error: "Use the leave endpoint to leave a project" });
        }

        const { data, error } = await supabase
            .from("project_user")
            .delete()
            .eq("project_id", req.projectId)
            .eq("user_id", user_id)
            .neq("role", "owner")
            .select("user_id");

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Member not found" });
        }

        res.status(200).json({ message: "Member removed" });
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// POST /api/projects/:project_id/leave   (any member)
// A non-owner just leaves. An owner passes ownership to the next member first
// (the leave_project function does this atomically and notifies the new owner).
const leaveProject = async (req, res) => {
    try {
        const { data, error } = await supabase.rpc("leave_project", {
            p_project_id: req.projectId,
            p_user_id: req.user.id,
        });

        if (error) throw error;

        switch (data.result) {
            case "left":
                return res.status(200).json({
                    message: "You left the project",
                    ...(data.new_owner_id && { new_owner_id: data.new_owner_id }),
                });
            case "default_project":
                return res.status(400).json({ error: "You can't leave your default project" });
            case "sole_member":
                return res.status(400).json({
                    error: "You are the only member. Delete the project instead of leaving it.",
                });
            default:
                return res.status(404).json({ error: "Project not found" });
        }
    } catch (error) {
        console.error("Error leaving project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getMembers,
    changeMemberRole,
    removeMember,
    leaveProject,
};
