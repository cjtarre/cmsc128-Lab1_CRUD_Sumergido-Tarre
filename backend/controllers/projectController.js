const supabase = require("../config/supabaseAdmin");
const { validateProjectName } = require("../utils/validation");
const { notify, removeInviteNotifications } = require("../utils/notifications");

const PROJECT_COLUMNS = "id, project_name, owner, is_default, icon, accent, created_at, deleted_at";

// Role-checking is done by requireProjectRole in projectRoutes.js, which sets
// req.projectId and req.projectRole. Handlers below can rely on both.

// retrieve all projects the authenticated user is a MEMBER of (not just owns),
// each with the user's role. Default project first, then oldest first.
// GET /api/projects?deleted=true returns the user's soft-deleted projects instead
// (owner only), so the UI has something to offer for restoring.
const getAllProjects = async (req, res) => {
    try {
        const onlyDeleted = req.query.deleted === "true";

        let query = supabase
            .from("project_user")
            .select(`role, projects!inner(${PROJECT_COLUMNS})`)
            .eq("user_id", req.user.id);

        query = onlyDeleted
            ? query.eq("role", "owner").not("projects.deleted_at", "is", null)
            : query.is("projects.deleted_at", null);

        const { data, error } = await query;

        if (error) throw error;

        const projects = data
            .map(({ role, projects: project }) => ({ ...project, role }))
            .sort((a, b) => {
                if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
                return new Date(a.created_at) - new Date(b.created_at);
            });

        // Deleted-project views only need the project records for restoration.
        if (onlyDeleted || projects.length === 0) {
            return res.status(200).json(projects);
        }

        const projectIds = projects.map((project) => project.id);

        const [
            { data: tasks, error: tasksError },
            { data: memberships, error: membersError },
        ] = await Promise.all([
            supabase
                .from("tasks")
                .select("task_id, project_id")
                .in("project_id", projectIds)
                .is("deleted_at", null),

            supabase
                .from("project_user")
                .select("project_id, user_id, created_at")
                .in("project_id", projectIds)
                .order("created_at", { ascending: true }),
        ]);

        if (tasksError) throw tasksError;
        if (membersError) throw membersError;

        const userIds = [...new Set((memberships || []).map((membership) => membership.user_id))];

        let profiles = [];

        if (userIds.length > 0) {
            const { data: profileData, error: profilesError } = await supabase
                .from("profiles")
                .select("user_id, username, display_name")
                .in("user_id", userIds);

            if (profilesError) throw profilesError;

            profiles = profileData || [];
        }

        const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));
        const taskCounts = new Map();
        const projectMembers = new Map();

        for (const task of tasks || []) {
            taskCounts.set(task.project_id, (taskCounts.get(task.project_id) || 0) + 1);
        }

        for (const membership of memberships || []) {
            const current = projectMembers.get(membership.project_id) || [];
            const profile = profileMap.get(membership.user_id);

            current.push({
                user_id: membership.user_id,
                username: profile?.username || null,
                display_name: profile?.display_name || null,
            });

            projectMembers.set(membership.project_id, current);
        }

        const projectsWithSummary = projects.map((project) => {
            const members = projectMembers.get(project.id) || [];

            return {
                ...project,
                task_count: taskCounts.get(project.id) || 0,
                member_count: members.length,
                members: members.slice(0, 4),
            };
        });

        res.status(200).json(projectsWithSummary);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// create a new project for the authenticated user
