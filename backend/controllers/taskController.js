const supabase = require("../config/supabaseAdmin");
const { validateTaskEnums, parseId } = require("../utils/validation");
const {
    ROLE_RANK,
    getRole,
    getMemberListIds,
    getDefaultListId,
    validateTagIdsForList,
} = require("../utils/listAccess");

const TASK_SELECT = `
    *,
    task_tag (
        tags ( tag_id, tag_name, tag_info )
    )
`;

// Loads a task and checks the caller's role in the task's list.
// Sends the error response itself and returns null when access isn't allowed,
// so callers just do `if (!task) return;`.
// Tasks in a soft-deleted list count as not found (getRole ignores deleted lists).
// Non-members get 404 (not 403) so task ids can't be probed for existence.
const loadTaskForUser = async (req, res, { includeDeleted = false, minRole = "editor" } = {}) => {
    const taskId = parseId(req.params.task_id);

    if (taskId === null) {
        res.status(400).json({ error: "Invalid task id" });
        return null;
    }

    let query = supabase
        .from("tasks")
        .select("task_id, list_id, deleted_at")
        .eq("task_id", taskId);

    if (!includeDeleted) {
        query = query.is("deleted_at", null);
    }

    const { data: task, error } = await query.maybeSingle();
    if (error) throw error;

    const role = task ? await getRole(task.list_id, req.user.id) : null;

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

// GET /api/tasks              -> tasks from every list the user belongs to
// GET /api/tasks?list_id=123  -> tasks from one list (user must be a member)
const getAllTasks = async (req, res) => {
    try {
        let query = supabase
            .from("tasks")
            .select(TASK_SELECT)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

        if (req.query.list_id !== undefined) {
            const listId = parseId(req.query.list_id);
            if (listId === null) {
                return res.status(400).json({ error: "Invalid list_id" });
            }

            const role = await getRole(listId, req.user.id);
            if (!role) {
                return res.status(404).json({ error: "List not found" });
            }

            query = query.eq("list_id", listId);
        } else {
            const listIds = await getMemberListIds(req.user.id);
            if (listIds.length === 0) {
                return res.status(200).json([]);
            }

            query = query.in("list_id", listIds);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// list_id is optional: when omitted the task goes into the user's default list,
// so clients that predate lists keep working. Requires editor or owner level access.
const createTask = async (req, res) => {
    try {
        const {
            task_name,
            task_info,
            priority_level,
            status,
            due_date,
            list_id,
            tag_ids
        } = req.body;

        const enumError = validateTaskEnums({ priority_level, status });
        if (enumError) {
            return res.status(400).json({ error: enumError });
        }

        let listId;
        if (list_id === undefined || list_id === null) {
            listId = await getDefaultListId(req.user.id);

            if (listId === null) {
                return res.status(400).json({ error: "list_id is required" });
            }
        } else {
            listId = parseId(list_id);

            if (listId === null) {
                return res.status(400).json({ error: "Invalid list_id" });
            }
        }

        const role = await getRole(listId, req.user.id);
        if (!role) {
            return res.status(404).json({ error: "List not found" });
        }

        if (ROLE_RANK[role] < ROLE_RANK.editor) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        let tagIdList = [];
        if (tag_ids != null) {
            const tagError = await validateTagIdsForList(tag_ids, listId);

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
                list_id: listId,
                user_id: req.user.id // creator; access is decided by list membership
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

// Requires editor or owner. list_id in the body is ignored: moving a task
// between lists isn't supported yet (it needs its own tag handling).
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
            const tagError = await validateTagIdsForList(tag_ids, task.list_id);
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

// Soft delete. Requires editor or owner (any task in the list, not just your own).
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

// Requires editor or owner. A task whose list is deleted can't be restored
// until the list itself is restored (loadTaskForUser treats it as not found).
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