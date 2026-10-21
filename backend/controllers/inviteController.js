const supabase = require("../config/supabaseAdmin");
const {
    parseId,
    validateIdentifier,
    validateInviteRole,
} = require("../utils/validation");
const { notify, removeInviteNotifications } = require("../utils/notifications");

// ---------------------------------------------------------------------------
// Project side: run behind requireProjectRole('owner'), which sets req.projectId.
// ---------------------------------------------------------------------------

// Resolve "username or email" to a profile, or null. Same convention as login:
// anything containing '@' is treated as an email.
const findInvitee = async (identifier) => {
    const value = identifier.trim();
    let userId;

    if (value.includes("@")) {
        const { data, error } = await supabase.rpc("find_user_id_by_email", { p_email: value });

        if (error) throw error;
        if (!data) return null;

        userId = data;
    }

    let query = supabase.from("profiles").select("user_id, username, display_name");

    query = userId
        ? query.eq("user_id", userId)
        : query.eq("username", value.toLowerCase());

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    return data;
};

// POST /api/projects/:project_id/invites   { identifier, role: 'editor' | 'viewer' }
const createInvite = async (req, res) => {
    try {
        const { identifier, role } = req.body;

        const identifierError = validateIdentifier(identifier);
        if (identifierError) {
            return res.status(400).json({ error: identifierError });
        }

        const roleError = validateInviteRole(role);
        if (roleError) {
            return res.status(400).json({ error: roleError });
        }

        const invitee = await findInvitee(identifier);

        if (!invitee) {
            return res.status(404).json({ error: "No user found with that username or email" });
        }

        if (invitee.user_id === req.user.id) {
            return res.status(400).json({ error: "You can't invite yourself" });
        }

        const { data: existingMember, error: memberError } = await supabase
            .from("project_user")
            .select("user_id")
            .eq("project_id", req.projectId)
            .eq("user_id", invitee.user_id)
            .maybeSingle();

        if (memberError) throw memberError;

        if (existingMember) {
            return res.status(409).json({ error: "That user is already a member of this project" });
        }

        const { data: invite, error: inviteError } = await supabase
            .from("project_invite")
            .insert({
                project_id: req.projectId,
                inviter_id: req.user.id,
                invitee_id: invitee.user_id,
                role,
            })
            .select("id, role, status, created_at")
            .single();

        // 23505 = the one-pending-invite-per-person unique index
        if (inviteError?.code === "23505") {
            return res.status(409).json({ error: "That user already has a pending invitation" });
        }

        if (inviteError) throw inviteError;

        try {
            const { data: project, error: projectError } = await supabase
                .from("projects")
                .select("project_name")
                .eq("id", req.projectId)
                .single();

            if (projectError) throw projectError;

            await notify([invitee.user_id], "project_invite", {
                actorId: req.user.id,
                data: {
                    invite_id: invite.id,
                    project_id: req.projectId,
                    project_name: project.project_name,
                    role,
                },
            });
        } catch (notifyError) {
            // An invite nobody is told about is worse than no invite: undo it.
            await supabase.from("project_invite").delete().eq("id", invite.id);
            throw notifyError;
        }

        res.status(201).json({
            ...invite,
            invitee: { username: invitee.username, display_name: invitee.display_name },
        });
    } catch (error) {
        console.error("Error creating invite:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET /api/projects/:project_id/invites   -> pending invites for this project
const getProjectInvites = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("project_invite")
            .select("id, role, status, created_at, invitee:profiles!invitee_id(username, display_name)")
            .eq("project_id", req.projectId)
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching project invites:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// DELETE /api/projects/:project_id/invites/:invite_id   -> owner cancels a pending invite
const cancelInvite = async (req, res) => {
    try {
        const inviteId = parseId(req.params.invite_id);

        if (inviteId === null) {
            return res.status(400).json({ error: "Invalid invite id" });
        }

        const { data, error } = await supabase
            .from("project_invite")
            .update({ status: "cancelled", responded_at: new Date().toISOString() })
            .eq("id", inviteId)
            .eq("project_id", req.projectId)
            .eq("status", "pending")
            .select("id");

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Pending invite not found" });
        }

        // The invitee's notification is no longer actionable; remove it.
        try {
            await removeInviteNotifications([inviteId]);
        } catch (cleanupError) {
            console.error("Error removing invite notification:", cleanupError);
        }

        res.status(200).json({ message: "Invite cancelled" });
    } catch (error) {
        console.error("Error cancelling invite:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ---------------------------------------------------------------------------
// Invitee side: /api/invites (behind requireAuth only; ownership of the invite
// is checked against req.user.id).
// ---------------------------------------------------------------------------

// GET /api/invites   -> my pending invites (projects that were deleted are hidden)
const getMyInvites = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("project_invite")
            .select(`
                id, role, status, created_at,
                projects!inner(id, project_name, deleted_at),
                inviter:profiles!inviter_id(username, display_name)
            `)
            .eq("invitee_id", req.user.id)
            .eq("status", "pending")
            .is("projects.deleted_at", null)
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.status(200).json(
            data.map(({ projects, ...invite }) => ({
                ...invite,
                project: { id: projects.id, project_name: projects.project_name },
            }))
        );
    } catch (error) {
        console.error("Error fetching invites:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const respondToInvite = (accept) => async (req, res) => {
    try {
        const inviteId = parseId(req.params.invite_id);

        if (inviteId === null) {
            return res.status(400).json({ error: "Invalid invite id" });
        }

        const { data, error } = await supabase.rpc("respond_to_invite", {
            p_invite_id: inviteId,
            p_user_id: req.user.id,
            p_accept: accept,
        });

        if (error) throw error;

        switch (data.result) {
            case "accepted":
            case "declined":
                return res.status(200).json({ result: data.result, project_id: data.project_id });
            case "not_pending":
                return res.status(409).json({ error: "This invitation has already been answered" });
            case "project_deleted":
                return res.status(410).json({ error: "This project no longer exists" });
            default:
                return res.status(404).json({ error: "Invitation not found" });
        }
    } catch (error) {
        console.error("Error responding to invite:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// POST /api/invites/:invite_id/accept
const acceptInvite = respondToInvite(true);

// POST /api/invites/:invite_id/decline
const declineInvite = respondToInvite(false);

module.exports = {
    createInvite,
    getProjectInvites,
    cancelInvite,
    getMyInvites,
    acceptInvite,
    declineInvite,
};