// The project row and the owner's project_user row are created together inside the
// create_project Postgres function, so one can never exist without the other.
const createProject = async (req, res) => {
    try {
        const { project_name } = req.body;

        const nameError = validateProjectName(project_name);
        if (nameError) {
            return res.status(400).json({ error: nameError });
        }

        const { data, error } = await supabase.rpc("create_project", {
            p_owner: req.user.id,
            p_name: project_name.trim(),
            p_is_default: false,
        });

        if (error) throw error;

        res.status(201).json({ ...data, role: "owner" });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// delete (soft) a project for the authenticated user
// must be the owner of the project to delete it (enforced by the route)
// The default project can't be deleted. Its tasks stay in the DB; they are hidden
// because task queries only include projects where deleted_at is null.
// All other members lose access, are notified (project_deleted), and pending
// invites for the project are cancelled.
const deleteProject = async (req, res) => {
    try {
        const { data: project, error: fetchError } = await supabase
            .from("projects")
            .select("id, project_name, is_default")
            .eq("id", req.projectId)
            .is("deleted_at", null)
            .single();

        if (fetchError) throw fetchError;

        if (project.is_default) {
            return res.status(400).json({ error: "The default project cannot be deleted" });
        }

        const { data, error } = await supabase
            .from("projects")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", req.projectId)
            .is("deleted_at", null)
            .select(PROJECT_COLUMNS);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Members lose access immediately (getRole ignores deleted projects).
        // Notifying them and clearing pending invites is best-effort: the
        // delete has already happened, so a failure here is logged, not returned.
        try {
            const { data: members, error: membersError } = await supabase
                .from("project_user")
                .select("user_id")
                .eq("project_id", req.projectId)
                .neq("user_id", req.user.id);

            if (membersError) throw membersError;

            await notify(members.map((m) => m.user_id), "project_deleted", {
                actorId: req.user.id,
                data: { project_id: req.projectId, project_name: project.project_name },
            });

            const { data: cancelled, error: cancelError } = await supabase
                .from("project_invite")
                .update({ status: "cancelled", responded_at: new Date().toISOString() })
                .eq("project_id", req.projectId)
                .eq("status", "pending")
                .select("id");

            if (cancelError) throw cancelError;

            await removeInviteNotifications(cancelled.map((invite) => invite.id));
        } catch (sideEffectError) {
            console.error("Error sending project deletion side effects:", sideEffectError);
        }

        res.status(200).json({
            message: `Project with ID ${req.projectId} deleted successfully`,
            data: data[0],
        });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// update a project for the authenticated user
// must be the owner of the project (enforced by the route).
// Project name and appearance are editable here; ownership changes need their own endpoint.
const updateProject = async (req, res) => {
    try {
        const { project_name, icon, accent } = req.body;

        const nameError = validateProjectName(project_name);
        if (nameError) {
            return res.status(400).json({ error: nameError });
        }

        const updates = { project_name: project_name.trim() };

        if (typeof icon === "string" && icon.trim()) {
            updates.icon = icon.trim();
        }

        if (typeof accent === "string" && accent.trim()) {
            updates.accent = accent.trim();
        }

        const { data, error } = await supabase
            .from("projects")
            .update(updates)
            .eq("id", req.projectId)
            .is("deleted_at", null)
            .select(PROJECT_COLUMNS);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.status(200).json({ ...data[0], role: req.projectRole });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// restore a deleted project for the authenticated user
// must be the owner of the project to restore it (route uses includeDeleted)
const restoreProject = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("projects")
            .update({ deleted_at: null })
            .eq("id", req.projectId)
            .not("deleted_at", "is", null)
            .select(PROJECT_COLUMNS);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(409).json({ error: "Project is not deleted" });
        }

        // Notify existing project members that the restored project is available again.
        // Membership rows are preserved during soft deletion, so restored members regain access.
        // Notification failure is best-effort because the project has already been restored.
        try {
            const { data: members, error: membersError } = await supabase
                .from("project_user")
                .select("user_id")
                .eq("project_id", req.projectId)
                .neq("user_id", req.user.id);

            if (membersError) throw membersError;

            await notify((members || []).map((member) => member.user_id), "project_restored", {
                actorId: req.user.id,
                data: {
                    project_id: req.projectId,
                    project_name: data[0].project_name,
                },
            });
        } catch (sideEffectError) {
            console.error("Error sending project restoration notifications:", sideEffectError);
        }

        res.status(200).json({ ...data[0], role: req.projectRole });
    } catch (error) {
        console.error("Error restoring project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// retrieve recent activity for a project.
// Any project member can view the activity feed (enforced by the route).
// Actor profile information is included so the UI can display who performed each action.
const getProjectActivity = async (req, res) => {
    try {
        const requestedLimit = Number.parseInt(req.query.limit, 10);
        const limit = Number.isInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 50)
            : 20;

        const { data, error } = await supabase
            .from("project_activity")
            .select(`
                id,
                project_id,
                actor_id,
                task_id,
                activity_type,
                data,
                created_at,
                actor:profiles!project_activity_actor_id_fkey (
                    user_id,
                    username,
                    display_name
                )
            `)
            .eq("project_id", req.projectId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching project activity:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getAllProjects,
    createProject,
    deleteProject,
    updateProject,
    restoreProject,
    getProjectActivity,
};