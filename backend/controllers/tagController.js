const supabase = require('../config/supabaseAdmin');
const { parseId, validateTagName, validateTagColor } = require('../utils/validation');
const {
    ROLE_RANK,
    getRole,
    getMemberProjectIds,
    getDefaultProjectId,
} = require('../utils/projectAccess');

// Tags with project_id = null are global presets visible to everyone.
// Tags with a project_id belong to that project and are visible only to its members.
//
// GET /api/tags                 -> global presets + tags from every project the user belongs to
// GET /api/tags?project_id=123  -> global presets + tags from that one project (user must be a member)
// GET /api/tags?default=true    -> global presets + tags from the user's default project
const getAllTags = async (req, res) => {
    try {
        let projectIds;

        if (req.query.project_id !== undefined) {
            const projectId = parseId(req.query.project_id);
            if (projectId === null) return res.status(400).json({ error: 'Invalid project_id' });

            const role = await getRole(projectId, req.user.id);
            if (!role) return res.status(404).json({ error: 'Project not found' });

            projectIds = [projectId];
        } else if (req.query.default === 'true') {
            const projectId = await getDefaultProjectId(req.user.id);
            projectIds = projectId ? [projectId] : [];
        } else {
            projectIds = await getMemberProjectIds(req.user.id);
        }

        let query = supabase
            .from('tags')
            .select('*')
            .order('tag_name', { ascending: true });

        // projectIds come from the database / parseId, so they are always integers.
        query = projectIds.length > 0
            ? query.or(`project_id.is.null,project_id.in.(${projectIds.join(',')})`)
            : query.is('project_id', null);

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Resolve the target project and require editor-level access for tag management.
const resolveWritableProject = async (req, res, rawProjectId) => {
    const projectId =
        rawProjectId === undefined || rawProjectId === null || rawProjectId === ''
            ? await getDefaultProjectId(req.user.id)
            : parseId(rawProjectId);

    if (projectId === null) {
        res.status(400).json({ error: 'Invalid project_id' });
        return null;
    }

    const role = await getRole(projectId, req.user.id);

    if (!role) {
        res.status(404).json({ error: 'Project not found' });
        return null;
    }

    if (ROLE_RANK[role] < ROLE_RANK.editor) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return null;
    }

    return projectId;
};

// POST /api/tags
// Creates a custom tag in the supplied project, or the user's default project
// when project_id is omitted.
const createTag = async (req, res) => {
    try {
        const { tag_name, color = '#64748b', project_id } = req.body;

        const nameError = validateTagName(tag_name);
        if (nameError) return res.status(400).json({ error: nameError });

        const colorError = validateTagColor(color);
        if (colorError) return res.status(400).json({ error: colorError });

        const projectId = await resolveWritableProject(req, res, project_id);
        if (!projectId) return;

        const { data, error } = await supabase
            .from('tags')
            .insert({
                tag_name: tag_name.trim(),
                color: color.toLowerCase(),
                project_id: projectId,
            })
            .select('*')
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Load a custom tag and check whether the current user can manage it.
// Global preset tags cannot be modified.
const loadWritableTag = async (req, res) => {
    const tagId = parseId(req.params.tag_id);

    if (tagId === null) {
        res.status(400).json({ error: 'Invalid tag id' });
        return null;
    }

    const { data: tag, error } = await supabase
        .from('tags')
        .select('*')
        .eq('tag_id', tagId)
        .maybeSingle();

    if (error) throw error;

    if (!tag) {
        res.status(404).json({ error: 'Tag not found' });
        return null;
    }

    if (tag.project_id === null) {
        res.status(403).json({ error: 'Global tags are read-only' });
        return null;
    }

    const role = await getRole(tag.project_id, req.user.id);

    if (!role) {
        res.status(404).json({ error: 'Tag not found' });
        return null;
    }

    if (ROLE_RANK[role] < ROLE_RANK.editor) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return null;
    }

    return tag;
};

// PATCH /api/tags/:tag_id
// Renames a custom tag and/or changes its color.
const updateTag = async (req, res) => {
    try {
        const { tag_name, color } = req.body;

        if (tag_name === undefined && color === undefined) {
            return res.status(400).json({ error: 'Tag name or color is required' });
        }

        if (tag_name !== undefined) {
            const nameError = validateTagName(tag_name);
            if (nameError) return res.status(400).json({ error: nameError });
        }

        if (color !== undefined) {
            const colorError = validateTagColor(color);
            if (colorError) return res.status(400).json({ error: colorError });
        }

        const tag = await loadWritableTag(req, res);
        if (!tag) return;

        const updates = {};

        if (tag_name !== undefined) updates.tag_name = tag_name.trim();
        if (color !== undefined) updates.color = color.toLowerCase();

        const { data, error } = await supabase
            .from('tags')
            .update(updates)
            .eq('tag_id', tag.tag_id)
            .select('*')
            .single();

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// DELETE /api/tags/:tag_id
// Deletes a custom tag. Global preset tags remain protected.
const deleteTag = async (req, res) => {
    try {
        const tag = await loadWritableTag(req, res);
        if (!tag) return;

        const { error } = await supabase
            .from('tags')
            .delete()
            .eq('tag_id', tag.tag_id);

        if (error) throw error;

        res.status(200).json({ message: 'Tag deleted' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getAllTags,
    createTag,
    updateTag,
    deleteTag,
};