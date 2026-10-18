const supabase = require("../config/supabaseAdmin");

// Insert one notification per recipient. Throws on failure; callers decide
// whether a failed notification should fail the request (invites) or just be
// logged (project deletion, where the main action has already happened).
const notify = async (userIds, type, { actorId = null, data = {} } = {}) => {
    const recipients = [...new Set(userIds)];

    if (recipients.length === 0) return;

    const rows = recipients.map((user_id) => ({
        user_id,
        type,
        actor_id: actorId,
        data,
    }));

    const { error } = await supabase.from("notifications").insert(rows);

    if (error) throw error;
};

// Remove the invite notifications for invites that are no longer actionable
// (cancelled by the owner, or the project was deleted).
const removeInviteNotifications = async (inviteIds) => {
    if (inviteIds.length === 0) return;

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("type", "project_invite")
        .in("data->>invite_id", inviteIds.map(String));

    if (error) throw error;
};

module.exports = { notify, removeInviteNotifications };
