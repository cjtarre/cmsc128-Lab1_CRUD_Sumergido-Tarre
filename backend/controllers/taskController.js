const supabase = require("../config/supabaseAdmin");
const { validateTaskEnums, parseId, isUuid } = require("../utils/validation");
const {
    ROLE_RANK,
    getRole,
    getMemberProjectIds,
    getDefaultProjectId,
    validateTagIdsForProject,
} = require("../utils/projectAccess");

const TASK_SELECT = `
    *,
    assignee:profiles!tasks_assignee_id_fkey (
        user_id,
        username,
        display_name
    ),
    task_tag (
        tags ( tag_id, tag_name, tag_info )
    )
`;

// assignee_id is optional, but when provided it must belong to the task's project.
const validateAssigneeForProject = async (assigneeId, projectId) => {
    if (assigneeId === undefined || assigneeId === null || assigneeId === "") return null;

    if (!isUuid(assigneeId)) {
        return "Invalid assignee_id";
    }

    const { data, error } = await supabase
        .from("project_user")
        .select("user_id")
        .eq("project_id", projectId)
        .eq("user_id", assigneeId)
        .maybeSingle();

    if (error) throw error;
    return data ? null : "Assignee must be a member of this project";
};

// Records meaningful project changes for the Recent Activity view.
// Activity logging is intentionally kept separate from user notifications.
const logProjectActivity = async ({ projectId, actorId, taskId = null, activityType, data = {} }) => {
    const { error } = await supabase
        .from("project_activity")
        .insert([{
            project_id: projectId,
            actor_id: actorId,
            task_id: taskId,
            activity_type: activityType,
            data
        }]);

    if (error) throw error;
};

// Loads a task and checks the caller's role in the task's project.
// Sends the error response itself and returns null when access isn't allowed,
// so callers just do `if (!task) return;`.
// Tasks in a soft-deleted project count as not found (getRole ignores deleted projects).
// Non-members get 404 (not 403) so task ids can't be probed for existence.
const loadTaskForUser = async (req, res, { includeDeleted = false, minRole = "editor" } = {}) => {
    const taskId = parseId(req.params.task_id);

    if (taskId === null) {
        res.status(400).json({ error: "Invalid task id" });
        return null;
    }

    let query = supabase
        .from("tasks")
        .select("task_id, task_name, project_id, status, assignee_id, deleted_at")
        .eq("task_id", taskId);

    if (!includeDeleted) {
        query = query.is("deleted_at", null);
    }

    const { data: task, error } = await query.maybeSingle();
    if (error) throw error;

    const role = task ? await getRole(task.project_id, req.user.id) : null;

    if (!role) {
        res.status(404).json({ error: "Task not found" });
        return null;
    }

    if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
        res.status(403).json({ error: "Insufficient permissions" });
        return null;
    }

    return task;
};

