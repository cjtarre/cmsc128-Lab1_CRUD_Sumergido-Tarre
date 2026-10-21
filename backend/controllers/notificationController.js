const supabase = require("../config/supabaseAdmin");
const { parseId } = require("../utils/validation");

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// GET /api/notifications?unread=true&limit=50
// -> { notifications: [...], unread_count }
// Newest first. project_invite notifications also carry invite_status
// ('pending' | 'accepted' | 'declined' | 'cancelled', or null if the invite is gone)
// so the UI knows whether to show Accept / Decline buttons.
const getNotifications = async (req, res) => {
    try {
        const requested = Number.parseInt(req.query.limit, 10);
        const limit = Number.isNaN(requested) ? DEFAULT_LIMIT : Math.min(Math.max(requested, 1), MAX_LIMIT);

        let query = supabase
            .from("notifications")
            .select("id, created_at, type, data, read_at, actor:profiles!actor_id(username, display_name)")
            .eq("user_id", req.user.id)
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .limit(limit);

        if (req.query.unread === "true") {
            query = query.is("read_at", null);
        }

        const [{ data, error }, { count, error: countError }] = await Promise.all([
            query,
            supabase
                .from("notifications")
                .select("id", { count: "exact", head: true })
                .eq("user_id", req.user.id)
                .is("read_at", null),
        ]);

        if (error) throw error;
        if (countError) throw countError;

        const inviteIds = data
            .filter((n) => n.type === "project_invite")
            .map((n) => Number(n.data?.invite_id))
            .filter(Number.isFinite);

        const statusById = new Map();

        if (inviteIds.length > 0) {
            const { data: invites, error: inviteError } = await supabase
                .from("project_invite")
                .select("id, status")
                .eq("invitee_id", req.user.id)
                .in("id", inviteIds);

            if (inviteError) throw inviteError;

            invites.forEach((invite) => statusById.set(invite.id, invite.status));
        }

        const notifications = data.map((n) =>
            n.type === "project_invite"
                ? { ...n, invite_status: statusById.get(Number(n.data?.invite_id)) ?? null }
                : n
        );

        res.status(200).json({ notifications, unread_count: count ?? 0 });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// PATCH /api/notifications/:notification_id/read   (idempotent)
const markNotificationRead = async (req, res) => {
    try {
        const notificationId = parseId(req.params.notification_id);

        if (notificationId === null) {
            return res.status(400).json({ error: "Invalid notification id" });
        }

        const { data, error } = await supabase
            .from("notifications")
            .update({ read_at: new Date().toISOString() })
            .eq("id", notificationId)
            .eq("user_id", req.user.id)
            .is("read_at", null)
            .select("id");

        if (error) throw error;

        if (!data || data.length === 0) {
            // Either it doesn't exist / isn't yours, or it was already read.
            const { data: existing, error: existsError } = await supabase
                .from("notifications")
                .select("id")
                .eq("id", notificationId)
                .eq("user_id", req.user.id)
                .maybeSingle();

            if (existsError) throw existsError;

            if (!existing) {
                return res.status(404).json({ error: "Notification not found" });
            }
        }

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// PATCH /api/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("notifications")
            .update({ read_at: new Date().toISOString() })
            .eq("user_id", req.user.id)
            .is("read_at", null)
            .select("id");

        if (error) throw error;

        res.status(200).json({ updated: data.length });
    } catch (error) {
        console.error("Error marking all notifications read:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// DELETE /api/notifications/:notification_id   (dismiss)
const deleteNotification = async (req, res) => {
    try {
        const notificationId = parseId(req.params.notification_id);

        if (notificationId === null) {
            return res.status(400).json({ error: "Invalid notification id" });
        }

        const { data, error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", notificationId)
            .eq("user_id", req.user.id)
            .select("id");

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
};
