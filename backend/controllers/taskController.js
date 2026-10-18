const supabase = require("../config/supabaseAdmin");
const { validateTaskEnums, parseId } = require("../utils/validation");
const {
    ROLE_RANK,
    getRole,
    getMemberProjectIds,
    getDefaultProjectId,
    validateTagIdsForProject,
} = require("../utils/projectAccess");

const TASK_SELECT = `
    *,
    task_tag (
        tags ( tag_id, tag_name, tag_info )
    )
`;

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
        .select("task_id, project_id, deleted_at")
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
                due_date,
                project_id: projectId,
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

        const { data, error: updateError } = await supabase
            .from("tasks")
            .update({
                task_name,
                task_info,
                priority_level,
                status,
                due_date
            })
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