// GET /api/tasks              -> tasks from every project the user belongs to
// GET /api/tasks?project_id=123  -> tasks from one project (user must be a member)
const getAllTasks = async (req, res) => {
    try {
        let query = supabase
            .from("tasks")
            .select(TASK_SELECT)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

        if (req.query.project_id !== undefined) {
            const projectId = parseId(req.query.project_id);
            if (projectId === null) {
                return res.status(400).json({ error: "Invalid project_id" });
            }

            const role = await getRole(projectId, req.user.id);
            if (!role) {
                return res.status(404).json({ error: "Project not found" });
            }

            query = query.eq("project_id", projectId);
        } else {
            const projectIds = await getMemberProjectIds(req.user.id);
            if (projectIds.length === 0) {
                return res.status(200).json([]);
            }

            query = query.in("project_id", projectIds);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// project_id is optional: when omitted the task goes into the user's default project,
// so clients that predate projects keep working. Requires editor or owner level access.
const createTask = async (req, res) => {
    try {
        const {
            task_name,
            task_info,
            priority_level,
            status,
            due_date,
            project_id,
            assignee_id,
            tag_ids
        } = req.body;

        const enumError = validateTaskEnums({ priority_level, status });
        if (enumError) {
            return res.status(400).json({ error: enumError });
        }

        let projectId;
        if (project_id === undefined || project_id === null) {
            projectId = await getDefaultProjectId(req.user.id);

            if (projectId === null) {
                return res.status(400).json({ error: "project_id is required" });
            }
        } else {
            projectId = parseId(project_id);

            if (projectId === null) {
                return res.status(400).json({ error: "Invalid project_id" });
            }
        }

        const role = await getRole(projectId, req.user.id);
        if (!role) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (ROLE_RANK[role] < ROLE_RANK.editor) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        // An assignment is optional, but the selected user must already be a project member.
        const assigneeError = await validateAssigneeForProject(assignee_id, projectId);
        if (assigneeError) {
            return res.status(400).json({ error: assigneeError });
        }

        let tagIdList = [];
        if (tag_ids != null) {
            const tagError = await validateTagIdsForProject(tag_ids, projectId);

            if (tagError) {
                return res.status(400).json({ error: tagError });
            }

            tagIdList = [...new Set(tag_ids.map(Number))];
        }

        const { data: newTask, error: newTaskError } = await supabase
            .from("tasks")
            .insert([{
                task_name,
                task_info,
                priority_level,
                status,
                due_date: due_date || null,
                project_id: projectId,
                assignee_id: assignee_id || null,
                user_id: req.user.id // creator; access is decided by project membership
            }])
            .select()
            .single();

        if (newTaskError) throw newTaskError;

        if (tagIdList.length > 0) {
            const taskTags = tagIdList.map(tag_id => ({
                task_id: newTask.task_id,
                tag_id
            }));

            const { error: taskTagsError } = await supabase
                .from("task_tag")
                .insert(taskTags);

            if (taskTagsError) throw taskTagsError;
        }

        // Creating a project task is a meaningful collaboration event.
        await logProjectActivity({
            projectId,
            actorId: req.user.id,
            taskId: newTask.task_id,
            activityType: "task_created",
            data: { task_name: newTask.task_name }
        });

        // Assignment is recorded separately so Recent Activity can show who received the task.
        if (newTask.assignee_id) {
            await logProjectActivity({
                projectId,
                actorId: req.user.id,
                taskId: newTask.task_id,
                activityType: "task_assigned",
                data: {
                    task_name: newTask.task_name,
                    assignee_id: newTask.assignee_id
                }
            });
        }

        const { data: taskWithTags, error: taskWithTagsError } = await supabase
            .from("tasks")
            .select(TASK_SELECT)
            .eq("task_id", newTask.task_id)
            .single();

        if (taskWithTagsError) throw taskWithTagsError;

        res.status(201).json(taskWithTags);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Requires editor or owner. project_id in the body is ignored: moving a task
// between projects isn't supported yet (it needs its own tag handling).
const updateTask = async (req, res) => {
    try {
        const {
            task_name,
            task_info,
            priority_level,
            status,
            due_date,
            assignee_id,
            tag_ids
        } = req.body;

        const enumError = validateTaskEnums({ priority_level, status });
        if (enumError) {
            return res.status(400).json({ error: enumError });
        }

        const task = await loadTaskForUser(req, res);
        if (!task) return;

        // Validate tags before writing anything, so a bad tag can't leave a half-applied update.
        let tagIdList;
        if (tag_ids != null) {
            const tagError = await validateTagIdsForProject(tag_ids, task.project_id);
            if (tagError) {
                return res.status(400).json({ error: tagError });
            }

            tagIdList = [...new Set(tag_ids.map(Number))];
        }

        // Only validate assignment when the client explicitly includes assignee_id.
        const assigneeWasProvided = Object.prototype.hasOwnProperty.call(req.body, "assignee_id");
        if (assigneeWasProvided) {
            const assigneeError = await validateAssigneeForProject(assignee_id, task.project_id);
            if (assigneeError) {
                return res.status(400).json({ error: assigneeError });
            }
        }

        const updates = {
            task_name,
            task_info,
            priority_level,
            status,
            due_date: due_date || null
        };

        if (assigneeWasProvided) {
            updates.assignee_id = assignee_id || null;
        }

        const { data, error: updateError } = await supabase
            .from("tasks")
            .update(updates)
            .eq("task_id", task.task_id)
            .select();

        if (updateError) throw updateError;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        if (tagIdList !== undefined) {
            const { error: deleteError } = await supabase
                .from("task_tag")
                .delete()
                .eq("task_id", task.task_id);

            if (deleteError) throw deleteError;

            if (tagIdList.length > 0) {
                const taskTags = tagIdList.map(tag_id => ({
                    task_id: task.task_id,
                    tag_id
                }));

                const { error: insertError } = await supabase
                    .from("task_tag")
                    .insert(taskTags);

                if (insertError) throw insertError;
            }
        }

        // Status changes are recorded independently so the activity feed stays meaningful.
        if (status !== undefined && status !== task.status) {
            await logProjectActivity({
                projectId: task.project_id,
                actorId: req.user.id,
                taskId: task.task_id,
                activityType: status === "completed" ? "task_completed" : "task_status_changed",
                data: {
                    task_name: task_name || task.task_name,
                    from: task.status,
                    to: status
                }
            });
        }

        // Assignment changes include assignment, reassignment, and returning a task to unassigned.
        if (assigneeWasProvided && (assignee_id || null) !== (task.assignee_id || null)) {
            await logProjectActivity({
                projectId: task.project_id,
                actorId: req.user.id,
                taskId: task.task_id,
                activityType: assignee_id ? "task_assigned" : "task_unassigned",
                data: {
                    task_name: task_name || task.task_name,
                    from_assignee_id: task.assignee_id || null,
                    assignee_id: assignee_id || null
                }
            });
        }

        const { data: updatedTask, error: fetchError } = await supabase
            .from("tasks")
            .select(TASK_SELECT)
            .eq("task_id", task.task_id)
            .single();

        if (fetchError) throw fetchError;

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Soft delete. Requires editor or owner (any task in the project, not just your own).
const deleteTask = async (req, res) => {
    try {
        const task = await loadTaskForUser(req, res);
        if (!task) return;

        const { data, error } = await supabase
            .from("tasks")
            .update({
                deleted_at: new Date().toISOString()
            })
            .eq("task_id", task.task_id)
            .is("deleted_at", null)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        await logProjectActivity({
            projectId: task.project_id,
            actorId: req.user.id,
            taskId: task.task_id,
            activityType: "task_deleted",
            data: { task_name: task.task_name }
        });

        res.status(200).json({
            message: `Task with ID ${task.task_id} deleted successfully`,
            data
        });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Requires editor or owner. A task whose project is deleted can't be restored
// until the project itself is restored (loadTaskForUser treats it as not found).
const restoreTask = async (req, res) => {
    try {
        const task = await loadTaskForUser(req, res, { includeDeleted: true });
        if (!task) return;

        const { error } = await supabase
            .from("tasks")
            .update({
                deleted_at: null
            })
            .eq("task_id", task.task_id);

        if (error) throw error;

        await logProjectActivity({
            projectId: task.project_id,
            actorId: req.user.id,
            taskId: task.task_id,
            activityType: "task_restored",
            data: { task_name: task.task_name }
        });

        const { data: restoredTask, error: fetchError } = await supabase
            .from("tasks")
            .select(TASK_SELECT)
            .eq("task_id", task.task_id)
            .single();

        if (fetchError) throw fetchError;

        res.status(200).json(restoredTask);
    } catch (error) {
        console.error("Error restoring task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    restoreTask
};